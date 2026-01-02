// src/pages/coordinator/CoordinatorConsole.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  FileText,
  Loader2,
  ShieldAlert,
  UserCheck,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { actorFromUser } from "../../services/auditActor";
import { AUTH_STORAGE_KEY } from "../../services/apiClient";

import { useCoordinatorEvaluations } from "./hooks/useCoordinatorEvaluations";
import { useEvaluationDetail } from "./hooks/useEvaluationDetail";

import EvaluationsListPanel from "./components/EvaluationsListPanel";
import EvaluationDetailPanel from "./components/EvaluationDetailPanel";

import type { CandidateGroup, DetailTabKey, LocalDecision } from "./types";
import { getCandidateKey } from "./utils/candidateKey";

import { getTeacherEvaluationById } from "../../services/teachersService";
import type { AnalysisResult } from "../../types";
import { buildAverageAnalysis, computeVariability } from "./utils/analysisAggregate";


import CoordinatorUsersPanel from "./components/users/CoordinatorUsersPanel";


const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ??
  "";

const apiUrl = (path: string) => {
  if (!API_BASE) return path;
  const base = API_BASE.replace(/\/+$/, "");
  return `${base}${path}`;
};

function normalizeDoc(raw: any): string {
  const s = (raw ?? "").toString().trim();
  return s.replace(/\D/g, "");
}

function normalizeText(raw: any): string {
  return (raw ?? "").toString().trim();
}

function getCandidateProgram(ev: any): string {
  return (
    normalizeText(ev?.candidate?.programNameSnapshot) ||
    normalizeText(ev?.programNameSnapshot) ||
    normalizeText(ev?.candidate?.programName) ||
    normalizeText(ev?.program?.name) ||
    ""
  );
}

function getCandidateSchool(ev: any): string {
  return (
    normalizeText(ev?.candidate?.schoolNameSnapshot) ||
    normalizeText(ev?.schoolNameSnapshot) ||
    normalizeText(ev?.candidate?.schoolName) ||
    normalizeText(ev?.school?.name) ||
    ""
  );
}

function getCandidateDoc(candidate: unknown): string {
  const c = candidate as any;
  return normalizeDoc(c?.documentNumber) || normalizeDoc(c?.document_number) || "";
}

function getCandidateProgramId(ev: any): string {
  return String(
    ev?.candidate?.programId ??
      ev?.candidate?.program_id ??
      ev?.programId ??
      ev?.program_id ??
      ""
  ).trim();
}

function getCandidateSchoolId(ev: any): string {
  return String(
    ev?.candidate?.schoolId ??
      ev?.candidate?.school_id ??
      ev?.schoolId ??
      ev?.school_id ??
      ""
  ).trim();
}

