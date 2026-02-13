// src/services/auditService.ts
import type { AuditActor } from "../types";

export interface AuditEvent {
  id: string;
  type: string;
  actor: AuditActor;
  timestamp: string;
  evaluationId?: string | null;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = "cun-audit-log";

// ✅ parametrizable
const MAX_STORED_EVENTS = 300; // total guardados en localStorage
const DEDUPE_WINDOW_MS = 1500; // evita duplicados idénticos por spam

function generateId(): string {
  const c = (globalThis as any).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function signatureOf(input: {
  type: string;
  actor: AuditActor;
  evaluationId?: string | null;
  metadata?: Record<string, any>;
}) {
  // firma “estable” para dedupe (no perfecta, pero suficiente para UI)
  const a =
    input.actor?.id ?? input.actor?.email ?? input.actor?.name ?? "system";
  return JSON.stringify({
    t: input.type,
    a,
    e: input.evaluationId ?? null,
    m: input.metadata ?? null,
  });
}

export function auditAppend(input: {
  type: string;
  actor: AuditActor;
  evaluationId?: string | null;
  metadata?: Record<string, any>;
}) {
  if (typeof window === "undefined") return;

  const nowIso = new Date().toISOString();
  const evt: AuditEvent = {
    id: generateId(),
    type: input.type,
    actor: input.actor,
    evaluationId: input.evaluationId ?? null,
    metadata: input.metadata,
    timestamp: nowIso,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: AuditEvent[] = safeParse(raw, []);

    // ✅ DEDUPE: si el último evento es idéntico y ocurrió hace nada, no lo agregues
    const last = list[list.length - 1];
    if (last) {
      const lastSig = signatureOf({
        type: last.type,
        actor: last.actor,
        evaluationId: last.evaluationId ?? null,
        metadata: last.metadata,
      });
      const newSig = signatureOf(input);

      const dt = Math.abs(
        new Date(nowIso).getTime() - new Date(last.timestamp).getTime(),
      );
      if (lastSig === newSig && dt <= DEDUPE_WINDOW_MS) {
        return;
      }
    }

    list.push(evt);

    // ✅ CAP: recorta los más antiguos
    if (list.length > MAX_STORED_EVENTS) {
      list.splice(0, list.length - MAX_STORED_EVENTS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("No se pudo escribir en el log de auditoría", err, evt);
  }
}

// (Opcional pero recomendado) helpers
export function auditRead(limit = 50): AuditEvent[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  const list: AuditEvent[] = safeParse(raw, []);
  return list.slice(-limit).reverse(); // últimos primero
}

export function auditClear() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
