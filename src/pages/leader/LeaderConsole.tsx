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
import { useAuth } from "../../context/AuthContext";
import { auditAppend } from "../../services/auditService";
import { actorFromUser } from "../../services/auditActor";

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

  const { user } = useAuth();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1) flujo normal: analizar desde el formulario (NO TOCAR LÓGICA)
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

        const form = mapToTeacherForm(data);
        const saved = await createTeacherEvaluation(ORG_ID, form, aiResult);

        auditAppend({
          type: "EVALUATION_CREATED",
          actor,
          evaluationId: saved.id,
          metadata: { orgId: ORG_ID, candidateId: saved.candidateId },
        });

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
    [user]
  );

  // 2) abrir detalle desde el historial (NO TOCAR LÓGICA)
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
          evaluationId: detail.id,
          metadata: { source: "leader-history" },
        });

        const form: TeacherForm = detail.formRawData;
        const analysis: AnalysisResult = detail.aiRawJson;

        const interview = mapFormToInterviewData(form);

        setInterviewData(interview);
        setAnalysisResult(analysis);
        setEvaluationId(detail.id);

        // volvemos a la vista de reporte
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
    [user]
  );

  // reset (NO TOCAR LÓGICA)
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

  // Chip de estado (solo visual)
  const renderStatusChip = () => {
    // ✅ Estilos más “sistema” y consistentes (sin tocar lógica)
    if (error) {
      return (
        <span className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full border border-red-500/25 bg-red-950/35 text-red-200/90">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400/80" />
          Error
        </span>
      );
    }
    if (isLoading) {
      return (
        <span className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full border border-white/12 bg-white/[0.035] text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" />
          Analizando…
        </span>
      );
    }
    if (analysisResult) {
      return (
        <span className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-200/90">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
          Reporte listo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full border border-white/12 bg-white/[0.035] text-white/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
        Listo para analizar
      </span>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans overflow-x-hidden relative">
      {/* =========================================================
          FONDO / ATMÓSFERA (SOLO VISUAL)
          - Más “centro brillante” + viñeta suave
          - No afecta interacción (pointer-events-none)
         ========================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* núcleo (centro) más luminoso */}
        <div
          className="absolute left-1/2 top-[-120px] -translate-x-1/2 h-[520px] w-[1050px] rounded-full blur-3xl opacity-25"
          style={{
            background: `radial-gradient(circle at center, ${brandTo} 0%, rgba(0,0,0,0) 62%)`,
          }}
        />

        {/* glow secundaria inferior */}
        <div
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-[650px] w-[1200px] rounded-full blur-3xl opacity-18"
          style={{
            background: `radial-gradient(circle at center, ${brandFrom} 0%, rgba(0,0,0,0) 60%)`,
          }}
        />

        {/* textura muy sutil */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background:
              "radial-gradient(circle at 18% 10%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 46%), radial-gradient(circle at 82% 88%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 46%)",
          }}
        />

        {/* viñeta: oscurece bordes para dirigir mirada al centro */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      {/* Header existente (NO TOCAR LÓGICA) */}
      <Header mode={mode} onChangeMode={setMode} />

      {/* leader-scope: “scope” para aplicar estilos a las tarjetas internas SIN envolver todo en una mega tarjeta */}
      <main className="w-full relative z-10 leader-scope">
        {/* =========================================================
            MODO: ANALYZE
           ========================================================= */}
        {mode === "analyze" && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-7 md:py-9">
            {/* =========================
                Encabezado de página (solo UI)
                - Más jerarquía y guía
               ========================= */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7 md:mb-8">
              <div className="max-w-3xl">
                {/* tag superior estilo “sistema” */}
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-200/80 border border-emerald-500/15 bg-emerald-500/10 shadow-[0_0_18px_-10px_rgba(16,185,129,0.25)]">
                  Sistema inteligente
                </div>

                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
                  Consola de Líder
                </h1>

                <p className="text-sm md:text-base text-white/60 mt-2 leading-relaxed">
                  Analiza entrevistas y revisa el historial de evaluaciones para
                  comparar reportes y decisiones.
                </p>

                {/* mini “pasos” de flujo (solo visual) */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-white/10 bg-white/[0.03]">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                    1. Datos
                  </span>
                  <span className="text-white/25">→</span>
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-white/10 bg-white/[0.03]">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                    2. Estrategia
                  </span>
                  <span className="text-white/25">→</span>
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-white/10 bg-white/[0.03]">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                    3. Ética
                  </span>
                  <span className="text-white/25">→</span>
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-white/10 bg-white/[0.03]">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                    4. Reporte
                  </span>
                </div>
              </div>

              {/* Estado (solo visual) */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/55">Estado:</span>
                {renderStatusChip()}
              </div>
            </div>

            {/* =========================
                CONTENIDO: FORM / LOADING / ERROR / RESULTS
                (NO TOCAR LÓGICA)
               ========================= */}

            {/* FORM */}
            {!analysisResult && !isLoading && !error && (
              <div className="animate-[fadeInUp_220ms_ease-out]">
                <InterviewForm onSubmit={handleFormSubmit} />
              </div>
            )}

            {/* LOADING */}
            {isLoading && (
              <div className="py-12 animate-[fadeInUp_180ms_ease-out]">
                <LoadingState />
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="py-10 text-center animate-[fadeInUp_180ms_ease-out]">
                <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/25 bg-red-950/35 px-5 py-4 shadow-[0_18px_60px_-45px_rgba(0,0,0,0.95)]">
                  <p className="text-sm text-red-200/90">
                    <strong className="font-bold">Error:</strong>
                    <span className="ml-2">{error}</span>
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="mt-6 rounded-2xl py-3 px-7 text-sm font-extrabold tracking-widest uppercase text-black transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
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
              <div className="animate-[fadeInUp_220ms_ease-out]">
                <AnalysisResults
                  result={analysisResult}
                  interviewData={interviewData}
                  onReset={handleReset}
                  evaluationId={evaluationId ?? undefined}
                />
              </div>
            )}

            {/* Nota inferior */}
            {!isLoading && (
              <p className="text-[11px] text-white/45 text-center mt-10">
                Consejo: revisa el historial para comparar reportes y decisiones
                de contratación.
              </p>
            )}
          </div>
        )}

        {/* =========================================================
            MODO: HISTORY
           ========================================================= */}
        {mode === "history" && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-7 md:py-9">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7 md:mb-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyan-200/80 border border-cyan-500/15 bg-cyan-500/10 shadow-[0_0_18px_-10px_rgba(34,211,238,0.22)]">
                  Panel de consulta
                </div>

                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
                  Historial de evaluaciones
                </h1>

                <p className="text-sm md:text-base text-white/60 mt-2 leading-relaxed">
                  Abre una evaluación para ver el reporte completo.
                </p>
              </div>

              <span className="text-[11px] text-white/45">
                Tip: usa búsqueda y filtros para encontrar más rápido.
              </span>
            </div>

            <div className="animate-[fadeInUp_220ms_ease-out]">
              <EvaluationsHistory
                onBackToAnalyze={() => setMode("analyze")}
                onOpenEvaluation={handleOpenEvaluationFromHistory}
              />
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          CSS inline (SOLO VISUAL)
          - Eleva tarjetas internas sin tocar InterviewForm/AnalysisResults
          - Corrige bug visual (antes había un bg rojo raro en rounded-3xl)
         ========================================================= */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* Normaliza transiciones suaves para UI “premium” (solo visual) */
          .leader-scope * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Tarjetas principales (rounded-2xl/3xl con borde) */
          .leader-scope :where(div, section, article)
            .rounded-2xl.border:not(input):not(textarea):not(select):not(button),
          .leader-scope :where(div, section, article)
            .rounded-3xl.border:not(input):not(textarea):not(select):not(button) {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255,255,255,0.14);
            box-shadow:
              0 10px 40px rgba(0,0,0,0.55),
              0 0 0 1px rgba(145,220,0,0.07);
          }

          /* Hover suave (solo en dispositivos con hover) */
          @media (hover: hover) {
            .leader-scope :where(div, section, article)
              .rounded-2xl.border:not(input):not(textarea):not(select):not(button):hover,
            .leader-scope :where(div, section, article)
              .rounded-3xl.border:not(input):not(textarea):not(select):not(button):hover {
              border-color: rgba(255,255,255,0.18);
              box-shadow:
                0 14px 54px rgba(0,0,0,0.62),
                0 0 0 1px rgba(145,220,0,0.10),
                0 0 32px rgba(49,171,46,0.10);
              transform: translateY(-1px);
              transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
            }
          }

          /* Responsive: reduce un poco el “aire” en móvil */
          @media (max-width: 640px) {
            .leader-scope .text-2xl { letter-spacing: -0.01em; }
          }
        `}
      </style>
    </div>
  );
};

export default LeaderConsole;
