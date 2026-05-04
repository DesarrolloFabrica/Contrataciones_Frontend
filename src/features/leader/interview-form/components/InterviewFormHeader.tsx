import React from "react";
import { BrainCircuit, Sparkles } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

export const InterviewFormHeader: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="text-center space-y-6">
      <div
        className={[
          "inline-flex items-center gap-2.5 px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-widest backdrop-blur-md",
          isDark
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
            : "border-[#00B894]/30 bg-[#E6FFF7] text-[#006B57] shadow-[0_0_18px_rgba(0,184,148,0.20)]",
        ].join(" ")}
      >
        <BrainCircuit className="w-4 h-4" />
        <span>Sistema Inteligente</span>
      </div>

      <div className="relative space-y-4 max-w-3xl mx-auto">
        <h2
          className={[
            "text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]",
            isDark ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
          Evaluación de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B894] to-[#06b6d4]">
            Talento Docente
          </span>
        </h2>
        <p
          className={`text-base md:text-lg font-light leading-relaxed ${
            isDark ? "text-gray-400" : "text-slate-600"
          }`}
        >
          Utiliza nuestra IA para analizar la coherencia pedagógica, ética y
          técnica de los candidatos en tiempo real.
        </p>
      </div>
    </header>
  );
};

export default InterviewFormHeader;
