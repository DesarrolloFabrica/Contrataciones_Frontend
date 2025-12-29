// src/pages/coordinator/utils/analysisAggregate.ts
// ✅ Utilidades para promediar múltiples AnalysisResult y medir variabilidad
// (solo frontend, no toca backend)

import type { AnalysisResult } from "../../../types";

/**
 * Redondea y protege NaN.
 */
function safeNum(n: any, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

/**
 * Mapea el riesgo a número para poder comparar/tendencias.
 */
function riskToNum(risk: string) {
  const r = (risk || "").toLowerCase();
  if (r.includes("alto")) return 3;
  if (r.includes("medio")) return 2;
  if (r.includes("bajo")) return 1;
  return 0;
}

/**
 * Vuelve del número a etiqueta.
 */
function numToRisk(n: number): "Bajo" | "Medio" | "Alto" {
  if (n >= 2.5) return "Alto";
  if (n >= 1.5) return "Medio";
  return "Bajo";
}

/**
 * Moda (valor más repetido). Si empate, devuelve el primero según orden de aparición.
 */
function mode<T>(arr: T[]): T {
  const counts = new Map<T, number>();
  let best = arr[0];
  let bestCount = 0;

  for (const x of arr) {
    const c = (counts.get(x) ?? 0) + 1;
    counts.set(x, c);
    if (c > bestCount) {
      best = x;
      bestCount = c;
    }
  }
  return best;
}

/**
 * ✅ Consolida múltiples análisis en un AnalysisResult "promedio".
 * - overallScore: promedio
 * - overallRiskLevel: promedio numérico -> etiqueta
 * - finalVerdict: moda (texto tal cual venga)
 * - executiveSummary: texto corto "consolidado" (sin IA extra)
 * - categoryAnalyses: promedio por categoría (match por category)
 *
 * IMPORTANTE: mantiene las mismas llaves del AnalysisResult para NO romper el UI.
 */
export function buildAverageAnalysis(
  analyses: AnalysisResult[]
): AnalysisResult {
  // Si llega vacío, devolvemos un “mock” defensivo
  if (!analyses.length) {
    return {
      overallRiskLevel: "Medio",
      overallScore: 0,
      executiveSummary: "No hay suficientes entrevistas para consolidar.",
      categoryAnalyses: [],
      mitigationRecommendations: [],
      resignationRiskWindow: "N/A",
      temporalRiskFactors: [],
      finalVerdict: "Sin veredicto",
    } as AnalysisResult;
  }

  const scores = analyses.map((a) => safeNum(a.overallScore, 0));
  const avgScore = scores.reduce((s, x) => s + x, 0) / scores.length;

  const riskNums = analyses.map((a) => riskToNum(a.overallRiskLevel));
  const avgRiskNum = riskNums.reduce((s, x) => s + x, 0) / riskNums.length;

  const verdicts = analyses
    .map((a) => (a.finalVerdict || "").trim())
    .filter(Boolean);

  const finalVerdict = verdicts.length ? mode(verdicts) : "Sin veredicto";

  // ✅ Consolidar categorías por nombre (category)
  const categoryMap = new Map<
    string,
    { scores: number[]; oportunidades: string[]; recomendaciones: string[] }
  >();

  for (const a of analyses) {
    for (const c of a.categoryAnalyses ?? []) {
      const key = (c.category || "").trim();
      if (!key) continue;

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          scores: [],
          oportunidades: [],
          recomendaciones: [],
        });
      }
      const bucket = categoryMap.get(key)!;
      bucket.scores.push(safeNum(c.score, 0));

      if (c.oportunidades) bucket.oportunidades.push(c.oportunidades);
      if (c.recomendaciones) bucket.recomendaciones.push(c.recomendaciones);
    }
  }

  const categoryAnalyses = Array.from(categoryMap.entries()).map(
    ([category, bucket]) => {
      const avgCatScore =
        bucket.scores.reduce((s, x) => s + x, 0) / bucket.scores.length;

      // ✅ Tomamos el texto más reciente (último) para no inventar demasiado
      // (y mantener el formato actual sin IA extra)
      const lastOportunidad = bucket.oportunidades[bucket.oportunidades.length - 1] ?? "";
      const lastRecomendacion = bucket.recomendaciones[bucket.recomendaciones.length - 1] ?? "";

      return {
        category,
        score: Math.round(avgCatScore),
        reporteAnalitico:
          "Consolidado a partir de múltiples entrevistas (promedio por categoría).",
        oportunidades: lastOportunidad,
        recomendaciones: lastRecomendacion,
        observacionesCorregidas:
          "Consolidado (se conserva el formato del reporte).",
      };
    }
  );

  // Orden estable (opcional): deja igual si ya te importa el orden
  // categoryAnalyses.sort((a, b) => a.category.localeCompare(b.category, "es"));

  const executiveSummary =
    `Resumen consolidado de ${analyses.length} entrevista(s). ` +
    `Score promedio: ${avgScore.toFixed(1)}/100. ` +
    `Riesgo promedio: ${numToRisk(avgRiskNum)}. ` +
    `Veredicto más frecuente: ${finalVerdict}.`;

  // Mitigación y factores: unimos y quitamos duplicados
  const mitigation = Array.from(
    new Set(
      analyses.flatMap((a) => a.mitigationRecommendations ?? []).filter(Boolean)
    )
  );

  const temporal = Array.from(
    new Set(analyses.flatMap((a) => a.temporalRiskFactors ?? []).filter(Boolean))
  );

  // “ventana” -> la última no rompe UI (o podrías poner un texto consolidado)
  const resignationRiskWindow =
    analyses[analyses.length - 1].resignationRiskWindow || "N/A";

  return {
    overallRiskLevel: numToRisk(avgRiskNum),
    overallScore: Math.round(avgScore),
    executiveSummary,
    categoryAnalyses,
    mitigationRecommendations: mitigation,
    resignationRiskWindow,
    temporalRiskFactors: temporal,
    finalVerdict,
  } as AnalysisResult;
}

/**
 * ✅ Calcula variabilidad simple para mostrar "Alta/Baja"
 * - scoreRange = max-min
 * - cambios de riesgo/veredicto entre entrevistas
 */
export function computeVariability(analyses: AnalysisResult[]) {
  if (analyses.length < 2) {
    return {
      level: "Baja" as const,
      label: "Baja variabilidad",
      detail: "Solo hay 1 entrevista.",
      scoreRange: 0,
      riskChanges: 0,
      verdictChanges: 0,
    };
  }

  const scores = analyses.map((a) => safeNum(a.overallScore, 0));
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const scoreRange = max - min;

  let riskChanges = 0;
  let verdictChanges = 0;

  for (let i = 1; i < analyses.length; i++) {
    const prev = analyses[i - 1];
    const cur = analyses[i];

    if ((prev.overallRiskLevel || "") !== (cur.overallRiskLevel || "")) riskChanges++;
    if ((prev.finalVerdict || "") !== (cur.finalVerdict || "")) verdictChanges++;
  }

  // ✅ Umbrales simples (ajustables)
  const high =
    scoreRange >= 15 || riskChanges >= 1 || verdictChanges >= 1;

  return {
    level: high ? ("Alta" as const) : ("Baja" as const),
    label: high ? "Alta variabilidad" : "Baja variabilidad",
    detail:
      `Rango score: ${min.toFixed(0)}–${max.toFixed(0)} (Δ ${scoreRange.toFixed(0)}). ` +
      `Cambios riesgo: ${riskChanges}. Cambios veredicto: ${verdictChanges}.`,
    scoreRange,
    riskChanges,
    verdictChanges,
  };
}
