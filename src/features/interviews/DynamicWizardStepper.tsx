import { Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import type { DynamicWizardStep } from "./dynamicWizardSteps";

type Props = {
  steps: DynamicWizardStep[];
  currentStepIndex: number;
  maxReachedStepIndex: number;
  completedSectionIndexes?: number[];
  onStepClick: (index: number) => void;
};

export function DynamicWizardStepper({
  steps,
  currentStepIndex,
  maxReachedStepIndex,
  completedSectionIndexes = [],
  onStepClick,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full">
      <div className="hidden items-center gap-1.5 overflow-x-auto md:flex">
        {steps.map((step, index) => {
          const label = step.kind === "review" ? "Revisión" : step.section.title;
          const visited = index <= maxReachedStepIndex && index !== currentStepIndex;
          const active = index === currentStepIndex;
          const complete = step.kind === "section" && completedSectionIndexes.includes(step.sectionIndex);
          return (
            <div key={step.kind === "review" ? "review" : step.section.id} className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className="group flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                aria-current={active ? "step" : undefined}
                aria-label={label}
                title={label}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black transition-all",
                    complete || visited
                      ? isDark
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                        : "border-emerald-300 bg-emerald-50 text-emerald-600"
                      : active
                        ? isDark
                          ? "border-emerald-400/50 bg-gradient-to-br from-emerald-500/25 to-emerald-500/15 text-emerald-200"
                          : "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : isDark
                          ? "border-white/[0.08] bg-white/[0.04] text-slate-500"
                          : "border-slate-200 bg-slate-50 text-slate-400",
                  )}
                >
                  {complete || visited ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em]",
                    active
                      ? isDark
                        ? "text-emerald-200"
                        : "text-emerald-700"
                      : isDark
                        ? "text-slate-500"
                        : "text-slate-400",
                  )}
                >
                  {label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px min-w-[10px] flex-1 rounded-full",
                    index < maxReachedStepIndex
                      ? isDark
                        ? "bg-emerald-500/30"
                        : "bg-emerald-400/40"
                      : isDark
                        ? "bg-white/[0.06]"
                        : "bg-slate-200",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.5 overflow-x-auto md:hidden">
        {steps.map((step, index) => {
          const label = step.kind === "review" ? "Revisión" : step.section.title;
          const visited = index <= maxReachedStepIndex && index !== currentStepIndex;
          const active = index === currentStepIndex;
          return (
            <button
              key={step.kind === "review" ? "review" : step.section.id}
              type="button"
              onClick={() => onStepClick(index)}
              title={label}
              aria-label={label}
              aria-current={active ? "step" : undefined}
              className={cn(
                "shrink-0 rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                visited
                  ? isDark
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    : "border-emerald-300 bg-emerald-50 text-emerald-600"
                  : active
                    ? isDark
                      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : isDark
                      ? "border-white/[0.08] bg-white/[0.03] text-slate-500"
                      : "border-slate-200 bg-slate-50 text-slate-400",
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
