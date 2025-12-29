import React, { useMemo, useState } from "react";
import AdminAuditTimeline from "./AdminAuditTimeline";
import { auditMockEvents } from "./mock/auditMockData";

type Mode = "GLOBAL" | "EVAL_ONLY";

export default function AdminAuditTimelinePreview() {
  const [mode, setMode] = useState<Mode>("GLOBAL");
  const [hideAdmin, setHideAdmin] = useState(false);

  const events = useMemo(() => {
    if (mode === "EVAL_ONLY") {
      return auditMockEvents.filter((e) => e.entityType === "EVALUATION");
    }
    return auditMockEvents;
  }, [mode]);

  return (
    <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-white font-bold text-sm uppercase tracking-wide">
            Preview Auditoría (Mock)
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Este panel es solo para validar cómo se ve el Timeline con datos de ejemplo.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode((m) => (m === "GLOBAL" ? "EVAL_ONLY" : "GLOBAL"))}
            className="text-xs px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
          >
            {mode === "GLOBAL" ? "Ver solo Evaluaciones" : "Ver Global"}
          </button>

          <button
            type="button"
            onClick={() => setHideAdmin((s) => !s)}
            className={`text-xs px-3 py-2 rounded-xl border ${
              hideAdmin
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200"
            }`}
          >
            {hideAdmin ? "Ocultando ADMIN" : "Mostrar ADMIN"}
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#0a0a0a]/50">
        <AdminAuditTimeline
          title={mode === "GLOBAL" ? "Historial global (mock)" : "Actividad de evaluaciones (mock)"}
          events={events}
          hideAdminEvents={hideAdmin}
        />
      </div>
    </div>
  );
}
