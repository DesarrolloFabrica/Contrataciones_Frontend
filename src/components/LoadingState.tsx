// src/components/LoadingState.tsx
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, Cpu, Search, Fingerprint } from 'lucide-react';

const messages = [
  "Analizando observaciones cualitativas...",
  "Aplicando rúbrica de puntuación...",
  "Calculando puntaje global ponderado...",
  "Evaluando factores de riesgo...",
  "Correlacionando patrones históricos...",
  "Generando estrategias de mitigación...",
  "Redactando informe ejecutivo..."
];

const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotación de mensajes
    const msgInterval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000);

    // Barra de progreso simulada
    const progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) return 0;
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 relative overflow-hidden rounded-3xl bg-[#050505] border border-white/5">
      
      {/* Luces Ambientales de Fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
      
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
        
        {/* --- NÚCLEO DE IA (Spinner Avanzado) --- */}
        <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
          {/* Anillo Exterior (Lento) */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 border-t-emerald-500 animate-[spin_3s_linear_infinite]" />
          
          {/* Anillo Interior (Rápido inverso) */}
          <div className="absolute inset-3 rounded-full border border-cyan-500/20 border-b-cyan-400 animate-[spin_2s_linear_infinite_reverse]" />
          
          {/* Icono Central Pulsante */}
          <div className="relative bg-[#0F0F0F] rounded-full p-4 border border-white/10 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] animate-pulse">
            <BrainCircuit className="w-8 h-8 text-emerald-400" />
          </div>

          {/* Partículas decorativas */}
          <Sparkles className="absolute -top-2 -right-4 w-5 h-5 text-cyan-400 animate-bounce opacity-50" />
        </div>

        {/* --- TEXTOS --- */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight text-center">
          Procesando Perfil
        </h2>
        
        <p className="text-gray-400 text-sm text-center mb-8 max-w-sm leading-relaxed">
          Nuestros modelos están deconstruyendo las respuestas para generar un análisis predictivo de riesgo y potencial.
        </p>

        {/* --- TARJETA DE ESTADO (Log) --- */}
        <div className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 relative overflow-hidden group">
          {/* Barra de Progreso Superior */}
          <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/5 rounded-lg text-emerald-400">
               {/* Cambia el icono dinámicamente según el paso (opcional, o usa uno fijo) */}
               <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Estado del Sistema
              </p>
              <div className="h-6 relative overflow-hidden">
                {messages.map((msg, idx) => (
                  <span
                    key={idx}
                    className={`absolute inset-0 flex items-center text-sm font-mono text-cyan-300 transition-all duration-500 transform ${
                      idx === messageIndex 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    {msg} <span className="animate-pulse ml-1">_</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Brillo de fondo al procesar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>

      </div>
    </div>
  );
};

export default LoadingState;