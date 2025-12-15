// src/pages/admin/utils/adminSelectors.ts
import type { TeacherEvaluationSummary } from "../../../types";
import type { AdminMetrics, RiskBucket, SchoolSummary } from "./adminTypes";

export const getBucket = (veredict: string | undefined | null): RiskBucket => {
  if (!veredict) return "DESCONOCIDO";
  const v = veredict.toLowerCase();
  if (v.includes("no recomendar")) return "NO_RECOMENDAR";
  if (v.includes("precauc")) return "PRECAUCION";
  if (v.includes("recomendar") || v.includes("recomendada")) return "RECOMENDADA";
  return "DESCONOCIDO";
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
    base = base.filter((ev) => (ev.candidate?.schoolNameSnapshot ?? "") === selectedSchool);
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

  return [...base].sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });
};

export const computeMetrics = (evaluations: TeacherEvaluationSummary[]): AdminMetrics => {
  if (evaluations.length === 0) {
    return { total: 0, avgScore: 0, recommended: 0, caution: 0, notRecommended: 0 };
  }

  const total = evaluations.length;
  let sumScore = 0;
  let recommended = 0;
  let caution = 0;
  let notRecommended = 0;

  evaluations.forEach((ev) => {
    sumScore += ev.aiTeachingSuitabilityScore || 0;
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

export const computeSchoolsSummary = (evaluations: TeacherEvaluationSummary[]): SchoolSummary[] => {
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
    current.avgScore += ev.aiTeachingSuitabilityScore || 0;

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

export const pct = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);

export const clampPct = (v: number) => Math.max(0, Math.min(100, v));
