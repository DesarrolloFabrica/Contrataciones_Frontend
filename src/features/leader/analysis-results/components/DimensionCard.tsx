import React from "react";
import { TrendingUp, AlertOctagon } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { getScoreDetails } from "../utils/analysisResultStyles";

interface DimensionCardProps {
  cat: any;
}

export const DimensionCard: React.FC<DimensionCardProps> = ({ cat }) => {
  const styles = getScoreDetails(cat.score);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "group relative rounded-2xl transition-all duration-300 overflow-hidden border",
        isDark
          ? "bg-gradient-to-b from-[#111A2B]/90 via-[#0F1727]/78 to-[#0B1220]/68 border-white/[0.1] hover:border-cyan-400/28"
          : "bg-white border-slate-200 hover:border-cyan-200 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)]",
      ].join(" ")}
    >
      <div
        className={`absolute top-0 left-0 w-[3px] h-full transition-all duration-300 opacity-50 group-hover:opacity-100 ${
          cat.score >= 80 ? "bg-cyan-500" : cat.score >= 60 ? "bg-amber-500" : "bg-rose-500"
        }`}
      />

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4
              className={[
                "font-bold text-sm tracking-wide",
                isDark ? "text-slate-200" : "text-slate-900",
              ].join(" ")}
            >
              {cat.category}
            </h4>
            <span
              className={[
                "text-[10px] uppercase font-semibold mt-0.5 block tracking-wider",
                isDark ? "text-slate-500" : "text-slate-400",
              ].join(" ")}
            >
              Analisis Vectorial
            </span>
          </div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl ${styles.bg} ${styles.border} border`}
          >
            <span className={`text-sm font-bold ${styles.color}`}>
              {Math.round(cat.score)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <p
            className={`text-xs leading-relaxed border-l-2 pl-3 ${
              isDark
                ? "text-slate-400 border-cyan-500/20"
                : "text-slate-600 border-cyan-300"
            }`}
          >
            {cat.reporteAnalitico}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div
              className={[
                "p-3 rounded-xl border transition-colors",
                isDark
                  ? "bg-cyan-500/5 border-cyan-500/15"
                  : "bg-cyan-50 border-cyan-200",
              ].join(" ")}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className={`w-3 h-3 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
                  Fortaleza
                </span>
              </div>
              <p
                className={`text-[11px] leading-snug ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {cat.oportunidades}
              </p>
            </div>

            <div
              className={[
                "p-3 rounded-xl border transition-colors",
                isDark
                  ? "bg-amber-500/5 border-amber-500/15"
                  : "bg-amber-50 border-amber-200",
              ].join(" ")}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <AlertOctagon className={`w-3 h-3 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                  A mejorar
                </span>
              </div>
              <p
                className={`text-[11px] leading-snug ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {cat.recomendaciones}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionCard;
