// src/pages/coordinator/CoordinatorConsole.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
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

import { useCoordinatorEvaluations } from "./hooks/useCoordinatorEvaluations";
import { useEvaluationDetail } from "./hooks/useEvaluationDetail";

import EvaluationsListPanel from "./components/EvaluationsListPanel";
import EvaluationDetailPanel from "./components/EvaluationDetailPanel";

import type {  CandidateGroup, DetailTabKey, LocalDecision } from "./types";

import { getCandidateKey } from "./utils/candidateKey";

import { useLocation } from "react-router-dom";



function normalizeDoc(raw: any): string {
  // ✅ Normaliza: deja solo dígitos (evita "1.234.567" vs "1234567")
  const s = (raw ?? "").toString().trim();
  return s.replace(/\D/g, "");
}

function groupByCandidate(
  evaluations: import("../../types").TeacherEvaluationSummary[]
): CandidateGroup[] {
  // key estable -> grupo
  const map = new Map<string, import("../../types").TeacherEvaluationSummary[]>();

  for (const ev of evaluations) {
    // ✅ key estable (usa doc camel/snake y fallback a nombre+escuela+programa)
    const key = getCandidateKey(ev);

    // ⚠️ IMPORTANTE: NO uses ev.id como key de fallback, porque eso duplica siempre
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }

  const groups: CandidateGroup[] = [];

  for (const [key, interviews] of map.entries()) {
    // ✅ ordena entrevistas (más reciente primero)
    const sorted = [...interviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latest = sorted[0];

    // ✅ doc para mostrar (si viene) - normalizado
    const docDisplay =
      normalizeDoc(latest.candidate?.documentNumber) ||
      normalizeDoc(latest.candidate?.document_number) ||
      "";

    groups.push({
      key,
      documentNumber: docDisplay,
      candidateName: latest.candidate?.fullName ?? "Sin nombre",
      school: latest.candidate?.schoolNameSnapshot ?? "",
      program: latest.candidate?.programNameSnapshot ?? "",
      interviews: sorted,
      latest,
    });
  }

  // ✅ ordena candidatos por su última entrevista
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
  // 3) Tabs panel derecho (✅ ahora: DECISION | AI | NOTES)
  // -----------------------------

  const [selectedCandidateKey, setSelectedCandidateKey] = useState<string | null>(null);

  


  const [detailTab, setDetailTab] = useState<DetailTabKey>("AI");

  // 3.2) Qué tarjeta inferior mostrar (detalle vs segunda tarjeta)
  // -----------------------------
  type DetailView = "DETAIL" | "SECOND" | null;
  const [detailView, setDetailView] = useState<DetailView>(null);
  // -----------------------------
  // 3.1) NUEVO: notas + criterios (para NotesTab)
  // -----------------------------
  const [notes, setNotes] = useState("");
  const [criteria, setCriteria] = useState<Record<string, boolean>>({
    docs_ok: false,
    profile_fit: false,
    risk_ok: false,
    communication_ok: false,
  });

  const detailSectionRef = useRef<HTMLDivElement | null>(null);

  // ✅ Helper: hace scroll suave hasta la sección inferior
  const scrollToDetailSection = () => {
    // Usamos requestAnimationFrame para esperar a que React pinte el panel
    requestAnimationFrame(() => {
      detailSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  // -----------------------------
  // 4) Filtros obligatorios (Escuela + Programa)
  // -----------------------------
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");

  const mustChooseScope = !schoolFilter || !programFilter;

  const schoolOptions = useMemo(() => {
    const set = new Set<string>();
    for (const ev of evals.evaluations) {
      const s = ev.candidate?.schoolNameSnapshot?.trim();
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [evals.evaluations]);

  const programOptions = useMemo(() => {
    const set = new Set<string>();
    for (const ev of evals.evaluations) {
      const s = ev.candidate?.schoolNameSnapshot?.trim();
      const p = ev.candidate?.programNameSnapshot?.trim();
      if (!p) continue;
      if (schoolFilter && s !== schoolFilter) continue;
      set.add(p);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [evals.evaluations, schoolFilter]);

  // -----------------------------
  // 5) Logout
  // -----------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // -----------------------------
  // 6) Resets al cambiar scope
  // -----------------------------
  useEffect(() => {
    setProgramFilter("");
    evals.setSearch("");
    setDetailTab("AI");
    detail.clearSelection();
    setDetailView(null);

    // ✅ si cambias escuela, las notas/criterios se reinician
    setNotes("");
    setCriteria({
      docs_ok: false,
      profile_fit: false,
      risk_ok: false,
      communication_ok: false,
    });
    if (detailView) {
    scrollToDetailSection();
  }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolFilter]);

  useEffect(() => {
    evals.setSearch("");
    setDetailTab("AI");
    detail.clearSelection();
    setDetailView(null);

    // ✅ si cambias programa, reinicia notas/criterios
    setNotes("");
    setCriteria({
      docs_ok: false,
      profile_fit: false,
      risk_ok: false,
      communication_ok: false,
    });
    if (detailView) {
    scrollToDetailSection();
  }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programFilter]);

  // -----------------------------
  // 7) Filtrado final
  // -----------------------------
  const filteredEvaluations = useMemo(() => {
    if (!schoolFilter || !programFilter) return [];

    let base = evals.evaluations;

    // scope
    base = base.filter((ev) => {
      const s = ev.candidate?.schoolNameSnapshot?.trim() ?? "";
      const p = ev.candidate?.programNameSnapshot?.trim() ?? "";
      return s === schoolFilter && p === programFilter;
    });

    // search
    const q = evals.search.trim().toLowerCase();
    if (q) {
      base = base.filter((ev) => {
        const name = ev.candidate?.fullName?.toLowerCase() ?? "";
        const school = ev.candidate?.schoolNameSnapshot?.toLowerCase() ?? "";
        const program = ev.candidate?.programNameSnapshot?.toLowerCase() ?? "";
        return name.includes(q) || school.includes(q) || program.includes(q);
      });
    }

    // decision filter
    if (evals.decisionFilter !== "ALL") {
      base = base.filter((ev) => {
        const status =
          evals.localDecisions[ev.id] ??
          ((ev.coordinatorDecisionStatus as LocalDecision | undefined) ??
            "PENDIENTE");
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

console.log(
  "Candidatos agrupados:",
  groupedCandidates.map((g) => ({
    key: g.key,
    doc: g.documentNumber,
    name: g.candidateName,
    interviews: g.interviews.length,
  }))
);

  



const selectedCandidateGroup = useMemo(() => {
  if (!selectedCandidateKey) return null;

  return (
    groupedCandidates.find((g) => g.key === selectedCandidateKey) ??
    null
  );
}, [groupedCandidates, selectedCandidateKey]);

  // -----------------------------
  // 8) UI states
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
                  setDetailView("DETAIL");
                  detail.handleSelectEvaluation(evaluationId);
                  setDetailTab("AI");
                  scrollToDetailSection();
                }}
                onOpenSecond={(candidateKey, evaluationId) => {
                  setSelectedCandidateKey(candidateKey);
                  setDetailView("SECOND");
                  detail.handleSelectEvaluation(evaluationId);
                  setDetailTab("AI");
                  scrollToDetailSection();
                }}
                
              />
      
      <div ref={detailSectionRef} />
        {detailView === "DETAIL" && (
          
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

            // ✅ NOTES
            notes={detail.notes}
            setNotes={detail.setNotes}
            criteria={detail.criteria}
            setCriteria={detail.setCriteria}

            // ✅ VALIDACIÓN + SUBMIT
            canSubmitDecision={detail.canSubmitDecision}
            missingReasons={detail.missingReasons}
            onSubmitDecision={detail.submitDecisionToAdmin}

            // ✅ ENTREVISTAS (NUEVO)
            candidateGroup={selectedCandidateGroup}
              onOpenInterview={(evaluationId) => {
              // ✅ Abre Leader directamente en la sección del reporte (AnalysisResults)
              const url = `/leader?evaluationId=${encodeURIComponent(evaluationId)}#report-to-download`;
                          
              // ✅ nueva pestaña (no rompe el flujo del coordinador)
              window.open(url, "_blank", "noopener,noreferrer");
            }}

          />
        )}
        {detailView === "SECOND" && (
          <div className="bg-[#0B0B0B] border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                  Segunda tarjeta
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Esta vista aún no necesita funcionalidad.
                </p>
              </div>
        
              {/* opcional: botón para volver al detalle */}
              <button
                type="button"
                onClick={() => setDetailView("DETAIL")}
                className="px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest
                           border border-white/10 text-gray-400 hover:border-emerald-500/40 hover:text-emerald-300 transition"
              >
                Volver a detalle
              </button>
            </div>
        
            <div className="text-sm text-gray-400 bg-black/20 border border-white/10 rounded-2xl p-4">
              Selecciona un candidato y usa los botones del listado para abrir esta tarjeta.
            </div>
          </div>
        )}
     
        

            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default CoordinatorConsole;
