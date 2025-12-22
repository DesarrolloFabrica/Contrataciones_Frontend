// src/pages/coordinator/utils/candidateKey.ts
// Helper centralizado para definir la "identidad" de un candidato en frontend.
// Hoy: no hay cédula desde backend, entonces usamos un fallback estable.
// Mañana: cuando backend entregue cedula/documentNumber, solo cambias 1 línea aquí.

import type { TeacherEvaluationSummary } from "../../../types";

export function getCandidateKey(ev: TeacherEvaluationSummary): string {
  // ✅ FUTURO (backend):
  // cuando exista, descomenta y deja esto como retorno principal:
  // const cedula = (ev.candidate as any)?.documentNumber?.toString()?.trim();
  // if (cedula) return cedula;

  // ✅ HOY (fallback): key “razonable” y consistente
  // OJO: si hay homónimos exactos en misma escuela+programa, podría agrupar mal.
  // Igual sirve para avanzar sin backend y luego migrar a cédula.
  const name = (ev.candidate?.fullName ?? "").trim().toLowerCase();
  const school = (ev.candidate?.schoolNameSnapshot ?? "").trim().toLowerCase();
  const program = (ev.candidate?.programNameSnapshot ?? "").trim().toLowerCase();

  // Si name viene vacío, usa el id de la evaluación para no colapsar todo en una sola
  if (!name) return `__no_name__::${ev.id}`;

  return `${name}||${school}||${program}`;
}