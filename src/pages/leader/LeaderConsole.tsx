// src/pages/leader/LeaderConsole.tsx
import React, { useState, useCallback, useEffect } from "react";

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

import { useLocation } from "react-router-dom";

import Header from "../../components/Header";
import InterviewForm from "../../components/InterviewForm";
import AnalysisResults from "../../components/AnalysisResults";
import LoadingState from "../../components/LoadingState";
import EvaluationsHistory from "../../components/EvaluationsHistory";
import { useAuth } from "../../context/AuthContext";
import { auditAppend } from "../../services/auditService";
import { actorFromUser } from "../../services/auditActor";

// ✅ mapper centralizado (frontend: documentNumber)
import { mapInterviewToTeacherForm } from "../../services/mappers/mapInterviewToTeacherForm";

const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

type ViewMode = "analyze" | "history";

/**
 * ✅ Adaptador FINAL (solo para el request al backend)
 * Mantiene tu frontend en camelCase (documentNumber),
 * pero envía snake_case (document_number) si el backend lo espera.
 */
const toBackendTeacherForm = (form: TeacherForm) => {
  return {
    ...form,
    candidate: {
      ...form.candidate,
      document_number: form.candidate.documentNumber?.trim() || "",
    },
  };
};

// inverso: TeacherForm -> InterviewData (para reconstruir el reporte)
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

const LeaderConsole: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>("analyze");

  const { user } = useAuth();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ 1) flujo normal: analizar desde el formulario
   * - InterviewForm adjunta candidateId (seleccionado o creado)
   * - backend exige candidateId UUID
   */
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
        // ✅ candidateId viene “inyectado” desde InterviewForm (no está en InterviewData tipado)
        const candidateId = (data as any)?.candidateId as string | null;

        if (!candidateId) {
          // importante: tu backend lo exige
          setError(
            "Debes seleccionar o crear el candidato (por cédula) antes de ejecutar el análisis."
          );
          return;
        }

        // 1) IA
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

        // 2) mapper central (frontend: documentNumber)
        const formFrontend: TeacherForm = mapInterviewToTeacherForm(data);

        // 3) adaptar SOLO para backend (snake_case)
        const formBackend = toBackendTeacherForm(formFrontend);

        // 4) guardar evaluación (backend exige 4 args: orgId, candidateId, form, aiResult)
        const saved = await createTeacherEvaluation(
          ORG_ID,
          candidateId,
          formBackend as any,
          aiResult
        );

        auditAppend({
          type: "EVALUATION_CREATED",
          actor,
          metadata: {
            orgId: ORG_ID,
            candidateId: saved.candidateId ?? candidateId,
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const evaluationIdFromUrl = params.get("evaluationId");
    if (!evaluationIdFromUrl) return;

    handleOpenEvaluationFromHistory(evaluationIdFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  /**
   * ✅ 2) abrir detalle desde el historial
   */
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

        // ✅ para consistencia del flujo (por si luego lo necesitas)
        // InterviewForm solo lo usa al submit, pero acá lo dejamos disponible
        (interview as any).candidateId = detail.candidateId ?? null;

        setInterviewData(interview);
        setAnalysisResult(analysis);
        setEvaluationId(detail.id);

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

  const handleReset = useCallback(() => {
    setInterviewData(null);
    setAnalysisResult(null);
    setEvaluationId(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const brandFrom = "#91DC00";
  const brandTo = "#31AB2E";

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans overflow-x-hidden relative">
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

      <Header mode={mode} onChangeMode={setMode} />

      <main className="w-full relative z-10">
        {mode === "analyze" && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] overflow-hidden">
              <div
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, ${brandFrom}, ${brandTo})`,
                }}
              />

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

              <div className="px-4 md:px-10 py-8">
                {!analysisResult && !isLoading && !error && (
                  <div className="animate-[fadeInUp_320ms_ease-out]">
                    <InterviewForm onSubmit={handleFormSubmit} />
                  </div>
                )}

                {isLoading && (
                  <div className="animate-[fadeInUp_220ms_ease-out]">
                    <LoadingState />
                  </div>
                )}

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

            <p className="text-[11px] text-white/45 text-center mt-5">
              Consejo: revisa el historial para comparar reportes y decisiones de contratación.
            </p>
          </div>
        )}

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
