// src/pages/admin/utils/adminMockScope.ts
import type { TeacherEvaluationSummary } from "../../../types";

type MockProgram = { name: string; students: number };

export const MOCK_SCHOOLS = [
  { name: "Ingeniería", subtitle: "Facultad de Ingeniería y Tecnología", programsCount: 4 },
  { name: "Medicina", subtitle: "Facultad de Ciencias de la Salud", programsCount: 3 },
  { name: "Derecho", subtitle: "Facultad de Ciencias Jurídicas", programsCount: 2 },
  { name: "Arquitectura", subtitle: "Facultad de Diseño y Urbanismo", programsCount: 2 },
  { name: "Economía", subtitle: "Facultad de Ciencias Económicas", programsCount: 3 },
] as const;

export const MOCK_PROGRAMS_BY_SCHOOL: Record<string, MockProgram[]> = {
  Ingeniería: [
    { name: "Ingeniería de Sistemas", students: 120 },
    { name: "Ingeniería Industrial", students: 95 },
    { name: "Ingeniería Electrónica", students: 80 },
    { name: "Ingeniería Civil", students: 110 },
  ],
  Medicina: [
    { name: "Medicina", students: 140 },
    { name: "Enfermería", students: 90 },
    { name: "Bacteriología", students: 70 },
  ],
  Derecho: [
    { name: "Derecho", students: 160 },
    { name: "Ciencia Política", students: 85 },
  ],
  Arquitectura: [
    { name: "Arquitectura", students: 120 },
    { name: "Diseño Interior", students: 65 },
  ],
  Economía: [
    { name: "Economía", students: 100 },
    { name: "Administración de Empresas", students: 180 },
    { name: "Contaduría Pública", students: 130 },
  ],
};

const schoolList = MOCK_SCHOOLS.map((s) => s.name);

function hashToIndex(input: string, mod: number) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return mod > 0 ? h % mod : 0;
}

/**
 * Si el backend no trae school/program, los asigna (determinístico) para que:
 * - Wizard muestre conteos
 * - Filtros y KPIs funcionen por scope
 * - 100% backend-ready (cuando llegue real, esto no pisa nada)
 */
export function applyMockScopeToEvaluations(
  evaluations: TeacherEvaluationSummary[]
): TeacherEvaluationSummary[] {
  return (evaluations ?? []).map((ev: any) => {
    const existingSchool =
      ev?.candidate?.schoolNameSnapshot ?? ev?.candidate?.schoolName ?? ev?.schoolNameSnapshot ?? ev?.schoolName;

    const existingProgram =
      ev?.candidate?.programNameSnapshot ?? ev?.candidate?.programName ?? ev?.programNameSnapshot ?? ev?.programName;

    // Si ya viene real → no tocamos
    if (existingSchool && existingProgram) return ev;

    const seed = String(ev?.id ?? ev?.evaluationId ?? ev?.candidate?.email ?? ev?.candidate?.fullName ?? Math.random());

    const school = schoolList[hashToIndex(seed, schoolList.length)];
    const programs = MOCK_PROGRAMS_BY_SCHOOL[school] ?? [];
    const program = programs[hashToIndex(seed + "::p", programs.length)]?.name ?? "Programa";

    // Inyectamos sin romper tipos (mantiene el objeto original)
    return {
      ...ev,
      candidate: {
        ...(ev?.candidate ?? {}),
        schoolNameSnapshot: existingSchool ?? school,
        programNameSnapshot: existingProgram ?? program,
      },
      schoolNameSnapshot: ev?.schoolNameSnapshot ?? existingSchool ?? school,
      programNameSnapshot: ev?.programNameSnapshot ?? existingProgram ?? program,
    } as TeacherEvaluationSummary;
  });
}
