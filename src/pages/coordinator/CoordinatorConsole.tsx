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
import {
  buildAverageAnalysis,
  computeVariability,
} from "./utils/analysisAggregate";

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
    (a, b) =>
      new Date(b.latest.createdAt).getTime() - new Date(a.latest.createdAt).getTime()
  );

  return groups;
}

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
  const [selectedCandidateKey, setSelectedCandidateKey] = useState<string | null>(
    null
  );
  const [detailTab, setDetailTab] = useState<DetailTabKey>("AI");
  const [showDetail, setShowDetail] = useState(false);

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
  // 5) Filtros obligatorios (Escuela + Programa)
  // -----------------------------
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");

  const mustChooseScope = !schoolFilter || !programFilter;

  const schoolOptions = useMemo(() => {
    const set = new Set<string>();
    for (const ev of evals.evaluations) {
      const s = getCandidateSchool(ev);
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [evals.evaluations]);

  const programOptions = useMemo(() => {
    const set = new Set<string>();
    for (const ev of evals.evaluations) {
      const s = getCandidateSchool(ev);
      const p = getCandidateProgram(ev);
      if (!p) continue;
      if (schoolFilter && s !== schoolFilter) continue;
      set.add(p);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [evals.evaluations, schoolFilter]);

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
    setProgramFilter("");
    evals.setSearch("");
    setDetailTab("AI");
    detail.clearSelection();
    setShowDetail(false);

    // notas/criterios (hook)
    detail.setNotes("");
    detail.setCriteria({
      docs_ok: false,
      profile_fit: false,
      risk_ok: false,
      communication_ok: false,
    });

    // resumen promedio
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

    // notas/criterios (hook)
    detail.setNotes("");
    detail.setCriteria({
      docs_ok: false,
      profile_fit: false,
      risk_ok: false,
      communication_ok: false,
    });

    // resumen promedio
    setAvgLoading(false);
    setAvgError(null);
    setAvgAnalysis(null);
    setVariabilityInfo(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programFilter]);

  // -----------------------------
  // 8) Filtrado final
  // -----------------------------
  const filteredEvaluations = useMemo(() => {
    if (!schoolFilter || !programFilter) return [];

    let base = evals.evaluations;

    // scope
    base = base.filter((ev) => {
      const s = getCandidateSchool(ev);
      const p = getCandidateProgram(ev);
      return s === schoolFilter && p === programFilter;
    });

    // search
    const q = evals.search.trim().toLowerCase();
    if (q) {
      base = base.filter((ev) => {
        const name = ev.candidate?.fullName?.toLowerCase() ?? "";
        const school = getCandidateSchool(ev).toLowerCase();
        const program = getCandidateProgram(ev).toLowerCase();
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

    // decision filter
    if (evals.decisionFilter !== "ALL") {
      base = base.filter((ev) => {
        const status =
          evals.localDecisions[ev.id] ??
          ((ev.coordinatorDecisionStatus as LocalDecision | undefined) ?? "PENDIENTE");
        return status === evals.decisionFilter;
      });
    }

    return base;
  }, [
    evals.evaluations,
    evals.search,
    evals.decisionFilter,
    evals.localDecisions,
    schoolFilter,
    programFilter,
  ]);

  const groupedCandidates = useMemo(() => {
    return groupByCandidate(filteredEvaluations);
  }, [filteredEvaluations]);

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

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest
                         border border-white/10 text-gray-400
                         hover:border-rose-500/40 hover:text-rose-400
                         transition inline-flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.05]">
              Revisión y Aprobación de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Evaluaciones Docentes
              </span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
              Para escalar bien, este panel obliga a seleccionar <b>Escuela</b> y{" "}
              <b>Programa</b> antes de listar evaluaciones.
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
                // Antes era "SECOND": ahora abre el detalle y te manda a entrevistas
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
                  // NOTES
                  notes={detail.notes}
                  setNotes={detail.setNotes}
                  criteria={detail.criteria}
                  setCriteria={detail.setCriteria}
                  // VALIDACIÓN + SUBMIT
                  canSubmitDecision={detail.canSubmitDecision}
                  missingReasons={detail.missingReasons}
                  onSubmitDecision={detail.submitDecisionToAdmin}
                  // ENTREVISTAS
                  candidateGroup={selectedCandidateGroup}
                  onOpenInterview={(evaluationId) => {
                    navigate(
                      `/coordinator/evaluations/${encodeURIComponent(evaluationId)}`
                    );
                  }}
                  // Resumen IA Promedio
                  avgAnalysis={avgAnalysis}
                  avgLoading={avgLoading}
                  avgError={avgError}
                  variabilityInfo={variabilityInfo}
                />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default CoordinatorConsole;
