import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  MessageSquareText,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

type ExamplePreset = "approved" | "medium" | "rejected";

type Props = {
  currentStep?: number;
  onOpenHelp?: () => void;
  onLoadExample?: (preset: ExamplePreset) => void;
};

export function LeaderHero({ currentStep = 1, onOpenHelp, onLoadExample }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={[
        "relative overflow-hidden rounded-2xl border px-4 py-3.5 md:px-5 md:py-4",
        isDark
          ? "border-white/10 bg-gradient-to-r from-[#0f1f23]/95 via-[#0d1a1e]/90 to-[#102226]/80 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "border-slate-200/90 bg-gradient-to-r from-white via-white to-emerald-50/50 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,1)]",
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
          <nav className={`mb-1.5 flex flex-wrap items-center gap-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`} aria-label="Ruta de navegación">
            <span>Inicio</span>
            <ChevronRight className="h-3 w-3" />
            <span>Entrevistas</span>
            <ChevronRight className="h-3 w-3" />
            <span className={isDark ? "text-slate-200" : "text-slate-700"}>Nueva entrevista</span>
          </nav>

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
                Entrevista de contratación
              </h1>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Charla guiada para decidir si el candidato puede contratarse · Paso {currentStep} de 5
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          {onLoadExample && (
            <div
              className={[
                "inline-flex items-center gap-0.5 rounded-xl border p-1 backdrop-blur-sm",
                isDark
                  ? "border-white/10 bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "border-slate-200 bg-white/80 shadow-sm",
              ].join(" ")}
              title="Cargar datos de ejemplo"
            >
              <button
                type="button"
                onClick={() => onLoadExample("approved")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Aprobado
              </button>
              <button
                type="button"
                onClick={() => onLoadExample("medium")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                Medio
              </button>
              <button
                type="button"
                onClick={() => onLoadExample("rejected")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                Riesgo
              </button>
            </div>
          )}

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

export default LeaderHero;
