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
        "w-full rounded-2xl border border-t-2 border-t-brand-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 transition-colors",
        isGlobal
          ? isDark
            ? "bg-white/[0.03] border-brand-500/20"
            : "bg-slate-50 border-brand-500/15"
          : isDark
            ? "bg-brand-500/[0.07] border-brand-500/30"
            : "bg-brand-50 border-brand-200",
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
                ? "bg-brand-500/20 border-brand-500/30"
                : "bg-brand-100 border-brand-200",
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
                isDark ? "text-brand-300" : "text-brand-600",
              ].join(" ")}
            />
          ) : (
            <Building2
              className={[
                "w-4 h-4",
                isDark ? "text-brand-300" : "text-brand-600",
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
                : isDark ? "text-brand-400" : "text-brand-600",
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
                  isDark ? "text-brand-200" : "text-brand-700",
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
                ? "bg-brand-500/15 border-brand-500/35 text-brand-200 hover:bg-brand-500/25"
                : "bg-brand-600 border-brand-500 text-white hover:bg-brand-500 shadow-[0_6px_18px_rgba(16,185,129,0.35)]"
              : isDark
                ? "bg-brand-500/20 border-brand-500/40 text-brand-100 hover:bg-brand-500/30"
                : "bg-brand-600 border-brand-500 text-white hover:bg-brand-500 shadow-[0_6px_18px_rgba(16,185,129,0.35)]",
          ].join(" ")}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {isGlobal ? "Filtrar por escuela / programa" : "Cambiar filtro"}
        </button>
      </div>
    </div>
  );
}
