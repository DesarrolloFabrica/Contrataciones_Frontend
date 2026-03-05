// src/components/Header.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import LogoCUN from "../assets/images/LogoCUN.png";
import { History, LayoutGrid, LogOut } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

type ViewMode = "analyze" | "history";

interface HeaderProps {
  mode: ViewMode;
  onChangeMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, onChangeMode }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="relative w-full z-50">
      {/* --- 1. FONDO AMBIENTAL (Glow sutil) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {isDark ? (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 to-[#020202]/0" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-emerald-500/10 blur-[110px] rounded-full opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          </>
        )}
      </div>

      {/* --- 2. BARRA PRINCIPAL --- */}
      <div
        className={[
          "relative z-10 border-b backdrop-blur-md",
          isDark
            ? "border-white/5 bg-[#020202]/60"
            : "border-neutral-200 bg-white/90",
        ].join(" ")}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* A. SECCIÓN IZQUIERDA: LOGO E IDENTIDAD */}
          <div className="flex items-center gap-5">
            {/* Logo Container con efecto "Inset" */}
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div
                className={[
                  "relative h-10 w-10 flex items-center justify-center rounded-xl border shadow-inner",
                  isDark
                    ? "bg-gradient-to-br from-white/10 to-white/5 border-white/10"
                    : "bg-gradient-to-br from-[#020617] to-[#111827] border-[#00B894]/35 shadow-[0_10px_30px_rgba(0,0,0,0.40)]",
                ].join(" ")}
              >
                <img
                  src={LogoCUN}
                  alt="CUN"
                  className="h-6 w-6 object-contain opacity-100 drop-shadow-[0_0_8px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>

            {/* Separador vertical sutil */}
            <div
              className={[
                "h-8 w-px hidden sm:block",
                isDark ? "bg-white/10" : "bg-neutral-200",
              ].join(" ")}
            />

            {/* Textos */}
            <div className="flex flex-col">
              <h1
                className={[
                  "text-sm font-bold tracking-wide uppercase flex items-center gap-2",
                  isDark ? "text-white" : "text-neutral-900",
                ].join(" ")}
              >
                IA para Facilitadores
              </h1>
              <p
                className={[
                  "text-xs font-medium tracking-wide",
                  isDark ? "text-neutral-400" : "text-neutral-500",
                ].join(" ")}
              >
                Consola de Líder · Evaluación de Talento
              </p>
            </div>
          </div>

          {/* B. SECCIÓN DERECHA: CONTROLES */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Indicador de estado (Status Pill) */}
            <div
              className={[
                "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border",
                isDark
                  ? "bg-black/40 border-white/5"
                  : "bg-neutral-100 border-neutral-200",
              ].join(" ")}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    mode === "analyze" ? "bg-emerald-500" : "bg-cyan-500"
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    mode === "analyze" ? "bg-emerald-500" : "bg-cyan-500"
                  }`}
                ></span>
              </span>
              <span
                className={[
                  "text-[11px] font-medium uppercase tracking-wider",
                  isDark ? "text-neutral-400" : "text-neutral-700",
                ].join(" ")}
              >
                {mode === "analyze" ? "Sistema Activo" : "Modo Historial"}
              </span>
            </div>

            {/* Toggle Switch "Premium" */}
            <div
              className={[
                "p-1 rounded-xl border shadow-inner flex items-center relative",
                isDark
                  ? "bg-[#0F0F0F] border-white/10"
                  : "bg-neutral-100 border-neutral-300",
              ].join(" ")}
            >
              <button
                onClick={() => onChangeMode("analyze")}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  mode === "analyze"
                    ? isDark
                      ? "bg-[#1f2937] text-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
                      : "bg-gradient-to-r from-[#00B894] to-[#16a34a] text-white shadow-sm ring-1 ring-[#00B894]/45"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <LayoutGrid
                  size={14}
                  className={
                    mode === "analyze"
                      ? isDark
                        ? "text-emerald-400"
                        : "text-white"
                      : "text-neutral-600"
                  }
                />
                Analizar
              </button>

              <button
                onClick={() => onChangeMode("history")}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  mode === "history"
                    ? isDark
                      ? "bg-[#1f2937] text-cyan-400 shadow-sm ring-1 ring-cyan-500/20"
                      : "bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white shadow-sm ring-1 ring-[#10b981]/45"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <History
                  size={14}
                  className={
                    mode === "history"
                      ? isDark
                        ? "text-cyan-400"
                        : "text-white"
                      : "text-neutral-600"
                  }
                />
                Historial
              </button>
            </div>

            {/* Cambio de tema */}
            <ThemeToggle />

            {/* ✅ BOTÓN CERRAR SESIÓN */}
            <button
              type="button"
              onClick={handleLogout}
              className={[
                "group relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
                isDark
                  ? "border-white/10 bg-black/40 text-neutral-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                  : "border-neutral-300 bg-white text-neutral-600 hover:text-red-500 hover:border-red-400 hover:bg-red-50",
              ].join(" ")}
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:rotate-[-10deg]" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">
                Cerrar Sesión 
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
