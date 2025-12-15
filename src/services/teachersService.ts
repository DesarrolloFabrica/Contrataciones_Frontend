// src/services/teachersService.ts
import type {
  TeacherForm,
  TeacherAiResult,
  CoordinatorDecisionPayload,
  TeacherEvaluationSummary,
} from "../types";
import api from "./apiClient";

// Lo que devuelve el backend en POST /teachers/evaluations
export interface TeacherEvaluationResponse {
  id: string;
  candidateId: string;
}

type TeacherEvaluationsListResponse =
  | TeacherEvaluationSummary[]
  | { data: TeacherEvaluationSummary[] }
  | { items: TeacherEvaluationSummary[] }
  | { results: TeacherEvaluationSummary[] }
  | { evaluations: TeacherEvaluationSummary[] }
  | { data: { data: TeacherEvaluationSummary[] } }
  | { data: { items: TeacherEvaluationSummary[] } }
  | { data: { results: TeacherEvaluationSummary[] } };

function normalizeTeacherEvaluationsList(
  payload: TeacherEvaluationsListResponse | any
): TeacherEvaluationSummary[] {
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload?.data,
    payload?.items,
    payload?.results,
    payload?.evaluations,

    // por si viene doble anidado
    payload?.data?.data,
    payload?.data?.items,
    payload?.data?.results,
    payload?.data?.evaluations,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  // Si llega algo raro, mejor lista vacía (y log para detectar el formato real)
  console.warn("Respuesta inesperada en GET /teachers/evaluations:", payload);
  return [];
}

/**
 * Crea la evaluación en el backend (guarda candidato + AI summary).
 */
export async function createTeacherEvaluation(
  orgId: string,
  form: TeacherForm,
  aiResult: TeacherAiResult
): Promise<TeacherEvaluationResponse> {
  const { data } = await api.post<TeacherEvaluationResponse>(
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

  await api.post(`/teachers/evaluations/${evaluationId}/report`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function listTeacherEvaluations(): Promise<TeacherEvaluationSummary[]> {
  const { data } = await api.get<TeacherEvaluationsListResponse>(
    "/teachers/evaluations"
  );

  return normalizeTeacherEvaluationsList(data);
}

export async function getTeacherEvaluation(id: string) {
  const { data } = await api.get(`/teachers/evaluations/${id}`);
  return data;
}

export async function getTeacherEvaluationById(id: string) {
  const { data } = await api.get(`/teachers/evaluations/${id}`);
  return data; // incluye formRawData y aiRawJson
}

// 🔹 NUEVO: actualizar decisión del coordinador
export async function updateTeacherDecision(
  evaluationId: string,
  payload: CoordinatorDecisionPayload
): Promise<TeacherEvaluationSummary> {
  const { data } = await api.post<TeacherEvaluationSummary>(
    `/teachers/evaluations/${evaluationId}/decision`,
    payload
  );

  return data;
}
