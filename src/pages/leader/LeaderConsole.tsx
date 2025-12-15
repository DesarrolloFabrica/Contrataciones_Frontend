// src/pages/leader/LeaderConsole.tsx
import React, { useState, useCallback } from "react";
import {
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

import Header from "../../components/Header";
import InterviewForm from "../../components/InterviewForm";
import AnalysisResults from "../../components/AnalysisResults";
import LoadingState from "../../components/LoadingState";
import EvaluationsHistory from "../../components/EvaluationsHistory";

const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

type ViewMode = "analyze" | "history";

const mapToTeacherForm = (data: InterviewData): TeacherForm => ({
  candidate: {
    fullName: data.candidateName,
    age: Number(data.age) || 0,
    schoolName: data.school,
    programName: data.program,
    careerSummary: data.careerSummary,
    teachingExperience: data.previousExperience,
  },
  availability: {
    scheduleDetails: data.availabilityDetails,
    acceptsCommittees: data.acceptsCommittees,
    otherJobsImpact: data.otherJobs,
  },
  classroomManagement: {
    evaluationMethodology: data.evaluationMethodology,
    planIfHalfFail: data.failureRatePlan,
    handleApatheticStudent: data.apatheticStudentPlan,
  },
  aiAttitude: {
    usesAiHow: data.aiToolsUsage,
    ethicalUseMeasures: data.ethicalAiMeasures,
    handleAiPlagiarism: data.aiPlagiarismPrevention,
  },
  coherenceCommitment: {
    caseStudent2_9: data.scenario29,
    emergencyProtocol: data.scenarioCoverage,
    handleNegativeFeedback: data.scenarioFeedback,
  },
});

// inverso: TeacherForm -> InterviewData (para reconstruir el reporte)
const mapFormToInterviewData = (form: TeacherForm): InterviewData => ({
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

const LeaderConsole: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>("analyze");

  const [interviewData, setInterviewData] =
    useState<InterviewData | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1) flujo normal: analizar desde el formulario
  const handleFormSubmit = useCallback(
    async (data: InterviewData) => {
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      setInterviewData(data);
      setEvaluationId(null);

      try {
        const aiResult: TeacherAiResult = await analyzeTeacherInterview(data);

        if (aiResult.rawOutput) {
          setAnalysisResult(aiResult.rawOutput);
        }

        const form = mapToTeacherForm(data);
        const saved = await createTeacherEvaluation(ORG_ID, form, aiResult);
        // el backend devuelve { id, candidateId }, donde id = id de la evaluación
        setEvaluationId(saved.id);
      } catch (err) {
        console.error("Error during analysis or save:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error durante el proceso."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 2) abrir detalle desde el historial
  const handleOpenEvaluationFromHistory = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      setInterviewData(null);
      setEvaluationId(null);

      try {
        const detail = await getTeacherEvaluationById(id);
        // detail.formRawData y detail.aiRawJson salen tal cual del backend
        const form: TeacherForm = detail.formRawData;
        const analysis: AnalysisResult = detail.aiRawJson;

        const interview = mapFormToInterviewData(form);

        setInterviewData(interview);
        setAnalysisResult(analysis);
        setEvaluationId(detail.id);

        // volvemos a la vista de reporte (misma que tras un análisis nuevo)
        setMode("analyze");
      } catch (err) {
        console.error("Error al cargar detalle de evaluación:", err);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el detalle de la evaluación."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleReset = useCallback(() => {
    setInterviewData(null);
    setAnalysisResult(null);
    setEvaluationId(null);
    setIsLoading(false);
    setError(null);
  }, []);

  // ==============================
  // VARIABLES VISUALES (SOLO UI)
  // ==============================
  const brandFrom = "#91DC00"; // verde claro (como login)
  const brandTo = "#31AB2E"; // verde marca (como login)

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans overflow-x-hidden relative">
      {/* =========================================
          DECORACIÓN DE FONDO (SOLO VISUAL)
          - blobs suaves para look premium
          - no afecta interacción (pointer-events-none)
         ========================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-25"
          style={{
            background: `radial-gradient(circle, ${brandTo} 0%, rgba(0,0,0,0) 65%)`,
          }}
        />
        <div
          className="absolute -bottom-28 -right-28 h-[520px] w-[520px] rounded-full blur-3xl opacity-20"
          style={{
            background: `radial-gradient(circle, ${brandFrom} 0%, rgba(0,0,0,0) 65%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background:
              "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 45%), radial-gradient(circle at 80% 90%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 45%)",
          }}
        />
      </div>

      {/* Header existente (no se toca lógica) */}
      <Header mode={mode} onChangeMode={setMode} />

      <main className="w-full relative z-10">
        {/* =========================
            MODO: ANALYZE
           ========================= */}
        {mode === "analyze" && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            {/* =========================================
                PANEL “DOCK” (SOLO UI)
                - unifica form/loading/error/results
                - estética tipo login: glass + borde sutil
               ========================================= */}
            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] overflow-hidden">
              {/* Barra superior sutil (acento de marca) */}
              <div
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, ${brandFrom}, ${brandTo})`,
                }}
              />

              {/* Cabecera interna (solo UI) */}
              <div className="px-6 md:px-10 pt-8 pb-6 border-b border-white/10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                      Consola de Líder
                    </h1>
                    <p className="text-sm text-white/60 mt-1">
                      Analiza entrevistas y revisa el historial de evaluaciones.
                    </p>
                  </div>

                  {/* Chip de estado (solo visual) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/60">Estado:</span>
                    {!isLoading && !error && !analysisResult && (
                      <span className="text-[11px] px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/80">
                        Listo para analizar
                      </span>
                    )}
                    {isLoading && (
                      <span className="text-[11px] px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/80">
                        Analizando...
                      </span>
                    )}
                    {error && (
                      <span className="text-[11px] px-3 py-1 rounded-full border border-red-500/30 bg-red-900/30 text-red-200">
                        Error
                      </span>
                    )}
                    {analysisResult && (
                      <span className="text-[11px] px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-200">
                        Reporte listo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenido (lo que ya existía, solo envuelto y con padding) */}
              <div className="px-4 md:px-10 py-8">
                {/* FORM */}
                {!analysisResult && !isLoading && !error && (
                  <div className="animate-[fadeInUp_320ms_ease-out]">
                    {/* El componente interno conserva su lógica;
                        aquí solo le damos un “marco” visual */}
                    <InterviewForm onSubmit={handleFormSubmit} />
                  </div>
                )}

                {/* LOADING */}
                {isLoading && (
                  <div className="animate-[fadeInUp_220ms_ease-out]">
                    <LoadingState />
                  </div>
                )}

                {/* ERROR */}
                {error && (
                  <div className="text-center p-6 md:p-10 animate-[fadeInUp_220ms_ease-out]">
                    <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/30 bg-red-950/40 px-5 py-4">
                      <p className="text-sm text-red-200">
                        <strong className="font-bold">Error:</strong>
                        <span className="ml-2">{error}</span>
                      </p>
                    </div>

                    <button
                      onClick={handleReset}
                      className="mt-6 rounded-2xl py-3 px-7 text-sm font-bold tracking-widest uppercase text-white transition hover:opacity-95"
                      style={{
                        background: `linear-gradient(90deg, ${brandFrom}, ${brandTo})`,
                      }}
                    >
                      Comenzar de Nuevo
                    </button>
                  </div>
                )}

                {/* RESULTS */}
                {analysisResult && interviewData && !error && (
                  <div className="animate-[fadeInUp_320ms_ease-out]">
                    <AnalysisResults
                      result={analysisResult}
                      interviewData={interviewData}
                      onReset={handleReset}
                      evaluationId={evaluationId ?? undefined}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Nota inferior (solo UI) */}
            <p className="text-[11px] text-white/45 text-center mt-5">
              Consejo: revisa el historial para comparar reportes y decisiones de contratación.
            </p>
          </div>
        )}

        {/* =========================
            MODO: HISTORY
            - No tocamos lógica, solo envolvemos con el mismo “dock”
           ========================= */}
        {mode === "history" && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] overflow-hidden">
              <div
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, ${brandFrom}, ${brandTo})`,
                }}
              />

              <div className="px-6 md:px-10 pt-8 pb-6 border-b border-white/10">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Historial de evaluaciones
                </h1>
                <p className="text-sm text-white/60 mt-1">
                  Abre una evaluación para ver el reporte completo.
                </p>
              </div>

              <div className="px-4 md:px-10 py-8 animate-[fadeInUp_280ms_ease-out]">
                <EvaluationsHistory
                  onBackToAnalyze={() => setMode("analyze")}
                  onOpenEvaluation={handleOpenEvaluationFromHistory}
                />
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Animación simple (solo CSS inline) */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default LeaderConsole;
