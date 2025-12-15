import React from "react";
import AuditTimeline from "../../../components/AuditTimeline";
import { TimelineTab } from "../types";

type Props = {
  timelineTab: TimelineTab;
  setTimelineTab: (v: TimelineTab) => void;

  activityByEval: any[];
  activityGlobal: any[];
};

const AuditTab: React.FC<Props> = ({ timelineTab, setTimelineTab, activityByEval, activityGlobal }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-gray-500">Actividad</p>

        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setTimelineTab("EVAL")}
            className={`px-3 py-1 rounded-full border ${
              timelineTab === "EVAL"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-gray-400 hover:border-emerald-500/40"
            }`}
          >
            Esta evaluación
          </button>

          <button
            type="button"
            onClick={() => setTimelineTab("GLOBAL")}
            className={`px-3 py-1 rounded-full border ${
              timelineTab === "GLOBAL"
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 text-gray-400 hover:border-cyan-500/40"
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
