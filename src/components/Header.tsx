// src/components/Header.tsx
import React from "react";
import LogoCUN from "../assets/images/LogoCUN.png";
import { Sparkles, History, LayoutGrid } from "lucide-react"; // Opcional: Iconos para darle un toque "Pro"

;
type ViewMode = "analyze" | "history";

interface HeaderProps {
  mode: ViewMode;
  onChangeMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, onChangeMode }) => {
  return (
    <header className="relative w-full z-50">
      {/* --- 1. FONDO AMBIENTAL (Glow sutil) --- */}
      {/* Esto crea la atmósfera verde/oscura detrás del header sin ensuciar el contenido */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 to-[#020202]/0" />
      </div>

      {/* --- 2. BARRA PRINCIPAL --- */}
      {/* backdrop-blur ayuda a que el contenido pase por debajo elegantemente */}
      <div className="relative z-10 border-b border-white/5 bg-[#020202]/60 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* A. SECCIÓN IZQUIERDA: LOGO E IDENTIDAD */}
          <div className="flex items-center gap-5">
            {/* Logo Container con efecto "Inset" (hundido) */}
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-inner">
                <img src={LogoCUN} alt="CUN" className="h-8 w-8 object-contain opacity-90" />
              </div>
            </div>

            {/* Separador vertical sutil */}
            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            {/* Textos con jerarquía tipográfica clara */}
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                IA para Facilitadores
              </h1>
              <p className="text-xs text-neutral-400 font-medium tracking-wide">
                Consola de Líder · Evaluación de Talento
              </p>
            </div>
          </div>

          {/* B. SECCIÓN DERECHA: CONTROLES */}
          <div className="flex items-center gap-6">
            
            {/* Indicador de estado (Status Pill) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5">
              <span className={`relative flex h-2 w-2`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${mode === 'analyze' ? 'bg-emerald-500' : 'bg-cyan-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${mode === 'analyze' ? 'bg-emerald-500' : 'bg-cyan-500'}`}></span>
              </span>
              <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                {mode === "analyze" ? "Sistema Activo" : "Modo Historial"}
              </span>
            </div>

            {/* Toggle Switch "Premium" */}
            <div className="p-1 rounded-xl bg-[#0F0F0F] border border-white/10 shadow-inner flex items-center relative">
              {/* Fondo animado del toggle (opcional, simplificado con lógica condicional) */}
              
              <button
                onClick={() => onChangeMode("analyze")}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  mode === "analyze"
                    ? "bg-[#1f2937] text-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <LayoutGrid size={14} className={mode === "analyze" ? "text-emerald-500" : "text-neutral-600"} />
                Analizar
              </button>

              <button
                onClick={() => onChangeMode("history")}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  mode === "history"
                    ? "bg-[#1f2937] text-cyan-400 shadow-sm ring-1 ring-cyan-500/20"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <History size={14} className={mode === "history" ? "text-cyan-500" : "text-neutral-600"} />
                Historial
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;