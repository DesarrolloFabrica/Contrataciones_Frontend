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
   * ✅ NUEVO: acciones específicas para los botones dentro del item.
   * Estos NO deben disparar el onClick general del item.
   */
  onOpenDetail?: () => void;
  onOpenSecond?: () => void;
}

const pillBase =
  "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border";

function getIaBadge(verdict: string) {
  const v = (verdict ?? "").toLowerCase();

  if (v.includes("no recomendar")) {
    return {
      cls: "bg-rose-500/10 text-rose-300 border-rose-500/30",
      label: verdict || "No recomendar",
    };
  }
  if (v.includes("precauc")) {
    return {
      cls: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      label: verdict || "Precaución",
    };
  }
  if (v.includes("recomendar") || v.includes("recomendada")) {
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

  // ✅ nuevos callbacks de botones
  onOpenDetail,
  onOpenSecond,
}) => {
  // Formateo de fecha (guardamos en memo para evitar recalcular en cada render)
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
  const decision = useMemo(
    () => getDecisionBadge(decisionStatus),
    [decisionStatus]
  );

  const score = Math.round(evaluation.aiTeachingSuitabilityScore || 0);

  // Solo estilos "clickable", sin volverlo button.
  const clickableCls = onClick ? "cursor-pointer" : "cursor-default";

  // Helper para que los botones NO disparen el click del item
  const stop = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      aria-pressed={onClick ? selected : undefined}
      onKeyDown={(e) => {
        // Accesibilidad: enter o espacio hace "selección" del item
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          // Si el foco está en el contenedor (no en un botón), activamos selección
          e.preventDefault();
          onClick();
        }
      }}
      className={[
        "w-full text-left px-4 py-3 rounded-2xl border transition-all duration-200",
        "flex items-start justify-between gap-4",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-0",
        selected
          ? "border-emerald-500/60 bg-emerald-500/5"
          : "border-white/5 bg-[#090909] hover:border-emerald-500/35 hover:bg-white/[0.02]",
        clickableCls,
      ].join(" ")}
    >
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

        {/* ✅ NUEVO: botones por candidato */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            // Evita que el click seleccione el item
            onClick={(e) => {
              stop(e);
              onOpenDetail?.();
            }}
            // Evita que Enter/Espacio aquí activen el contenedor padre
            onKeyDown={(e) => stop(e)}
            className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest
                       border border-white/10 bg-white/5 text-gray-200
                       hover:bg-white/10 hover:border-emerald-500/30 hover:text-emerald-200 transition"
          >
            Ver detalle
          </button>

          <button
            type="button"
            onClick={(e) => {
              stop(e);
              onOpenSecond?.();
            }}
            onKeyDown={(e) => stop(e)}
            className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest
                       border border-white/10 bg-white/5 text-gray-200
                       hover:bg-white/10 hover:border-cyan-500/30 hover:text-cyan-200 transition"
          >
            Otra tarjeta
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherEvaluationItem;
