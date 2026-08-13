import type {
  IntelligenceEvidence,
  IntelligenceResultStatus,
  InterviewAnalysis,
  InterviewAnalysisOutput,
} from "../intelligence/types";

export const analysisStatusLabel: Record<IntelligenceResultStatus, string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  COMPLETED: "Completado",
  FAILED: "Fallido",
  STALE: "Desactualizado",
};

export const evidenceClassificationLabel: Record<
  IntelligenceEvidence["classification"],
  string
> = {
  EVIDENCE: "Evidencia de entrevista",
  INFERENCE: "Inferencia de IA",
  INTERVIEWER_OPINION: "Opinión del entrevistador",
};

export function isAnalysisBusy(analysis: InterviewAnalysis | null | undefined): boolean {
  if (!analysis) return false;
  const resultBusy = analysis.status === "PENDING" || analysis.status === "PROCESSING";
  const jobBusy =
    analysis.job?.status === "PENDING" || analysis.job?.status === "PROCESSING";
  return resultBusy || jobBusy;
}

export function attentionPoints(output: InterviewAnalysisOutput | null | undefined): string[] {
  if (!output) return [];
  return [...(output.risks ?? []), ...(output.concerns ?? [])].filter(Boolean);
}

export function formatConfidence(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  return `${Math.round(Number(value) * 100)}%`;
}

export const IA_DISCLAIMER =
  "El análisis de IA es una herramienta de apoyo y no constituye una decisión de selección.";
