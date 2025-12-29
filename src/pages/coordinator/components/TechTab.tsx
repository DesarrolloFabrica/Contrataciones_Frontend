import React from "react";
import { AnalysisResult } from "../../../types";

type Props = {
  analysis: AnalysisResult;
};

const TechTab: React.FC<Props> = ({ analysis }) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#090909] border border-white/10 rounded-2xl p-4">
        <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-2">
          Técnico / Debug
        </p>

        <pre className="text-[11px] text-gray-400 bg-black/40 border border-white/10 rounded-xl p-3 overflow-auto">
{JSON.stringify(analysis, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TechTab;
