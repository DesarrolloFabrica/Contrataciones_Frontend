import React from "react";
import AuditTimeline from "../../../components/AuditTimeline";
import { TimelineTab } from "../types";
import { useTheme } from "../../../context/ThemeContext";

type Props = {
  timelineTab: TimelineTab;
  setTimelineTab: (v: TimelineTab) => void;

  activityByEval: any[];
  activityGlobal: any[];
};

const AuditTab: React.FC<Props> = ({ timelineTab, setTimelineTab, activityByEval, activityGlobal }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className={`text-[11px] uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-600"}`}>Actividad</p>


        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setTimelineTab("EVAL")}
            className={`px-3 py-1 rounded-full border ${
              timelineTab === "EVAL"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                : isDark
                  ? "border-[#579689]/20 text-slate-400 hover:border-[#58bea1]/45"
                  : "border-slate-200 text-slate-600 hover:border-emerald-400"
            }`}
          >
            Esta evaluación
          </button>

          <button
            type="button"
            onClick={() => setTimelineTab("GLOBAL")}
            className={`px-3 py-1 rounded-full border ${
              timelineTab === "GLOBAL"
                ? "border-brand-500 bg-brand-500/10 text-brand-300"
                : isDark
                  ? "border-[#579689]/20 text-slate-400 hover:border-[#58bea1]/45"
                  : "border-slate-200 text-slate-600 hover:border-emerald-400"
            }`}
          >
            Global
          </button>
        </div>
      </div>

      <AuditTimeline
        title={timelineTab === "EVAL" ? "Actividad de esta evaluación" : "Actividad global (últimos eventos)"}
        events={timelineTab === "EVAL" ? activityByEval : activityGlobal}
        emptyText="Aún no hay actividad."
        compact
      />
    </div>
  );
};

export default AuditTab;
