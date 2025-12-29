// src/pages/admin/utils/adminSelectors.ts
import type { TeacherEvaluationSummary } from "../../../types";
import type {
  AdminMetrics,
  RiskBucket,
  SchoolSummary,
  AdminDecisionStatus,
} from "../adminTypes";

/**
 * Bucket de riesgo basado en veredicto IA (texto).
 * Mantiene compatibilidad con lo que ya tenías.
 */
export const getBucket = (veredict: string | undefined | null): RiskBucket => {
  if (!veredict) return "DESCONOCIDO";
  const v = veredict.toLowerCase();

  if (v.includes("no recomendar")) return "NO_RECOMENDAR";
  if (v.includes("precauc")) return "PRECAUCION";
  if (v.includes("recomendar") || v.includes("recomendada")) return "RECOMENDADA";

  return "DESCONOCIDO";
};

/** score seguro */
export const safeScore = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** date seguro */
export const safeDateMs = (iso?: string | null) => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
};

/**
 * (Futuro backend) Normaliza valores de decisión.
 * Acepta: "PENDIENTE" | "APROBADO" | "RECHAZADO" o variantes lower.
 */
export const normalizeDecisionStatus = (
  v: any,
  fallback: AdminDecisionStatus = "PENDING"
): AdminDecisionStatus => {
  const s = String(v ?? "").trim().toUpperCase();
  if (s === "APPROVED") return "APPROVED";
  if (s === "REJECTED") return "REJECTED";
  if (s === "PENDING") return "PENDING";
  return fallback;
};

/**
 * (Futuro backend) Helper para extraer estados desde el summary
 * sin acoplar todo el UI a una estructura exacta.
 *
 * IMPORTANTE:
 * - Hoy puede que NO exista en TeacherEvaluationSummary.
 * - Mañana backend lo envía, y no tienes que reescribir el UI.
 */
export const getCoordinatorDecisionFromSummary = (
  ev: TeacherEvaluationSummary
): AdminDecisionStatus => {
  // soporte: si el summary ya trae coordinatorDecisionStatus
  const anyEv = ev as any;
  if (anyEv?.coordinatorDecisionStatus) {
    return normalizeDecisionStatus(anyEv.coordinatorDecisionStatus);
  }
  // soporte alterno: raw snapshot
  if (anyEv?.coordinatorDecision?.status) {
    return normalizeDecisionStatus(anyEv.coordinatorDecision.status);
  }
  return "PENDING";
};

export const getAdminDecisionFromSummary = (
  ev: TeacherEvaluationSummary
): AdminDecisionStatus => {
  const anyEv = ev as any;
  if (anyEv?.adminDecisionStatus) {
    return normalizeDecisionStatus(anyEv.adminDecisionStatus);
  }
  if (anyEv?.adminDecision?.status) {
    return normalizeDecisionStatus(anyEv.adminDecision.status);
  }
  return "PENDING";
};

export const buildSchoolOptions = (evaluations: TeacherEvaluationSummary[]) => {
  const set = new Set<string>();
  evaluations.forEach((ev) => {
    const name = ev.candidate?.schoolNameSnapshot?.trim();
    if (name) set.add(name);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
};

export const filterEvaluations = (
  evaluations: TeacherEvaluationSummary[],
  search: string,
  selectedSchool: string
) => {
  let base = evaluations;

  if (selectedSchool !== "TODAS") {
    base = base.filter(
      (ev) => (ev.candidate?.schoolNameSnapshot ?? "") === selectedSchool
    );
  }

  const q = search.trim().toLowerCase();
  if (q) {
    base = base.filter((ev) => {
      const name = ev.candidate?.fullName?.toLowerCase() ?? "";
      const school = ev.candidate?.schoolNameSnapshot?.toLowerCase() ?? "";
      const program = ev.candidate?.programNameSnapshot?.toLowerCase() ?? "";
      return name.includes(q) || school.includes(q) || program.includes(q);
    });
  }

  // sort: más reciente primero
  return [...base].sort((a, b) => safeDateMs(b.createdAt) - safeDateMs(a.createdAt));
};

export const computeMetrics = (
  evaluations: TeacherEvaluationSummary[]
): AdminMetrics => {
  if (evaluations.length === 0) {
    return {
      total: 0,
      avgScore: 0,
      recommended: 0,
      caution: 0,
      notRecommended: 0,
    };
  }

  const total = evaluations.length;
  let sumScore = 0;
  let recommended = 0;
  let caution = 0;
  let notRecommended = 0;

  evaluations.forEach((ev) => {
    sumScore += safeScore(ev.aiTeachingSuitabilityScore);
    const bucket = getBucket(ev.aiFinalRecommendation);
    if (bucket === "RECOMENDADA") recommended += 1;
    if (bucket === "PRECAUCION") caution += 1;
    if (bucket === "NO_RECOMENDAR") notRecommended += 1;
  });

  return {
    total,
    avgScore: sumScore / total,
    recommended,
    caution,
    notRecommended,
  };
};

export const computeSchoolsSummary = (
  evaluations: TeacherEvaluationSummary[]
): SchoolSummary[] => {
  const map = new Map<string, SchoolSummary>();

  evaluations.forEach((ev) => {
    const key = ev.candidate?.schoolNameSnapshot?.trim() ?? "Sin escuela";
    const current = map.get(key) ?? {
      schoolName: key,
      total: 0,
      avgScore: 0,
      recommended: 0,
      notRecommended: 0,
    };

    current.total += 1;
    current.avgScore += safeScore(ev.aiTeachingSuitabilityScore);

    const bucket = getBucket(ev.aiFinalRecommendation);
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

/**
 * ✅ NUEVO: Métricas de decisiones (coordinador + admin)
 * Útil para completar “admin debe tener absolutamente todo”.
 */
export const computeDecisionMetrics = (evaluations: TeacherEvaluationSummary[]) => {
  let coordPending = 0;
  let coordApproved = 0;
  let coordRejected = 0;

  let adminPending = 0;
  let adminApproved = 0;
  let adminRejected = 0;

  evaluations.forEach((ev) => {
    const c = getCoordinatorDecisionFromSummary(ev);
    if (c === "PENDING") coordPending += 1;
    if (c === "APPROVED") coordApproved += 1;
    if (c === "REJECTED") coordRejected += 1;

    const a = getAdminDecisionFromSummary(ev);
    if (a === "PENDING") adminPending += 1;
    if (a === "APPROVED") adminApproved += 1;
    if (a === "REJECTED") adminRejected += 1;
  });

  return {
    coordinator: { pending: coordPending, approved: coordApproved, rejected: coordRejected },
    admin: { pending: adminPending, approved: adminApproved, rejected: adminRejected },
  };
};

export const pct = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);

export const clampPct = (v: number) => Math.max(0, Math.min(100, v));
