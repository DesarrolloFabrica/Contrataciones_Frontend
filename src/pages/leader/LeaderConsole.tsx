// src/pages/leader/LeaderConsole.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, ListChecks, FileText, Info, CheckCircle2 } from "lucide-react";

// Types & Services
import type {
  InterviewData,
  AnalysisResult,
  TeacherForm,
  TeacherAiResult,
} from "../../types";
import { analyzeTeacherInterview } from "../../services/geminiService";
import {
  createTeacherEvaluation,
  getTeacherEvaluationById,
} from "../../services/teachersService";
import { auditAppend } from "../../services/auditService";
import { actorFromUser } from "../../services/auditActor";
import { mapInterviewToTeacherForm } from "../../services/mappers/mapInterviewToTeacherForm";

// Context
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Components
import Header from "../../components/Header";
import InterviewForm from "../../components/InterviewForm";
import AnalysisResults from "../../components/AnalysisResults";
import LoadingState from "../../components/LoadingState";
import EvaluationsHistory from "../../components/EvaluationsHistory";

const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

type ViewMode = "analyze" | "history";

// --- MAPPERS INTERNOS ---
const toBackendTeacherForm = (form: TeacherForm) => {
  return {
    ...form,
    candidate: {
      ...form.candidate,
      document_number: form.candidate.documentNumber?.trim() || "",
    },
  };
};

const mapFormToInterviewData = (form: TeacherForm): InterviewData => ({
  documentNumber: form.candidate.documentNumber ?? "",
  candidateName: form.candidate.fullName,
  age: form.candidate.age ? String(form.candidate.age) : "",
  school: form.candidate.schoolName,
  program: form.candidate.programName,
  careerSummary: form.candidate.careerSummary,
  previousExperience: form.candidate.teachingExperience,

  availabilityDetails: form.availability.scheduleDetails,
  acceptsCommittees: form.availability.acceptsCommittees,
  otherJobs: form.availability.otherJobsImpact,

  evaluationMethodology: form.classroomManagement.evaluationMethodology,
  failureRatePlan: form.classroomManagement.planIfHalfFail,
  apatheticStudentPlan: form.classroomManagement.handleApatheticStudent,

  aiToolsUsage: form.aiAttitude.usesAiHow,
  ethicalAiMeasures: form.aiAttitude.ethicalUseMeasures,
  aiPlagiarismPrevention: form.aiAttitude.handleAiPlagiarism,

  scenario29: form.coherenceCommitment.caseStudent2_9,
  scenarioCoverage: form.coherenceCommitment.emergencyProtocol,
  scenarioFeedback: form.coherenceCommitment.handleNegativeFeedback,
});

