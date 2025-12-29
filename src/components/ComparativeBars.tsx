// src/components/ComparativeBars.tsx
import React from 'react';
import { CategoryAnalysis } from '../types';

interface ComparativeBarsProps {
  categoryAnalyses: CategoryAnalysis[];
}

const ComparativeBars: React.FC<ComparativeBarsProps> = ({ categoryAnalyses }) => {
  // Data simulada para fines de demostración
  const simulatedAverage: { [key: string]: number } = {
    'Disponibilidad y Condiciones': 65,
    'Manejo de Aula': 75,
    'Actitud Frente a la IA': 80,
    'Coherencia y Compromiso': 70,
  };

  return (
    <div>
      <p className="text-sm text-gray-400 mb-6 text-center">
        Este gráfico compara el puntaje del candidato (barra <span className="text-[#00FF88]">verde neón</span>) con el puntaje promedio simulado de otros candidatos para programas similares (barra <span className="text-[#007BFF]">azul eléctrico</span>).
      </p>
      <div className="space-y-5">
        {categoryAnalyses.map(analysis => (
          <div key={analysis.category}>
            <h5 className="font-semibold text-white mb-2 text-base">{analysis.category}</h5>
            <div className="space-y-2">
              {/* Candidate Bar */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-300">Candidato:</span>
                <div className="flex-1 bg-[#0D0D0D] rounded-full h-5 border border-gray-700 overflow-hidden">
                  <div className="bg-[#00FF88] h-full rounded-full transition-all duration-700" style={{ width: `${analysis.score}%` }}></div>
                </div>
                <span className="w-12 text-right font-bold text-[#00FF88] text-lg">{analysis.score}</span>
              </div>
              {/* Average Bar */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-400">Promedio:</span>
                <div className="flex-1 bg-[#0D0D0D] rounded-full h-5 border border-gray-700 overflow-hidden">
                  <div className="bg-[#007BFF] h-full rounded-full transition-all duration-700" style={{ width: `${simulatedAverage[analysis.category] || 60}%` }}></div>
                </div>
                <span className="w-12 text-right font-bold text-[#007BFF] text-lg">{simulatedAverage[analysis.category] || 60}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparativeBars;
