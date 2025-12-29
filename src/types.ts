// src/types.ts
// ✅ Ajustado: agrega documentNumber en InterviewData y en TeacherForm.candidate
// (manteniendo el resto tal cual)

export type AcceptsCommitteesOption = "Sí" | "No" | "Depende";

export interface InterviewData {
  // ✅ NUEVO: CC / documento
  documentNumber: string;

  candidateName: string;
  age: string;
  school: string;
  program: string;
  careerSummary: string;
  previousExperience: string;
  availabilityDetails: string;
  acceptsCommittees: AcceptsCommitteesOption;
  otherJobs: string;
  evaluationMethodology: string;
  failureRatePlan: string;
  apatheticStudentPlan: string;
  aiToolsUsage: string;
  ethicalAiMeasures: string;
  aiPlagiarismPrevention: string;
  scenario29: string;
  scenarioCoverage: string;
  scenarioFeedback: string;
}

export interface CategoryAnalysis {
  category: string;
  score: number;
  reporteAnalitico: string;
  oportunidades: string;
  recomendaciones: string;
  observacionesCorregidas: string;
}

export interface AnalysisResult {
  overallRiskLevel: "Bajo" | "Medio" | "Alto";
  overallScore: number;
  executiveSummary: string;
  categoryAnalyses: CategoryAnalysis[];
  mitigationRecommendations: string[];
  resignationRiskWindow: string;
  temporalRiskFactors: string[];
  finalVerdict: string;
}

// ===== TIPOS PARA BACKEND TEACHERS =====

export interface TeacherForm {
  candidate: {
    // ✅ NUEVO: CC / documento
    documentNumber: string;

    fullName: string;
    age: number;
    schoolName: string;
    programName: string;
    careerSummary: string;
    teachingExperience: string;
  };
  availability: {
    scheduleDetails: string;
    acceptsCommittees: AcceptsCommitteesOption;
    otherJobsImpact: string;
  };
  classroomManagement: {
    evaluationMethodology: string;
    planIfHalfFail: string;
    handleApatheticStudent: string;
  };
  aiAttitude: {
    usesAiHow: string;
    ethicalUseMeasures: string;
    handleAiPlagiarism: string;
  };
  coherenceCommitment: {
    caseStudent2_9: string;
    emergencyProtocol: string;
    handleNegativeFeedback: string;
  };
}

// Resultado “compacto” que mandaremos al backend
export interface TeacherAiResult {
  strengths?: string;
  weaknesses?: string;
  improvementAreas?: string;
  teachingSuitabilityScore?: number;
  recommendation?: string;
  overallComment?: string;
  rawOutput?: AnalysisResult;
}




// 🔹 NUEVO: estados de decisión del coordinador
export type CoordinatorDecisionStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

// 🔹 NUEVO: detalle de la decisión
export interface CoordinatorDecision {
  status: CoordinatorDecisionStatus;
  comment?: string | null;
  decidedAt?: string | null;
  decidedById?: string | null;
  decidedByName?: string | null;
}

// 🔹 NUEVO: payload que enviará el frontend al backend
export interface CoordinatorDecisionPayload {
  status: CoordinatorDecisionStatus;
  comment?: string;
}

// Resumen que devuelve el backend al listar
export interface TeacherEvaluationSummary {
  id: string;
  createdAt: string;

  candidate?: {
    fullName: string;
    document_number?: string;
    schoolNameSnapshot?: string | null;
    programNameSnapshot?: string | null;

    // ✅ opcional por si lo quieres mostrar en historial
    documentNumber?: string | null;
  };

  aiTeachingSuitabilityScore: number;
  aiFinalRecommendation: string;
  aiOverallComment: string;
  aiReportDriveFileId?: string | null;

  coordinatorDecision?: CoordinatorDecision;
  coordinatorDecisionStatus?: "PENDIENTE" | "APROBADO" | "RECHAZADO" | null;
  coordinatorDecisionBy?: string | null;
  coordinatorDecisionAt?: string | null;
  coordinatorDecisionComment?: string | null;
}



// ===== AUDIT TRAIL (FRONTEND-ONLY POR AHORA) =====

export type AuditActorRole = "leader" | "coordinator" | "admin" | "system";

export interface AuditActor {
  id: string;
  name: string;
  email: string;
  role: AuditActorRole;
}

export type AuditEventType =
  | "EVALUATION_CREATED"
  | "EVALUATION_OPENED"
  | "AI_ANALYSIS_STARTED"
  | "AI_ANALYSIS_FINISHED"
  | "REPORT_PDF_DOWNLOADED"
  | "REPORT_PDF_UPLOADED"
  | "COORDINATOR_DECISION_SET"
  | "COORDINATOR_COMMENT_SET"
  | "COORDINATOR_DECISION_SUBMITTED"
  | "LOGIN"
  | "LOGOUT";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  at: string;
  evaluationId?: string | null;
  actor: AuditActor;
  metadata?: Record<string, string | number | boolean | null>;
}

// user/auth/backend (sin cambios)
export type UserRole = "ADMIN" | "COORDINADOR" | "LIDER";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "COORDINADOR" | "LIDER";
  schoolId: string | null;
  mustResetPassword?: boolean;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type BackendRole = "ADMIN" | "COORDINADOR" | "LIDER";

export interface BackendSchoolSummary {
  id: string;
  name: string;
}

export interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: BackendRole;
  schoolId?: string | null;
  school?: BackendSchoolSummary | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BackendUserRole = "ADMIN" | "COORDINADOR" | "LIDER";

export interface BackendAuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: BackendUserRole;
  schoolId?: string | null;
}

export interface AuthApiResponse {
  accessToken: string;
  user: BackendAuthUser;
}

export interface StoredAuth {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "coordinator" | "leader";
    schoolId?: string | null;
  };
}