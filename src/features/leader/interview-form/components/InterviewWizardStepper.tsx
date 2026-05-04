import React from "react";
import { Check } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

type StepDef = { id: WizardStep; label: string };

const STEPS: StepDef[] = [
  { id: 1, label: "Contexto" },
  { id: 2, label: "Documentos" },
  { id: 3, label: "Candidato" },
  { id: 4, label: "Entrevista" },
  { id: 5, label: "Revision" },
];

interface InterviewWizardStepperProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}

export const InterviewWizardStepper: React.FC<InterviewWizardStepperProps> = ({
  currentStep,
  onStepClick,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-1.5">
        {STEPS.map((step, idx) => {
          const completed = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => {
                  if (step.id <= currentStep) onStepClick(step.id);
                }}
                className="flex items-center gap-2.5 min-w-0 group"
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={[
                    "w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-300",
                    completed
                      ? isDark
                        ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                        : "bg-cyan-50 text-cyan-600 border-cyan-300"
                      : active
                        ? isDark
                          ? "bg-gradient-to-br from-cyan-500/25 to-blue-500/15 text-cyan-200 border-cyan-400/50 shadow-[0_0_16px_-4px_rgba(6,182,212,0.3)]"
                          : "bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 border-cyan-300 shadow-[0_0_12px_-4px_rgba(6,182,212,0.2)]"
                        : isDark
                          ? "bg-white/[0.04] text-slate-500 border-white/[0.08] group-hover:border-white/20 group-hover:text-slate-300"
                          : "bg-slate-50 text-slate-400 border-slate-200 group-hover:border-slate-300 group-hover:text-slate-600",
                  ].join(" ")}
                >
                  {completed ? <Check className="w-3.5 h-3.5" /> : step.id}
                </span>

                <span
                  className={[
                    "text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap transition-colors duration-200",
                    completed
                      ? isDark
                        ? "text-cyan-300/80"
                        : "text-cyan-600"
                      : active
                        ? isDark
                          ? "text-cyan-200"
                          : "text-cyan-700"
                        : isDark
                          ? "text-slate-500 group-hover:text-slate-300"
                          : "text-slate-400 group-hover:text-slate-600",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </button>

              {idx < STEPS.length - 1 && (
                <div
                  className={[
                    "flex-1 h-px rounded-full min-w-[16px] transition-colors duration-300",
                    step.id < currentStep
                      ? isDark
                        ? "bg-cyan-500/30"
                        : "bg-cyan-400/40"
                      : isDark
                        ? "bg-white/[0.06]"
                        : "bg-slate-200",
                  ].join(" ")}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden grid grid-cols-5 gap-1.5">
        {STEPS.map((step) => {
          const completed = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <button
              type="button"
              key={step.id}
              onClick={() => {
                if (step.id <= currentStep) onStepClick(step.id);
              }}
              className={[
                "rounded-lg border px-1 py-2 text-[9px] font-bold uppercase tracking-wider transition-all duration-200",
                completed
                  ? isDark
                    ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                    : "bg-cyan-50 border-cyan-300 text-cyan-600"
                  : active
                    ? isDark
                      ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-200 shadow-[0_0_12px_-4px_rgba(6,182,212,0.25)]"
                      : "bg-cyan-50 border-cyan-300 text-cyan-700"
                    : isDark
                      ? "bg-white/[0.03] border-white/[0.08] text-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-400",
              ].join(" ")}
            >
              {step.id}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewWizardStepper;
