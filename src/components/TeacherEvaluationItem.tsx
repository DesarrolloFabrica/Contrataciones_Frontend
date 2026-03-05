// src/components/TeacherEvaluationItem.tsx
import React, { useMemo } from "react";
import type { TeacherEvaluationSummary } from "../types";
import { useTheme } from "../context/ThemeContext";

type LocalDecision = "PENDIENTE" | "APROBADO" | "RECHAZADO";

interface TeacherEvaluationItemProps {
  evaluation: TeacherEvaluationSummary;
  selected?: boolean;

  /**
   * Click general del item (seleccionar candidato).
   * OJO: no convertimos el item en <button> para evitar "button dentro de button".
   */
  onClick?: () => void;

  decisionStatus?: LocalDecision;

  /**
   * ✅ Footer opcional para mostrar info extra dentro de la tarjeta
   * (ej: # entrevistas + botón ver detalle).
   */
  footer?: React.ReactNode;
}

const pillBase =
  "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border";

function getIaBadge(verdict: string, isDark: boolean) {
  const full = (verdict ?? "").trim();
  const v = full.toLowerCase();

  const isNotRecommended =
    v.includes("no recomend") ||
    v.includes("no se recomienda") ||
    v.includes("rechaz") ||
    v.includes("no apto") ||
    v.includes("no es apto");

  if (isNotRecommended) {
    return {
      cls: isDark
        ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
        : "bg-rose-50 text-rose-700 border-rose-200",
      short: "No recomendado",
      full: full || "No recomendado",
    };
  }

  const isCaution =
    v.includes("precauc") ||
    v.includes("condicion") ||
    v.includes("reserv") ||
    v.includes("duda") ||
    v.includes("riesgo medio");

  if (isCaution) {
    return {
      cls: isDark
        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200",
      short: "Con reservas",
      full: full || "Con reservas",
    };
  }

  const isRecommended =
    v.includes("recomend") || v.includes("apto") || v.includes("idóneo");

  if (isRecommended) {
    // si viene “Recomendación fuerte…” o “altamente recomendada…”
    const isStrong =
      v.includes("fuerte") || v.includes("altamente") || v.includes("excepcional");
    return {
      cls: isDark
        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      short: isStrong ? "Recomendación fuerte" : "Recomendado",
      full: full || "Recomendado",
    };
  }

  return {
    cls: isDark
      ? "bg-slate-500/10 text-slate-300 border-slate-500/30"
      : "bg-slate-100 text-slate-700 border-slate-300/80",
    short: "Sin veredicto",
    full: full || "Sin veredicto",
  };
}

function getDecisionBadge(decisionStatus: LocalDecision | undefined, isDark: boolean) {
  if (!decisionStatus) return null;

  if (decisionStatus === "APROBADO") {
    return {
      cls: isDark
        ? "bg-emerald-600/15 text-emerald-300 border-emerald-500/40"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      label: "Aprobado coordinación",
    };
  }
  if (decisionStatus === "RECHAZADO") {
    return {
      cls: isDark
        ? "bg-rose-600/15 text-rose-300 border-rose-500/40"
        : "bg-rose-50 text-rose-700 border-rose-200",
      label: "Rechazado coordinación",
    };
  }
  return {
    cls: isDark
      ? "bg-slate-600/20 text-slate-200 border-slate-500/40"
      : "bg-slate-100 text-slate-700 border-slate-300/80",
    label: "Pendiente coordinación",
  };
}

const TeacherEvaluationItem: React.FC<TeacherEvaluationItemProps> = ({
  evaluation,
  selected = false,
  onClick,
  decisionStatus,
  footer,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const dateLabel = useMemo(() => {
    const createdAt = evaluation.createdAt ? new Date(evaluation.createdAt) : null;
    if (!createdAt || isNaN(createdAt.getTime())) return "Fecha no disponible";

    return createdAt.toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [evaluation.createdAt]);

  const verdict = evaluation.aiFinalRecommendation || "";
  const ia = useMemo(
    () => getIaBadge(verdict, isDark),
    [verdict, isDark],
  );
  const decision = useMemo(
    () => getDecisionBadge(decisionStatus, isDark),
    [decisionStatus, isDark],
  );

  const score = Math.round(evaluation.aiTeachingSuitabilityScore || 0);
  const clickableCls = onClick ? "cursor-pointer" : "cursor-default";

  const name = evaluation.candidate?.fullName ?? "Candidato sin nombre";
  const school = evaluation.candidate?.schoolNameSnapshot ?? "";
  const program = evaluation.candidate?.programNameSnapshot ?? "";

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      aria-pressed={onClick ? selected : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={[
        "w-full text-left px-4 py-3 rounded-2xl border transition-all duration-200",
        "flex flex-col gap-3",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-0",
        selected
          ? isDark
            ? "border-emerald-500/60 bg-emerald-500/5"
            : "border-emerald-400 bg-emerald-50 shadow-[0_18px_40px_rgba(16,185,129,0.25)]"
          : isDark
            ? "border-white/5 bg-[#090909] hover:border-emerald-500/35 hover:bg-white/[0.02]"
            : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-white hover:shadow-[0_18px_50px_rgba(15,23,42,0.10)]",
        clickableCls,
      ].join(" ")}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        {/* LEFT */}
        <div className="min-w-0 space-y-1">
          <p
            className={`text-sm font-semibold truncate ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {name}
          </p>

          {/* 👇 “Sin veredicto / estado IA corto” va abajo del nombre */}
          <div
            className={`text-[11px] ${
              isDark ? "text-white/55" : "text-slate-500"
            }`}
          >
            {ia.short}
          </div>

          <div
            className={`text-[11px] flex flex-wrap items-center gap-2 ${
              isDark ? "text-gray-500" : "text-slate-500"
            }`}
          >
            {school && <span className="truncate max-w-[220px]">{school}</span>}
            {school && program && (
              <span
                className={`w-1 h-1 rounded-full ${
                  isDark ? "bg-gray-600" : "bg-slate-400"
                }`}
              />
            )}
            {program && <span className="truncate max-w-[260px]">{program}</span>}
          </div>

          <p
            className={`text-[11px] ${
              isDark ? "text-neutral-600" : "text-slate-500"
            }`}
          >
            {dateLabel}
          </p>

          {decision && (
            <div className={`${pillBase} ${decision.cls} normal-case mt-2`}>
              {decision.label}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="text-right flex flex-col items-end gap-2 shrink-0 min-w-[140px]">
          {/* ✅ IA pill arriba, pero CORTA; texto largo queda en tooltip */}
          <div
            title={ia.full}
            className={`${pillBase} ${ia.cls} normal-case max-w-[220px] truncate`}
          >
            {ia.short}
          </div>

          <div className="text-xs font-semibold">
            <span className="text-neutral-400">Score </span>
            <span className="text-emerald-400">{score}</span>
            <span className="text-neutral-500">/100</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      {footer && (
        <div
          className={`pt-3 border-t flex items-center justify-between gap-3 ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default TeacherEvaluationItem;