import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { type TimelineEvent } from "../utils/coordinatorTimeline";

interface ProcessTimelineProps {
  events: TimelineEvent[];
}

const statusConfig = (
  status: TimelineEvent["status"],
  isDark: boolean,
) => {
  switch (status) {
    case "completed":
      return {
        dot: isDark ? "bg-emerald-400" : "bg-emerald-500",
        line: isDark ? "bg-emerald-500/30" : "bg-emerald-200",
        text: isDark ? "text-emerald-300" : "text-emerald-700",
      };
    case "pending":
      return {
        dot: isDark ? "bg-amber-400" : "bg-amber-500",
        line: isDark ? "bg-white/10" : "bg-slate-200",
        text: isDark ? "text-amber-300" : "text-amber-700",
      };
    case "unavailable":
      return {
        dot: isDark ? "bg-white/20" : "bg-slate-300",
        line: isDark ? "bg-white/5" : "bg-slate-100",
        text: isDark ? "text-white/40" : "text-slate-400",
      };
  }
};

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ events }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const cfg = statusConfig(event.status, isDark);
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${cfg.dot} ${isDark ? "border-[#020408]" : "border-white"} shrink-0 mt-1`} />
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[24px] ${cfg.line}`} />
              )}
            </div>
            <div className={`pb-6 flex-1 ${isLast ? "" : ""}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>
                {event.label}
              </p>
              <p className={`text-[11px] mt-0.5 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                {event.status === "unavailable"
                  ? "No disponible"
                  : event.status === "pending"
                    ? "Pendiente"
                    : event.date
                      ? `${new Date(event.date).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}${event.actor ? ` — ${event.actor}` : ""}`
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
