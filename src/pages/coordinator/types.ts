// src/pages/coordinator/types.ts

// ✅ Tabs del panel derecho
export type DetailTabKey = "DECISION" | "AI" | "NOTES";

// ✅ Decisión local coordinador
export type LocalDecision = "PENDIENTE" | "APROBADO" | "RECHAZADO";

// ✅ Filtro de estado en la lista (lo que te falta)
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

// ✅ Guardado por evaluación
export type CoordinatorNotesByEval = Record<string, CoordinatorNotes>;
