// src/types.ts
export type AcceptsCommitteesOption = "Sí" | "No" | "Depende";

export interface InterviewData {
  documentNumber: string;
  candidateName: string;
  age: string;
  school: string;
  program: string;
  candidateId?: string | null;
  schoolId?: string | null;
  programId?: string | null;
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

/* =========================
   BACKEND TEACHERS
   ========================= */

export type DecisionStatusApi = "PENDING" | "APPROVED" | "REJECTED";

export interface TeacherForm {
  candidate: {
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

export interface TeacherAiResult {
  strengths?: string;
  weaknesses?: string;
  improvementAreas?: string;
  teachingSuitabilityScore?: number;
  recommendation?: string;
  overallComment?: string;
  rawOutput?: AnalysisResult;
}

export interface CoordinatorDecision {
  status: DecisionStatusApi;
  comment?: string | null;
  decidedAt?: string | null;
  decidedById?: string | null;
  decidedByName?: string | null;
}

// Resumen/listado (alineado a entity TeacherEvaluation + relation candidate)
export interface TeacherEvaluationSummary {
  id: string;
  createdAt: string;

  candidate?: {
    id: string;

    // principal (UI)
    documentNumber: string | null;

    fullName: string;

    // compat con payloads legacy/backends distintos
    document_number?: string | null;
    schoolNameSnapshot?: string | null;
    programNameSnapshot?: string | null;
  };

  aiTeachingSuitabilityScore: number | null;
  aiFinalRecommendation: string | null;
  aiOverallComment: string | null;
  aiReportDriveFileId?: string | null;

  coordinatorDecisionStatus?: DecisionStatusApi | null;
  coordinatorDecisionComment?: string | null;
  coordinatorDecisionAt?: string | null;

  adminDecisionStatus?: DecisionStatusApi | null;
  adminDecisionComment?: string | null;
  adminDecisionAt?: string | null;

  interviewerUserId?: string | null;
}

/* =========================
   AUDIT TRAIL (front)
   ========================= */

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

/* =========================
   AUTH / USERS (sin cambios)
   ========================= */

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