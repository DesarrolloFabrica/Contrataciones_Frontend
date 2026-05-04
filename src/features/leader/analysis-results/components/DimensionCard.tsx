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
        "group relative p-6 rounded-2xl transition-all duration-300 overflow-hidden border",
        isDark
          ? "bg-[#0A0A0A] border-white/5 hover:border-white/10"
          : "bg-white border-slate-200 hover:border-emerald-200 shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
      ].join(" ")}
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full ${styles.bg.replace(
          "/10",
          "",
        )} transition-all duration-300 opacity-40 group-hover:opacity-90`}
      />

      <div className="flex justify-between items-start mb-4">
        <div>
          <h4
            className={[
              "font-bold text-sm tracking-wide",
              isDark ? "text-neutral-200" : "text-slate-900",
            ].join(" ")}
          >
            {cat.category}
          </h4>
          <span
            className={[
              "text-[10px] uppercase font-mono mt-1 block",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Análisis Vectorial
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
          className={`text-xs leading-relaxed border-l pl-3 ${
            isDark
              ? "text-neutral-400 border-white/5"
              : "text-slate-600 border-slate-200"
          }`}
        >
          {cat.reporteAnalitico}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div
            className={[
              "p-3 rounded-lg border",
              isDark
                ? "bg-white/[0.02] border-white/5"
                : "bg-emerald-50 border-emerald-100",
            ].join(" ")}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400/80 uppercase">
                Fortaleza
              </span>
            </div>
            <p
              className={`text-[11px] leading-snug ${
                isDark ? "text-neutral-500" : "text-emerald-900"
              }`}
            >
              {cat.oportunidades}
            </p>
          </div>

          <div
            className={[
              "p-3 rounded-lg border",
              isDark
                ? "bg-white/[0.02] border-white/5"
                : "bg-amber-50 border-amber-100",
            ].join(" ")}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <AlertOctagon className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400/80 uppercase">
                A mejorar
              </span>
            </div>
            <p
              className={`text-[11px] leading-snug ${
                isDark ? "text-neutral-500" : "text-amber-900"
              }`}
            >
              {cat.recomendaciones}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionCard;
