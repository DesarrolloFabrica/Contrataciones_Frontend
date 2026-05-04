import React, { useMemo } from "react";
import { Scale, Sparkles } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

interface EvaluationComparisonPreviewProps {
  interviewsCount: number;
  candidateName: string;
  hasComparisonData: boolean;
  onCompare: () => void;
  compareLoading: boolean;
  compareError: string;
  onRetry?: () => void;
}

export const EvaluationComparisonPreview: React.FC<
  EvaluationComparisonPreviewProps
> = ({
  interviewsCount,
  candidateName,
  hasComparisonData,
  onCompare,
  compareLoading,
  compareError,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const canCompare = interviewsCount >= 2;

  const statusMessage = useMemo(() => {
    if (compareLoading) return "Comparando con IA...";
    if (compareError) return "Error en la comparación";
    if (hasComparisonData) return "Comparación disponible";
    if (canCompare) return "Listo para comparar";
    return "Se necesitan 2+ entrevistas";
  }, [compareLoading, compareError, hasComparisonData, canCompare]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-emerald-100 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent ${
          !isDark ? "opacity-70" : ""
        }`}
      />
      <div className="relative p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
            Comparación IA entre entrevistas
          </div>
          <div
            className={`mt-1 text-sm ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {canCompare
              ? `Compara las entrevistas de ${candidateName} y detecta evolución.`
              : "Se necesita al menos 2 entrevistas del mismo candidato para usar la comparación."}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span
              className={`px-2.5 py-1 rounded-full border ${
                isDark
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {interviewsCount} entrevistas
            </span>
            <span
              className={`px-2.5 py-1 rounded-full border ${
                isDark
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {statusMessage}
            </span>
          </div>

          <button
            type="button"
            onClick={onCompare}
            disabled={!canCompare || compareLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all ${
              canCompare && !compareLoading
                ? isDark
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-[#020408] hover:border-transparent shadow-[0_0_18px_rgba(16,185,129,0.18)]"
                  : "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_10px_25px_rgba(16,185,129,0.35)]"
                : isDark
                  ? "border-white/10 bg-white/[0.02] text-white/25 cursor-not-allowed"
                  : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {compareLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Comparando...
              </>
            ) : (
              <>
                <Scale className="w-4 h-4" />
                Comparar IA
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nota de comparativo futuro */}
      {interviewsCount < 2 && (
        <div
          className={`border-t px-4 py-3 text-[11px] ${
            isDark ? "border-white/5 text-white/40" : "border-slate-200 text-slate-400"
          }`}
        >
          El comparativo entre candidatos por perfil se habilitará cuando exista
          soporte backend.
        </div>
      )}
    </div>
  );
};

export default EvaluationComparisonPreview;