function groupByCandidate(
  evaluations: import("../../types").TeacherEvaluationSummary[]
): CandidateGroup[] {
  const map = new Map<string, import("../../types").TeacherEvaluationSummary[]>();

  for (const ev of evaluations) {
    const key = getCandidateKey(ev);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }

  const groups: CandidateGroup[] = [];

  for (const [key, interviews] of map.entries()) {
    const sorted = [...interviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latest = sorted[0];

    groups.push({
      key,
      documentNumber: getCandidateDoc(latest.candidate),
      candidateName: latest.candidate?.fullName ?? "Sin nombre",
      school: getCandidateSchool(latest as any),
      program: getCandidateProgram(latest as any),
      interviews: sorted,
      latest,
    });
  }

  groups.sort(
    (a, b) => new Date(b.latest.createdAt).getTime() - new Date(a.latest.createdAt).getTime()
  );

  return groups;
}

// ---------- SCOPE TYPES ----------
type RemoteSchool = {
  id: string;
  name: string;
  programs?: Array<{ id: string; name: string }>;
};

type ScopedSchool = {
  id: string;
  name: string;
  programs: Array<{ id: string; name: string }>;
};

type ProgramOption = { id: string; name: string };

const CoordinatorConsole: React.FC = () => {
  const { user } = useAuth();
  const actor = actorFromUser(user);
  const navigate = useNavigate();

  // -----------------------------
  // 1) Hook lista
  // -----------------------------
  const evals = useCoordinatorEvaluations();

  // -----------------------------
  // 2) Hook detalle
  // -----------------------------
  const detail: ReturnType<typeof useEvaluationDetail> = useEvaluationDetail({
    user,
    actor,
    evaluations: evals.evaluations,
    localDecisions: evals.localDecisions,
    setLocalDecisions: evals.setLocalDecisions,
  });

  // -----------------------------
  // 3) Tabs / estado panel derecho
  // -----------------------------
  const [selectedCandidateKey, setSelectedCandidateKey] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTabKey>("AI");
  const [showDetail, setShowDetail] = useState(false);
  const [mainTab, setMainTab] = useState<"evaluations" | "users">("evaluations");

  

  // -----------------------------
  // 4) Resumen IA promedio (por candidato)
  // -----------------------------
  const [avgLoading, setAvgLoading] = useState(false);
  const [avgError, setAvgError] = useState<string | null>(null);
  const [avgAnalysis, setAvgAnalysis] = useState<AnalysisResult | null>(null);
  const [variabilityInfo, setVariabilityInfo] = useState<any>(null);

  const computeAvgForSelectedCandidate = async (group: CandidateGroup) => {
    try {
      setAvgLoading(true);
      setAvgError(null);
      setAvgAnalysis(null);
      setVariabilityInfo(null);

      const interviews = group?.interviews ?? [];
      if (interviews.length < 1) {
        setAvgError("Este candidato no tiene entrevistas.");
        return;
      }

      const maxToUse = 6;
      const slice = interviews.slice(0, maxToUse);

      const details = await Promise.all(
        slice.map(async (ev) => {
          const d = await getTeacherEvaluationById(ev.id);
          return (d?.aiRawJson as AnalysisResult) ?? null;
        })
      );

      const analyses = details.filter(Boolean) as AnalysisResult[];

      if (!analyses.length) {
        setAvgError("No hay reportes IA guardados para este candidato.");
        return;
      }

      const avg = buildAverageAnalysis(analyses);
      const variability = computeVariability(analyses);

      setAvgAnalysis(avg);
      setVariabilityInfo(variability);
    } catch (e) {
      console.error(e);
      setAvgError(e instanceof Error ? e.message : "No se pudo consolidar el resumen IA.");
    } finally {
      setAvgLoading(false);
    }
  };

  const detailSectionRef = useRef<HTMLDivElement | null>(null);
  const scrollToDetailSection = () => {
    requestAnimationFrame(() => {
      detailSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // -----------------------------
  // ✅ Scope por schoolId del usuario
  // -----------------------------
  const userSchoolId: string | null =
    (user as any)?.schoolId ?? (user as any)?.school_id ?? null;

  const [scopedSchool, setScopedSchool] = useState<ScopedSchool | null>(null);
  const [scopeLoading, setScopeLoading] = useState(false);

  // -----------------------------
  // 5) Filtros obligatorios (Escuela + Programa)
  // -----------------------------
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  // ✅ programFilter ahora es programId
  const [programFilter, setProgramFilter] = useState<string>("");

  const mustChooseScope = !schoolFilter || !programFilter;

  // ✅ cargar escuela+programas por schoolId (para poblar selects)
  useEffect(() => {
    let alive = true;

    const loadScope = async () => {
      if (!userSchoolId) {
        if (!alive) return;
        setScopedSchool(null);
        return;
      }

      setScopeLoading(true);
      try {
        const token =
          (user as any)?.accessToken ??
          (user as any)?.token ??
          (user as any)?.jwt ??
          null;

        const res = await fetch(apiUrl("/schools?includePrograms=true"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error(`GET /schools failed: ${res.status}`);

        const data = (await res.json()) as RemoteSchool[];
        const list = Array.isArray(data) ? data : [];
        const found = list.find((s) => String(s?.id) === String(userSchoolId));

        if (!found) {
          if (!alive) return;
          setScopedSchool(null);
          return;
        }

        const scope: ScopedSchool = {
          id: found.id,
          name: found.name,
          programs: (found.programs ?? []).filter(Boolean),
        };

        if (!alive) return;

        setScopedSchool(scope);

        // ✅ fija escuela por usuario
        setSchoolFilter(scope.name);

        // ✅ si el programa seleccionado ya no existe, resetea
        setProgramFilter((prev) =>
          prev && scope.programs.some((p) => p.id === prev) ? prev : ""
        );
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setScopedSchool(null);
      } finally {
        if (!alive) return;
        setScopeLoading(false);
      }
    };

    loadScope();
    return () => {
      alive = false;
    };
  }, [user, userSchoolId]);

  // ✅ schoolOptions:
  // - si hay scopedSchool: solo esa escuela
  // - si no: fallback al modo viejo (de evaluaciones)
  const schoolOptions = useMemo(() => {
    if (scopedSchool?.name) return [scopedSchool.name];

    const set = new Set<string>();
    for (const ev of evals.evaluations) {
      const s = getCandidateSchool(ev);
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [scopedSchool, evals.evaluations]);

  // ✅ programOptions:
  // - si hay scopedSchool: salen del backend (id+name)
  // - si no: fallback al modo viejo (names desde evaluaciones)
  const programOptions: ProgramOption[] = useMemo(() => {
    if (scopedSchool?.programs?.length) {
      return [...scopedSchool.programs].sort((a, b) => a.name.localeCompare(b.name, "es"));
    }

    // fallback: construye listado por nombre (sin ids)
    const set = new Set<string>();
    for (const ev of evals.evaluations) {
      const s = getCandidateSchool(ev);
      const pName = getCandidateProgram(ev);
      if (!pName) continue;
      if (schoolFilter && s !== schoolFilter) continue;
      set.add(pName);
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((name) => ({ id: name, name }));
  }, [scopedSchool, evals.evaluations, schoolFilter]);

  // -----------------------------
  // ✅ Auto-pick programa (sin romper Rules of Hooks)
  // -----------------------------
  const programAutoPickedRef = useRef(false);
  const programStorageKey = (schoolName: string) => `coord:lastProgram:${schoolName}`;

  useEffect(() => {
    if (!schoolFilter) return;
    if (programFilter) return;
    if (!programOptions || programOptions.length === 0) return;

    const saved = localStorage.getItem(programStorageKey(schoolFilter));
    if (saved && programOptions.some((p) => p.id === saved)) {
      programAutoPickedRef.current = true;
      setProgramFilter(saved);
      return;
    }

    if (programOptions.length === 1) {
      programAutoPickedRef.current = true;
      setProgramFilter(programOptions[0].id);
      return;
    }
  }, [schoolFilter, programFilter, programOptions]);

  useEffect(() => {
    if (!schoolFilter || !programFilter) return;
    localStorage.setItem(programStorageKey(schoolFilter), programFilter);
  }, [schoolFilter, programFilter]);

  // -----------------------------
  // 6) Logout
  // -----------------------------
  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // -----------------------------
  // 7) Resets al cambiar scope
  // -----------------------------
  useEffect(() => {
    // ojo: si cambias escuela, reseteas programa y luego el auto-pick lo vuelve a setear
    setProgramFilter("");
    evals.setSearch("");
    setDetailTab("AI");
    detail.clearSelection();
    setShowDetail(false);

    detail.setNotes("");
    detail.setCriteria({
      docs_ok: false,
      profile_fit: false,
      risk_ok: false,
      communication_ok: false,
    });

    setAvgLoading(false);
    setAvgError(null);
    setAvgAnalysis(null);
    setVariabilityInfo(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolFilter]);

  useEffect(() => {
    evals.setSearch("");
    setDetailTab("AI");
    detail.clearSelection();
    setShowDetail(false);

    detail.setNotes("");
    detail.setCriteria({
      docs_ok: false,
      profile_fit: false,
      risk_ok: false,
      communication_ok: false,
    });

    setAvgLoading(false);
    setAvgError(null);
    setAvgAnalysis(null);
    setVariabilityInfo(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programFilter]);

  // -----------------------------
  // 8) Filtrado final (schoolId + programId)
  // -----------------------------
  const filteredEvaluations = useMemo(() => {
    if (!schoolFilter || !programFilter) return [];

    let base = evals.evaluations;

    // ✅ scope por schoolId del usuario (si existe)
    if (userSchoolId) {
      base = base.filter((ev: any) => {
        const sid = getCandidateSchoolId(ev);
        if (sid) return sid === String(userSchoolId);
        return getCandidateSchool(ev) === schoolFilter; // fallback por nombre
      });
    } else {
      base = base.filter((ev) => getCandidateSchool(ev) === schoolFilter);
    }

    // ✅ programa:
    // - si hay scopedSchool => programFilter es ID real
    // - si no => programFilter es "id=name" del fallback
    if (scopedSchool) {
      base = base.filter((ev: any) => getCandidateProgramId(ev) === String(programFilter));
    } else {
      base = base.filter((ev) => getCandidateProgram(ev) === String(programFilter));
    }

    // search
    const q = evals.search.trim().toLowerCase();
    if (q) {
      const programNameById = new Map(
        (scopedSchool?.programs ?? []).map((p) => [String(p.id), String(p.name)])
      );

      base = base.filter((ev: any) => {
        const name = String(ev.candidate?.fullName ?? "").toLowerCase();
        const school = String(getCandidateSchool(ev) ?? "").toLowerCase();

        const pid = getCandidateProgramId(ev);
        const programName =
          pid && programNameById.get(String(pid))
            ? programNameById.get(String(pid))
            : getCandidateProgram(ev);

        const program = String(programName ?? "").toLowerCase();

        const doc =
          normalizeDoc(ev.candidate?.documentNumber) ||
          normalizeDoc((ev.candidate as any)?.document_number) ||
          "";

        return (
          name.includes(q) ||
          school.includes(q) ||
          program.includes(q) ||
          (doc && doc.includes(normalizeDoc(q)))
        );
      });
    }

    return base;
  }, [evals.evaluations, evals.search, schoolFilter, programFilter, userSchoolId, scopedSchool]);

  const groupedCandidates = useMemo(() => groupByCandidate(filteredEvaluations), [filteredEvaluations]);

  const selectedCandidateGroup = useMemo(() => {
    if (!selectedCandidateKey) return null;
    return groupedCandidates.find((g) => g.key === selectedCandidateKey) ?? null;
  }, [groupedCandidates, selectedCandidateKey]);

  // ✅ Cuando cambia el candidato, recalculamos promedio + variabilidad
  useEffect(() => {
    if (!selectedCandidateGroup) return;
    computeAvgForSelectedCandidate(selectedCandidateGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCandidateGroup?.key]);

  // -----------------------------
  // 9) UI states
  // -----------------------------
  const showLoading = evals.loading;
  const showError = !evals.loading && !!evals.error;
  const metrics = evals.metrics;

  console.log(">>> CoordinatorConsole RENDER <<<");

  return (
    <div className="min-h-screen w-full bg-[#020202] text-gray-200 font-sans relative overflow-x-hidden">
      {/* blobs fondo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/6 rounded-full blur-[140px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "9s" }}
        />
        <div className="absolute bottom-[5%] right-[0%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-10">
        {/* HEADER */}
        <header className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
              <ShieldAlert className="w-4 h-4" />
              <span>Consola de Coordinación</span>
            </div>

            {/* ✅ Tabs principales */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMainTab("evaluations")}
                className={[
                  "px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest border transition inline-flex items-center gap-2",
                  mainTab === "evaluations"
                    ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                    : "border-white/10 text-gray-400 hover:border-white/20",
                ].join(" ")}
                title="Ver evaluaciones"
              >
                <FileText className="w-4 h-4" />
                Evaluaciones
              </button>
              
              <button
                type="button"
                onClick={() => setMainTab("users")}
                className={[
                  "px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest border transition inline-flex items-center gap-2",
                  mainTab === "users"
                    ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                    : "border-white/10 text-gray-400 hover:border-white/20",
                ].join(" ")}
                title="Gestionar líderes de mi escuela"
              >
                <UserCheck className="w-4 h-4" />
                Usuarios
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest
                           border border-white/10 text-gray-400
                           hover:border-rose-500/40 hover:text-rose-400
                           transition inline-flex items-center gap-2"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>


          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.05]">
              Revisión y Aprobación de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Evaluaciones Docentes
              </span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
              Para escalar bien, este panel obliga a seleccionar <b>Escuela</b> y <b>Programa</b>{" "}
              antes de listar evaluaciones.
            </p>
          </div>
        </header>

        {/* ESTADO CARGA / ERROR */}
        {showLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Cargando historial de evaluaciones…</p>
          </div>
        )}

        {showError && (
          <div className="flex flex-col items-center justify-center py-16 text-red-400 gap-3">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm text-center max-w-md">{evals.error}</p>
          </div>
        )}

        {!showLoading && !showError && (
        <>
          {/* ✅ Si estás en Evaluaciones */}
          {mainTab === "evaluations" && (
            <>
              {/* MÉTRICAS RÁPIDAS */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div className="bg-[#1F1F1F]/30 border border-white/10 rounded-3xl px-5 py-4 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] uppercase tracking-widest text-gray-500">
                      Evaluaciones Totales
                    </span>
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-black text-white">{metrics.total}</p>
                </div>
          
                <div className="bg-[#1F1F1F]/30 border border-white/10 rounded-3xl px-5 py-4 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] uppercase tracking-widest text-gray-500">
                      Puntaje Global Promedio
                    </span>
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-3xl font-black text-white">
                    {metrics.avgScore.toFixed(1)}
                    <span className="text-sm text-gray-500 ml-1">/100</span>
                  </p>
                </div>
          
                <div className="bg-[#1F1F1F]/30 border border-white/10 rounded-3xl px-5 py-4 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] uppercase tracking-widest text-gray-500">
                      Próxima Fase
                    </span>
                    <UserCheck className="w-4 h-4 text-emerald-300" />
                  </div>
                  <p className="text-xs text-gray-400">
                    Esto evita “listas infinitas” y prepara el terreno para filtros backend.
                  </p>
                </div>
              </section>
          
              {/* LISTA + DETALLE */}
              <section className="flex flex-col gap-6">
                <EvaluationsListPanel
                  schoolFilter={schoolFilter}
                  setSchoolFilter={setSchoolFilter}
                  programFilter={programFilter}
                  setProgramFilter={setProgramFilter}
                  schoolOptions={schoolOptions}
                  programOptions={programOptions}
                  mustChooseScope={mustChooseScope}
                  groupedCandidates={groupedCandidates}
                  selectedId={detail.selectedId}
                  search={evals.search}
                  setSearch={evals.setSearch}
                  decisionFilter={evals.decisionFilter}
                  setDecisionFilter={evals.setDecisionFilter}
                  localDecisions={evals.localDecisions}
                  lockedSchool={!!userSchoolId}
                  schoolHint={
                    scopeLoading
                      ? "Cargando programas de tu escuela…"
                      : userSchoolId
                      ? "Escuela asignada por tu usuario."
                      : undefined
                  }
                  onSelectEvaluation={(candidateKey, evaluationId) => {
                    setSelectedCandidateKey(candidateKey);
                    detail.handleSelectEvaluation(evaluationId);
                    setDetailTab("AI");
                  }}
                  onOpenDetail={(candidateKey, evaluationId) => {
                    setSelectedCandidateKey(candidateKey);
                    setShowDetail(true);
                    detail.handleSelectEvaluation(evaluationId);
                    setDetailTab("AI");
                    scrollToDetailSection();
                  }}
                  onOpenSecond={(candidateKey, evaluationId) => {
                    setSelectedCandidateKey(candidateKey);
                    setShowDetail(true);
                    detail.handleSelectEvaluation(evaluationId);
                    setDetailTab("INTERVIEWS");
                    scrollToDetailSection();
                  }}
                />

                <div ref={detailSectionRef} />
                
                {showDetail && (
                  <EvaluationDetailPanel
                    selectedId={detail.selectedId}
                    selectedDetail={detail.selectedDetail}
                    loadingDetail={detail.loadingDetail}
                    onExportPdf={detail.exportPdf}
                    detailTab={detailTab}
                    setDetailTab={setDetailTab}
                    decision={detail.decision}
                    decisionComment={detail.decisionComment}
                    setDecisionComment={detail.setDecisionComment}
                    onDecisionCommentBlur={detail.onDecisionCommentBlur}
                    onApplyDecision={detail.applyDecision}
                    onOpenComparison={() => setDetailTab("INTERVIEWS")}
                    notes={detail.notes}
                    setNotes={detail.setNotes}
                    criteria={detail.criteria}
                    setCriteria={detail.setCriteria}
                    canSubmitDecision={detail.canSubmitDecision}
                    missingReasons={detail.missingReasons}
                    onSubmitDecision={detail.submitDecisionToAdmin}
                    candidateGroup={selectedCandidateGroup}
                    onOpenInterview={(evaluationId) => {
                      navigate(`/coordinator/evaluations/${encodeURIComponent(evaluationId)}`);
                    }}
                    avgAnalysis={avgAnalysis}
                    avgLoading={avgLoading}
                    avgError={avgError}
                    variabilityInfo={variabilityInfo}
                  />
                )}
              </section>
            </>
          )}

    {/* ✅ Si estás en Usuarios */}
    {mainTab === "users" && (
      <CoordinatorUsersPanel />
    )}
  </>
)}

      </div>
    </div>
  );
};

export default CoordinatorConsole;
