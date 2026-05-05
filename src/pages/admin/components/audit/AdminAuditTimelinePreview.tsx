import React, { useMemo, useState } from "react";
import AdminAuditTimeline from "./AdminAuditTimeline";
import { auditMockEvents } from "./mock/auditMockData";
import { useTheme } from "../../../../context/ThemeContext";

type Mode = "GLOBAL" | "EVAL_ONLY";

export default function AdminAuditTimelinePreview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mode, setMode] = useState<Mode>("GLOBAL");
  const [hideAdmin, setHideAdmin] = useState(false);

  const events = useMemo(() => {
    if (mode === "EVAL_ONLY") {
      return auditMockEvents.filter((e) => e.entityType === "EVALUATION");
    }
    return auditMockEvents;
  }, [mode]);

  const toggleBtn = (active: boolean) =>
    [
      "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border",
      active
        ? isDark
          ? "bg-white/10 text-white border-white/10"
          : "bg-white text-slate-900 border-slate-200 shadow-sm"
        : isDark
          ? "border-transparent text-neutral-500 hover:text-neutral-300"
          : "border-transparent text-slate-500 hover:text-slate-700",
    ].join(" ");

  return (
    <div className={[
      "rounded-2xl border overflow-hidden",
      isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white shadow-sm",
    ].join(" ")}>
      <div className={[
        "px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3",
        isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50",
      ].join(" ")}>
        <div>
          <p className={`text-[11px] uppercase tracking-widest font-semibold ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
            Vista previa (Mock)
          </p>
          <p className={`text-xs ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
            Datos de ejemplo para validar diseño
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex p-0.5 rounded-lg border bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setMode("GLOBAL")}
              className={toggleBtn(mode === "GLOBAL")}
            >
              Global
            </button>
            <button
              type="button"
              onClick={() => setMode("EVAL_ONLY")}
              className={toggleBtn(mode === "EVAL_ONLY")}
            >
              Solo Evaluaciones
            </button>
          </div>
          <button
            type="button"
            onClick={() => setHideAdmin((s) => !s)}
            className={[
              "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border",
              hideAdmin
                ? isDark
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                  : "bg-cyan-50 border-cyan-200 text-cyan-700"
                : isDark
                  ? "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            ].join(" ")}
          >
            {hideAdmin ? "Ocultando ADMIN" : "Mostrar ADMIN"}
          </button>
        </div>
      </div>
      <div className={isDark ? "bg-black/20" : "bg-slate-50/30"}>
        <div className="p-5">
          <AdminAuditTimeline
            title={mode === "GLOBAL" ? "Historial global (mock)" : "Actividad de evaluaciones (mock)"}
            events={events}
            hideAdminEvents={hideAdmin}
          />
        </div>
      </div>
    </div>
  );
}
