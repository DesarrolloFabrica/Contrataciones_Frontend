import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import type { AnalysisResult } from "../../../types";

type Props = { analysis: AnalysisResult };

const AiSummaryTab: React.FC<Props> = ({ analysis }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const risk = analysis.overallRiskLevel?.toLowerCase();
  const riskBadgeClass =
    risk === "bajo"
      ? isDark
        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
        : "bg-emerald-50 text-emerald-700 border-emerald-200"
      : risk === "alto"
        ? isDark
          ? "bg-red-500/10 text-red-300 border-red-500/25"
          : "bg-red-50 text-red-700 border-red-200"
        : risk === "medio"
          ? isDark
            ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
            : "bg-amber-50 text-amber-700 border-amber-200"
          : isDark
            ? "bg-slate-500/10 text-slate-300 border-[#579689]/20"
            : "bg-slate-100 text-slate-700 border-slate-200";

  const shell = isDark
    ? "bg-[#091d22] border-[#579689]/20"
    : "bg-white border-slate-200 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.18)]";
  const card = isDark
    ? "bg-[#0d252b] border-[#579689]/18"
    : "bg-slate-50/80 border-slate-200";
  const title = isDark ? "text-slate-200" : "text-slate-800";
  const muted = isDark ? "text-slate-400" : "text-slate-600";

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 space-y-4 ${shell}`}>
        <p className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Resumen IA
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className={`rounded-xl border px-4 py-3 ${card}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${title}`}>Puntaje global</span>
            <p className="mt-2 text-2xl font-black leading-none text-brand-600 dark:text-[#72c4ae]">
              {analysis.overallScore.toFixed(1)}
              <span className={`ml-1 text-sm font-semibold ${muted}`}>/100</span>
            </p>
          </div>

          <div className={`rounded-xl border px-4 py-3 ${card}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${title}`}>Nivel de riesgo</span>
            <span className={`mt-2 block w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold ${riskBadgeClass}`}>
              {analysis.overallRiskLevel}
            </span>
          </div>
        </div>

        <div className={`rounded-xl border px-4 py-3 ${card}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${title}`}>Veredicto IA</span>
          <span className={`mt-2 block text-sm font-semibold ${muted}`}>{analysis.finalVerdict}</span>
        </div>

        <div className={`rounded-xl border px-4 py-3 ${card}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${title}`}>Resumen ejecutivo</p>
          <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{analysis.executiveSummary}</p>
        </div>
      </div>
    </div>
  );
};

export default AiSummaryTab;
