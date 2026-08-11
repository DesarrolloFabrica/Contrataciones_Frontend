// src/pages/coordinator/components/InterviewsTab.tsx
import React, { useState } from "react";
import type { CandidateGroup } from "../types";
import ComparisonInlinePanel from "./ComparisonInlinePanel";
import { useTheme } from "../../../context/ThemeContext";

type Props = {
  /** Grupo del candidato seleccionado (trae interviews[]) */
  candidateGroup: CandidateGroup;

  /** evaluación actualmente abierta en el panel (para resaltar) */
  selectedEvaluationId: string | null;

  /** Abrir una evaluación específica (una entrevista) */
  onOpenInterview: (evaluationId: string) => void;

  /** fallback (si quieres abrir otra vista o tab) */
  onOpenComparison: () => void;
};

export default function InterviewsTab({
  candidateGroup,
  selectedEvaluationId,
  onOpenInterview,
  onOpenComparison,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const interviews = candidateGroup.interviews ?? [];

  const [showComparison, setShowComparison] = useState(false);

  if (interviews.length === 0) {
    return (
      <div className={`text-sm rounded-2xl border p-4 ${isDark ? "text-slate-400 bg-[#0b232a] border-[#579689]/18" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
        Este candidato no tiene entrevistas registradas.
      </div>
    );
  }

  const canCompare = interviews.length >= 2;

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 [&_b]:!text-slate-700 dark:[&_b]:!text-slate-300">
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
                  : isDark
                    ? "border-[#579689]/18 bg-[#0b232a]/70 hover:border-[#58bea1]/30 hover:bg-[#102a30]"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                    Entrevista
                  </div>
                  <div className={`text-xs mt-0.5 ${isDark ? "text-white/55" : "text-slate-500"}`}>
                    {new Date(ev.createdAt).toLocaleString("es-CO")}
                  </div>
                </div>

                <span
                  className={[
                    "text-[11px] px-3 py-1 rounded-full border",
                    active
                      ? "border-emerald-500/30 text-emerald-200 bg-emerald-500/10"
                      : isDark
                        ? "border-[#579689]/18 text-slate-300 bg-[#102a30]"
                        : "border-slate-200 text-slate-600 bg-slate-50",
                  ].join(" ")}
                >
                  Abrir
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {canCompare && (
        <div className={`pt-3 border-t space-y-3 ${isDark ? "border-[#579689]/18" : "border-slate-200"}`}>
          <button
            type="button"
            onClick={() => setShowComparison((v) => !v)}
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

          <p className={`text-xs ${isDark ? "text-white/45" : "text-slate-500"}`}>
            La IA detectará similitudes, diferencias y evolución entre reportes.
          </p>

          {showComparison ? (
            <ComparisonInlinePanel candidateGroup={candidateGroup} />
          ) : (
            // fallback opcional: si prefieres abrir otra vista/tab cuando no está desplegado
            null
          )}

          {/* Si algún día quieres forzar navegación/tab, puedes usar esto:
          <button type="button" onClick={onOpenComparison} className="text-xs text-emerald-300 underline">
            Abrir comparación en vista dedicada
          </button>
          */}
        </div>
      )}
    </div>
  );
}
