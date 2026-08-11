import React from "react";
import { Check } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { cn } from "../../../../utils/cn";

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
  maxReachedStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}

export const InterviewWizardStepper: React.FC<InterviewWizardStepperProps> = ({
  currentStep,
  maxReachedStep,
  onStepClick,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stepButtonClass = (step: StepDef) => {
    const visited = step.id <= maxReachedStep && step.id !== currentStep;
    const active = step.id === currentStep;
    const upcoming = step.id > maxReachedStep;

    return cn(
      "flex items-center gap-2.5 min-w-0 group rounded-lg px-1 py-1 -mx-1 transition-colors",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
      upcoming && "opacity-80 hover:opacity-100"
    );
  };

  const badgeClass = (step: StepDef) => {
    const visited = step.id <= maxReachedStep && step.id !== currentStep;
    const active = step.id === currentStep;

    if (visited) {
      return isDark
        ? "bg-brand-500/15 text-brand-300 border-brand-500/30"
        : "bg-brand-50 text-brand-600 border-brand-300";
    }
    if (active) {
      return isDark
        ? "bg-gradient-to-br from-brand-500/25 to-brand-500/15 text-brand-200 border-brand-400/50 shadow-[0_0_16px_-4px_rgba(16,185,129,0.3)]"
        : "bg-gradient-to-br from-brand-50 to-brand-50 text-brand-700 border-brand-300 shadow-[0_0_12px_-4px_rgba(16,185,129,0.2)]";
    }
    return isDark
      ? "bg-white/[0.04] text-slate-500 border-white/[0.08] group-hover:border-white/20 group-hover:text-slate-300"
      : "bg-slate-50 text-slate-400 border-slate-200 group-hover:border-slate-300 group-hover:text-slate-600";
  };

  const labelClass = (step: StepDef) => {
    const visited = step.id <= maxReachedStep && step.id !== currentStep;
    const active = step.id === currentStep;

    if (visited) {
      return isDark ? "text-brand-300/80" : "text-brand-600";
    }
    if (active) {
      return isDark ? "text-brand-200" : "text-brand-700";
    }
    return isDark
      ? "text-slate-500 group-hover:text-slate-300"
      : "text-slate-400 group-hover:text-slate-600";
  };

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-1.5">
        {STEPS.map((step, idx) => {
          const visited = step.id <= maxReachedStep && step.id !== currentStep;
          const active = step.id === currentStep;
          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                className={stepButtonClass(step)}
                aria-current={active ? "step" : undefined}
                title={`Ir a ${step.label}`}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-300",
                    badgeClass(step)
                  )}
                >
                  {visited ? <Check className="w-3 h-3" /> : step.id}
                </span>

                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap transition-colors duration-200",
                    labelClass(step)
                  )}
                >
                  {step.label}
                </span>
              </button>

              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px rounded-full min-w-[12px] transition-colors duration-300",
                    step.id < maxReachedStep
                      ? isDark
                        ? "bg-brand-500/30"
                        : "bg-brand-400/40"
                      : isDark
                        ? "bg-white/[0.06]"
                        : "bg-slate-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden grid grid-cols-5 gap-1.5">
        {STEPS.map((step) => {
          const visited = step.id <= maxReachedStep && step.id !== currentStep;
          const active = step.id === currentStep;
          return (
            <button
              type="button"
              key={step.id}
              onClick={() => onStepClick(step.id)}
              title={step.label}
              className={cn(
                "rounded-lg border px-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-200",
                visited
                  ? isDark
                    ? "bg-brand-500/15 border-brand-500/30 text-brand-300"
                    : "bg-brand-50 border-brand-300 text-brand-600"
                  : active
                    ? isDark
                      ? "bg-brand-500/15 border-brand-400/40 text-brand-200 shadow-[0_0_12px_-4px_rgba(16,185,129,0.25)]"
                      : "bg-brand-50 border-brand-300 text-brand-700"
                    : isDark
                      ? "bg-white/[0.03] border-white/[0.08] text-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-400"
              )}
            >
              {visited ? "✓" : step.id}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewWizardStepper;
