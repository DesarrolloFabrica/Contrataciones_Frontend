import React from "react";
import { Sparkles } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

export function LeaderHero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative overflow-hidden rounded-2xl">
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-16 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-500/6 via-blue-500/4 to-transparent blur-[100px]" />
          <div className="absolute -bottom-24 -left-12 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-500/5 to-transparent blur-[80px]" />
        </div>
      )}

      <div
        className={`relative px-6 py-4 md:px-8 md:py-5 ${
          isDark
            ? "bg-gradient-to-b from-[#080D16]/90 via-[#0A1018]/80 to-[#060A12] border border-white/[0.06] shadow-[0_0_40px_-12px_rgba(6,182,212,0.06)]"
            : "bg-gradient-to-b from-white via-slate-50/80 to-white border border-slate-200/60 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.06)]"
        } rounded-2xl`}
      >
        <div className="flex items-center gap-4 max-w-2xl">
          <div
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark
                ? "bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500/20"
                : "bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
          </div>

          <div className="space-y-0.5">
            <h1
              className={`text-xl md:text-2xl font-black leading-tight tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Evaluacion de{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Talento Docente
              </span>
            </h1>
            <p
              className={`text-sm max-w-lg leading-relaxed ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Flujo guiado para la contratacion de facilitadores.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
