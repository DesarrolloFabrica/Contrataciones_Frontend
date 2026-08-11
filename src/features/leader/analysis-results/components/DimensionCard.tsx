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
        "group relative rounded-2xl transition-all duration-300 overflow-hidden border border-t-2 border-t-brand-500",
        isDark
          ? "bg-gradient-to-b from-[#102a30]/90 via-[#0d252b]/82 to-[#0a2025]/74 border-[#579689]/22 hover:border-[#58bea1]/38"
          : "bg-white border-brand-500/20 hover:border-brand-500/40 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)]",
      ].join(" ")}
    >
      <div
        className={`absolute top-0 left-0 w-[3px] h-full transition-all duration-300 opacity-50 group-hover:opacity-100 ${
          cat.score >= 80 ? "bg-brand-500" : cat.score >= 60 ? "bg-amber-500" : "bg-rose-500"
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
                ? "text-slate-400 border-brand-500/20"
                : "text-slate-600 border-brand-300"
            }`}
          >
            {cat.reporteAnalitico}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div
              className={[
                "p-3 rounded-xl border transition-colors",
                isDark
                  ? "bg-brand-500/5 border-brand-500/15"
                  : "bg-brand-50 border-brand-200",
              ].join(" ")}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className={`w-3 h-3 ${isDark ? "text-brand-400" : "text-brand-600"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-brand-300" : "text-brand-700"}`}>
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
