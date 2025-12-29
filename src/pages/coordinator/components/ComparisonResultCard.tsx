import React from "react";
import type { InterviewComparisonResult } from "../../../services/geminiService";

type Props = {
  data: InterviewComparisonResult;
};

export default function ComparisonResultCard({ data }: Props) {
  return (
    <div className="space-y-4">
      {/* Resumen ejecutivo */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[11px] uppercase tracking-widest text-white/45 font-bold">
          Resumen ejecutivo
        </div>
        <div className="mt-2 text-sm text-white/80 leading-relaxed">
          {data.executiveComparison}
        </div>
      </div>

      {/* Tendencias */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-widest text-white/45 font-bold">
            Tendencia general
          </div>
          <div className="mt-2 text-base font-semibold text-white">
            {data.evolution.overallTrend}
          </div>
          <div className="mt-2 text-xs text-white/60">
            <b>Score:</b> {data.evolution.scoreTrend}
          </div>
          <div className="mt-1 text-xs text-white/60">
            <b>Riesgo:</b> {data.evolution.riskTrend}
          </div>
          <div className="mt-1 text-xs text-white/60">
            <b>Veredicto:</b> {data.evolution.verdictTrend}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-widest text-white/45 font-bold">
            Entrevistas comparadas
          </div>
          <div className="mt-2 text-base font-semibold text-white">
            {data.interviewsCompared}
          </div>

          {data.bestInterview && (
            <div className="mt-3 text-xs text-emerald-200/80">
              <b>Mejor:</b> {data.bestInterview.evaluationId.slice(0, 8)}… —{" "}
              {data.bestInterview.reason}
            </div>
          )}

          {data.weakestInterview && (
            <div className="mt-2 text-xs text-rose-200/80">
              <b>Más débil:</b> {data.weakestInterview.evaluationId.slice(0, 8)}… —{" "}
              {data.weakestInterview.reason}
            </div>
          )}
        </div>
      </div>

      {/* Similitudes */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[11px] uppercase tracking-widest text-white/45 font-bold">
          Similitudes
        </div>
        <ul className="mt-3 space-y-2 text-sm text-white/75 list-disc pl-5">
          {data.similarities.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      {/* Diferencias */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[11px] uppercase tracking-widest text-white/45 font-bold">
          Diferencias
        </div>
        <ul className="mt-3 space-y-2 text-sm text-white/75 list-disc pl-5">
          {data.differences.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      {/* Cambios por categoría */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[11px] uppercase tracking-widest text-white/45 font-bold">
          Cambios por categoría
        </div>

        <div className="mt-3 space-y-3">
          {data.categoryChanges.map((c, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">
                  {c.category}
                </div>
                <div className="text-[11px] px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/70">
                  {c.trend}
                </div>
              </div>

              <ul className="mt-3 space-y-2 text-xs text-white/65 list-disc pl-5">
                {c.keyChanges.map((k, idx) => (
                  <li key={idx}>{k}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Red flags */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
        <div className="text-[11px] uppercase tracking-widest text-rose-200/80 font-bold">
          Alertas / inconsistencias
        </div>
        {data.redFlags.length ? (
          <ul className="mt-3 space-y-2 text-sm text-rose-100/80 list-disc pl-5">
            {data.redFlags.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 text-sm text-rose-100/70">
            No se detectaron alertas relevantes.
          </div>
        )}
      </div>
    </div>
  );
}
