import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  CalendarClock,
  Headphones,
  History,
  LayoutDashboard,
  MessageSquareText,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

type ViewMode = "analyze" | "history";
type WizardStep = 1 | 2 | 3 | 4 | 5;

type InterviewerCounts = {
  pending: number;
  inProgress: number;
  completed: number;
};

type Props = {
  mode: ViewMode;
  /** Conservado para la siguiente fase (formulario dinámico / wizard). */
  currentStep: WizardStep;
  onChangeMode: (mode: ViewMode) => void;
  /** Conservado para la siguiente fase; no se usa en la bandeja. */
  onSelectStep: (step: WizardStep) => void;
  onOpenHelp: () => void;
  counts?: InterviewerCounts | null;
};

const WORKSPACE_ITEMS = [
  { id: "analyze" as const, label: "Mis charlas", icon: MessageSquareText },
  { id: "history" as const, label: "Historial", icon: History },
];

export function LeaderWorkspaceSidebar({
  mode,
  currentStep: _currentStep,
  onChangeMode,
  onSelectStep: _onSelectStep,
  onOpenHelp,
  counts = null,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  void _currentStep;
  void _onSelectStep;

  return (
    <aside
      className={[
        "relative hidden h-full w-[248px] shrink-0 flex-col overflow-hidden border-r lg:flex",
        isDark
          ? "border-emerald-400/[0.12] bg-[#07181c]"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-5 pt-8">
        <div
          className={[
            "flex items-center gap-3 rounded-xl border px-3 py-3",
            isDark
              ? "border-emerald-400/20 bg-[#0c2228]"
              : "border-emerald-200 bg-emerald-50/80",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
              isDark
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-emerald-200 bg-white text-emerald-700",
            ].join(" ")}
          >
            <LayoutDashboard className="h-[17px] w-[17px]" strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className={`block text-[13px] font-semibold leading-5 ${isDark ? "text-white" : "text-slate-900"}`}>
              Panel del entrevistador
            </span>
            <span className={`block text-[10px] leading-4 ${isDark ? "text-emerald-100/55" : "text-slate-500"}`}>
              CHARLAS
            </span>
          </span>
        </div>

        <div className="relative mt-8 min-h-0 flex-1 overflow-y-auto scrollbar-hide">
          <p
            className={[
              "mb-2.5 px-2 text-[9px] font-semibold uppercase tracking-[0.14em]",
              isDark ? "text-slate-400/70" : "text-slate-400",
            ].join(" ")}
          >
            Espacio de trabajo
          </p>

          <nav className="space-y-1.5" aria-label="Navegación del entrevistador">
            {WORKSPACE_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = mode === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChangeMode(id)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-200",
                    active
                      ? isDark
                        ? "border-emerald-400/15 bg-emerald-500/15 text-emerald-50 shadow-[inset_3px_0_0_0_rgba(52,211,153,0.85)]"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-[inset_3px_0_0_0_rgba(16,185,129,0.85)]"
                      : isDark
                        ? "border-transparent text-slate-300 hover:border-white/[0.05] hover:bg-white/[0.04] hover:text-white"
                        : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")}
                >
                  <Icon
                    className={`h-[17px] w-[17px] shrink-0 transition-colors ${
                      active
                        ? isDark
                          ? "text-emerald-300"
                          : "text-emerald-700"
                        : isDark
                          ? "text-slate-400 group-hover:text-emerald-300"
                          : "text-slate-400 group-hover:text-emerald-600"
                    }`}
                    strokeWidth={1.8}
                  />
                  {label}
                </button>
              );
            })}
          </nav>

          {counts && (
            <>
              <div className={`my-5 h-px ${isDark ? "bg-white/[0.07]" : "bg-slate-200"}`} />
              <p
                className={[
                  "mb-2.5 px-2 text-[9px] font-semibold uppercase tracking-[0.14em]",
                  isDark ? "text-slate-400/70" : "text-slate-400",
                ].join(" ")}
              >
                Resumen
              </p>
              <div className="space-y-1.5">
                <SummaryRow
                  isDark={isDark}
                  icon={CalendarClock}
                  label="Pendientes"
                  value={counts.pending}
                />
                <SummaryRow
                  isDark={isDark}
                  icon={CircleDot}
                  label="En progreso"
                  value={counts.inProgress}
                />
                <SummaryRow
                  isDark={isDark}
                  icon={CheckCircle2}
                  label="Completadas"
                  value={counts.completed}
                />
              </div>
            </>
          )}
        </div>

        <div className="relative mt-5 shrink-0">
          <button
            type="button"
            onClick={onOpenHelp}
            className={[
              "group w-full rounded-xl border p-2 text-left transition-all duration-200",
              isDark
                ? "border-emerald-300/[0.1] bg-[#091d20] hover:border-emerald-300/20"
                : "border-slate-200 bg-slate-50 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/50",
            ].join(" ")}
          >
            <span className="flex items-center gap-2.5 px-0.5 pb-2">
              <span
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                  isDark
                    ? "border-emerald-300/[0.12] bg-emerald-500/10 text-emerald-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
                ].join(" ")}
              >
                <Headphones className="h-[18px] w-[18px]" strokeWidth={1.7} />
              </span>
              <span className="min-w-0">
                <span className={`block text-[11px] font-semibold leading-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                  ¿Necesitas ayuda?
                </span>
                <span className={`block text-[9px] leading-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Consulta la guía del espacio de trabajo.
                </span>
              </span>
            </span>
            <span
              className={[
                "flex h-7 w-full items-center justify-center gap-1.5 rounded-lg text-[10px] font-semibold transition-colors",
                isDark
                  ? "bg-emerald-500/[0.1] text-emerald-100 group-hover:bg-emerald-500/[0.16]"
                  : "bg-emerald-100/80 text-emerald-800 group-hover:bg-emerald-100",
              ].join(" ")}
            >
              Ver guía
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({
  isDark,
  icon: Icon,
  label,
  value,
}: {
  isDark: boolean;
  icon: typeof CalendarClock;
  label: string;
  value: number;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2.5 rounded-xl border px-2.5 py-2",
        isDark ? "border-transparent text-slate-300" : "border-transparent text-slate-600",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
          isDark
            ? "border-white/[0.035] bg-white/[0.045] text-emerald-300"
            : "border-slate-200 bg-slate-100 text-emerald-700",
        ].join(" ")}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1 text-[12px] font-medium">{label}</span>
      <span className={`text-[12px] font-bold tabular-nums ${isDark ? "text-white" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}

export default LeaderWorkspaceSidebar;
