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

  await api.post(
    `/teachers/evaluations/${evaluationId}/report`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
}

export async function listTeacherEvaluations() {
  const { data } = await api.get<TeacherEvaluationSummary[]>(
    "/teachers/evaluations"
  );
  return data;
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
  // POST /teachers/evaluations/:id/decision
  const { data } = await api.post<TeacherEvaluationSummary>(
    `/teachers/evaluations/${evaluationId}/decision`,
    payload
  );

  return data;
}
