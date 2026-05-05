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

export async function searchTeacherCandidates(
  params: SearchTeacherCandidatesParams
): Promise<TeacherCandidateSearchItemDto[]> {
  const { orgId, q, limit = 8 } = params;

  // Nota: ajusta el endpoint si tu backend usa otro path.
  // Este es el más común: GET /teachers/candidates/search?orgId=...&q=...&limit=...
  const { data } = await apiClient.get<
    TeacherCandidateSearchItemDto[] | { items: TeacherCandidateSearchItemDto[] } | any
  >("/teachers/candidates/search", {
    params: { orgId, q, limit },
  });

  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).items)) return (data as any).items;
  return [];
}

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

export async function createTeacherCandidate(
  payload: CreateTeacherCandidatePayload
): Promise<CreateTeacherCandidateResponse> {
  // Nota: ajusta el endpoint si tu backend usa otro path.
  // Común: POST /teachers/candidates
  const { data } = await apiClient.post<CreateTeacherCandidateResponse>(
    "/teachers/candidates",
    payload
  );
  return data;
}


/* ------------------------------------------------------------------ */
/*  Crear evaluación + PDF                                            */
/* ------------------------------------------------------------------ */

export async function createTeacherEvaluation(
  orgId: string,
  form: TeacherForm,
  aiResult: TeacherAiResult
): Promise<TeacherEvaluationResponse> {
  const candidate: any = (form as any)?.candidate ?? {};

  // Acepta ambos nombres (camelCase y snake_case)
  const documentNumber = String(
    candidate.documentNumber ?? candidate.document_number ?? ""
  ).trim();

  if (!documentNumber) {
    throw new Error("No se encontró documentNumber del candidato para crear la evaluación.");
  }

  // 1) Intentar encontrar el candidato (lo más común si ya existe)
  let candidateId: string | null = null;

  const found = await searchTeacherCandidates({
    orgId,
    q: documentNumber,
    limit: 8,
  });

  // si hay match exacto por cédula úsalo; si no, usa el primero
  const exact =
    found.find(
      (c) => String(c.documentNumber ?? "").trim() === documentNumber
    ) ?? found[0];

  if (exact?.id) candidateId = exact.id;

  // 2) Si no existe, intentar crearlo (si tenemos IDs necesarios)
  if (!candidateId) {
    const fullName = String(candidate.fullName ?? "").trim();
    const age = candidate.age ?? null;

    const schoolId = String(candidate.schoolId ?? candidate.school_id ?? "").trim();
    const programId = String(candidate.programId ?? candidate.program_id ?? "").trim();

    // Si no tienes schoolId/programId, no podemos crear el candidato
    if (!fullName || !schoolId || !programId) {
      throw new Error(
        "El candidato no existe y faltan datos para crearlo (fullName/schoolId/programId). " +
          "Asegúrate de que el formulario tenga schoolId y programId (no solo nombres)."
      );
    }

    try {
      const created = await createTeacherCandidate({
        orgId,
        documentNumber,
        fullName,
        age,
        schoolId,
        programId,
      });

      candidateId = created.id;
    } catch (err: any) {
      // Si ya existe (409), búscalo otra vez
      if (err?.response?.status === 409) {
        const again = await searchTeacherCandidates({
          orgId,
          q: documentNumber,
          limit: 8,
        });
        candidateId = again?.[0]?.id ?? null;
      } else {
        throw err;
      }
    }
  }

  if (!candidateId) {
    throw new Error(
      "No se pudo resolver candidateId (UUID). Revisa endpoints /teachers/candidates y /teachers/candidates/search."
    );
  }

  // 3) Ahora sí: crear evaluación enviando candidateId
  const { data } = await apiClient.post<TeacherEvaluationResponse>(
    "/teachers/evaluations",
    {
      orgId,
      candidateId,
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

export type CoordinatorDecisionStatusApi = "PENDING" | "APPROVED" | "REJECTED";

// ✅ NUEVO: criterios del tab NOTAS
export type CoordinatorCriteriaPayload = Record<string, boolean>;

/**
 * Payload flexible para la decisión del coordinador.
 * - Compat viejo: { status, comment } o { verdict, notes } (donde "notes" era comentario)
 * - Nuevo: notesBrief + criteria (tab NOTAS)
 */
export type CoordinatorDecisionPayload = {
  status?: CoordinatorDecisionStatusApi;
  verdict?: CoordinatorDecisionStatusApi;

  // comentario (tab DECISIÓN)
  comment?: string;
  notes?: string; // compat: notes == comment

  // ✅ nuevos (tab NOTAS)
  notesBrief?: string; // -> backend dto.notes
  criteria?: CoordinatorCriteriaPayload; // -> backend dto.criteria
};

export interface CoordinatorDecisionUpdateDto {
  status: CoordinatorDecisionStatusApi;

  // comentario (backend dto.comment)
  comment?: string;

  // ✅ nuevos (backend dto.notes / dto.criteria)
  notes?: string;
  criteria?: CoordinatorCriteriaPayload;
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
 * Adapter flexible → canonical coordinador.
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
    status,
    // compat vieja: notes (viejo) se interpreta como comment
    comment: payload.comment ?? payload.notes ?? undefined,

    // nuevos (tab NOTAS)
    notes: payload.notesBrief ?? undefined,
    criteria: payload.criteria ?? undefined,
  };

  return saveCoordinatorDecision(evaluationId, body);
}

/* ------------------------------------------------------------------ */
/*  Decisión del admin                                                */
/* ------------------------------------------------------------------ */

/**
 * Payload flexible para la decisión del admin.
 * Acepta tanto { status, comment } como { verdict, notes } por compatibilidad.
 */
export type AdminDecisionPayload = {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  verdict?: "PENDING" | "APPROVED" | "REJECTED";
  comment?: string;
  notes?: string;
};

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
