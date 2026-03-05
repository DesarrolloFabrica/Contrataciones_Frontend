// src/pages/admin/components/AdminHeader.tsx
import React, { useMemo } from "react";
import {
  LayoutDashboard,
  ScrollText,
  LogOut,
  RefreshCcw,
  Building2,
  GraduationCap,
  Globe,
} from "lucide-react";
import ThemeToggle from "../../../components/ThemeToggle";
import { useTheme } from "../../../context/ThemeContext";

const pillBase =
  "px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2";

type Props = {
  hasSelection: boolean;
  onClearSelection: () => void;
  onLogout: () => void;

  selectedSchool: string | null;
  selectedProgram: string | null;

  onChangeScope: () => void; // abre modal
  onResetScope: () => void;  // vuelve a global
};

export default function AdminHeader(props: Props) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  const isGlobal = !props.selectedSchool;
  const isSchoolOnly = !!props.selectedSchool && !props.selectedProgram;
  const isProgram = !!props.selectedSchool && !!props.selectedProgram;

  const scopeLabel = useMemo(() => {
    if (isGlobal) return "Vista Global";
    if (isSchoolOnly) return props.selectedSchool!;
    return `${props.selectedSchool} · ${props.selectedProgram}`;
  }, [isGlobal, isSchoolOnly, props.selectedSchool, props.selectedProgram]);

  return (
    <header
      className={[
        "flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8",
        isDarkTheme
          ? "border-white/10"
          : "border-neutral-200 bg-white/80 backdrop-blur-sm rounded-2xl px-4 md:px-6 pt-4",
      ].join(" ")}
    >
      <div>
        <div
          className={[
            "flex items-center gap-2 mb-2 font-bold tracking-widest text-xs uppercase",
            isDarkTheme ? "text-emerald-400" : "text-emerald-600",
          ].join(" ")}
        >
          <LayoutDashboard size={16} /> Admin Console
        </div>

        <h1
          className={[
            "text-4xl md:text-5xl font-bold tracking-tight",
            isDarkTheme ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
          Panel de Control{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Global
          </span>
        </h1>

        <p
          className={[
            "mt-2 max-w-2xl text-sm leading-relaxed",
            isDarkTheme ? "text-neutral-400" : "text-slate-600",
          ].join(" ")}
        >
          Vista ejecutiva: métricas, distribución por escuelas, lista completa y
          detalle del reporte (IA + decisiones).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-end">
        {/* Scope pill (siempre) */}
        <span
          className={[
            pillBase,
            isGlobal
              ? isDarkTheme
                ? "border-white/10 bg-white/5 text-neutral-200"
                : "border-slate-200 bg-slate-50 text-slate-700"
              : isDarkTheme
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
          ].join(" ")}
          title="Scope actual"
        >
          {isGlobal ? (
            <>
              <Globe className="w-4 h-4 text-neutral-300" />
              {scopeLabel}
            </>
          ) : (
            <>
              <Building2 className="w-4 h-4 text-emerald-300" />
              {props.selectedSchool}
            </>
          )}
        </span>

        {/* Programa pill */}
        {isProgram && (
          <span
            className={[
              pillBase,
              isDarkTheme
                ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                : "border-cyan-200 bg-cyan-50 text-cyan-700",
            ].join(" ")}
            title="Programa seleccionado"
          >
            <GraduationCap className="w-4 h-4 text-cyan-200" />
            {props.selectedProgram}
          </span>
        )}

        <button
          type="button"
          onClick={props.onChangeScope}
          className={[
            pillBase,
            isDarkTheme
              ? "border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
          ].join(" ")}
          title="Cambiar escuela/programa"
        >
          <RefreshCcw className="w-4 h-4 text-neutral-300" />
          Cambiar
        </button>

        {!isGlobal && (
          <button
            type="button"
            onClick={props.onResetScope}
            className={[
              pillBase,
              isDarkTheme
                ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-200 hover:bg-emerald-500/10"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
            ].join(" ")}
            title="Volver a vista global"
          >
            <Globe className="w-4 h-4 text-emerald-200" />
            Global
          </button>
        )}

        {props.hasSelection && (
          <button
            onClick={props.onClearSelection}
            className={[
              pillBase,
              isDarkTheme
                ? "border-white/10 text-neutral-300 hover:border-white/20 bg-white/5"
                : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50",
            ].join(" ")}
            type="button"
          >
            <ScrollText className="w-4 h-4 text-neutral-400" />
            Cerrar detalle
          </button>
        )}

        <ThemeToggle />

        <button
          onClick={props.onLogout}
          className={[
            pillBase,
            isDarkTheme
              ? "border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15 hover:border-rose-500/30"
              : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
          ].join(" ")}
          type="button"
        >
          <LogOut className="w-4 h-4 text-rose-300" />
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
