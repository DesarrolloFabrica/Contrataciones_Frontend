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
  "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border";

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
    const isStrong =
      v.includes("fuerte") || v.includes("altamente") || v.includes("excepcional");
    return {
      cls: isDark
        ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
        : "bg-cyan-50 text-cyan-700 border-cyan-200",
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
        ? "bg-cyan-600/15 text-cyan-300 border-cyan-500/40"
        : "bg-cyan-50 text-cyan-700 border-cyan-200",
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
  const scoreColor = score >= 70 ? "text-cyan-400" : score >= 50 ? "text-amber-400" : "text-rose-400";
  const scoreBg = score >= 70 ? "bg-cyan-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";
  const scoreWidth = `${score}%`;
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
        "w-full text-left px-4 py-3 rounded-2xl border transition-all duration-300",
        "flex flex-col gap-2.5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30 focus-visible:ring-offset-0",
        selected
          ? isDark
            ? "border-cyan-500/60 bg-cyan-500/5 shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)]"
            : "border-cyan-400 bg-cyan-50 shadow-[0_18px_40px_rgba(6,182,212,0.25)]"
          : isDark
            ? "border-white/[0.06] bg-[#0D1117]/80 hover:border-white/10 hover:bg-[#111820] hover:shadow-lg"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
        clickableCls,
      ].join(" ")}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        {/* LEFT */}
        <div className="min-w-0 space-y-1">
          <p
            className={`text-[13px] font-bold tracking-tight truncate ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {name}
          </p>

          {/* 👇 “Sin veredicto / estado IA corto” va abajo del nombre */}
          <div
            className={`text-[10px] font-medium ${
              isDark ? "text-white/60" : "text-slate-500"
            }`}
          >
            {ia.short}
          </div>

          <div
            className={`text-[10px] flex flex-wrap items-center gap-1.5 ${
              isDark ? "text-gray-400" : "text-slate-500"
            }`}
          >
            {school && <span className="truncate max-w-[180px]">{school}</span>}
            {school && program && (
              <span
                className={`w-1 h-1 rounded-full opacity-60 ${
                  isDark ? "bg-gray-500" : "bg-slate-400"
                }`}
              />
            )}
            {program && <span className="truncate max-w-[220px]">{program}</span>}
          </div>

          <p
            className={`text-[10px] ${
              isDark ? "text-neutral-600" : "text-slate-500"
            }`}
          >
            {dateLabel}
          </p>

          {decision && (
            <div className={`${pillBase} ${decision.cls} normal-case mt-1.5`}>
              {decision.label}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="text-right flex flex-col items-end gap-2 shrink-0 min-w-[120px]">
          <div
            title={ia.full}
            className={`${pillBase} ${ia.cls} normal-case max-w-[180px] truncate`}
          >
            {ia.short}
          </div>

          <div className={`flex flex-col items-end gap-1 w-full`}>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${scoreColor}`}>{score}</span>
              <span className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>/100</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${scoreBg}`}
                style={{ width: scoreWidth }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      {footer && (
        <div
          className={`pt-2 border-t flex items-center justify-between gap-2 ${
            isDark ? "border-white/[0.06]" : "border-slate-200/80"
          }`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default TeacherEvaluationItem;