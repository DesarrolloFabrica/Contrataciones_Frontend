// src/components/ComparativeBars.tsx
import React from 'react';
import { CategoryAnalysis } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ComparativeBarsProps {
  categoryAnalyses: CategoryAnalysis[];
}

const ComparativeBars: React.FC<ComparativeBarsProps> = ({ categoryAnalyses }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const simulatedAverage: { [key: string]: number } = {
    'Disponibilidad y Condiciones': 65,
    'Manejo de Aula': 75,
    'Actitud Frente a la IA': 80,
    'Coherencia y Compromiso': 70,
  };

  return (
    <div className="space-y-5">
      {categoryAnalyses.map((analysis) => (
        <div key={analysis.category}>
          <h5
            className={`font-semibold text-sm mb-2.5 ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            {analysis.category}
          </h5>
          <div className="space-y-1.5">
            {/* Candidate Bar */}
            <div className="flex items-center gap-3">
              <span className={`w-20 text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Candidato:
              </span>
              <div className={`flex-1 rounded-full h-4 overflow-hidden ${isDark ? "bg-white/[0.04]" : "bg-slate-100"}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-700"
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
              <span className="w-10 text-right font-bold text-cyan-400 text-sm">{analysis.score}</span>
            </div>
            {/* Average Bar */}
            <div className="flex items-center gap-3">
              <span className={`w-20 text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Promedio:
              </span>
              <div className={`flex-1 rounded-full h-4 overflow-hidden ${isDark ? "bg-white/[0.04]" : "bg-slate-100"}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500/60 to-blue-400/60 transition-all duration-700"
                  style={{ width: `${simulatedAverage[analysis.category] || 60}%` }}
                />
              </div>
              <span className={`w-10 text-right font-bold text-sm ${isDark ? "text-blue-400/70" : "text-blue-500/70"}`}>
                {simulatedAverage[analysis.category] || 60}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComparativeBars;
