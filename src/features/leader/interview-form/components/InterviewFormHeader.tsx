import React from "react";
import { BrainCircuit } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

export const InterviewFormHeader: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="text-center">
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
          isDark
            ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-400/70"
            : "border-emerald-200 bg-emerald-50 text-emerald-600"
        }`}
      >
        <BrainCircuit className="w-3.5 h-3.5" />
        <span>Formulario de entrevista</span>
      </div>
    </header>
  );
};

export default InterviewFormHeader;
