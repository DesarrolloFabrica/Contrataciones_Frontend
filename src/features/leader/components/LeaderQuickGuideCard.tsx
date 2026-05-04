import React from "react";
import { Lightbulb, CheckCircle2, Clock, FileText, UserCheck, Brain, Layers, HelpCircle } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const STEP_META: Record<number, { label: string; icon: typeof Layers; fields: string[] }> = {
  1: {
    label: "Contexto de contratacion",
    icon: Layers,
    fields: ["Rol objetivo", "Tipo de proceso", "Area solicitante", "Prioridad"],
  },
  2: {
    label: "Documentos requeridos",
    icon: FileText,
    fields: ["Hoja de vida", "Certificados", "Documentos academicos"],
  },
  3: {
    label: "Datos del candidato",
    icon: UserCheck,
    fields: ["Nombre completo", "No. documento", "Escuela y programa"],
  },
  4: {
    label: "Entrevista pedagogica",
    icon: Brain,
    fields: ["Disponibilidad", "Pedagogia", "Uso de IA", "Casos eticos"],
  },
  5: {
    label: "Revision y envio",
    icon: CheckCircle2,
    fields: ["Verificar datos", "Revisar checklist", "Ejecutar analisis"],
  },
};

type Props = {
  currentStep?: number;
  onOpenFlowHelp?: () => void;
};

export function LeaderQuickGuideCard({ currentStep = 1, onOpenFlowHelp }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const meta = STEP_META[currentStep] ?? STEP_META[1];
  const StepIcon = meta.icon;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-b from-[#080D16] to-[#0A1018] border-white/[0.06] shadow-[0_0_40px_-12px_rgba(6,182,212,0.05)]"
          : "bg-white border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark
                ? "bg-cyan-500/10 border border-cyan-500/20"
                : "bg-cyan-50 border border-cyan-200"
            }`}
          >
            <Lightbulb className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
          </div>
          <div>
            <h3
              className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Guia rapida
            </h3>
            <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Paso {currentStep} de 5
            </p>
          </div>
        </div>

        {/* Current step indicator */}
        <div
          className={`rounded-xl border p-3 ${
            isDark
              ? "bg-cyan-500/8 border-cyan-500/20"
              : "bg-cyan-50 border-cyan-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDark
                  ? "bg-cyan-500/15 border border-cyan-500/25"
                  : "bg-cyan-100 border border-cyan-200"
              }`}
            >
              <StepIcon className={`w-3.5 h-3.5 ${isDark ? "text-cyan-300" : "text-cyan-600"}`} />
            </div>
            <div className="min-w-0">
              <p
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? "text-cyan-300" : "text-cyan-700"
                }`}
              >
                Paso actual
              </p>
              <p
                className={`text-xs font-semibold truncate ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {meta.label}
              </p>
            </div>
          </div>
        </div>

        {/* Field reminders */}
        <div className="space-y-1.5">
          <p
            className={`text-[9px] font-bold uppercase tracking-[0.16em] ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Campos de este paso
          </p>
          {meta.fields.map((field) => (
            <div key={field} className="flex items-center gap-2">
              <span
                className={`w-1 h-1 rounded-full shrink-0 ${
                  isDark ? "bg-cyan-400/60" : "bg-cyan-500/60"
                }`}
              />
              <span
                className={`text-[11px] leading-tight ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {field}
              </span>
            </div>
          ))}
        </div>

        {/* Draft status */}
        <div
          className={`rounded-lg border p-2.5 flex items-center gap-2 ${
            isDark
              ? "bg-cyan-500/5 border-cyan-500/15"
              : "bg-cyan-50 border-cyan-200"
          }`}
        >
          <Clock className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
          <div>
            <p
              className={`text-[9px] font-bold uppercase tracking-widest ${
                isDark ? "text-cyan-300" : "text-cyan-700"
              }`}
            >
              Borrador
            </p>
            <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Guardado localmente
            </p>
          </div>
        </div>

        {/* Help button */}
        {onOpenFlowHelp && (
          <button
            type="button"
            onClick={onOpenFlowHelp}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-200 ${
              isDark
                ? "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:border-white/20 hover:text-white"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Ver guia completa
          </button>
        )}
      </div>
    </div>
  );
}
