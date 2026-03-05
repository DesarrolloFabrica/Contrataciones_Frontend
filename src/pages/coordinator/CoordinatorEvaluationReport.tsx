// src/pages/coordinator/CoordinatorEvaluationReport.tsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

import type { AnalysisResult, InterviewData } from "../../types";
import { getTeacherEvaluationById } from "../../services/teachersService";
import { mapFormToInterviewData } from "./utils/mapFormToInterviewData";
import AnalysisResults from "../../components/AnalysisResults";
import { useTheme } from "../../context/ThemeContext";

type DetailTab = "ai" | "interviews" | "notes" | "decision";

const normalizeTab = (raw: string | null): DetailTab => {
  const t = String(raw ?? "").trim().toLowerCase();
  if (t === "interviews" || t === "entrevistas" || t === "comparativa") return "interviews";
  if (t === "notes" || t === "notas") return "notes";
  if (t === "decision" || t === "decisión" || t === "decision") return "decision";
  return "ai";
};

const CoordinatorEvaluationReport: React.FC = () => {
  const navigate = useNavigate();
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const initialTab = useMemo(() => normalizeTab(searchParams.get("tab")), [searchParams]);

  // -----------------------------
  // Estado local de carga
  // -----------------------------
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);

  // Para “auto-scroll” si el usuario viene por Comparativa
  const rootRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------
  // Helper: volver al panel de coordinador
  // -----------------------------
  const handleBack = useCallback(() => {
    navigate("/coordinator", { replace: false });
  }, [navigate]);

  // -----------------------------
  // Cargar detalle desde backend
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      if (!evaluationId) {
        setError("No se encontró el id de la evaluación en la URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const detail = await getTeacherEvaluationById(evaluationId);

        const ai: AnalysisResult = detail.aiRawJson;
        const interview: InterviewData = mapFormToInterviewData(detail);

        setAnalysis(ai);
        setInterviewData(interview);
      } catch (err) {
        console.error("Error cargando reporte (coordinator):", err);
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el reporte de la evaluación."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [evaluationId]);

  /**
   * ✅ “Compatibilidad inteligente” con la navegación:
   * - Si vienes con ?tab=interviews:
   *   - Intentamos abrir esa sección.
   *   - Como AnalysisResults es reutilizado y puede cambiar, hacemos fallback:
   *     1) buscar un elemento con data-anchor="interviews"
   *     2) buscar un heading que incluya "Entrevistas" o "Comparativa"
   *     3) si no existe nada, al menos hacemos scroll al inicio del reporte.
   */
  useEffect(() => {
    if (loading) return;
    if (error) return;
    if (!analysis || !interviewData) return;

    if (initialTab !== "interviews") return;

    // Espera un frame para que el DOM pinte
    requestAnimationFrame(() => {
      const root = rootRef.current ?? document;
      const byAnchor =
        (root as any).querySelector?.('[data-anchor="interviews"]') ??
        document.querySelector?.('[data-anchor="interviews"]');

      if (byAnchor && typeof (byAnchor as any).scrollIntoView === "function") {
        (byAnchor as any).scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      // Fallback: buscar título (muy tolerante)
      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,button"));
      const target = headings.find((el) => {
        const txt = (el.textContent ?? "").toLowerCase();
        return txt.includes("entrevist") || txt.includes("comparativ");
      });

      if (target && typeof (target as any).scrollIntoView === "function") {
        (target as any).scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      // Último fallback
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [initialTab, loading, error, analysis, interviewData]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div
      ref={rootRef}
      className={[
        "min-h-screen w-full font-sans relative overflow-x-hidden",
        isDark ? "bg-[#020202] text-white" : "bg-gray-50 text-gray-900",
      ].join(" ")}
    >
      {/* Fondo suave para coherencia visual */}
      {isDark && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-25 bg-emerald-500/10" />
          <div className="absolute -bottom-28 -right-28 h-[520px] w-[520px] rounded-full blur-3xl opacity-20 bg-cyan-500/10" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              background:
                "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 45%), radial-gradient(circle at 80% 90%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 45%)",
            }}
          />
        </div>
      )}

      {/* Barra superior simple */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            className={[
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition",
              isDark
                ? "border-white/10 bg-white/[0.03] text-white/80 hover:text-white hover:border-emerald-500/30"
                : "border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-300 shadow-sm",
            ].join(" ")}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </button>

          <div className="flex items-center gap-3">
            {initialTab === "interviews" ? (
              <span
                className={[
                  "text-[11px] px-2.5 py-1 rounded-full border",
                  isDark
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
                ].join(" ")}
              >
                Vista: Comparativa
              </span>
            ) : null}

            <div
              className={[
                "text-xs font-mono",
                isDark ? "text-white/45" : "text-slate-400",
              ].join(" ")}
            >
              Eval ID: {evaluationId ?? "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6">
        {loading && (
          <div
            className={[
              "flex flex-col items-center justify-center py-20 gap-3",
              isDark ? "text-white/60" : "text-slate-500",
            ].join(" ")}
          >
            <Loader2
              className={[
                "w-8 h-8 animate-spin",
                isDark ? "text-emerald-400" : "text-emerald-500",
              ].join(" ")}
            />
            <p className="text-sm">Cargando reporte completo…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="w-8 h-8" />
            <p
              className={[
                "text-sm text-center max-w-md",
                isDark ? "text-red-300" : "text-rose-600",
              ].join(" ")}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={handleBack}
              className={[
                "mt-4 px-4 py-2 rounded-xl border transition",
                isDark
                  ? "border-white/10 text-white/70 hover:text-white hover:border-emerald-500/30"
                  : "border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-300 shadow-sm",
              ].join(" ")}
            >
              Volver
            </button>
          </div>
        )}

        {!loading && !error && analysis && interviewData && (
          <div className="animate-[fadeInUp_320ms_ease-out]">
            <AnalysisResults
              result={analysis}
              interviewData={interviewData}
              onReset={handleBack}
              evaluationId={evaluationId ?? undefined}
              resetLabel="Volver al panel"
              initialTab={initialTab}
            />
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

export default CoordinatorEvaluationReport;