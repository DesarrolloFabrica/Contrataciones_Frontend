import React from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  FileText,
  Headphones,
  History,
  LayoutDashboard,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

type ViewMode = "analyze" | "history";
type WizardStep = 1 | 2 | 3 | 4 | 5;

type Props = {
  mode: ViewMode;
  currentStep: WizardStep;
  onChangeMode: (mode: ViewMode) => void;
  onSelectStep: (step: WizardStep) => void;
  onOpenHelp: () => void;
};

const WORKSPACE_ITEMS = [
  { id: "analyze" as const, label: "Nueva entrevista", icon: BrainCircuit },
  { id: "history" as const, label: "Historial", icon: History },
];

const FLOW_STEPS: Array<{ id: WizardStep; label: string; hint: string; icon: typeof FileText }> = [
  { id: 1, label: "Contexto", hint: "Vacante y perfil", icon: ClipboardList },
  { id: 2, label: "Documentos", hint: "Soportes del candidato", icon: FileText },
  { id: 3, label: "Candidato", hint: "Datos de identidad", icon: UserRound },
  { id: 4, label: "Entrevista", hint: "Respuestas de la charla", icon: MessageSquareText },
  { id: 5, label: "Revisión", hint: "Validar y enviar", icon: CheckCircle2 },
];

export function LeaderWorkspaceSidebar({
  mode,
  currentStep,
  onChangeMode,
  onSelectStep,
  onOpenHelp,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
              Panel del líder
            </span>
            <span className={`block text-[10px] leading-4 ${isDark ? "text-emerald-100/55" : "text-slate-500"}`}>
              Contratación docente
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

          <nav className="space-y-1.5" aria-label="Navegación del líder">
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

          <div className={`my-5 h-px ${isDark ? "bg-white/[0.07]" : "bg-slate-200"}`} />

          <div className="mb-2.5 flex items-center justify-between px-2">
            <p
              className={[
                "text-[9px] font-semibold uppercase tracking-[0.14em]",
                isDark ? "text-slate-400/70" : "text-slate-400",
              ].join(" ")}
            >
              Flujo actual
            </p>
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[9px] font-bold tabular-nums",
                isDark
                  ? "bg-emerald-400/[0.12] text-emerald-300"
                  : "bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {currentStep}/5
            </span>
          </div>

          <div className="space-y-1">
            {FLOW_STEPS.map(({ id, label, hint, icon: Icon }) => {
              const active = mode === "analyze" && currentStep === id;
              const complete = mode === "analyze" && id < currentStep;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectStep(id)}
                  aria-current={active ? "step" : undefined}
                  className={[
                    "group flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all duration-200",
                    active
                      ? isDark
                        ? "border-emerald-300/[0.12] bg-white/[0.065] text-white shadow-[0_12px_28px_-24px_rgba(16,185,129,0.8)]"
                        : "border-emerald-200 bg-emerald-50/80 text-slate-900"
                      : isDark
                        ? "border-transparent text-slate-400 hover:bg-white/[0.035] hover:text-slate-200"
                        : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                      active || complete
                        ? isDark
                          ? "border-emerald-400/[0.12] bg-emerald-400/[0.12] text-emerald-300"
                          : "border-emerald-200 bg-white text-emerald-700"
                        : isDark
                          ? "border-white/[0.035] bg-white/[0.045] text-slate-500 group-hover:text-slate-300"
                          : "border-slate-200 bg-slate-100 text-slate-400 group-hover:text-slate-600",
                    ].join(" ")}
                  >
                    {complete ? (
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                    ) : (
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium leading-4">{label}</span>
                    <span
                      className={[
                        "block truncate text-[9px] leading-4",
                        isDark ? "text-slate-500" : "text-slate-400",
                      ].join(" ")}
                    >
                      {hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
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
                  Consulta la guía completa del proceso.
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

export default LeaderWorkspaceSidebar;
