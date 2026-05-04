import React from "react";
import { RotateCcw } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

interface InterviewFormActionsProps {
  isCedulaValid: boolean;
  onReset: () => void;
}

export const InterviewFormActions: React.FC<InterviewFormActionsProps> = ({
  isCedulaValid,
  onReset,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 pb-10 border-t border-white/5">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400 hover:text-white hover:bg-white/8 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15"
      >
        <RotateCcw className="w-4 h-4" /> Resetear
      </button>

      <button
        type="submit"
        disabled={!isCedulaValid}
        className={`inline-flex items-center justify-center rounded-full px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] transition
          ${
            !isCedulaValid
              ? isDark
                ? "bg-white/5 text-white/40 border border-white/15 cursor-not-allowed shadow-none"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 text-black hover:brightness-110 shadow-[0_12px_30px_rgba(45,212,191,0.35)]"
          }`}
      >
        Ejecutar Análisis IA
      </button>
    </div>
  );
};

export default InterviewFormActions;
