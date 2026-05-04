// src/pages/leader/LeaderConsole.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
// Types & Services
import type {
  InterviewData,
  AnalysisResult,
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
import Header from "../../components/Header";
import InterviewForm from "../../components/InterviewForm";
import AnalysisResults from "../../components/AnalysisResults";
import LoadingState from "../../components/LoadingState";
import EvaluationsHistory from "../../components/EvaluationsHistory";
import { LeaderIntroPanel } from "../../features/leader/components/LeaderIntroPanel";
import { LeaderFlowHelpModal } from "../../features/leader/components/LeaderFlowHelpModal";
import { LeaderErrorState } from "../../features/leader/components/LeaderErrorState";
import { toBackendTeacherForm, mapFormToInterviewData } from "../../features/leader/utils/leaderMappers";

const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

type ViewMode = "analyze" | "history";

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

      // ✅ Validar datos obligatorios ANTES de llamar IA
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
        // ✅ PASO 1: Resolver o crear candidato ANTES de llamar IA
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

        // ✅ PASO 2: Ejecutar IA (solo si el candidato está listo)
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

        // ✅ PASO 3: Guardar evaluación con candidateId garantizado
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
              
        <LeaderIntroPanel
          currentStep={currentStep}
          status={status}
          onOpenFlowHelp={() => setIsFlowHelpOpen(true)}
        />

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
        <LeaderErrorState error={error} onReset={handleReset} />
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
        <LeaderFlowHelpModal onClose={() => setIsFlowHelpOpen(false)} />
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