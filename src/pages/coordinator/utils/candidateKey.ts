// src/pages/coordinator/utils/candidateKey.ts
import type { TeacherEvaluationSummary } from "../../../types";

/**
 * Normaliza un documento (CC) para que siempre quede comparable.
 * - Solo deja dígitos (quita puntos, espacios, guiones, etc.)
 */
function normalizeDoc(v: unknown): string {
  return String(v ?? "")
    .trim()
    .replace(/\D+/g, ""); // <- SOLO números
}

/**
 * Normaliza texto para keys:
 * - trim
 * - lower
 * - quita tildes/diacríticos
 * - colapsa espacios múltiples
 */
function normalizeText(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD") // separa letras y tildes
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/\s+/g, " "); // colapsa espacios
}

export function getCandidateKey(ev: TeacherEvaluationSummary): string {
  // ✅ 1) principal: documentNumber (camelCase)
  const doc1 = normalizeDoc(ev.candidate?.documentNumber);
  if (doc1) return doc1;

  // ✅ 2) compat: document_number (snake_case)
  const doc2 = normalizeDoc(ev.candidate?.document_number);
  if (doc2) return doc2;

  // ✅ 3) fallback (cuando NO viene CC):
  // Normalizamos fuerte para evitar duplicados por tildes/espacios.
  const name = normalizeText(ev.candidate?.fullName);
  if (!name) return `__no_name__::${ev.id}`;

  const school = normalizeText(ev.candidate?.schoolNameSnapshot);
  const program = normalizeText(ev.candidate?.programNameSnapshot);

  // Nota: como ya filtras por escuela/programa arriba, esto es bastante estable.
  return `${name}||${school}||${program}`;
}