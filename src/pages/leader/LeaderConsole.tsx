// src/pages/leader/LeaderConsole.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
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
  searchTeacherCandidates,
} from "../../services/teachersService";
import {
  createCandidateDocument,
  uploadCandidateResume,
  type CandidateDocumentType,
} from "../../services/candidateDocumentsService";
import { createManualHiringRequest } from "../../services/hiringRequestsService";
import { auditAppend } from "../../services/auditService";
import { actorFromUser } from "../../services/auditActor";
import { mapInterviewToTeacherForm } from "../../services/mappers/mapInterviewToTeacherForm";
import apiClient from "../../services/apiClient";

// Context
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Components
import InterviewForm from "../../components/InterviewForm";
import AnalysisResults from "../../components/AnalysisResults";
import LoadingState from "../../components/LoadingState";
import EvaluationsHistory from "../../components/EvaluationsHistory";
import { LeaderFlowHelpModal } from "../../features/leader/components/LeaderFlowHelpModal";
import { LeaderErrorState } from "../../features/leader/components/LeaderErrorState";
import { LeaderHero } from "../../features/leader/components/LeaderHero";
import { LeaderModeHeader } from "../../features/leader/components/LeaderModeHeader";
import { LeaderWorkspaceSidebar } from "../../features/leader/components/LeaderWorkspaceSidebar";
import { LeaderAmbientDecor } from "../../features/leader/components/LeaderAmbientDecor";
import { toBackendTeacherForm, mapFormToInterviewData } from "../../features/leader/utils/leaderMappers";
import { InterviewerInbox } from "../../features/interviews/InterviewerInbox";

const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

/**
 * Convergencia INTERVIEWER: la bandeja CHARLAS es la experiencia principal.
 * El formulario/historial teacher legacy se conserva detrás de este flag para la siguiente fase.
 */
const ENABLE_LEGACY_INTERVIEWER_FORM = false as boolean;

type ViewMode = "analyze" | "history";
type ExamplePreset = "approved" | "medium" | "rejected" | null;
type WizardStep = 1 | 2 | 3 | 4 | 5;
type InterviewerCounts = { pending: number; inProgress: number; completed: number };

type SchoolWithPrograms = {
  id?: string;
  name?: string;
  programs?: Array<{ id?: string; name?: string }>;
};

async function resolveSchoolAndProgramIds(
  schoolName: string,
  programName: string,
): Promise<{ schoolId: string | null; programId: string | null }> {
  const schoolNameNormalized = schoolName.trim().toLowerCase();
  const programNameNormalized = programName.trim().toLowerCase();
  if (!schoolNameNormalized || !programNameNormalized) {
    return { schoolId: null, programId: null };
  }

  const { data } = await apiClient.get<SchoolWithPrograms[] | { items?: SchoolWithPrograms[] }>("/schools", {
    params: { includePrograms: "true" },
  });

  const schools = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  const matchedSchool = schools.find(
    (school) => String(school?.name ?? "").trim().toLowerCase() === schoolNameNormalized,
  );

  if (!matchedSchool?.id) {
    return { schoolId: null, programId: null };
  }

  const matchedProgram = (matchedSchool.programs ?? []).find(
    (program) => String(program?.name ?? "").trim().toLowerCase() === programNameNormalized,
  );

  return {
    schoolId: String(matchedSchool.id),
    programId: matchedProgram?.id ? String(matchedProgram.id) : null,
  };
}