// --- COMPONENTE PRINCIPAL ---
const LeaderConsole: React.FC = () => {
  // =========================
  // ✅ ESTADOS PRINCIPALES
  // =========================
  const [mode, setMode] = useState<ViewMode>("analyze");
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlowHelpOpen, setIsFlowHelpOpen] = useState(false);

  // --- LOGICA DE NEGOCIO (Sin cambios) ---
  const handleFormSubmit = useCallback(
    async (data: InterviewData) => {
      const actor = actorFromUser(user);

      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      setInterviewData(data);
      setEvaluationId(null);

      auditAppend({
        type: "AI_ANALYSIS_STARTED",
        actor,
        metadata: { orgId: ORG_ID },
      });

      try {
        const aiResult: TeacherAiResult = await analyzeTeacherInterview(data);

        if (aiResult.rawOutput) {
          setAnalysisResult(aiResult.rawOutput);

          auditAppend({
            type: "AI_ANALYSIS_FINISHED",
            actor,
            metadata: {
              orgId: ORG_ID,
              overallScore: aiResult.rawOutput.overallScore ?? null,
              risk: aiResult.rawOutput.overallRiskLevel ?? null,
              verdict: aiResult.rawOutput.finalVerdict ?? null,
            },
          });
        }

        const formFrontend: TeacherForm = mapInterviewToTeacherForm(data);
        const formBackend = toBackendTeacherForm(formFrontend);

        const saved = await createTeacherEvaluation(ORG_ID, formBackend as any, aiResult);

        auditAppend({
          type: "EVALUATION_CREATED",
          actor,
          metadata: {
            orgId: ORG_ID,
            candidateId: saved.candidateId,
            evaluationId: saved.id,
            documentNumber: data.documentNumber ?? null,
          },
        });

        setEvaluationId(saved.id);
      } catch (err: any) {
        console.error("❌ Error during analysis or save:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });

        setError(
          err?.response?.data?.message ??
            (err instanceof Error ? err.message : "Ocurrió un error durante el proceso.")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const location = useLocation();

  const handleOpenEvaluationFromHistory = useCallback(
    async (id: string) => {
      const actor = actorFromUser(user);

      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      setInterviewData(null);
      setEvaluationId(null);

      try {
        const detail = await getTeacherEvaluationById(id);

        auditAppend({
          type: "EVALUATION_OPENED",
          actor,
          metadata: { source: "leader-history", evaluationId: detail.id },
        });

        const form: TeacherForm = detail.formRawData;
        const analysis: AnalysisResult = detail.aiRawJson;

        const interview = mapFormToInterviewData(form);

        setInterviewData(interview);
        setAnalysisResult(analysis);
        setEvaluationId(detail.id);

        setMode("analyze");
      } catch (err) {
        console.error("Error al cargar detalle de evaluación:", err);
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el detalle de la evaluación."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const evaluationIdFromUrl = params.get("evaluationId");
    if (!evaluationIdFromUrl) return;
    handleOpenEvaluationFromHistory(evaluationIdFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleReset = useCallback(() => {
    setInterviewData(null);
    setAnalysisResult(null);
    setEvaluationId(null);
    setIsLoading(false);
    setError(null);
  }, []);

  // --- UI HELPERS ---
  const brandFrom = "#91DC00";
  const brandTo = "#31AB2E";

  // Paso actual del flujo para el panel de arriba
  const currentStep = useMemo<1 | 2 | 3>(() => {
    if (isLoading) return 2;
    if (analysisResult) return 3;
    return 1;
  }, [isLoading, analysisResult]);

  const status = useMemo(() => {
    if (isLoading) {
      return {
        label: "Procesando...",
        cls: isDark
          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-200 animate-pulse"
          : "border-emerald-400/50 bg-emerald-50 text-emerald-700 animate-pulse",
      };
    }
    if (error) {
      return {
        label: "Error detectado",
        cls: isDark
          ? "border-red-500/50 bg-red-500/20 text-red-200"
          : "border-red-400/40 bg-red-50 text-red-600",
      };
    }
    if (analysisResult) {
      return {
        label: "Análisis completado",
        cls: isDark
          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
          : "border-emerald-400/60 bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_rgba(16,185,129,0.10)]",
      };
    }
    return {
      label: "En espera",
      cls: isDark
        ? "border-white/10 bg-white/5 text-white/50"
        : "border-slate-200 bg-slate-50 text-slate-500",
    };
  }, [isLoading, error, analysisResult, isDark]);

  return (
    <div
      className={[
        "min-h-screen w-full font-sans overflow-x-hidden flex flex-col",
        isDark ? "bg-[#020202] text-white" : "bg-gray-50 text-gray-900",
      ].join(" ")}
    >

      <Header mode={mode} onChangeMode={setMode} />

      <main className="flex-1 relative z-10 w-full">
        {/* Container principal alineado con el Header (px-6 es clave) */}
        <div className="container mx-auto px-6 py-8">
          
          {/* ================= VISTA: ANALIZAR ================= */}
          {mode === "analyze" && (
            <div className="animate-[fadeInUp_400ms_ease-out] space-y-8">
              
              {/* 1. Panel de Control / Guía (nuevo diseño) */}
              <section
                className={[
                  "relative overflow-hidden rounded-3xl backdrop-blur-2xl",
                  isDark
                    ? "border border-white/10 bg-[#050505]/90 shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
                    : "border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)]",
                ].join(" ")}
              >
                {/* Decoraciones de fondo (solo en oscuro para no lavar el texto en claro) */}
                {isDark && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-32 right-0 w-80 h-80 rounded-full blur-[90px] bg-emerald-500/12" />
                    <div className="absolute -bottom-40 left-10 w-72 h-72 rounded-full blur-[100px] bg-cyan-500/8" />
                  </div>
                )}

                <div className="relative p-6 md:p-8 flex flex-col gap-6 md:gap-8">
                  {/* Encabezado del panel */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-3">
                      <div
                        className={[
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-[0.18em]",
                          isDark
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                            : "border-emerald-400/30 bg-emerald-50 text-emerald-700",
                        ].join(" ")}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Panel principal de líder</span>
                      </div>
                      <div>
                        <h2
                          className={[
                            "text-xl md:text-2xl font-semibold tracking-tight",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          Evaluación asistida por IA
                        </h2>
                        <p
                          className={[
                            "text-sm max-w-xl",
                            isDark ? "text-neutral-400" : "text-slate-600",
                          ].join(" ")}
                        >
                          Registra la entrevista, ejecuta el análisis y genera un reporte
                          listo para el comité académico o quien defina la decisión final.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch md:items-end gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${status.cls}`}
                        >
                          {status.label}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFlowHelpOpen(true)}
                        className={[
                          "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-[0.2em] transition",
                          isDark
                            ? "border-white/10 bg-white/[0.03] text-neutral-200 hover:bg-white/[0.08] hover:border-white/20"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
                        ].join(" ")}
                      >
                        <Info className="w-3.5 h-3.5" />
                        Ver guía rápida
                      </button>
                    </div>
                  </div>

                  {/* Contenido: flujo + tips */}
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-4 md:gap-6">
                    {/* Card: Flujo visual */}
                    <div
                      className={[
                        "relative p-5 rounded-2xl border",
                        isDark
                          ? "bg-white/[0.02] border-white/10"
                          : "bg-white border-slate-200 shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                            <ListChecks className="w-4 h-4" />
                          </div>
                          <div>
                            <h3
                              className={[
                                "text-xs font-bold uppercase tracking-[0.22em]",
                                isDark ? "text-neutral-300" : "text-slate-700",
                              ].join(" ")}
                            >
                              Flujo de evaluación
                            </h3>
                            <p
                              className={[
                                "text-[11px]",
                                isDark ? "text-neutral-500" : "text-slate-500",
                              ].join(" ")}
                            >
                              3 pasos guiados para registrar la evaluación y su evidencia.
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-neutral-500 uppercase tracking-[0.18em]">
                          Paso {currentStep} de 3
                        </span>
                      </div>

                      <ol className="space-y-3">
                        {[
                          {
                            id: 1,
                            title: "Capturar información del docente",
                            desc: "Completa identidad, trayectoria, disponibilidad y casos éticos.",
                          },
                          {
                            id: 2,
                            title: "Ejecutar análisis de IA",
                            desc: "Envía el formulario y revisa en segundos el resumen ejecutivo.",
                          },
                          {
                            id: 3,
                            title: "Generar reporte para comité",
                            desc: "Descarga el PDF y compártelo con el comité o con quien toma la decisión final.",
                          },
                        ].map((step) => {
                          const isActive = currentStep === step.id;
                          const isDone = currentStep > step.id || (step.id === 2 && analysisResult);

                          return (
                            <li
                              key={step.id}
                              className="flex items-start gap-3 relative"
                            >
                              {/* Línea vertical */}
                              {step.id !== 3 && (
                                <div className="absolute left-3 top-6 bottom-[-6px] w-px bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-transparent pointer-events-none" />
                              )}

                              <div
                                className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold
                                  ${
                                    isDone
                                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                                      : isActive
                                      ? "border-emerald-400/70 bg-emerald-500/10 text-emerald-200"
                                      : isDark
                                      ? "border-white/15 bg-black/40 text-neutral-400"
                                      : "border-slate-200 bg-slate-50 text-slate-500"
                                  }`}
                              >
                                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                              </div>

                              <div className="ml-1 space-y-0.5">
                                <p
                                  className={`text-[13px] font-semibold ${
                                    isActive || isDone
                                      ? isDark
                                        ? "text-white"
                                        : "text-slate-900"
                                      : isDark
                                      ? "text-neutral-300"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {step.title}
                                </p>
                                <p
                                  className={`text-[11px] leading-relaxed ${
                                    isDark ? "text-neutral-500" : "text-slate-500"
                                  }`}
                                >
                                  {step.desc}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>

                    {/* Card: Tips prácticos */}
                    <div
                      className={[
                        "relative p-5 rounded-2xl border",
                        isDark
                          ? "bg-gradient-to-br from-[#050b07] via-[#050505] to-[#040812] border-white/10"
                          : "bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 border-slate-200 shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={[
                            "p-2 rounded-xl flex items-center justify-center",
                            isDark
                              ? "bg-cyan-500/15 text-cyan-300"
                              : "bg-cyan-100 text-cyan-700",
                          ].join(" ")}
                        >
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h3
                            className={[
                              "text-xs font-bold uppercase tracking-[0.22em]",
                              isDark ? "text-neutral-300" : "text-slate-700",
                            ].join(" ")}
                          >
                            Recomendaciones para líderes
                          </h3>
                          <p
                            className={`text-[11px] ${
                              isDark ? "text-neutral-500" : "text-slate-500"
                            }`}
                          >
                            Usa estas pautas para formular mejores preguntas.
                          </p>
                        </div>
                      </div>

                      <ul
                        className={`space-y-3 text-sm ${
                          isDark ? "text-neutral-300" : "text-slate-700"
                        }`}
                      >
                        <li className="flex gap-2">
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                              isDark ? "bg-cyan-400/80" : "bg-cyan-400/70"
                            }`}
                          />
                          <div>
                            <p className="text-[13px] font-medium">Pide ejemplos concretos.</p>
                            <p
                              className={`text-[11px] ${
                                isDark ? "text-neutral-500" : "text-slate-500"
                              }`}
                            >
                              Evita respuestas genéricas: solicita casos reales, cifras y resultados.
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-2">
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                              isDark ? "bg-cyan-400/80" : "bg-cyan-400/70"
                            }`}
                          />
                          <div>
                            <p className="text-[13px] font-medium">
                              Explora vacíos laborales y cambios de rol.
                            </p>
                            <p
                              className={`text-[11px] ${
                                isDark ? "text-neutral-500" : "text-slate-500"
                              }`}
                            >
                              Profundiza en periodos sin docencia o transiciones poco claras.
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-2">
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                              isDark ? "bg-cyan-400/80" : "bg-cyan-400/70"
                            }`}
                          />
                          <div>
                            <p className="text-[13px] font-medium">Refuerza la dimensión ética.</p>
                            <p
                              className={`text-[11px] ${
                                isDark ? "text-neutral-500" : "text-slate-500"
                              }`}
                            >
                              Verifica coherencia entre discurso, uso de IA y manejo de conflictos.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Área Principal (Formulario o Resultados) */}
              <section className="relative">
                {!analysisResult && !isLoading && !error && (
                  <div className="animate-[fadeIn_300ms_ease-out]">
                    <InterviewForm onSubmit={handleFormSubmit} />
                  </div>
                )}

                {isLoading && (
                   <div className="py-20 flex flex-col items-center justify-center animate-[pulse_2s_infinite]">
                     {/* Placeholder visual para loading state */}
                     <LoadingState />
                     <p className="mt-6 text-sm text-emerald-400/80 font-medium animate-pulse">
                       Analizando patrones pedagógicos y éticos...
                     </p>
                   </div>
                )}

                {error && (
                  <div className="animate-[shake_0.5s_ease-in-out] mx-auto max-w-2xl mt-8">
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-6 text-center shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Error en el análisis</h3>
                      <p className="text-red-200/80 mb-6">{error}</p>
                      
                      <button
                        onClick={handleReset}
                        className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20"
                      >
                        Intentar Nuevamente
                      </button>
                    </div>
                  </div>
                )}

                {analysisResult && interviewData && !error && (
                  <div className="animate-[slideUp_400ms_ease-out]">
                    <AnalysisResults
                      result={analysisResult}
                      interviewData={interviewData}
                      onReset={handleReset}
                      evaluationId={evaluationId ?? undefined}
                    />
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ================= VISTA: HISTORIAL ================= */}
          {mode === "history" && (
            <div className="animate-[fadeInUp_400ms_ease-out]">
              <div className="relative">
                 {/* Fondo decorativo detrás de la tabla/lista */}
                 <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent blur-3xl -z-10" />         
                 <EvaluationsHistory
                  onBackToAnalyze={() => setMode("analyze")}
                  onOpenEvaluation={handleOpenEvaluationFromHistory}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal: Guía rápida del flujo */}
      {isFlowHelpOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={[
              "relative w-full max-w-2xl mx-4 rounded-3xl border shadow-[0_30px_120px_rgba(0,0,0,0.9)] overflow-hidden",
              isDark
                ? "border-white/10 bg-[#050505]"
                : "border-slate-200 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]",
            ].join(" ")}
          >
            <div
              className={[
                "absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent",
                !isDark ? "opacity-70" : "",
              ].join(" ")}
            />

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div
                    className={[
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-[0.18em]",
                      isDark
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                        : "bg-emerald-50 border-emerald-400/40 text-emerald-700",
                    ].join(" ")}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Guía para el líder</span>
                  </div>
                  <h3
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Cómo usar este panel de evaluación
                  </h3>
                  <p
                    className={`text-sm ${
                      isDark ? "text-neutral-400" : "text-slate-600"
                    }`}
                  >
                    Esta vista está pensada para que registres evaluaciones trazables de
                    cada docente y generes evidencia clara para quienes toman la decisión final,
                    combinando tu criterio con la analítica de IA.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFlowHelpOpen(false)}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border transition",
                    isDark
                      ? "border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700",
                  ].join(" ")}
                  aria-label="Cerrar guía rápida"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={[
                    "rounded-2xl p-4 space-y-2 border",
                    isDark
                      ? "bg-white/[0.02] border-white/10"
                      : "bg-slate-50 border-slate-200",
                  ].join(" ")}
                >
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                      isDark ? "text-neutral-400" : "text-slate-500"
                    }`}
                  >
                    Paso 1 · Captura
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Registra el contexto completo del docente.
                  </p>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? "text-neutral-400" : "text-slate-600"
                    }`}
                  >
                    Entre más detalladas sean las respuestas, más preciso será el
                    análisis. Evita copiar textos genéricos de hojas de vida.
                  </p>
                </div>

                <div
                  className={[
                    "rounded-2xl p-4 space-y-2 border",
                    isDark
                      ? "bg-white/[0.02] border-white/10"
                      : "bg-slate-50 border-slate-200",
                  ].join(" ")}
                >
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                      isDark ? "text-neutral-400" : "text-slate-500"
                    }`}
                  >
                    Paso 2 · Análisis IA
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Interpreta el resumen ejecutivo y los riesgos.
                  </p>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? "text-neutral-400" : "text-slate-600"
                    }`}
                  >
                    Revisa el veredicto, las alertas y las recomendaciones antes de
                    decidir. Usa el PDF como soporte formal de la entrevista.
                  </p>
                </div>

                <div
                  className={[
                    "rounded-2xl p-4 space-y-2 border",
                    isDark
                      ? "bg-white/[0.02] border-white/10"
                      : "bg-slate-50 border-slate-200",
                  ].join(" ")}
                >
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                      isDark ? "text-neutral-400" : "text-slate-500"
                    }`}
                  >
                    Paso 3 · Reporte
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Genera y comparte el reporte oficial.
                  </p>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? "text-neutral-400" : "text-slate-600"
                    }`}
                  >
                    Descarga el PDF y compártelo con el comité o con las personas
                    responsables de tomar la decisión institucional sobre el docente.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                <div
                  className={`flex items-center gap-2 text-[11px] ${
                    isDark ? "text-neutral-500" : "text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Recuerda: la IA es un apoyo, la decisión siempre es humana.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFlowHelpOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-[11px] font-bold uppercase tracking-[0.22em] hover:brightness-110 transition"
                >
                  Entendido, continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Nota legal sutil */}
      <footer className="py-6 text-center border-t border-white/5 mt-auto">
         <p className="text-[10px] text-white/20 uppercase tracking-widest">
            Sistema de Evaluación Docente · CUN © {new Date().getFullYear()}
         </p>
      </footer>

      {/* Definición de Keyframes Tailwind-friendly */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default LeaderConsole;