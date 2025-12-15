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
 * Payload flexible para la decisión del admin.
 * Igual idea que el del coordinador.
 */
export type AdminDecisionPayload = {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  verdict?: "PENDING" | "APPROVED" | "REJECTED";
  comment?: string;
  notes?: string;
};

/* ------------------------------------------------------------------ */
/*  Crear evaluación + PDF                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Listado + detalle técnico                                         */
/* ------------------------------------------------------------------ */

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

export async function getTeacherEvaluation(id: string) {
  const { data } = await apiClient.get(`/teachers/evaluations/${id}`);
  return data;
}

export async function getTeacherEvaluationById(id: string) {
  const { data } = await apiClient.get(`/teachers/evaluations/${id}`);
  return data;
}

/* ------------------------------------------------------------------ */
/*  Resumen ejecutivo                                                 */
/* ------------------------------------------------------------------ */

export async function getExecutiveSummary(
  evaluationId: string
): Promise<TeacherExecutiveSummary> {
  const { data } = await apiClient.get<TeacherExecutiveSummary>(
    `/teachers/evaluations/${evaluationId}/executive-summary`
  );
  return data;
}

/* ------------------------------------------------------------------ */
/*  Decisión del coordinador                                          */
/* ------------------------------------------------------------------ */

export type CoordinatorDecisionStatusApi =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface CoordinatorDecisionUpdateDto {
  status: CoordinatorDecisionStatusApi;
  comment?: string;
}

/**
 * Canonical coordinador:
 * POST /teachers/evaluations/:id/coordinator-decision
 * Devuelve TeacherExecutiveSummary actualizado.
 */
export async function saveCoordinatorDecision(
  evaluationId: string,
  payload: CoordinatorDecisionUpdateDto
): Promise<TeacherExecutiveSummary> {
  const { data } = await apiClient.post<TeacherExecutiveSummary>(
    `/teachers/evaluations/${evaluationId}/coordinator-decision`,
    payload
  );
  return data;
}

/**
 * Adapter payload viejo → canonical coordinador.
 */
export async function updateCoordinatorDecision(
  evaluationId: string,
  payload: CoordinatorDecisionPayload
): Promise<TeacherExecutiveSummary> {
  const status = payload.status ?? payload.verdict;
  if (!status) {
    throw new Error(
      "Coordinator decision requires a status/verdict ('PENDING' | 'APPROVED' | 'REJECTED')."
    );
  }

  const body: CoordinatorDecisionUpdateDto = {
    status: status as CoordinatorDecisionStatusApi,
    comment: payload.comment ?? payload.notes ?? undefined,
  };

  return saveCoordinatorDecision(evaluationId, body);
}

/* ------------------------------------------------------------------ */
/*  Decisión del admin                                                */
/* ------------------------------------------------------------------ */

export type AdminDecisionStatusApi = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminDecisionUpdateDto {
  status: AdminDecisionStatusApi;
  comment?: string;
}

/**
 * Canonical admin:
 * POST /teachers/evaluations/:id/admin-decision
 * Devuelve TeacherExecutiveSummary actualizado.
 */
export async function saveAdminDecision(
  evaluationId: string,
  payload: AdminDecisionUpdateDto
): Promise<TeacherExecutiveSummary> {
  const { data } = await apiClient.post<TeacherExecutiveSummary>(
    `/teachers/evaluations/${evaluationId}/admin-decision`,
    payload
  );
  return data;
}

/**
 * Adapter flexible para el admin (mismo estilo que coordinador).
 */
export async function updateAdminDecision(
  evaluationId: string,
  payload: AdminDecisionPayload
): Promise<TeacherExecutiveSummary> {
  const status = payload.status ?? payload.verdict;
  if (!status) {
    throw new Error(
      "Admin decision requires a status/verdict ('PENDING' | 'APPROVED' | 'REJECTED')."
    );
  }

  const body: AdminDecisionUpdateDto = {
    status: status as AdminDecisionStatusApi,
    comment: payload.comment ?? payload.notes ?? undefined,
  };

  return saveAdminDecision(evaluationId, body);
}
