// src/types.ts

// --- EXISTENTE ---
export type AcceptsCommitteesOption = 'Sí' | 'No' | 'Depende';

export interface InterviewData {
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
  overallRiskLevel: 'Bajo' | 'Medio' | 'Alto';
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
  rawOutput?: AnalysisResult; // seguimos guardando el JSON completo si lo necesitas
}

// 🔹 NUEVO: estados de decisión del coordinador
export type CoordinatorDecisionStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

// 🔹 NUEVO: detalle de la decisión (lo que idealmente guardará el backend)
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
    schoolNameSnapshot?: string | null;
    programNameSnapshot?: string | null;
  };

  aiTeachingSuitabilityScore: number;
  aiFinalRecommendation: string;
  aiOverallComment: string;
  aiReportDriveFileId?: string | null;

  // 🔹 NUEVO: decisión del coordinador (si existe)
  coordinatorDecision?: CoordinatorDecision;
  // 🔹 NUEVO: campos pensados para la decisión del coordinador
  coordinatorDecisionStatus?: "PENDIENTE" | "APROBADO" | "RECHAZADO" | null;
  coordinatorDecisionBy?: string | null;
  coordinatorDecisionAt?: string | null;
  coordinatorDecisionComment?: string | null;
}

// ===== AUDIT TRAIL (FRONTEND-ONLY POR AHORA) =====

export type AuditActorRole = "leader" | "coordinator" | "admin" | "system";

export interface AuditActor {
  id?: string | null;
  name?: string | null;
  email?: string | null;
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
  | "LOGIN"
  | "LOGOUT";

export interface AuditEvent {
  id: string; // uuid
  type: AuditEventType;
  at: string; // ISO date
  evaluationId?: string | null; // si aplica
  actor: AuditActor;
  // metadata libre (pero tipada como record simple)
  metadata?: Record<string, string | number | boolean | null>;
}

