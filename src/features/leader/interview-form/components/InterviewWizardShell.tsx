import React from "react";
import { useTheme } from "../../../../context/ThemeContext";
import { InterviewWizardStepper, type WizardStep } from "./InterviewWizardStepper";

interface InterviewWizardShellProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  children: React.ReactNode;
  navigation: React.ReactNode;
}

export const InterviewWizardShell: React.FC<InterviewWizardShellProps> = ({
  currentStep,
  onStepClick,
  children,
  navigation,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "rounded-2xl border overflow-hidden transition-all duration-300",
        isDark
          ? "bg-gradient-to-b from-[#080D16] via-[#0A1018] to-[#060A12] border-white/[0.08] shadow-[0_0_60px_-15px_rgba(6,182,212,0.08)]"
          : "bg-white border-slate-200/80 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)]",
      ].join(" ")}
    >
      <div
        className={[
          "px-6 py-4 border-b",
          isDark ? "border-white/[0.06] bg-white/[0.01]" : "border-slate-100 bg-slate-50/30",
        ].join(" ")}
      >
        <InterviewWizardStepper currentStep={currentStep} onStepClick={onStepClick} />
      </div>
      <div className="p-6 space-y-6">
        {children}
        {navigation}
      </div>
    </div>
  );
};

export default InterviewWizardShell;
