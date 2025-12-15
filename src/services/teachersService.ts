// src/services/teachersService.ts
import type {
  TeacherForm,
  TeacherAiResult,
  TeacherEvaluationSummary,
} from "../types";
import apiClient from "./apiClient";

/**
 * Tipos que refleja el backend (TeacherExecutiveSummaryDto)
 */
export interface TeacherExecutiveSummary {
  evaluationId: string;

  candidateName: string;
  schoolName: string | null;
  programName: string | null;

  aiScore: number | null;
  aiRecommendation: string | null;

  coordinatorDecision: {
    verdict: "PENDING" | "APPROVED" | "REJECTED" | null;
    notes: string | null;
    decidedAt: string | null;
  };

  adminDecision: {
    verdict: "PENDING" | "APPROVED" | "REJECTED" | null;
    notes: string | null;
    decidedAt: string | null;
  };

  finalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

// Lo que devuelve el backend en POST /teachers/evaluations
export interface TeacherEvaluationResponse {
  id: string;
  candidateId: string;
}

type ListEvalResponse =
  | TeacherEvaluationSummary[]
  | { items: TeacherEvaluationSummary[] }
  | any;

/**
 * Payload flexible para la decisión del coordinador.
 * Acepta tanto { status, comment } como { verdict, notes } por compatibilidad.
 */
export type CoordinatorDecisionPayload = {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  verdict?: "PENDING" | "APPROVED" | "REJECTED";
  comment?: string;
  notes?: string;
};

/**
 * Crea la evaluación en el backend (guarda candidato + AI summary).
 */
export async function createTeacherEvaluation(
  orgId: string,
  form: TeacherForm,
  aiResult: TeacherAiResult
): Promise<TeacherEvaluationResponse> {
  const { data } = await apiClient.post<TeacherEvaluationResponse>(
    "/teachers/evaluations",
    {
      orgId,
      form,
      aiResult,
    }
  );

  return data;
}

/**
 * Sube el PDF de esa evaluación al backend, que a su vez lo guarda en Drive.
 */
export async function uploadTeacherReport(
  evaluationId: string,
  pdfBlob: Blob
): Promise<void> {
  const formData = new FormData();
  formData.append("file", pdfBlob, "reporte-evaluacion.pdf");

  await apiClient.post(
    `/teachers/evaluations/${evaluationId}/report`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
}

/**
 * Lista de evaluaciones para dashboard (admin / leader / coord).
 */
export async function listTeacherEvaluations(): Promise<TeacherEvaluationSummary[]> {
  const res = await apiClient.get<ListEvalResponse>("/teachers/evaluations");

  console.log("listTeacherEvaluations raw response:", res.data);

  const data = res.data;

  if (Array.isArray(data)) {
    return data as TeacherEvaluationSummary[];
  }

  if (data && Array.isArray((data as any).items)) {
    return (data as any).items as TeacherEvaluationSummary[];
  }

  // fallback defensivo
  return [];
}

/**
 * Detalle técnico de una evaluación (formRawData + aiRawJson, etc.).
 */
export async function getTeacherEvaluation(id: string) {
  const { data } = await apiClient.get(`/teachers/evaluations/${id}`);
  return data;
}

export async function getTeacherEvaluationById(id: string) {
  const { data } = await apiClient.get(`/teachers/evaluations/${id}`);
  return data;
}

/**
 * Resumen ejecutivo consolidado (para panel derecho del admin).
 */
export async function getExecutiveSummary(
  evaluationId: string
): Promise<TeacherExecutiveSummary> {
  const { data } = await apiClient.get<TeacherExecutiveSummary>(
    `/teachers/evaluations/${evaluationId}/executive-summary`
  );
  return data;
}

/**
 * Actualiza decisión del coordinador (tab COORDINADOR) y devuelve
 * el resumen ejecutivo actualizado.
 *
 * Backend: POST /teachers/evaluations/:id/coordinator-decision
 */
export async function updateCoordinatorDecision(
  evaluationId: string,
  payload: CoordinatorDecisionPayload
): Promise<TeacherExecutiveSummary> {
  const body = {
    status: payload.status ?? payload.verdict, // aceptamos ambas claves
    comment: payload.comment ?? payload.notes ?? undefined,
  };

  const { data } = await apiClient.post<TeacherExecutiveSummary>(
    `/teachers/evaluations/${evaluationId}/coordinator-decision`,
    body
  );

  return data;
}
