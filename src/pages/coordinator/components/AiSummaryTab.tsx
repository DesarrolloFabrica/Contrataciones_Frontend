import React from "react";
import { AnalysisResult } from "../../../types";

type Props = {
  analysis: AnalysisResult;
};

const AiSummaryTab: React.FC<Props> = ({ analysis }) => {
  const riskBadgeClass =
  analysis.overallRiskLevel?.toLowerCase() === "bajo"
    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
    : analysis.overallRiskLevel?.toLowerCase() === "alto"
    ? "bg-red-500/15 text-red-300 border border-red-500/30"
    : analysis.overallRiskLevel?.toLowerCase() === "medio"
    ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
    : "bg-slate-800 text-gray-100 border border-white/10";

  return (
    <div className="space-y-4">
      <div className="bg-[#090909] border border-white/10 rounded-2xl p-4 space-y-4">
        <p className="text-lg uppercase tracking-widest text-gray-500">Resumen IA</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3">
            <span className="text-base uppercase tracking-widest text-gray-200">Puntaje Global</span>
            <p className="mt-1 text-2xl font-bold text-emerald-400 leading-none">
              {analysis.overallScore.toFixed(1)}
              <span className="text-sm text-gray-500 ml-1">/100</span>
            </p>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3">
            <span className="text-base uppercase tracking-widest text-gray-200 mr-3">
              Nivel de riesgo
            </span>
ñ
            <span
              className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${riskBadgeClass}`}
            >
              {analysis.overallRiskLevel}
            </span>
          </div>
        </div>
          <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3">
            <span className="text-base uppercase tracking-widest text-gray-200">Veredicto IA</span>
            <span className="mt-2 text-sm font-semibold text-gray-400 block">
              {analysis.finalVerdict}
            </span>
          </div>
        <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3">
          <p className="text-base uppercase tracking-widest text-gray-200">Resumen ejecutivo</p>
          <p className="text-sm text-gray-400 leading-relaxed">{analysis.executiveSummary}</p>
        </div>

        <div className="h-px bg-white/10" />

      </div>
    </div>
  );
};

export default AiSummaryTab;
