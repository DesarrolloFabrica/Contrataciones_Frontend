import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { type TimelineEvent } from "../utils/coordinatorTimeline";

interface ProcessTimelineProps {
  events: TimelineEvent[];
  orientation?: "vertical" | "horizontal";
  compact?: boolean;
}

const statusConfig = (status: TimelineEvent["status"], isDark: boolean) => {
  switch (status) {
    case "completed":
      return {
        dot: isDark ? "bg-emerald-400 border-emerald-300/40" : "bg-emerald-500 border-emerald-300",
        line: isDark ? "bg-emerald-500/35" : "bg-emerald-200",
        text: isDark ? "text-emerald-300" : "text-emerald-700",
        badge: isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700",
      };
    case "pending":
      return {
        dot: isDark ? "bg-amber-400 border-amber-300/30" : "bg-amber-500 border-amber-300",
        line: isDark ? "bg-white/10" : "bg-slate-200",
        text: isDark ? "text-amber-300" : "text-amber-700",
        badge: isDark ? "bg-amber-500/15 text-amber-300" : "bg-amber-50 text-amber-700",
      };
    case "unavailable":
      return {
        dot: isDark ? "bg-white/20 border-white/10" : "bg-slate-300 border-slate-200",
        line: isDark ? "bg-white/5" : "bg-slate-100",
        text: isDark ? "text-slate-500" : "text-slate-400",
        badge: isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-500",
      };
  }
};

function formatDate(date: string | null) {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  events,
  orientation = "vertical",
  compact = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (orientation === "horizontal") {
    return (
      <div className="w-full overflow-hidden">
        <ol
          className="grid w-full gap-1"
          style={{ gridTemplateColumns: `repeat(${Math.max(events.length, 1)}, minmax(0, 1fr))` }}
        >
          {events.map((event, idx) => {
            const cfg = statusConfig(event.status, isDark);
            const isLast = idx === events.length - 1;
            const dateLabel = formatDate(event.date);
            const statusLabel =
              event.status === "completed"
                ? event.label.toLowerCase().includes("aprob")
                  ? "Aprobado"
                  : event.label.toLowerCase().includes("rechaz")
                    ? "Rechazado"
                    : "Hecho"
                : event.status === "pending"
                  ? "Pendiente"
                  : "N/D";

            const shortLabel = event.label
              .replace(/\s*\([^)]*\)\s*$/, "")
              .replace("Evaluación creada", "Creada")
              .replace("Entrevista realizada", "Entrevista")
              .replace("Análisis IA generado", "Análisis IA")
              .replace("Decisión coordinador", "Coord.")
              .replace("Decisión administración", "Admin")
              .replace("Reporte PDF", "PDF");

            return (
              <li key={event.id} className="relative flex min-w-0 flex-col items-center px-0.5 text-center">
                {!isLast && (
                  <span
                    aria-hidden
                    className={`absolute left-[calc(50%+6px)] right-[calc(-50%+6px)] top-[6px] h-0.5 ${cfg.line}`}
                  />
                )}
                <span className={`relative z-[1] h-3 w-3 rounded-full border-2 ${cfg.dot}`} />
                <p
                  className={`mt-1.5 w-full truncate text-[9px] font-semibold leading-tight ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                  title={event.label}
                >
                  {compact ? shortLabel : event.label.replace(/\s*\([^)]*\)\s*$/, "")}
                </p>
                <span className={`mt-1 rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide ${cfg.badge}`}>
                  {statusLabel}
                </span>
                {!compact && dateLabel && (
                  <p className={`mt-1 truncate text-[9px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {dateLabel}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const cfg = statusConfig(event.status, isDark);
        const isLast = idx === events.length - 1;
        const dateLabel = formatDate(event.date);

        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${cfg.dot}`} />
              {!isLast && <div className={`w-0.5 min-h-[24px] flex-1 ${cfg.line}`} />}
            </div>
            <div className="flex-1 pb-6">
              <p className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>
                {event.label}
              </p>
              <p className={`mt-0.5 text-[11px] ${isDark ? "text-white/40" : "text-slate-500"}`}>
                {event.status === "unavailable"
                  ? "No disponible"
                  : event.status === "pending"
                    ? "Pendiente"
                    : dateLabel
                      ? `${dateLabel}${event.actor ? ` — ${event.actor}` : ""}`
                      : "Pendiente"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProcessTimeline;
