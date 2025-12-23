// src/pages/coordinator/components/InterviewsTab.tsx
import React from "react";
import type { CandidateGroup } from "../types";

type Props = {
  /** Grupo del candidato seleccionado (trae interviews[]) */
  candidateGroup: CandidateGroup;

  /** evaluación actualmente abierta en el panel (para resaltar) */
  selectedEvaluationId: string | null;

  /** Abrir una evaluación específica (una entrevista) */
  onOpenInterview: (evaluationId: string) => void;

  /** ✅ NUEVO: abrir la tarjeta de comparación IA */
  onOpenComparison: () => void;
};

export default function InterviewsTab({
  candidateGroup,
  selectedEvaluationId,
  onOpenInterview,
  onOpenComparison,
}: Props) {
  const interviews = candidateGroup.interviews ?? [];

  if (interviews.length === 0) {
    return (
      <div className="text-sm text-gray-400 bg-black/20 border border-white/10 rounded-2xl p-4">
        Este candidato no tiene entrevistas registradas.
      </div>
    );
  }

  const canCompare = interviews.length >= 2; // ✅ regla pedida

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500">
        <b className="text-gray-300">{candidateGroup.candidateName}</b> •{" "}
        {interviews.length} entrevista(s)
      </div>

      <div className="space-y-2">
        {interviews.map((ev) => {
          const active = ev.id === selectedEvaluationId;

          return (
            <button
              key={ev.id}
              type="button"
              onClick={() => onOpenInterview(ev.id)}
              className={[
                "w-full text-left rounded-2xl border px-4 py-3 transition",
                active
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-white/10 bg-white/[0.03] hover:border-emerald-500/25 hover:bg-white/[0.06]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    Entrevista
                  </div>
                  <div className="text-xs text-white/55 mt-0.5">
                    {new Date(ev.createdAt).toLocaleString("es-CO")}
                  </div>
                </div>

                <span
                  className={[
                    "text-[11px] px-3 py-1 rounded-full border",
                    active
                      ? "border-emerald-500/30 text-emerald-200 bg-emerald-500/10"
                      : "border-white/10 text-gray-300 bg-white/[0.03]",
                  ].join(" ")}
                >
                  Abrir
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ✅ CTA inferior: comparar entrevistas (solo si hay 2+) */}
      {canCompare && (
        <div className="pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onOpenComparison}
            className="
              w-full
              rounded-2xl
              px-4 py-3
              text-[11px] font-extrabold uppercase tracking-[0.22em]
              border border-emerald-500/20
              bg-emerald-500/10 text-emerald-200
              hover:bg-emerald-500/15 hover:border-emerald-500/30
              transition
            "
          >
            Comparar entrevistas con IA
          </button>
          <p className="mt-2 text-xs text-white/45">
            La IA detectará similitudes, diferencias y evolución entre reportes.
          </p>
        </div>
      )}
    </div>
  );
}