import type { TeacherEvaluationSummary } from "../../../types";
import type {
  AdminMetrics,
  RiskBucket,
  SchoolSummary,
  AdminDecisionStatus,
} from "../adminTypes";

// ── Unified AI recommendation status ─────────────────────────────────
// Single source of truth for mapping AI recommendation → status bucket.
// Used by both KPI counters and list badges to guarantee sync.

export type AiRecommendationStatus = "RECOMMENDED" | "RESERVED" | "NOT_RECOMMENDED" | "NO_ANALYSIS";

export const getAiRecommendationStatus = (ev: TeacherEvaluationSummary): AiRecommendationStatus => {
  const rec = (ev.aiFinalRecommendation ?? "").toLowerCase().trim();
  const score = Number(ev.aiTeachingSuitabilityScore ?? 0);
  const hasScore = Number.isFinite(score) && score > 0;

  // 1) Text-based classification (primary)
  if (rec) {
    // No recomendado: covers "no recomendar", "no recomendado", "no se recomienda", "rechaz", "no apto", "no es apto"
    if (
      rec.includes("no recomend") ||
      rec.includes("no se recomienda") ||
      rec.includes("rechaz") ||
      rec.includes("no apto") ||
      rec.includes("no es apto")
    ) {
      return "NOT_RECOMMENDED";
    }
    // Recomendado con reservas: covers "precauc", "condicion", "reserv", "duda", "riesgo medio"
    if (
      rec.includes("precauc") ||
      rec.includes("condicion") ||
      rec.includes("reserv") ||
      rec.includes("duda") ||
      rec.includes("riesgo medio")
    ) {
      return "RESERVED";
    }
    // Recomendado: covers "recomend", "apto", "idóneo"
    if (
      rec.includes("recomend") ||
      rec.includes("apto") ||
      rec.includes("idóneo") ||
      rec.includes("idoneo")
    ) {
      return "RECOMMENDED";
    }
  }

  // 2) Score-based fallback (when text is ambiguous or missing)
  if (hasScore) {
    if (score >= 80) return "RECOMMENDED";
    if (score >= 60) return "RESERVED";
    return "NOT_RECOMMENDED";
  }

  // 3) No analysis available
  return "NO_ANALYSIS";
};

// Human-readable label for AI recommendation status
export const aiRecommendationLabel = (status: AiRecommendationStatus): string => {
  switch (status) {
    case "RECOMMENDED": return "Recomendado";
    case "RESERVED": return "Recomendado con reservas";
    case "NOT_RECOMMENDED": return "No recomendado";
    case "NO_ANALYSIS": return "Pendiente de decisión";
  }
};

// Keep legacy getBucket for backward compatibility with existing code
/**
 * Bucket de riesgo basado en veredicto IA (texto).
 * @deprecated Use getAiRecommendationStatus instead
 */
export const getBucket = (veredict: string | undefined | null): RiskBucket => {
  if (!veredict) return "DESCONOCIDO";
  const v = veredict.toLowerCase();

  if (v.includes("no recomendar")) return "NO_RECOMENDAR";
  if (v.includes("precauc")) return "PRECAUCION";
  if (v.includes("recomendar") || v.includes("recomendada")) return "RECOMENDADA";

  return "DESCONOCIDO";
};

export const safeScore = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const safeDateMs = (iso?: string | null) => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
};

export const normalizeDecisionStatus = (
  v: any,
  fallback: AdminDecisionStatus = "PENDIENTE"
): AdminDecisionStatus => {
  const s = String(v ?? "").trim().toUpperCase();
  if (s === "APROBADO") return "APROBADO";
  if (s === "RECHAZADO") return "RECHAZADO";
  if (s === "PENDIENTE") return "PENDIENTE";
  return fallback;
};

export const getCoordinatorDecisionFromSummary = (
  ev: TeacherEvaluationSummary
): AdminDecisionStatus => {
  const anyEv = ev as any;
  if (anyEv?.coordinatorDecisionStatus) {
    return normalizeDecisionStatus(anyEv.coordinatorDecisionStatus);
  }
  if (anyEv?.coordinatorDecision?.status) {
    return normalizeDecisionStatus(anyEv.coordinatorDecision.status);
  }
  return "PENDIENTE";
};

export const getAdminDecisionFromSummary = (
  ev: TeacherEvaluationSummary
): AdminDecisionStatus => {
  void ev;
  return "PENDIENTE";
};

// -------------------------
// ✅ Helpers null-friendly + backend-ready
// -------------------------
type Maybe = string | null | undefined;

const norm = (v: any) => String(v ?? "").trim().toLowerCase();

// Prioridad: snapshots + fallback a campos planos por si backend cambia
const pickSchool = (ev: any) =>
  ev?.candidate?.schoolNameSnapshot ??
  ev?.candidate?.schoolName ??
  ev?.schoolNameSnapshot ??
  ev?.schoolName ??
  ev?.school ??
  "";

const pickProgram = (ev: any) =>
  ev?.candidate?.programNameSnapshot ??
  ev?.candidate?.programName ??
  ev?.programNameSnapshot ??
  ev?.programName ??
  ev?.program ??
  "";

const pickCandidateName = (ev: any) =>
  ev?.candidate?.fullName ??
  ev?.candidate?.name ??
  ev?.candidateName ??
  ev?.name ??
  [ev?.candidate?.firstName, ev?.candidate?.lastName].filter(Boolean).join(" ") ??
  "";

const pickExtraSearch = (ev: any) =>
  [
    ev?.candidate?.email,
    ev?.candidate?.document,
    ev?.candidate?.cedula,
    ev?.candidate?.phone,
    ev?.candidate?.telefono,
    ev?.id,
    ev?.evaluationId,
    ev?.aiFinalRecommendation,
    ev?.aiTeachingSuitabilityScore,
    ev?.status,
  ]
    .filter(Boolean)
    .join(" ");

