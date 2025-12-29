// src/components/TeacherEvaluationItem.tsx
import React, { useMemo } from "react";
import type { TeacherEvaluationSummary } from "../types";

interface TeacherEvaluationItemProps {
  evaluation: TeacherEvaluationSummary;
  selected?: boolean;

  /**
   * Click general del item (seleccionar candidato).
   * OJO: no convertimos el item en <button> para evitar "button dentro de button".
   */
  onClick?: () => void;

  decisionStatus?: "PENDIENTE" | "APROBADO" | "RECHAZADO";

  /**
   * ✅ NUEVO: footer opcional para mostrar info extra dentro de la tarjeta
   * (ej: # entrevistas + botón ver detalle).
   */
  footer?: React.ReactNode;
}

const pillBase =
  "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border";

function getIaBadge(verdict: string) {
  const v = (verdict ?? "").toLowerCase().trim();

  const isNotRecommended =
    v.includes("no recomend") ||
    v.includes("no se recomienda") ||
    v.includes("rechaz") ||
    v.includes("no apto") ||
    v.includes("no es apto");

  if (isNotRecommended) {
    return {
      cls: "bg-rose-500/10 text-rose-300 border-rose-500/30",
      label: verdict || "No recomendada",
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
      cls: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      label: verdict || "Precaución",
    };
  }

  const isRecommended =
    v.includes("recomend") || v.includes("apto") || v.includes("idóneo");

  if (isRecommended) {
    return {
      cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      label: verdict || "Recomendada",
    };
  }

  return {
    cls: "bg-slate-500/10 text-slate-300 border-slate-500/30",
    label: verdict || "Sin veredicto",
  };
}

function getDecisionBadge(
  decisionStatus?: "PENDIENTE" | "APROBADO" | "RECHAZADO"
) {
  if (!decisionStatus) return null;

  if (decisionStatus === "APROBADO") {
    return {
      cls: "bg-emerald-600/15 text-emerald-300 border-emerald-500/40",
      label: "Aprobado coordinación",
    };
  }
  if (decisionStatus === "RECHAZADO") {
    return {
      cls: "bg-rose-600/15 text-rose-300 border-rose-500/40",
      label: "Rechazado coordinación",
    };
  }
  return {
    cls: "bg-slate-600/20 text-slate-200 border-slate-500/40",
    label: "Pendiente coordinación",
  };
}

const TeacherEvaluationItem: React.FC<TeacherEvaluationItemProps> = ({
  evaluation,
  selected = false,
  onClick,
  decisionStatus,
  footer, // ✅ nuevo
}) => {
  // Formateo de fecha (memo para performance)
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

  // Badges (IA + decisión coordinación)
  const verdict = evaluation.aiFinalRecommendation || "";
  const ia = useMemo(() => getIaBadge(verdict), [verdict]);
  const decision = useMemo(() => getDecisionBadge(decisionStatus), [decisionStatus]);

  const score = Math.round(evaluation.aiTeachingSuitabilityScore || 0);

  // Estilos de "clickable" sin volverlo button
  const clickableCls = onClick ? "cursor-pointer" : "cursor-default";

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
        "flex flex-col gap-3", // ✅ antes era un layout horizontal; ahora lo hacemos columna para agregar footer fácil
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-0",
        selected
          ? "border-emerald-500/60 bg-emerald-500/5"
          : "border-white/5 bg-[#090909] hover:border-emerald-500/35 hover:bg-white/[0.02]",
        clickableCls,
      ].join(" ")}
    >
      {/* ✅ HEADER (arriba): izquierda + derecha */}
      <div className="flex items-start justify-between gap-4">
        {/* IZQUIERDA */}
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-white truncate">
            {evaluation.candidate?.fullName ?? "Candidato sin nombre"}
          </p>

          <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-2">
            {evaluation.candidate?.schoolNameSnapshot && (
              <span className="truncate max-w-[220px]">
                {evaluation.candidate.schoolNameSnapshot}
              </span>
            )}

            {evaluation.candidate?.programNameSnapshot && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span className="truncate max-w-[260px]">
                  {evaluation.candidate.programNameSnapshot}
                </span>
              </>
            )}
          </div>

          <p className="text-[11px] text-neutral-600">{dateLabel}</p>

          {decision && (
            <div className={`${pillBase} ${decision.cls} normal-case mt-2`}>
              {decision.label}
            </div>
          )}
        </div>

        {/* DERECHA */}
        <div className="text-right flex flex-col items-end gap-2 shrink-0">
          <div className={`${pillBase} ${ia.cls} normal-case max-w-[240px] truncate`}>
            {ia.label}
          </div>

          <div className="text-xs font-semibold">
            <span className="text-neutral-400">Score </span>
            <span className="text-emerald-400">{score}</span>
            <span className="text-neutral-500">/100</span>
          </div>
        </div>
      </div>

      {/* ✅ FOOTER (abajo dentro de la tarjeta) */}
      {footer && (
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          {footer}
        </div>
      )}
    </div>
  );
};

export default TeacherEvaluationItem;
