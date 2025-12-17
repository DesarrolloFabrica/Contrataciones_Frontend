// ✅ Tabs del panel derecho
export type DetailTabKey = "DECISION" | "AI" | "NOTES";

// ✅ Decisión local coordinador
export type LocalDecision = "PENDIENTE" | "APROBADO" | "RECHAZADO";

// ✅ Timeline (si lo sigues usando, si no lo puedes borrar luego)
export type TimelineTab = "EVAL" | "GLOBAL";

// ✅ Criterios tipados (en vez de Record<string, boolean>)
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
