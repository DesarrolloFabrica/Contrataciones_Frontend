// src/services/teachersService.ts
import apiClient from "./apiClient";
import type { TeacherForm, TeacherAiResult, TeacherEvaluationSummary } from "../types";

/* ------------------------------------------------------------------ */
/*  Tipos alineados al backend                                         */
/* ------------------------------------------------------------------ */

export type DecisionStatusApi = "PENDING" | "APPROVED" | "REJECTED";

export interface TeacherExecutiveSummary {
  evaluationId: string;

  candidateId: string | null;
  candidateDocumentNumber: string | null;

  candidateName: string;
  schoolName: string | null;
  programName: string | null;

  aiScore: number | null;
  aiRecommendation: string | null;

  coordinatorDecision: {
    verdict: DecisionStatusApi | null;
    notes: string | null;
    decidedAt: string | null;
  };

  adminDecision: {
    verdict: DecisionStatusApi | null;
    notes: string | null;
    decidedAt: string | null;
  };

  finalStatus: DecisionStatusApi;
}

export interface TeacherCandidateCreateDto {
  orgId: string;
  documentNumber: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  age?: number | null;
  schoolId?: string | null;
  programId?: string | null;
}


export interface TeacherCandidateCreateResponse {
  id: string;
  orgId: string | null;
  documentNumber: string | null;
  fullName: string;
}

export interface TeacherEvaluationResponse {
  id: string;
  candidateId: string;
  created?: boolean;
  updated?: boolean;
}

type ListEvalResponse =
  | TeacherEvaluationSummary[]
  | { items: TeacherEvaluationSummary[] }
  | any;


/* ------------------------------------------------------------------ */
/*  Candidates (search + create)                                      */
/* ------------------------------------------------------------------ */

export type TeacherCandidateSearchItemDto = {
  id: string;
  documentNumber?: string | number | null;
  fullName?: string | null;
  age?: number | null;

  // opcionales (si backend los manda)
  schoolId?: string | null;
  schoolName?: string | null;
  programId?: string | null;
  programName?: string | null;
};

export type SearchTeacherCandidatesParams = {
  orgId: string;
  q: string; // cédula (o texto de búsqueda)
  limit?: number;
};



export type CreateTeacherCandidatePayload = {
  orgId: string;
  documentNumber: string;
  fullName: string;
  age?: number | null;
  schoolId: string;
  programId: string;
};

export type CreateTeacherCandidateResponse = {
  id: string;
  documentNumber?: string | number | null;
  fullName?: string | null;
  age?: number | null;
  schoolId?: string | null;
  programId?: string | null;
  schoolName?: string | null;
  programName?: string | null;
};


/* ------------------------------------------------------------------ */
/*  CANDIDATES                                                        */
/* ------------------------------------------------------------------ */

export async function createTeacherCandidate(
  payload: TeacherCandidateCreateDto
): Promise<TeacherCandidateCreateResponse> {
  const { data } = await apiClient.post<TeacherCandidateCreateResponse>(
    "/teachers/candidates",
    payload
  );
  return data;
}

export async function searchTeacherCandidates(params: {
  orgId: string;
  q: string;
  limit?: number;
}): Promise<TeacherCandidateSearchItemDto[]> {
  const { data } = await apiClient.get<TeacherCandidateSearchItemDto[]>(
    "/teachers/candidates/search",
    { params }
  );
  return data;
}

export async function getTeacherCandidate(id: string) {
  const { data } = await apiClient.get(`/teachers/candidates/${id}`);
  return data;
}

/* ------------------------------------------------------------------ */
/*  EVALUATIONS                                                       */
/* ------------------------------------------------------------------ */

export async function createTeacherEvaluation(
  orgId: string,
  candidateId: string,
  form: TeacherForm,
  aiResult: TeacherAiResult
): Promise<TeacherEvaluationResponse> {
  const { data } = await apiClient.post<TeacherEvaluationResponse>(
    "/teachers/evaluations",
    { orgId, candidateId, form, aiResult }
  );
  return data;
}

export async function listTeacherEvaluations(): Promise<TeacherEvaluationSummary[]> {
  const res = await apiClient.get<ListEvalResponse>("/teachers/evaluations");
  const data = res.data;

  if (Array.isArray(data)) return data as TeacherEvaluationSummary[];
  if (data && Array.isArray((data as any).items))
    return (data as any).items as TeacherEvaluationSummary[];

  return [];
}

export async function getTeacherEvaluationById(id: string) {
  const { data } = await apiClient.get(`/teachers/evaluations/${id}`);
  return data;
}

export async function getExecutiveSummary(
  evaluationId: string
): Promise<TeacherExecutiveSummary> {
  const { data } = await apiClient.get<TeacherExecutiveSummary>(
    `/teachers/evaluations/${evaluationId}/executive-summary`
  );
  return data;
}

/* ------------------------------------------------------------------ */
/*  REPORT (PDF upload)                                                */
/* ------------------------------------------------------------------ */
/**
 * El frontend ya lo está llamando desde AnalysisResults.
 * Para que compile, exportamos la función aquí.
 *
 * Requiere que exista en backend:
 * POST /teachers/evaluations/:id/report (multipart/form-data, field "file")
 */
export async function uploadTeacherReport(
  evaluationId: string,
  pdfBlob: Blob
): Promise<void> {
  const formData = new FormData();
  formData.append("file", pdfBlob, "reporte-evaluacion.pdf");

  await apiClient.post(`/teachers/evaluations/${evaluationId}/report`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/* ------------------------------------------------------------------ */
/*  Decisión del coordinador                                          */
/* ------------------------------------------------------------------ */

export type CoordinatorDecisionStatusApi = DecisionStatusApi;
export type CoordinatorCriteriaPayload = Record<string, boolean>;

export type CoordinatorDecisionPayload = {
  status?: CoordinatorDecisionStatusApi;
  verdict?: CoordinatorDecisionStatusApi;

  comment?: string;
  notes?: string;

  notesBrief?: string;
  criteria?: CoordinatorCriteriaPayload;
};

export interface CoordinatorDecisionUpdateDto {
  status: CoordinatorDecisionStatusApi;
  comment?: string;
  notes?: string;
  criteria?: CoordinatorCriteriaPayload;
}

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
    status,
    comment: payload.comment ?? payload.notes ?? undefined,
    notes: payload.notesBrief ?? undefined,
    criteria: payload.criteria ?? undefined,
  };

  return saveCoordinatorDecision(evaluationId, body);
}

/* ------------------------------------------------------------------ */
/*  Decisión del admin                                                */
/* ------------------------------------------------------------------ */

export type AdminDecisionStatusApi = DecisionStatusApi;

export type AdminDecisionPayload = {
  status?: AdminDecisionStatusApi;
  verdict?: AdminDecisionStatusApi;
  comment?: string;
  notes?: string;
};

export interface AdminDecisionUpdateDto {
  status: AdminDecisionStatusApi;
  comment?: string;
}

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
    status,
    comment: payload.comment ?? payload.notes ?? undefined,
  };

  return saveAdminDecision(evaluationId, body);
}
