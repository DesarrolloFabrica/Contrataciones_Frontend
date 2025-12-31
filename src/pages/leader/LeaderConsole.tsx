// src/pages/leader/LeaderConsole.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

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
  const [mode, setMode] = useState<ViewMode>("analyze");

  const { user } = useAuth();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const status = useMemo(() => {
    if (isLoading) return { label: "Procesando...", cls: "border-emerald-500/50 bg-emerald-500/20 text-emerald-200 animate-pulse" };
    if (error) return { label: "Error detectado", cls: "border-red-500/50 bg-red-500/20 text-red-200" };
    if (analysisResult) return { label: "Análisis completado", cls: "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]" };
    return { label: "En espera", cls: "border-white/10 bg-white/5 text-white/50" };
  }, [isLoading, error, analysisResult]);

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans overflow-x-hidden flex flex-col">
      
      <Header mode={mode} onChangeMode={setMode} />

      <main className="flex-1 relative z-10 w-full">
        {/* Container principal alineado con el Header (px-6 es clave) */}
        <div className="container mx-auto px-6 py-8">
          
          {/* ================= VISTA: ANALIZAR ================= */}
          {mode === "analyze" && (
            <div className="animate-[fadeInUp_400ms_ease-out] space-y-8">
              
              {/* 1. Panel de Control / Guía (Estilo Dashboard) */}
              <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md shadow-2xl">
                 {/* Decoración de fondo sutil */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start justify-between">
                  {/* Izquierda: Título y Estado */}
                  <div className="flex flex-col gap-4 min-w-[200px]">
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        Panel de Evaluación
                      </h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Sigue el flujo para evaluar al docente.
                      </p>
                    </div>
                    
                    {/* Status Badge Moderno */}
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-300 ${status.cls}`}>
                            {status.label}
                        </div>
                    </div>
                  </div>

                  {/* Derecha: Pasos y Buenas Prácticas (Grid Layout) */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-auto">
                    {/* Card: Pasos */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Flujo
                        </h4>
                        <ol className="space-y-2 text-sm text-neutral-400 list-decimal list-inside marker:text-emerald-500/50">
                            <li>Llenar datos del candidato.</li>
                            <li>Ejecutar análisis de IA.</li>
                            <li>Exportar evidencia PDF.</li>
                        </ol>
                    </div>

                    {/* Card: Tips */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"/> Tips
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-400">
                            <li className="flex gap-2"><span className="text-cyan-500/50">•</span> Evita respuestas ambiguas.</li>
                            <li className="flex gap-2"><span className="text-cyan-500/50">•</span> Justifica los vacíos laborales.</li>
                            <li className="flex gap-2"><span className="text-cyan-500/50">•</span> Verifica coherencia ética.</li>
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