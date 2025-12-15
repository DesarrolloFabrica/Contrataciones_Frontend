import type { AuditEvent, AuditEventType, AuditActor } from "../types";

const STORAGE_KEY = "ope-cun:audit-events:v1";
const MAX_EVENTS = 2000; // límite para no reventar localStorage


function safeRead(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(events: AuditEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // si storage está lleno, intentamos guardar solo los últimos N
    const trimmed = events.slice(-500);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // si falla igual, no rompemos la app
    }
  }
}

export function auditList(params?: {
  evaluationId?: string;
  limit?: number;
}): AuditEvent[] {
  const all = safeRead();

  const filtered = params?.evaluationId
    ? all.filter((e) => e.evaluationId === params.evaluationId)
    : all;

  const ordered = filtered.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return ordered.slice(0, params?.limit ?? 500);
}

export function auditAppend(input: {
  type: AuditEventType;
  actor: AuditActor;
  evaluationId?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}): AuditEvent {
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    type: input.type,
    at: new Date().toISOString(),
    evaluationId: input.evaluationId ?? null,
    actor: input.actor,
    metadata: input.metadata,
  };

  const current = safeRead();
  const next = [...current, event].slice(-MAX_EVENTS);

  safeWrite(next);
  return event;
}

export function auditClear() {
  localStorage.removeItem(STORAGE_KEY);
}
