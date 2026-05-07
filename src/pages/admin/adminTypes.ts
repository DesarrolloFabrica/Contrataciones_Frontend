// src/pages/admin/utils/adminTypes.ts
import type {
  AnalysisResult,
  InterviewData,
  TeacherEvaluationSummary,
} from "../../types";

export type RiskBucket =
  | "RECOMENDADA"
  | "PRECAUCION"
  | "NO_RECOMENDAR"
  | "DESCONOCIDO";

export type AdminTab = "RESUMEN" | "DECISIONES" | "AUDITORIA" | "TECNICO";


export interface AdminMetrics {
  total: number;
  avgScore: number;
  recommended: number;
  caution: number;
  notRecommended: number;
  noAnalysis: number;
}

export interface SchoolSummary {
  schoolName: string;
  total: number;
  avgScore: number;
  recommended: number;
  notRecommended: number;
}

export type AdminDetailState = {
  selectedId: string | null;
  loadingDetail: boolean;
  selectedDetail: {
    analysis: AnalysisResult;
    interview: InterviewData;
    raw: any;
  } | null;
};

export type AdminListState = {
  evaluations: TeacherEvaluationSummary[];
  loading: boolean;
  error: string | null;

  search: string;
  setSearch: (v: string) => void;

  selectedSchool: string;
  setSelectedSchool: (v: string) => void;
};

// -------------------------
// USERS (Admin -> Coordinadores)
// -------------------------

export type AdminUserRole = "ADMIN" | "COORDINATOR" | "LEADER";

export type AdminUserStatus = "ACTIVE" | "INACTIVE";



export interface AdminUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  cedula?: string | null;

  schoolId?: string | null;

  role: AdminUserRole;
  status: AdminUserStatus;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface CreateAdminUserDto {
  name: string;
  lastName: string;
  email: string;
  cedula?: string | null;

  role: AdminUserRole;

  schoolId?: string | null;
}

export interface UpdateAdminUserDto {
  name?: string;
  lastName?: string;
  cedula?: string | null;
  role?: AdminUserRole;
  status?: AdminUserStatus;
}

// ✅ SOPORTE: Historial, asignaciones, decisiones y trazabilidad

/** Para auditoría: sobre qué entidad aplica el evento */
export type AdminAuditEntityType = "EVALUATION" | "USER" | "SYSTEM" | "TEACHER_CANDIDATE" | "CANDIDATE_DOCUMENT" | "HIRING_REQUEST" | "TEACHER_EVALUATION";

/** Acciones que el Admin/Coordinador pueden generar (mock hoy, backend mañana) */
export type AdminAuditAction =
  | "DETAIL_VIEWED"
  | "PDF_EXPORTED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_ACTIVATED"
  | "USER_DEACTIVATED"
  | "USER_TOGGLED"
  | "PASSWORD_RESET"
  | "COORDINATOR_ASSIGNED"
  | "COORDINATOR_DECISION_SAVED"
  | "COORDINATOR_DECISION_CREATED"
  | "COORDINATOR_DECISION_UPDATED"
  | "ADMIN_DECISION_SAVED"
  | "ADMIN_DECISION_BLOCKED"
  | "CANDIDATE_CREATED"
  | "CANDIDATE_UPDATED"
  | "EVALUATION_SUBMITTED"
  | "EVALUATION_UPDATED"
  | "EVALUATION_HIRING_REQUEST_ASSOCIATED"
  | "INTERVIEW_CREATED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_LINK_REGISTERED"
  | "RESUME_MARKED_PRIMARY"
  | "EVALUATION_REPORT_ATTACHED"
  | "HIRING_REQUEST_CREATED"
  | "HIRING_REQUEST_UPDATED"
  | "SETTINGS_UPDATED"; 

/** Evento de auditoría */
export interface AdminAuditEvent {
  id: string;
  entityType: AdminAuditEntityType;
  entityId: string;

  action: AdminAuditAction;

  actorUserId: string;
  actorRole: AdminUserRole;

  at: string; // ISO
  meta?: Record<string, any>;
}

/** Estado estándar de decisión */
export type AdminDecisionStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

/** Decisión de un coordinador sobre una evaluación */
export interface CoordinatorDecision {
  evaluationId: string;
  status: AdminDecisionStatus;
  comment?: string | null;

  decidedByUserId?: string | null;
  decidedAt?: string | null; // ISO
}

/** Decisión final del Admin (aprobación/rechazo) */
export interface AdminFinalDecision {
  evaluationId: string;
  status: AdminDecisionStatus;
  comment?: string | null;

  decidedByUserId?: string | null;
  decidedAt?: string | null; // ISO
}

/** Asignación: qué coordinador tiene esta evaluación */
export interface AdminAssignment {
  evaluationId: string;
  coordinatorUserId?: string | null;
  assignedAt?: string | null; // ISO
  assignedByUserId?: string | null;
}

/** Meta técnica para depurar: modelo, prompt, requestId, etc */
export interface AdminSystemMeta {
  evaluationId: string;

  model?: string | null;
  promptVersion?: string | null;
  requestId?: string | null;

  createdAt?: string | null; // ISO
  updatedAt?: string | null; // ISO
}

/** Ajustes del motor (thresholds) */
export interface AdminSettings {
  recommendedMinScore: number;
  cautionMinScore: number;
  highRiskMaxScore: number;
}
export type TimelineTab = "EVAL" | "GLOBAL";

export type AuditEvent = {
  id?: string;
  type: string;
  at?: string; // ISO
  actor?: { id?: string | null; name?: string | null; role?: string | null } | null;
  evaluationId?: string | null;
  metadata?: Record<string, any> | null;
};



