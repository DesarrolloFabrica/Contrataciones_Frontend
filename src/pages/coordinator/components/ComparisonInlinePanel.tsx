// src/pages/coordinator/components/ComparisonInlinePanel.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import type { CandidateGroup } from "../types";

// Servicios
import { getTeacherEvaluationById } from "../../../services/teachersService";
import { compareTeacherEvaluations } from "../../../services/geminiService";
import type { InterviewComparisonResult } from "../../../services/geminiService";

// UI del resultado
import ComparisonResultCard from "./ComparisonResultCard";
import { useTheme } from "../../../context/ThemeContext";

/**
 * Panel inline que:
 * 1) se muestra justo debajo del botón en InterviewsTab
 * 2) genera automáticamente la comparativa del candidato seleccionado
 */
type Props = {
  candidateGroup: CandidateGroup;
};

export default function ComparisonInlinePanel({ candidateGroup }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  // Estado de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewComparisonResult | null>(null);

  // Seguridad: tomamos hasta N entrevistas para no explotar costo/latencia
  const interviewsToUse = useMemo(() => {
    const maxToUse = 6;
    return (candidateGroup?.interviews ?? []).slice(0, maxToUse);
  }, [candidateGroup]);

  const canCompare = interviewsToUse.length >= 2;

  /**
   * Genera la comparativa para ESTE candidato (candidateGroup).
   * OJO: no usa selectedCandidateGroup global, para evitar “resultados pegados”.
   */
  const run = useCallback(async () => {
    if (!canCompare) {
      setError("Este candidato necesita mínimo 2 entrevistas para comparar.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Traemos detalle de cada evaluación para obtener aiRawJson
      const details = await Promise.all(
        interviewsToUse.map(async (ev) => {
          const detail = await getTeacherEvaluationById(ev.id);
          const analysis = (detail?.aiRawJson as any) ?? null;

          // Si no hay análisis, lo descartamos
          if (!analysis) return null;

          return {
            evaluationId: ev.id,
            createdAt: ev.createdAt ?? new Date().toISOString(),
            analysis,

            // Info contextual (por si el prompt la usa)
            candidateName:
              detail?.formRawData?.candidate?.fullName ?? candidateGroup.candidateName,
            programName:
              detail?.formRawData?.candidate?.programName ?? candidateGroup.program,
            schoolName:
              detail?.formRawData?.candidate?.schoolName ?? candidateGroup.school,
          };
        })
      );

      const reports = details.filter(Boolean) as Array<{
        evaluationId: string;
        createdAt: string;
        analysis: any;
        candidateName?: string;
        programName?: string;
        schoolName?: string;
      }>;

      if (reports.length < 2) {
        setError("No hay suficientes reportes IA guardados para comparar (mínimo 2).");
        return;
      }

      // Llamada a IA de comparación
      const comparison = await compareTeacherEvaluations(reports);

      setResult(comparison);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "No se pudo generar la comparación.");
    } finally {
      setLoading(false);
    }
  }, [canCompare, interviewsToUse, candidateGroup]);

  /**
   * ✅ Auto-run:
   * Cada vez que abres el panel (se monta) o cambia el candidato (key),
   * recalcula la comparativa para el candidato actual.
   */
  useEffect(() => {
    let alive = true;

    // Reset rápido al cambiar candidato (evita “flash” de resultado anterior)
    setError(null);
    setResult(null);

    // Ejecutamos en microtask para que el reset pinte primero
    Promise.resolve().then(async () => {
      if (!alive) return;
      await run();
    });

    return () => {
      alive = false;
    };
  }, [candidateGroup.key, run]);

  // Render
  return (
    <div className={`rounded-3xl border p-4 md:p-5 space-y-4 ${
      isDark ? "border-[#579689]/18 bg-[#071a20]/75" : "border-slate-200 bg-slate-50"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={`text-[11px] uppercase tracking-widest font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Comparación de entrevistas con IA
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Candidato:{" "}
            <span className={isDark ? "text-slate-300 font-semibold" : "text-slate-700 font-semibold"}>
              {candidateGroup.candidateName}
            </span>{" "}
            • {candidateGroup.interviews.length} entrevista(s)
          </div>
        </div>

        <button
          type="button"
          onClick={run}
          disabled={loading || !canCompare}
          className="
            px-3 py-2 rounded-xl
            text-[11px] font-bold uppercase tracking-widest
            bg-emerald-600 text-white hover:bg-emerald-500 transition
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? "Comparando..." : "Recalcular"}
        </button>
      </div>

      {/* Estados */}
      {!canCompare && (
        <div className={`text-sm rounded-2xl border p-4 ${isDark ? "text-slate-400 bg-[#0b232a] border-[#579689]/18" : "text-slate-600 bg-white border-slate-200"}`}>
          Este candidato necesita mínimo 2 entrevistas para comparar.
        </div>
      )}

      {error && (
        <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
          {error}
        </div>
      )}

      {loading && (
        <div className={`text-sm rounded-2xl border p-4 ${isDark ? "text-slate-400 bg-[#0b232a] border-[#579689]/18" : "text-slate-600 bg-white border-slate-200"}`}>
          Generando comparación…
        </div>
      )}

      {!loading && !error && result && <ComparisonResultCard data={result} />}
    </div>
  );
}
