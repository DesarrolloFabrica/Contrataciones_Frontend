// src/pages/admin/utils/adminMockScopeData.ts
import type { TeacherEvaluationSummary } from "../../../types";

export const MOCK_SCHOOLS = [
  "Ingeniería",
  "Medicina",
  "Derecho",
  "Arquitectura",
  "Economía",
];

export const MOCK_PROGRAMS_BY_SCHOOL: Record<string, string[]> = {
  Ingeniería: [
    "Ingeniería de Sistemas",
    "Ingeniería Industrial",
    "Ingeniería Electrónica",
    "Ingeniería Civil",
  ],
  Medicina: ["Medicina", "Enfermería", "Bacteriología"],
  Derecho: ["Derecho", "Ciencia Política"],
  Arquitectura: ["Arquitectura", "Diseño Interior"],
  Economía: ["Economía", "Administración de Empresas", "Contaduría Pública"],
};

const hashToIndex = (s: string, mod: number) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return mod > 0 ? h % mod : 0;
};

const getStableKey = (ev: any) =>
  String(
    ev?.id ??
      ev?.evaluationId ??
      ev?.candidate?.email ??
      ev?.candidate?.fullName ??
      Math.random()
  );

export function shouldUseMockScope(evaluations: TeacherEvaluationSummary[]) {
  // Si NO hay escuelas reales en los snapshots -> usamos mock
  return (evaluations ?? []).every((ev: any) => {
    const s =
      ev?.candidate?.schoolNameSnapshot ??
      ev?.candidate?.schoolName ??
      ev?.schoolName ??
      "";
    return !String(s).trim();
  });
}

export function applyMockScopeToEvaluations(
  evaluations: TeacherEvaluationSummary[]
): TeacherEvaluationSummary[] {
  return (evaluations ?? []).map((ev: any) => {
    const hasSchool =
      !!String(
        ev?.candidate?.schoolNameSnapshot ??
          ev?.candidate?.schoolName ??
          ev?.schoolName ??
          ""
      ).trim();

    const hasProgram =
      !!String(
        ev?.candidate?.programNameSnapshot ??
          ev?.candidate?.programName ??
          ev?.programName ??
          ""
      ).trim();

    // Si ya viene del backend real, NO lo tocamos
    if (hasSchool && hasProgram) return ev;

    const key = getStableKey(ev);
    const school = MOCK_SCHOOLS[hashToIndex(key, MOCK_SCHOOLS.length)];
    const programs = MOCK_PROGRAMS_BY_SCHOOL[school] ?? [];
    const program = programs[hashToIndex(key + "::p", programs.length)] ?? "Programa";

    // metemos en snapshots para que tus selectors los tomen
    const next = { ...ev };
    next.candidate = { ...(next.candidate ?? {}) };
    next.candidate.schoolNameSnapshot = next.candidate.schoolNameSnapshot ?? school;
    next.candidate.programNameSnapshot = next.candidate.programNameSnapshot ?? program;

    return next;
  });
}
