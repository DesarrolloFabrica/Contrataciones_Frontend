// src/pages/coordinator/types.ts
import type { TeacherEvaluationSummary } from "../../types";
// ✅ Tabs del panel derecho
export type DetailTabKey =
  | "AI"
  | "INTERVIEWS"
  | "DECISION"
  | "AUDIT"
  | "TECH";

// ✅ Decisión local coordinador
export type LocalDecision = "PENDIENTE" | "APROBADO" | "RECHAZADO";

// ✅ Filtro de estado en la lista
export type DecisionFilter = "ALL" | LocalDecision;

// ✅ Timeline (si lo sigues usando)
export type TimelineTab = "EVAL" | "GLOBAL";

// ✅ Criterios tipados
export type CoordinatorCriteriaKey =
  | "docs_ok"
  | "profile_fit"
  | "risk_ok"
  | "communication_ok";

export type CoordinatorCriteria = {
  docs_ok: boolean;
  profile_fit: boolean;
  risk_ok: boolean;
  communication_ok: boolean;
};

export const DEFAULT_CRITERIA: CoordinatorCriteria = {
  docs_ok: false,
  profile_fit: false,
  risk_ok: false,
  communication_ok: false,
};

export type CoordinatorNotes = {
  notes: string;
  criteria: CoordinatorCriteria;
};

export type CandidateGroup = {
  // ✅ key interna estable (para agrupar y seleccionar)
  key: string;

  // ✅ lo que muestras como "CC" (puede ser vacío si no llegó)
  documentNumber: string;

  candidateName: string;
  school: string;
  program: string;

  // todas las entrevistas del candidato
  interviews: TeacherEvaluationSummary[];

  // la entrevista más reciente
  latest: TeacherEvaluationSummary;
};

// ✅ Guardado por evaluación
export type CoordinatorNotesByEval = Record<string, CoordinatorNotes>;
