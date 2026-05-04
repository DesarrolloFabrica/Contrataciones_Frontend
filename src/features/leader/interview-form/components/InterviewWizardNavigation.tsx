import React from "react";
import type { WizardStep } from "./InterviewWizardStepper";
import { useTheme } from "../../../../context/ThemeContext";

interface InterviewWizardNavigationProps {
  currentStep: WizardStep;
  isCedulaValid: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const InterviewWizardNavigation: React.FC<InterviewWizardNavigationProps> = ({
  currentStep,
  isCedulaValid,
  onBack,
  onNext,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 5;

  return (
    <div className="flex items-center justify-between gap-3">
      {isFirstStep ? (
        <div />
      ) : (
        <button
          type="button"
          onClick={onBack}
          className={[
            "rounded-xl border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200",
            isDark
              ? "border-white/10 text-slate-400 hover:bg-white/[0.04] hover:text-white hover:border-white/20"
              : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300",
          ].join(" ")}
        >
          Atras
        </button>
      )}

      {isLastStep ? (
        <button
          type="submit"
          disabled={!isCedulaValid}
          className={[
            "rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-[0.18em] transition-all duration-300",
            !isCedulaValid
              ? isDark
                ? "bg-white/[0.04] text-slate-500 border border-white/10 cursor-not-allowed"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              : isDark
                ? "bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 text-white shadow-[0_0_24px_-4px_rgba(6,182,212,0.4)] hover:shadow-[0_0_32px_-4px_rgba(6,182,212,0.5)] hover:brightness-110"
                : "bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 text-white shadow-[0_8px_25px_rgba(6,182,212,0.3)] hover:shadow-[0_12px_35px_rgba(6,182,212,0.35)] hover:brightness-110",
          ].join(" ")}
        >
          Ejecutar Analisis IA
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className={[
            "rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-[0.18em] transition-all duration-300",
            isDark
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/15 text-cyan-200 border border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-400/50 hover:text-cyan-100 hover:shadow-[0_0_20px_-6px_rgba(6,182,212,0.25)]"
              : "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-300 hover:bg-cyan-100 hover:border-cyan-400 hover:text-cyan-800",
          ].join(" ")}
        >
          Continuar
        </button>
      )}
    </div>
  );
};

export default InterviewWizardNavigation;