const LeaderConsole: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode: ViewMode = searchParams.get("view") === "history" ? "history" : "analyze";
  const setMode = useCallback(
    (next: ViewMode) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === "history") params.set("view", "history");
          else params.delete("view");
          return params;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isFlowHelpOpen, setIsFlowHelpOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [requestedWizardStep, setRequestedWizardStep] = useState<WizardStep | null>(null);
  const [examplePreset, setExamplePreset] = useState<ExamplePreset>(null);
  const [interviewerCounts, setInterviewerCounts] = useState<InterviewerCounts | null>(null);

  const handleFormSubmit = useCallback(
    async (data: InterviewData) => {
      const actor = actorFromUser(user);

      const fullName = (data.candidateName ?? "").trim();
      let schoolId = (data.schoolId ?? "").trim();
      let programId = (data.programId ?? "").trim();

      if ((!schoolId || !programId) && data.school?.trim() && data.program?.trim()) {
        try {
          const resolvedIds = await resolveSchoolAndProgramIds(data.school, data.program);
          schoolId = schoolId || String(resolvedIds.schoolId ?? "").trim();
          programId = programId || String(resolvedIds.programId ?? "").trim();
        } catch {
          setWarning("No se pudo validar catálogo de escuelas/programas en este momento. Verifica conexión con backend.");
        }
      }

      if (!fullName || !schoolId || !programId) {
        const missing: string[] = [];
        if (!fullName) missing.push("nombre del candidato");
        if (!schoolId) missing.push("escuela/coordinación");
        if (!programId) missing.push("programa académico");
        setError(`Faltan datos obligatorios: ${missing.join(", ")}. Selecciona escuela y programa válidos antes de ejecutar el análisis.`);
        return;
      }

      const enrichedData: InterviewData = {
        ...(data as any),
        schoolId,
        programId,
      };

      const docItems = ((data as any)?.candidateDocuments?.items ?? []) as Array<any>;
      const resumeItem = docItems.find((item) => String(item?.id) === "resume");
      if (!resumeItem?.file) {
        setError("La hoja de vida es el documento principal y es obligatoria.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setWarning(null);
      setAnalysisResult(null);
      setInterviewData(enrichedData);
      setEvaluationId(null);

      try {
        let candidateId: string | null = (data as any)?.candidateId ?? null;
        const documentNumber = (data.documentNumber ?? "").trim();

        if (!candidateId && documentNumber) {
          const found = await searchTeacherCandidates({
            orgId: ORG_ID,
            q: documentNumber,
            limit: 8,
          });

          const exact = found.find(
            (c) => String(c.documentNumber ?? "").trim() === documentNumber
          );

          if (exact?.id) {
            candidateId = exact.id;
            setWarning("Fallback técnico: candidato encontrado por cédula y reutilizado.");
          }
        }

        if (!candidateId) {
          throw new Error("Debes buscar o crear el candidato antes de ejecutar el análisis.");
        }
        const resolvedCandidateId = candidateId;

        auditAppend({
          type: "AI_ANALYSIS_STARTED",
          actor,
          metadata: { orgId: ORG_ID },
        });

        const interviewOnlyData: InterviewData = { ...(enrichedData as InterviewData) };
        delete (interviewOnlyData as any).candidateDocuments;
        delete (interviewOnlyData as any).hiringContext;
        delete (interviewOnlyData as any).hiringRequestId;

        const aiResult: TeacherAiResult = await analyzeTeacherInterview(interviewOnlyData);

        auditAppend({
          type: "AI_ANALYSIS_FINISHED",
          actor,
          metadata: {
            orgId: ORG_ID,
            overallScore: aiResult.rawOutput?.overallScore ?? null,
            risk: aiResult.rawOutput?.overallRiskLevel ?? null,
            verdict: aiResult.rawOutput?.finalVerdict ?? null,
          },
        });

        const formFrontend: TeacherForm = mapInterviewToTeacherForm(enrichedData);
        const formBackend = toBackendTeacherForm(formFrontend);

        let hiringRequestId = (data as any)?.hiringRequestId ?? (data as any)?.hiringContext?.hiringRequestId ?? null;
        if (!hiringRequestId) {
          const ctx: any = (data as any)?.hiringContext ?? {};
          const role = String(ctx.targetRole ?? "").trim();
          const description = String(ctx.needDescription ?? "").trim();
          if (!role || !description) {
            throw new Error(
              "En modo manual debes completar al menos cargo/perfil y descripción de la necesidad."
            );
          }

          try {
            const createdHr = await createManualHiringRequest({
              positionName: role,
              roleName: role,
              profile: String(ctx.processType ?? "Manual"),
              area: String(ctx.requestingArea ?? "").trim() || null,
              coordination: String(ctx.coordination ?? "").trim() || null,
              priority: String(ctx.priority ?? "").trim() || null,
              schoolId: schoolId || null,
              programId: programId || null,
              description,
              externalSource: "MANUAL",
            });
            hiringRequestId = createdHr.id;
          } catch (err: any) {
            throw new Error(
              err?.response?.data?.message ??
              "No se pudo crear el contexto manual de vacante. Verifica los datos del contexto e intenta nuevamente."
            );
          }
        }
        (formBackend as any).hiringContext = (data as any)?.hiringContext ?? null;
        (formBackend as any).candidateDocuments = (data as any)?.candidateDocuments ?? null;

        const saved = await createTeacherEvaluation(ORG_ID, formBackend as any, aiResult, {
          hiringRequestId,
        });

        const mapTypeById: Record<string, CandidateDocumentType> = {
          resume: "RESUME",
          "academic-certificates": "ACADEMIC_CERTIFICATE",
          "work-certificates": "WORK_CERTIFICATE",
          portfolio: "PORTFOLIO",
          "identity-document": "IDENTITY_DOCUMENT",
          "other-supports": "OTHER",
        };

        const resumeNotes = String(resumeItem?.note ?? "").trim();
        try {
          await uploadCandidateResume({
            file: resumeItem.file,
            candidateId: resolvedCandidateId,
            evaluationId: saved.id,
            hiringRequestId,
            notes: resumeNotes || null,
          });
        } catch (resumeError: any) {
          if (import.meta.env.DEV) {
            console.error("[LEADER] Resume upload failed", {
              message: resumeError?.message,
              status: resumeError?.response?.status,
              data: resumeError?.response?.data,
            });
          }
          throw new Error(
            resumeError?.response?.data?.message ??
              "La evaluación se creó, pero falló la subida de la hoja de vida. Intenta nuevamente en documentos del candidato."
          );
        }

        let docFailures = 0;
        for (const item of docItems) {
          if (String(item?.id ?? "") === "resume") continue;
          const link = String(item?.tempUrl ?? "").trim();
          const note = String(item?.note ?? "").trim();
          if (!link && !note) continue;

          const type = mapTypeById[String(item?.id ?? "")] ?? "OTHER";
          try {
            await createCandidateDocument({
              candidateId: resolvedCandidateId,
              evaluationId: saved.id,
              hiringRequestId,
              documentType: type,
              sourceType: "URL",
              url: link || null,
              notes: note || null,
              isPrimaryResume: false,
            });
          } catch {
          }
        }

        if (docFailures > 0) {
          setWarning(
            `La evaluación se guardó, pero ${docFailures} documento(s) no se pudieron registrar. Puedes volver a cargarlos luego.`
          );
        }

        auditAppend({
          type: "EVALUATION_CREATED",
          actor,
          metadata: {
            orgId: ORG_ID,
            candidateId: saved.candidateId,
            evaluationId: saved.id,
            hiringRequestId,
            documentNumber: data.documentNumber ?? null,
          },
        });

        setEvaluationId(saved.id);

        if (aiResult.rawOutput) {
          setAnalysisResult(aiResult.rawOutput);
        }
      } catch (err: any) {
        console.error("[LEADER] Error during analysis or save:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });

        setAnalysisResult(null);
        setEvaluationId(null);
        setError(
          (Array.isArray(err?.response?.data?.message)
            ? err.response.data.message.join(". ")
            : err?.response?.data?.message) ??
            (err instanceof Error ? err.message : "Ocurrió un error durante el proceso.")
        );
        throw err;
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

        const form = detail.formRawData ?? {};
        const analysis: AnalysisResult =
          detail.aiRawJson ??
          ({
            overallRiskLevel: "Medio",
            overallScore: Number(detail.aiTeachingSuitabilityScore ?? 0),
            executiveSummary: detail.aiOverallComment ?? "",
            categoryAnalyses: [],
            mitigationRecommendations: [],
            resignationRiskWindow: "",
            temporalRiskFactors: [],
            finalVerdict: detail.aiFinalRecommendation ?? "",
          } as AnalysisResult);

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
  }, [location.search]);

  const handleRetryAnalysis = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  const handleReset = useCallback(() => {
    setInterviewData(null);
    setAnalysisResult(null);
    setEvaluationId(null);
    setIsLoading(false);
    setError(null);
    setWarning(null);
    setWizardStep(1);
  }, []);

  const handleSelectWizardStep = useCallback((step: WizardStep) => {
    if (analysisResult) {
      handleReset();
    }
    setMode("analyze");
    setRequestedWizardStep(step);
  }, [analysisResult, handleReset]);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/login";
  }, [logout]);

  const statusLabel = useMemo(() => {
    if (!ENABLE_LEGACY_INTERVIEWER_FORM) {
      if (!interviewerCounts) return "Mis charlas";
      const open = interviewerCounts.pending + interviewerCounts.inProgress;
      if (open > 0) return `${open} por atender`;
      return "Al día";
    }
    if (isLoading) return "Procesando...";
    if (error) return "Error";
    if (analysisResult) return "Completado";
    return "Listo";
  }, [isLoading, error, analysisResult, interviewerCounts]);

  const handleInterviewerCounts = useCallback((counts: InterviewerCounts) => {
    setInterviewerCounts(counts);
  }, []);

  return (
    <div
      className={`relative h-[100dvh] w-full font-sans overflow-hidden flex flex-col ${
        isDark ? "bg-[#071214] text-white" : "bg-white text-slate-900"
      }`}
    >
      <div className="relative z-20 flex min-h-0 flex-1 flex-col overflow-hidden">
        <LeaderModeHeader
          mode={mode}
          onChangeMode={setMode}
          onLogout={handleLogout}
          onOpenHelp={() => setIsFlowHelpOpen(true)}
          statusLabel={statusLabel}
        />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <LeaderWorkspaceSidebar
          mode={mode}
          currentStep={wizardStep}
          onChangeMode={setMode}
          onSelectStep={handleSelectWizardStep}
          onOpenHelp={() => setIsFlowHelpOpen(true)}
          counts={ENABLE_LEGACY_INTERVIEWER_FORM ? null : interviewerCounts}
        />

        <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <LeaderAmbientDecor />
          <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6 md:py-5">
              {!ENABLE_LEGACY_INTERVIEWER_FORM && (
                <div className="space-y-4 animate-[fadeInUp_400ms_ease-out]">
                  {mode === "analyze" && (
                    <LeaderHero
                      counts={interviewerCounts}
                      onOpenHelp={() => setIsFlowHelpOpen(true)}
                    />
                  )}
                  <InterviewerInbox
                    mode={mode === "history" ? "history" : "inbox"}
                    onCountsChange={handleInterviewerCounts}
                  />
                </div>
              )}

              {ENABLE_LEGACY_INTERVIEWER_FORM && mode === "analyze" && (
                <div className="space-y-4 animate-[fadeInUp_400ms_ease-out]">
                  {!analysisResult && (
                    <LeaderHero
                      counts={null}
                      onOpenHelp={() => setIsFlowHelpOpen(true)}
                    />
                  )}

                  {!analysisResult && (
                    <div className="relative">
                      {error && (
                        <div className="mb-4">
                          <LeaderErrorState error={error} onRetry={handleRetryAnalysis} variant="banner" />
                        </div>
                      )}

                      {isLoading && (
                        <div
                          className={`absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm ${
                            isDark ? "bg-[#071214]/80" : "bg-white/80"
                          }`}
                        >
                          <LoadingState />
                          <p className="mt-6 text-sm font-medium text-emerald-500 animate-pulse">
                            Analizando la entrevista del candidato...
                          </p>
                        </div>
                      )}

                      <div className={isLoading ? "pointer-events-none opacity-60" : undefined}>
                        <InterviewForm
                          onSubmit={handleFormSubmit}
                          onStepChange={(step) => setWizardStep(step as WizardStep)}
                          requestedStep={requestedWizardStep}
                          onRequestedStepApplied={() => setRequestedWizardStep(null)}
                          examplePreset={examplePreset}
                          onExampleApplied={() => setExamplePreset(null)}
                        />
                      </div>
                    </div>
                  )}

                  {warning && !error && (
                    <div className={`rounded-lg border px-4 py-3 text-sm ${isDark ? "border-amber-400/30 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                      {warning}
                    </div>
                  )}

                  {analysisResult && interviewData && (
                    <div className="animate-[slideUp_400ms_ease-out] w-full">
                      <AnalysisResults
                        result={analysisResult}
                        interviewData={interviewData}
                        onReset={handleReset}
                        evaluationId={evaluationId ?? undefined}
                      />
                    </div>
                  )}
                </div>
              )}

              {ENABLE_LEGACY_INTERVIEWER_FORM && mode === "history" && (
                <div className="animate-[fadeInUp_400ms_ease-out]">
                  <EvaluationsHistory
                    onBackToAnalyze={() => setMode("analyze")}
                    onOpenEvaluation={handleOpenEvaluationFromHistory}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
        </div>
      </div>

      {isFlowHelpOpen && (
        <LeaderFlowHelpModal onClose={() => setIsFlowHelpOpen(false)} />
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LeaderConsole;
