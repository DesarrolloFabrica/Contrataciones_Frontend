import React from "react";
import { useTheme } from "../../../../context/ThemeContext";
import { InterviewWizardStepper, type WizardStep } from "./InterviewWizardStepper";

interface InterviewWizardShellProps {
  currentStep?: WizardStep;
  maxReachedStep?: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  children: React.ReactNode;
  navigation: React.ReactNode;
  /** Si se provee, reemplaza el stepper legacy (1–5) sin romper InterviewForm. */
  headerStepper?: React.ReactNode;
}

export const InterviewWizardShell: React.FC<InterviewWizardShellProps> = ({
  currentStep = 1,
  maxReachedStep = 1,
  onStepClick,
  children,
  navigation,
  headerStepper,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border",
        isDark
          ? "border-white/10 bg-gradient-to-b from-[#122226] via-[#0e1c20] to-[#0b171b] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "border-slate-200 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)]",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          isDark
            ? "bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
            : "bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent",
        ].join(" ")}
      />
      <div
        className={[
          "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl",
          isDark ? "bg-emerald-500/10" : "bg-emerald-400/15",
        ].join(" ")}
      />

      <div className={`relative h-1 w-full ${isDark ? "bg-gradient-to-r from-emerald-500/80 via-teal-400/70 to-emerald-600/40" : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400"}`} />

      <div className={`relative min-w-0 border-b px-3 py-3 sm:px-4 md:px-5 ${headerStepper ? "" : "lg:hidden"} ${isDark ? "border-white/10" : "border-slate-100"}`}>
        {headerStepper ?? (
          <InterviewWizardStepper
            currentStep={currentStep}
            maxReachedStep={maxReachedStep}
            onStepClick={onStepClick ?? (() => undefined)}
          />
        )}
      </div>

      <div className="relative min-w-0 px-3 py-3.5 sm:px-4 md:px-5 md:py-4">{children}</div>

      <div
        className={[
          "relative min-w-0 border-t px-3 py-2.5 sm:px-4 md:px-5",
          isDark
            ? "border-white/10 bg-gradient-to-r from-black/25 via-emerald-950/20 to-black/20"
            : "border-slate-100 bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50",
        ].join(" ")}
      >
        {navigation}
      </div>
    </div>
  );
};

export default InterviewWizardShell;
