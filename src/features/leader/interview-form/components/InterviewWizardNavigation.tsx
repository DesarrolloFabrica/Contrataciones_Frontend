import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

interface InterviewWizardNavigationProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  isCedulaValid: boolean;
  onBack: () => void;
  onNext: () => void;
  onReset?: () => void;
}

export const InterviewWizardNavigation: React.FC<InterviewWizardNavigationProps> = ({
  currentStep,
  isCedulaValid,
  onBack,
  onNext,
  onReset,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 5;

  const secondaryBtn = [
    "rounded-xl border px-4 py-2 text-sm font-medium transition",
    isDark
      ? "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/5 hover:text-white"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm",
  ].join(" ");

  const primaryBtn = [
    "rounded-xl px-5 py-2 text-sm font-semibold text-white transition",
    "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_10px_24px_-12px_rgba(16,185,129,0.8)] hover:from-emerald-400 hover:to-emerald-500",
  ].join(" ");

  const disabledBtn = [
    "rounded-lg border px-5 py-2 text-sm font-semibold cursor-not-allowed",
    isDark
      ? "border-white/10 bg-white/5 text-slate-500"
      : "border-slate-200 bg-slate-100 text-slate-400",
  ].join(" ");

  return (
    <div className="flex items-center justify-between gap-3">
      {isFirstStep ? (
        <button type="button" onClick={onReset} className={secondaryBtn}>
          Cancelar y limpiar
        </button>
      ) : (
        <button type="button" onClick={onBack} className={secondaryBtn}>
          Atrás
        </button>
      )}

      {isLastStep ? (
        <button type="submit" disabled={!isCedulaValid} className={!isCedulaValid ? disabledBtn : primaryBtn}>
          Analizar entrevista
        </button>
      ) : (
        <button type="button" onClick={onNext} className={primaryBtn}>
          Continuar
        </button>
      )}
    </div>
  );
};

export default InterviewWizardNavigation;
