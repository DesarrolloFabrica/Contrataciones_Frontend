import React from "react";
import { Sparkles, BarChart3, History, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { UserHeaderProfile } from "../../../components/UserHeaderProfile";

type ViewMode = "analyze" | "history";

type Props = {
  mode: ViewMode;
  onChangeMode: (m: ViewMode) => void;
  onLogout: () => void;
  statusLabel?: string;
};

export function LeaderModeHeader({ mode, onChangeMode, onLogout, statusLabel }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const btnBase = (active: boolean) =>
    [
      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-[0.18em] border transition-all duration-200 flex items-center gap-2",
      active
        ? isDark
          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400/40 shadow-[0_0_24px_-5px_rgba(6,182,212,0.4)]"
          : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400/50 shadow-[0_8px_25px_rgba(6,182,212,0.3)]"
        : isDark
          ? "bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-white hover:border-white/20"
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300",
    ].join(" ");

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-colors duration-300 ${
        isDark
          ? "bg-[#060A12]/80 border-white/[0.06]"
          : "bg-white/80 border-slate-200/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isDark
                  ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/15 border border-cyan-500/20"
                  : "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
            </div>
            <div>
              <span
                className={`font-black text-sm tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                IA para Facilitadores
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
                </span>
                <span
                  className={`text-[9px] uppercase tracking-widest font-semibold ${
                    isDark ? "text-cyan-400/80" : "text-cyan-600"
                  }`}
                >
                  Sistema activo
                </span>
                {statusLabel && (
                  <>
                    <span className={`mx-1 ${isDark ? "text-slate-600" : "text-slate-300"}`}>·</span>
                    <span className={`text-[9px] uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {statusLabel}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
            <UserHeaderProfile />
            <button
              type="button"
              className={btnBase(mode === "analyze")}
              onClick={() => onChangeMode("analyze")}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analizar
            </button>

            <button
              type="button"
              className={btnBase(mode === "history")}
              onClick={() => onChangeMode("history")}
            >
              <History className="w-3.5 h-3.5" />
              Historial
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                isDark
                  ? "bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              title={isDark ? "Modo claro" : "Modo oscuro"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                isDark
                  ? "bg-white/[0.04] border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              }`}
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
