// src/pages/admin/components/AdminHeader.tsx
import React from "react";
import { LayoutDashboard, ScrollText, LogOut } from "lucide-react";
import ThemeToggle from "../../../components/ThemeToggle";
import { UserHeaderProfile } from "../../../components/UserHeaderProfile";
import { useTheme } from "../../../context/ThemeContext";

const pillBase =
  "px-3 py-1.5 rounded-xl border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2 font-semibold";

type Props = {
  hasSelection: boolean;
  onClearSelection: () => void;
  onLogout: () => void;
};

export default function AdminHeader({
  hasSelection,
  onClearSelection,
  onLogout,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className={[
        "relative overflow-hidden rounded-3xl border backdrop-blur-md",
        isDark
          ? "border-white/[0.07] bg-[#0B1220]/72 shadow-[0_16px_48px_-28px_rgba(6,182,212,0.45)]"
          : "border-slate-200/90 bg-white/95 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.14)]",
      ].join(" ")}
    >
      {isDark && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-8 h-40 w-56 rounded-full bg-cyan-500/12 blur-[48px]" />
          <div className="absolute -bottom-12 -left-6 h-36 w-44 rounded-full bg-blue-600/10 blur-[52px]" />
        </div>
      )}

      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500/45 to-transparent" />

      <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6 md:py-5">
        {/* Left: brand + title */}
        <div className="min-w-0">
          <div
            className={[
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
              isDark
                ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-200"
                : "border-cyan-200 bg-cyan-50 text-cyan-700",
            ].join(" ")}
          >
            <LayoutDashboard size={14} className="shrink-0 opacity-90" />
            Admin Console
          </div>
          <h1
            className={[
              "text-2xl font-black tracking-tight leading-tight md:text-3xl",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Panel de Control{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Global
            </span>
          </h1>
          <p
            className={[
              "mt-1.5 max-w-xl text-xs md:text-sm",
              isDark ? "text-slate-300" : "text-slate-700",
            ].join(" ")}
          >
            Vista ejecutiva del sistema: métricas, evaluaciones y trazabilidad.
          </p>
        </div>

        {/* Right: utility actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 md:justify-end">
          {hasSelection && (
            <button
              onClick={onClearSelection}
              className={[
                pillBase,
                isDark
                  ? "border-white/10 text-neutral-200 hover:border-white/20 bg-white/5"
                  : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50",
              ].join(" ")}
              type="button"
            >
              <ScrollText className="w-3.5 h-3.5" />
              Cerrar detalle
            </button>
          )}

          <UserHeaderProfile />

          <ThemeToggle />

          <button
            onClick={onLogout}
            className={[
              pillBase,
              isDark
                ? "border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15 hover:border-rose-500/30"
                : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
            ].join(" ")}
            type="button"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
