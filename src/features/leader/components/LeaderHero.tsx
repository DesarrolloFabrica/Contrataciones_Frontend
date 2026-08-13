import React from "react";
import {
  CalendarClock,
  CheckCircle2,
  CircleDot,
  CircleHelp,
  MessageSquareText,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

type InterviewerCounts = {
  pending: number;
  inProgress: number;
  completed: number;
};

type Props = {
  counts?: InterviewerCounts | null;
  onOpenHelp?: () => void;
};

export function LeaderHero({ counts = null, onOpenHelp }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={[
        "relative overflow-hidden rounded-2xl border px-4 py-3.5 md:px-5 md:py-4",
        isDark
          ? "border-white/10 bg-gradient-to-r from-[#0f1f23]/95 via-[#0d1a1e]/90 to-[#102226]/80 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "border-slate-200 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.22)]",
        ].join(" ")}
      >
      <div
        className={[
          "pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full blur-3xl",
          isDark ? "bg-emerald-500/15" : "bg-emerald-400/20",
        ].join(" ")}
      />
      <div
        className={[
          "pointer-events-none absolute bottom-0 left-24 h-20 w-40 rounded-full blur-2xl",
          isDark ? "bg-teal-400/8" : "bg-teal-200/30",
        ].join(" ")}
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`absolute -inset-1 rounded-xl blur-md ${isDark ? "bg-emerald-500/25" : "bg-emerald-400/30"}`} />
              <div
                className={[
                  "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                  isDark
                    ? "border-emerald-400/20 bg-gradient-to-br from-emerald-500/25 to-teal-700/20 text-emerald-300"
                    : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-700",
                ].join(" ")}
              >
                <MessageSquareText className="h-5 w-5" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className={`text-xl font-bold tracking-tight md:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                Panel del entrevistador
              </h1>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Gestiona las charlas que tienes asignadas y registra la información necesaria para cada proceso.
              </p>
            </div>
          </div>

          {counts && (
            <div className="mt-3 flex flex-wrap gap-2">
              <CountChip
                isDark={isDark}
                icon={<CalendarClock className="h-3.5 w-3.5" />}
                label="Pendientes"
                value={counts.pending}
              />
              <CountChip
                isDark={isDark}
                icon={<CircleDot className="h-3.5 w-3.5" />}
                label="En progreso"
                value={counts.inProgress}
              />
              <CountChip
                isDark={isDark}
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                label="Completadas"
                value={counts.completed}
              />
            </div>
          )}
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className={[
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm",
              ].join(" ")}
            >
              <CircleHelp className="h-3.5 w-3.5" />
              Guía
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function CountChip({
  isDark,
  icon,
  label,
  value,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        isDark
          ? "border-white/10 bg-black/20 text-slate-300"
          : "border-slate-200 bg-slate-50 text-slate-600",
      ].join(" ")}
    >
      <span className="text-emerald-500">{icon}</span>
      {label}
      <strong className={isDark ? "text-white" : "text-slate-900"}>{value}</strong>
    </span>
  );
}

export default LeaderHero;
