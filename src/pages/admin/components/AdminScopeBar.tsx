// src/pages/admin/components/AdminScopeBar.tsx
import React from "react";
import {
  Globe,
  Building2,
  GraduationCap,
  SlidersHorizontal,
  X,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

type Props = {
  selectedSchool: string | null;
  selectedProgram: string | null;
  onChangeScope: () => void;
  onResetScope: () => void;
};

export default function AdminScopeBar({
  selectedSchool,
  selectedProgram,
  onChangeScope,
  onResetScope,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isGlobal = !selectedSchool;
  const isSchoolOnly = !!selectedSchool && !selectedProgram;
  const isProgram = !!selectedSchool && !!selectedProgram;

  return (
    <div
      className={[
        "w-full rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 transition-colors",
        isGlobal
          ? isDark
            ? "bg-white/[0.03] border-white/[0.08]"
            : "bg-slate-50 border-slate-200"
          : isDark
            ? "bg-cyan-500/[0.07] border-cyan-500/30"
            : "bg-cyan-50 border-cyan-200",
      ].join(" ")}
    >
      {/* Left: scope status */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon */}
        <div
          className={[
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
            isGlobal
              ? isDark
                ? "bg-white/[0.06] border-white/10"
                : "bg-white border-slate-200"
              : isDark
                ? "bg-cyan-500/20 border-cyan-500/30"
                : "bg-cyan-100 border-cyan-200",
          ].join(" ")}
        >
          {isGlobal ? (
            <Globe
              className={[
                "w-4 h-4",
                isDark ? "text-neutral-300" : "text-slate-700",
              ].join(" ")}
            />
          ) : isProgram ? (
            <GraduationCap
              className={[
                "w-4 h-4",
                isDark ? "text-cyan-300" : "text-cyan-600",
              ].join(" ")}
            />
          ) : (
            <Building2
              className={[
                "w-4 h-4",
                isDark ? "text-cyan-300" : "text-cyan-600",
              ].join(" ")}
            />
          )}
        </div>

        {/* Label */}
        <div className="min-w-0">
          <p
            className={[
              "text-[10px] uppercase tracking-[0.18em] font-bold",
              isGlobal
                ? isDark ? "text-neutral-400" : "text-slate-600"
                : isDark ? "text-cyan-400" : "text-cyan-600",
            ].join(" ")}
          >
            Filtro activo
          </p>

          {isGlobal && (
            <p
              className={[
                "text-sm font-semibold mt-0.5",
                isDark ? "text-neutral-200" : "text-slate-700",
              ].join(" ")}
            >
              Vista global — todas las escuelas y programas
            </p>
          )}

          {isSchoolOnly && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={[
                  "text-sm font-semibold",
                  isDark ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                {selectedSchool}
              </span>
              <span
                className={[
                  "text-xs",
                  isDark ? "text-neutral-300" : "text-slate-600",
                ].join(" ")}
              >
                · todos los programas
              </span>
            </div>
          )}

          {isProgram && (
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span
                className={[
                  "text-sm font-semibold",
                  isDark ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                {selectedSchool}
              </span>
              <ChevronRight
                className={[
                  "w-3.5 h-3.5 shrink-0",
                  isDark ? "text-neutral-400" : "text-slate-600",
                ].join(" ")}
              />
              <span
                className={[
                  "text-sm font-semibold",
                  isDark ? "text-cyan-200" : "text-cyan-700",
                ].join(" ")}
              >
                {selectedProgram}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Reset to global (only when filtered) */}
        {!isGlobal && (
          <button
            type="button"
            onClick={onResetScope}
            title="Quitar filtro y volver a vista global"
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
              isDark
                ? "border-white/10 bg-white/[0.05] text-neutral-200 hover:bg-white/10 hover:text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            <X className="w-3.5 h-3.5" />
            Quitar filtro
          </button>
        )}

        {/* Change scope — main CTA */}
        <button
          type="button"
          onClick={onChangeScope}
          className={[
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
            isGlobal
              ? isDark
                ? "bg-cyan-500/15 border-cyan-500/35 text-cyan-200 hover:bg-cyan-500/25"
                : "bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-500 shadow-[0_6px_18px_rgba(6,182,212,0.35)]"
              : isDark
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-100 hover:bg-cyan-500/30"
                : "bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-500 shadow-[0_6px_18px_rgba(6,182,212,0.35)]",
          ].join(" ")}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {isGlobal ? "Filtrar por escuela / programa" : "Cambiar filtro"}
        </button>
      </div>
    </div>
  );
}
