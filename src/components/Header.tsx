// src/components/Header.tsx
import React from "react";
import LogoCUN from "../assets/images/LogoCUN.png";

type ViewMode = "analyze" | "history";

interface HeaderProps {
  mode: ViewMode;
  onChangeMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, onChangeMode }) => {
  return (
    <header className="relative w-full border-b border-gray-200 bg-white">
      <div className="relative z-10 container mx-auto px-6 py-5 md:py-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo y textos */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {/* Glow muy sutil para no ensuciar en fondo blanco */}
              <div className="absolute inset-0 bg-emerald-400 blur-lg opacity-10" />
              <img
                src={LogoCUN}
                alt="Logo Ópera"
                className="h-10 w-10 object-contain relative"
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                OPE-CUN
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="hidden md:block w-8 h-[1px] bg-emerald-500/60"></span>
                <span className="text-sm md:text-base text-gray-600 font-light tracking-wide">
                  IA para Facilitadores
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Analizar / Historial */}
          <div className="bg-gray-100 border border-gray-300 rounded-full px-1.5 py-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest">
            <button
              type="button"
              onClick={() => onChangeMode("analyze")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                mode === "analyze"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white"
              }`}
            >
              Analizar
            </button>
            <button
              type="button"
              onClick={() => onChangeMode("history")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                mode === "history"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white"
              }`}
            >
              Historial
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
