// src/pages/leader/LeaderConsole.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle2, FlaskConical, XCircle } from "lucide-react";
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
  createTeacherCandidate,
} from "../../services/teachersService";
import { auditAppend } from "../../services/auditService";
import { actorFromUser } from "../../services/auditActor";
import { mapInterviewToTeacherForm } from "../../services/mappers/mapInterviewToTeacherForm";

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
import { LeaderQuickGuideCard } from "../../features/leader/components/LeaderQuickGuideCard";
import { toBackendTeacherForm, mapFormToInterviewData } from "../../features/leader/utils/leaderMappers";
import AnimatedBackground from "../../components/AnimatedBackground";

const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

type ViewMode = "analyze" | "history";
type ExamplePreset = "approved" | "medium" | "rejected" | null;

const LeaderConsole: React.FC = () => {
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
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [examplePreset, setExamplePreset] = useState<ExamplePreset>(null);

  const handleFormSubmit = useCallback(
    async (data: InterviewData) => {
      const actor = actorFromUser(user);

      const fullName = (data.candidateName ?? "").trim();
      const schoolId = (data.schoolId ?? "").trim();
      const programId = (data.programId ?? "").trim();

      if (!fullName || !schoolId || !programId) {
        const missing: string[] = [];
        if (!fullName) missing.push("nombre del candidato");
        if (!schoolId) missing.push("escuela/coordinación");
        if (!programId) missing.push("programa académico");
        setError(`Faltan datos obligatorios: ${missing.join(", ")}. Selecciona escuela y programa antes de ejecutar el análisis.`);
        return;
      }

      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      setInterviewData(data);
      setEvaluationId(null);

      try {
        let candidateId: string | null = null;
        const documentNumber = (data.documentNumber ?? "").trim();

        if (documentNumber) {
          const found = await searchTeacherCandidates({
            orgId: ORG_ID,
            q: documentNumber,
            limit: 8,
          });

          const exact =
            found.find(
              (c) => String(c.documentNumber ?? "").trim() === documentNumber
            ) ?? found[0];

          if (exact?.id) {
            candidateId = exact.id;
          }
        }

        if (!candidateId) {
          if (!documentNumber) {
            throw new Error("Se requiere documento de identidad para crear el candidato.");
          }

          try {
            const ageNum = Number(data.age);
            const age = Number.isFinite(ageNum) && ageNum > 0 ? ageNum : null;

            const created = await createTeacherCandidate({
              orgId: ORG_ID,
              documentNumber,
              fullName,
              age,
              schoolId,
              programId,
            });
            candidateId = created.id;
          } catch (err: any) {
            if (err?.response?.status === 409) {
              const again = await searchTeacherCandidates({
                orgId: ORG_ID,
                q: documentNumber,
                limit: 8,
              });
              candidateId = again?.[0]?.id ?? null;
            } else {
              throw err;
            }
          }
        }

        if (!candidateId) {
          throw new Error("No se pudo resolver ni crear el candidato. Verifica los datos.");
        }

        auditAppend({
          type: "AI_ANALYSIS_STARTED",
          actor,
          metadata: { orgId: ORG_ID },
        });

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
        console.error("Error during analysis or save:", {
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
  }, [location.search]);

  const handleReset = useCallback(() => {
    setInterviewData(null);
    setAnalysisResult(null);
    setEvaluationId(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("AUTH_TOKEN");
    try {
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const statusLabel = useMemo(() => {
    if (isLoading) return "Procesando...";
    if (error) return "Error";
    if (analysisResult) return "Completado";
    return "Listo";
  }, [isLoading, error, analysisResult]);

  return (
    <div
      className={`min-h-screen w-full font-sans overflow-x-hidden flex flex-col ${
        isDark ? "bg-[#020308] text-white" : "bg-[#F4F7FC] text-slate-900"
      }`}
    >
      <LeaderModeHeader
        mode={mode}
        onChangeMode={setMode}
        onLogout={handleLogout}
        statusLabel={statusLabel}
      />

      <main className="flex-1 relative z-10 w-full">
        <AnimatedBackground />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 relative z-10">
          {mode === "analyze" && (
            <div className="space-y-6 md:space-y-8 animate-[fadeInUp_400ms_ease-out]">
              <LeaderHero />

              {!analysisResult && !isLoading && !error && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                  <div className="animate-[fadeIn_300ms_ease-out]">
                    <InterviewForm
                      onSubmit={handleFormSubmit}
                      onStepChange={setWizardStep}
                      examplePreset={examplePreset}
                      onExampleApplied={() => setExamplePreset(null)}
                    />
                  </div>

                  <aside className="hidden lg:block space-y-4 sticky top-28">
                    <LeaderQuickGuideCard
                      currentStep={wizardStep}
                      onOpenFlowHelp={() => setIsFlowHelpOpen(true)}
                    />
                    <div
                      className={`rounded-2xl border p-4 space-y-3 ${
                        isDark
                          ? "bg-gradient-to-b from-[#080D16] to-[#0A1018] border-white/[0.06]"
                          : "bg-white border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.06)]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            isDark
                              ? "bg-cyan-500/10 border border-cyan-500/20"
                              : "bg-cyan-50 border border-cyan-200"
                          }`}
                        >
                          <FlaskConical className={`h-4 w-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                        </div>
                        <div>
                          <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${isDark ? "text-white" : "text-slate-900"}`}>
                            Datos de ejemplo
                          </p>
                          <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                            Carga casos de prueba sin editar el formulario completo.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setExamplePreset("approved")}
                          className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold transition ${
                            isDark
                              ? "border-white/10 text-slate-200 hover:bg-emerald-500/10 hover:border-emerald-400/30"
                              : "border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Perfil aprobado
                        </button>
                        <button
                          type="button"
                          onClick={() => setExamplePreset("medium")}
                          className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold transition ${
                            isDark
                              ? "border-white/10 text-slate-200 hover:bg-amber-500/10 hover:border-amber-400/30"
                              : "border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-200"
                          }`}
                        >
                          <AlertCircle className="h-4 w-4 text-amber-400" />
                          Perfil medio
                        </button>
                        <button
                          type="button"
                          onClick={() => setExamplePreset("rejected")}
                          className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold transition ${
                            isDark
                              ? "border-white/10 text-slate-200 hover:bg-rose-500/10 hover:border-rose-400/30"
                              : "border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-200"
                          }`}
                        >
                          <XCircle className="h-4 w-4 text-rose-400" />
                          Perfil rechazado
                        </button>
                      </div>
                    </div>
                  </aside>
                </div>
              )}

              {isLoading && (
                <div className="py-24 flex flex-col items-center justify-center">
                  <LoadingState />
                  <p className="mt-6 text-sm text-cyan-400/80 font-medium animate-pulse">
                    Analizando patrones pedagógicos y éticos...
                  </p>
                </div>
              )}

              {error && (
                <LeaderErrorState error={error} onReset={handleReset} />
              )}

              {analysisResult && interviewData && !error && (
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

          {mode === "history" && (
            <div className="animate-[fadeInUp_400ms_ease-out]">
              {isDark && (
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />
              )}
              <EvaluationsHistory
                onBackToAnalyze={() => setMode("analyze")}
                onOpenEvaluation={handleOpenEvaluationFromHistory}
              />
            </div>
          )}
        </div>
      </main>

      {isFlowHelpOpen && (
        <LeaderFlowHelpModal onClose={() => setIsFlowHelpOpen(false)} />
      )}

      <footer className="py-6 text-center border-t border-white/5 mt-auto">
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          Sistema de Evaluación Docente · CUN © {new Date().getFullYear()}
        </p>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LeaderConsole;
