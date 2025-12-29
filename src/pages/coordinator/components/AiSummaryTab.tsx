import React from "react";
import { AnalysisResult } from "../../../types";

type Props = {
  analysis: AnalysisResult;
};

const AiSummaryTab: React.FC<Props> = ({ analysis }) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#090909] border border-white/10 rounded-2xl p-4 space-y-4">
        <p className="text-[11px] uppercase tracking-widest text-gray-500">Resumen IA</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Score Global</span>
            <p className="mt-1 text-2xl font-bold text-emerald-400 leading-none">
              {analysis.overallScore.toFixed(1)}
              <span className="text-sm text-gray-500 ml-1">/100</span>
            </p>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Nivel de riesgo</span>
            <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-slate-800 text-gray-100 text-[11px] font-semibold">
              {analysis.overallRiskLevel}
            </span>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Veredicto IA</span>
            <span className="mt-2 text-xs font-semibold text-gray-200 block">
              {analysis.finalVerdict}
            </span>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">Resumen ejecutivo</p>
          <p className="text-xs text-gray-400 leading-relaxed">{analysis.executiveSummary}</p>
        </div>
      </div>
    </div>
  );
};

export default AiSummaryTab;
