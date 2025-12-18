// src/pages/admin/components/audit/AdminAuditPanel.tsx
import React, { useMemo, useState } from "react";
import type { AdminAuditEvent, TimelineTab } from "../../adminTypes";
import AdminAuditTimeline from "./AdminAuditTimeline";

type Props = {
  evaluationId?: string | null;
  activityByEval: AdminAuditEvent[];
  activityGlobal: AdminAuditEvent[];
  defaultTab?: TimelineTab;
};

const AdminAuditPanel: React.FC<Props> = ({
  evaluationId,
  activityByEval,
  activityGlobal,
  defaultTab = "EVAL",
}) => {
  const [timelineTab, setTimelineTab] = useState<TimelineTab>(defaultTab);

  const effectiveTab = useMemo(() => {
    if (!evaluationId) return "GLOBAL";
    return timelineTab;
  }, [evaluationId, timelineTab]);

  const events = effectiveTab === "EVAL" ? activityByEval : activityGlobal;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-gray-500">
          Actividad
        </p>

        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            disabled={!evaluationId}
            onClick={() => setTimelineTab("EVAL")}
            className={`px-3 py-1 rounded-full border transition ${
              effectiveTab === "EVAL"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-gray-400 hover:border-emerald-500/40"
            } ${!evaluationId ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            Esta evaluación
          </button>

          <button
            type="button"
            onClick={() => setTimelineTab("GLOBAL")}
            className={`px-3 py-1 rounded-full border transition ${
              effectiveTab === "GLOBAL"
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 text-gray-400 hover:border-cyan-500/40"
            }`}
          >
            Global
          </button>
        </div>
      </div>

      <AdminAuditTimeline
            title="Actividad de esta evaluación"
            events={events}
            compact
            />
    </div>
  );
};

export default AdminAuditPanel;
