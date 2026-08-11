import React from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  FileText,
  HelpCircle,
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
          ? "border-white/10 bg-gradient-to-b from-[#0d1a1e] via-[#0a1518] to-[#081214]"
          : "border-slate-200 bg-gradient-to-b from-white via-white to-slate-50",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute inset-x-0 top-0 h-32",
          isDark
            ? "bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_70%)]",
        ].join(" ")}
      />

      <div className={`relative flex items-center gap-3 border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <div
          className={[
            "relative flex h-10 w-10 items-center justify-center rounded-xl border",
            isDark
              ? "border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-teal-700/15 text-emerald-300 shadow-[0_0_20px_-8px_rgba(16,185,129,0.55)]"
              : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-700 shadow-sm",
          ].join(" ")}
        >
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <div>
          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Panel del líder</p>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Contratación docente</p>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 py-4">
        <p className={`mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Espacio de trabajo
        </p>
        <nav className="space-y-1" aria-label="Navegación del líder">
          {[
            { id: "analyze" as const, label: "Nueva entrevista", icon: BrainCircuit },
            { id: "history" as const, label: "Historial", icon: History },
          ].map(({ id, label, icon: Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeMode(id)}
                className={[
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                  active
                    ? isDark
                      ? "bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-100 shadow-[inset_3px_0_0_0_rgba(52,211,153,0.8)]"
                      : "bg-gradient-to-r from-emerald-50 to-transparent text-emerald-800 shadow-[inset_3px_0_0_0_rgba(16,185,129,0.85)]"
                    : isDark
                      ? "text-slate-300 hover:bg-white/5 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className={`my-4 h-px ${isDark ? "bg-gradient-to-r from-transparent via-white/15 to-transparent" : "bg-gradient-to-r from-transparent via-slate-200 to-transparent"}`} />

        <div className="mb-2 flex items-center justify-between px-2">
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Flujo actual
          </p>
          <span
            className={[
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            {currentStep}/5
          </span>
        </div>

        <div className="space-y-0.5">
          {FLOW_STEPS.map(({ id, label, hint, icon: Icon }) => {
            const active = mode === "analyze" && currentStep === id;
            const complete = mode === "analyze" && id < currentStep;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectStep(id)}
                className={[
                  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition",
                  active
                    ? isDark
                      ? "bg-white/[0.07] text-white ring-1 ring-emerald-400/20"
                      : "bg-slate-100 text-slate-900 ring-1 ring-emerald-200/80"
                    : isDark
                      ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                    active || complete
                      ? isDark
                        ? "bg-gradient-to-br from-emerald-500/30 to-teal-600/20 text-emerald-300"
                        : "bg-gradient-to-br from-emerald-100 to-white text-emerald-700"
                      : isDark
                        ? "bg-white/5 text-slate-500"
                        : "bg-slate-100 text-slate-400",
                  ].join(" ")}
                >
                  {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className={`block text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`relative border-t p-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <button
          type="button"
          onClick={onOpenHelp}
          className={[
            "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
            isDark
              ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent hover:from-white/[0.08]"
              : "border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:from-emerald-50/60 shadow-sm",
          ].join(" ")}
        >
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"}`}>
            <HelpCircle className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>¿Necesitas ayuda?</span>
            <span className={`block text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Ver guía del flujo</span>
          </span>
          <ArrowRight className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
        </button>
      </div>
    </aside>
  );
}

export default LeaderWorkspaceSidebar;
