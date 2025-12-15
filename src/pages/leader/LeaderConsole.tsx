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
    [user]
  );

  // 2) abrir detalle desde el historial
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
    [user]
  );

  const handleReset = useCallback(() => {
    setInterviewData(null);
    setAnalysisResult(null);
    setEvaluationId(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans overflow-x-hidden">
      <Header mode={mode} onChangeMode={setMode} />

      <main className="w-full">
        {mode === "analyze" && (
          <>
            {!analysisResult && !isLoading && (
              <InterviewForm onSubmit={handleFormSubmit} />
            )}

            {isLoading && (
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <LoadingState />
              </div>
            )}

            {error && (
              <div className="max-w-7xl mx-auto px-4 md:px-8 text-center p-8">
                <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                  <strong className="font-bold">Error:</strong>
                  <span className="ml-2">{error}</span>
                </div>

                <button
                  onClick={handleReset}
                  className="mt-6 bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition-colors duration-300"
                >
                  Comenzar de Nuevo
                </button>
              </div>
            )}

            {analysisResult && interviewData && (
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <AnalysisResults
                  result={analysisResult}
                  interviewData={interviewData}
                  onReset={handleReset}
                  evaluationId={evaluationId ?? undefined}
                />
              </div>
            )}
          </>
        )}

        {mode === "history" && (
          <EvaluationsHistory
            onBackToAnalyze={() => setMode("analyze")}
            onOpenEvaluation={handleOpenEvaluationFromHistory}
          />
        )}
      </main>
    </div>
  );
};

export default LeaderConsole;
