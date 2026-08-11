import React from "react";
import type { InterviewComparisonResult } from "../../../services/geminiService";
import { useTheme } from "../../../context/ThemeContext";

type Props = {
  data: InterviewComparisonResult;
};

export default function ComparisonResultCard({ data }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const panel = isDark ? "border-[#579689]/18 bg-[#0b232a]" : "border-slate-200 bg-white";
  const label = "text-slate-500";
  const body = isDark ? "text-slate-300" : "text-slate-600";
  const strong = isDark ? "text-white" : "text-slate-800";
  return (
    <div className="space-y-4">
      {/* Resumen ejecutivo */}
      <div className={`rounded-2xl border p-4 ${panel}`}>
        <div className={`text-[11px] uppercase tracking-widest font-bold ${label}`}>
          Resumen ejecutivo
        </div>
        <div className={`mt-2 text-sm leading-relaxed ${body}`}>
          {data.executiveComparison}
        </div>
      </div>

      {/* Tendencias */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-4 ${panel}`}>
          <div className={`text-[11px] uppercase tracking-widest font-bold ${label}`}>
            Tendencia general
          </div>
          <div className={`mt-2 text-base font-semibold ${strong}`}>
            {data.evolution.overallTrend}
          </div>
          <div className={`mt-2 text-xs ${body}`}>
            <b>Score:</b> {data.evolution.scoreTrend}
          </div>
          <div className={`mt-1 text-xs ${body}`}>
            <b>Riesgo:</b> {data.evolution.riskTrend}
          </div>
          <div className={`mt-1 text-xs ${body}`}>
            <b>Veredicto:</b> {data.evolution.verdictTrend}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 ${panel}`}>
          <div className={`text-[11px] uppercase tracking-widest font-bold ${label}`}>
            Entrevistas comparadas
          </div>
          <div className={`mt-2 text-base font-semibold ${strong}`}>
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
      <div className={`rounded-2xl border p-4 ${panel}`}>
        <div className={`text-[11px] uppercase tracking-widest font-bold ${label}`}>
          Similitudes
        </div>
        <ul className={`mt-3 space-y-2 text-sm list-disc pl-5 ${body}`}>
          {data.similarities.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      {/* Diferencias */}
      <div className={`rounded-2xl border p-4 ${panel}`}>
        <div className={`text-[11px] uppercase tracking-widest font-bold ${label}`}>
          Diferencias
        </div>
        <ul className={`mt-3 space-y-2 text-sm list-disc pl-5 ${body}`}>
          {data.differences.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      {/* Cambios por categoría */}
      <div className={`rounded-2xl border p-4 ${panel}`}>
        <div className={`text-[11px] uppercase tracking-widest font-bold ${label}`}>
          Cambios por categoría
        </div>

        <div className="mt-3 space-y-3">
          {data.categoryChanges.map((c, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 ${isDark ? "border-[#579689]/16 bg-[#061419]/55" : "border-slate-200 bg-slate-50"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className={`text-sm font-semibold ${strong}`}>
                  {c.category}
                </div>
                <div className={`text-[11px] px-3 py-1 rounded-full border ${isDark ? "border-[#579689]/18 bg-[#102a30] text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
                  {c.trend}
                </div>
              </div>

              <ul className={`mt-3 space-y-2 text-xs list-disc pl-5 ${body}`}>
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
        <div className={`text-[11px] uppercase tracking-widest font-bold ${isDark ? "text-rose-200/80" : "text-rose-700"}`}>
          Alertas / inconsistencias
        </div>
        {data.redFlags.length ? (
          <ul className={`mt-3 space-y-2 text-sm list-disc pl-5 ${isDark ? "text-rose-100/80" : "text-rose-700"}`}>
            {data.redFlags.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        ) : (
          <div className={`mt-2 text-sm ${isDark ? "text-rose-100/70" : "text-rose-700"}`}>
            No se detectaron alertas relevantes.
          </div>
        )}
      </div>
    </div>
  );
}
