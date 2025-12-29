// src/services/auditService.ts

// Lo que ya usa tu AuthContext:
export interface AuditActor {
  id: string;
  name: string;
  email: string;
  role: string; // "admin" | "coordinator" | "leader"
}

export interface AuditEvent {
  id: string;
  type: string; // "LOGIN" | "LOGOUT" | ...
  actor: AuditActor;
  timestamp: string;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = "cun-audit-log";

// 👉 función segura para generar IDs en navegador
function generateId(): string {
  const c = (globalThis as any).crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  // fallback por si acaso
  return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * Añade un evento de auditoría al almacenamiento local.
 */
export function auditAppend(input: {
  type: string;
  actor: AuditActor;
  metadata?: Record<string, any>;
}) {
  if (typeof window === "undefined") return;

  const evt: AuditEvent = {
    id: generateId(),
    type: input.type,
    actor: input.actor,
    metadata: input.metadata,
    timestamp: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: AuditEvent[] = raw ? JSON.parse(raw) : [];
    list.push(evt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // console.log("[audit] evento guardado", evt);
  } catch (err) {
    console.warn("No se pudo escribir en el log de auditoría", err, evt);
  }
}
