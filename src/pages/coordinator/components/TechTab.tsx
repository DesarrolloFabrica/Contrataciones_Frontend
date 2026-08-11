import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import type { AnalysisResult } from "../../../types";

type Props = { analysis: AnalysisResult };

const TechTab: React.FC<Props> = ({ analysis }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${isDark ? "bg-[#091d22] border-[#579689]/20" : "bg-white border-slate-200 shadow-sm"}`}>
        <p className={`mb-2 text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Técnico / Debug
        </p>
        <pre className={`overflow-auto rounded-xl border p-3 text-[11px] ${isDark ? "bg-[#061419]/70 border-[#579689]/18 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
          {JSON.stringify(analysis, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TechTab;