const pickSortDate = (ev: any) =>
  safeDateMs(ev?.createdAt) ||
  safeDateMs(ev?.updatedAt) ||
  safeDateMs(ev?.interviewDate) ||
  0;

// -------------------------
// ✅ Opciones escuela + programa (para wizard)
// -------------------------
export const buildSchoolOptions = (evaluations: TeacherEvaluationSummary[]) => {
  const set = new Set<string>();
  (evaluations ?? []).forEach((ev) => {
    const name = String(pickSchool(ev)).trim();
    if (name) set.add(name);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
};

export const buildProgramOptions = (
  evaluations: TeacherEvaluationSummary[],
  selectedSchool: string | null
) => {
  if (!selectedSchool) return [];

  const set = new Set<string>();
  const target = norm(selectedSchool);

  (evaluations ?? []).forEach((ev) => {
    const school = norm(pickSchool(ev));
    const program = String(pickProgram(ev)).trim();
    if (!program) return;

    if (school === target) set.add(program);
  });

  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
};

// -------------------------
// ✅ Filtro por scope + búsqueda (GLOBAL/SCHOOL/PROGRAM)
//    - Global: selectedSchool=null
//    - School: selectedSchool!=null && selectedProgram=null
//    - Program: selectedSchool!=null && selectedProgram!=null
//
// Nota: "program sin school" NO es un estado válido. Si llega, se ignora.
// -------------------------
export const filterEvaluations = (
  evaluations: TeacherEvaluationSummary[],
  search: string,
  selectedSchool: Maybe,
  selectedProgram: Maybe
) => {
  let base = [...(evaluations ?? [])];

  // Scope: SCHOOL o PROGRAM
  if (selectedSchool) {
    const s = norm(selectedSchool);
    base = base.filter((ev: any) => norm(pickSchool(ev)) === s);
  }

  // Scope: PROGRAM (solo si hay school + program)
  if (selectedSchool && selectedProgram) {
    const p = norm(selectedProgram);
    base = base.filter((ev: any) => norm(pickProgram(ev)) === p);
  }

  // Search (siempre aplica)
  const q = norm(search);
  if (q) {
    base = base.filter((ev: any) => {
      const blob = [
        pickCandidateName(ev),
        pickSchool(ev),
        pickProgram(ev),
        pickExtraSearch(ev),
      ]
        .map(norm)
        .join(" ");
      return blob.includes(q);
    });
  }

  // Orden: más recientes primero (con fallback)
  return base.sort((a, b) => pickSortDate(b as any) - pickSortDate(a as any));
};

// -------------------------
// ✅ Métricas
// -------------------------
export const computeMetrics = (
  evaluations: TeacherEvaluationSummary[]
): AdminMetrics => {
  if (!evaluations || evaluations.length === 0) {
    return {
      total: 0,
      avgScore: 0,
      recommended: 0,
      caution: 0,
      notRecommended: 0,
      noAnalysis: 0,
    };
  }

  const total = evaluations.length;
  let sumScore = 0;
  let recommended = 0;
  let caution = 0;
  let notRecommended = 0;
  let noAnalysis = 0;

  evaluations.forEach((ev) => {
    sumScore += safeScore((ev as any).aiTeachingSuitabilityScore);
    const status = getAiRecommendationStatus(ev);
    if (status === "RECOMMENDED") recommended += 1;
    if (status === "RESERVED") caution += 1;
    if (status === "NOT_RECOMMENDED") notRecommended += 1;
    if (status === "NO_ANALYSIS") noAnalysis += 1;
  });

  return {
    total,
    avgScore: sumScore / total,
    recommended,
    caution,
    notRecommended,
    noAnalysis,
  };
};

export const computeSchoolsSummary = (
  evaluations: TeacherEvaluationSummary[]
): SchoolSummary[] => {
  const map = new Map<string, SchoolSummary>();

  (evaluations ?? []).forEach((ev) => {
    const key = String(pickSchool(ev)).trim() || "Sin escuela";

    const current =
      map.get(key) ??
      ({
        schoolName: key,
        total: 0,
        avgScore: 0,
        recommended: 0,
        notRecommended: 0,
      } as SchoolSummary);

    current.total += 1;
    current.avgScore += safeScore((ev as any).aiTeachingSuitabilityScore);

    const bucket = getBucket((ev as any).aiFinalRecommendation);
    if (bucket === "RECOMENDADA") current.recommended += 1;
    if (bucket === "NO_RECOMENDAR") current.notRecommended += 1;

    map.set(key, current);
  });

  return Array.from(map.values())
    .map((s) => ({
      ...s,
      avgScore: s.total > 0 ? s.avgScore / s.total : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

export const computeDecisionMetrics = (evaluations: TeacherEvaluationSummary[]) => {
  let coordPending = 0;
  let coordApproved = 0;
  let coordRejected = 0;

  let adminPending = 0;
  let adminApproved = 0;
  let adminRejected = 0;

  (evaluations ?? []).forEach((ev) => {
    const c = getCoordinatorDecisionFromSummary(ev);
    if (c === "PENDIENTE") coordPending += 1;
    if (c === "APROBADO") coordApproved += 1;
    if (c === "RECHAZADO") coordRejected += 1;

    adminPending = coordPending;
    adminApproved = coordApproved;
    adminRejected = coordRejected;
  });

  return {
    coordinator: { pending: coordPending, approved: coordApproved, rejected: coordRejected },
    admin: { pending: adminPending, approved: adminApproved, rejected: adminRejected },
  };
};

// % helpers
export const pct = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);
export const clampPct = (v: number) => Math.max(0, Math.min(100, v));
