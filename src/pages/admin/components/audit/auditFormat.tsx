// src/pages/admin/components/audit/auditFormat.tsx
import React from "react";
import {
  FileText,
  UserPlus,
  UserCog,
  ShieldCheck,
  Clock,
} from "lucide-react";

import type { AdminAuditAction, AdminAuditEvent, AdminAuditEntityType } from "../../adminTypes";

export type Severity = "INFO" | "DECISION" | "CRITICAL";

const ALLOWED_ACTIONS = new Set<AdminAuditAction>([
  "USER_CREATED",
  "USER_UPDATED",
  "COORDINATOR_DECISION_SAVED",
  "ADMIN_DECISION_SAVED",
]);

const HIDDEN_ACTIONS = new Set<AdminAuditAction>([
  "DETAIL_VIEWED", // ocultar definitivo
]);

export function shouldShowEvent(
  ev: AdminAuditEvent,
  opts?: { hideAdmin?: boolean }
) {
  if (!ev) return false;

  if (HIDDEN_ACTIONS.has(ev.action)) return false;

  // ✅ Solo lo relevante
  if (!ALLOWED_ACTIONS.has(ev.action)) return false;

  // ✅ Opcional: ocultar lo que haga el ADMIN
  if (opts?.hideAdmin && ev.actorRole === "ADMIN") return false;

  return true;
}

export function severityForAction(action: AdminAuditAction): Severity {
  switch (action) {
    case "USER_CREATED":
      return "INFO"; // 🟢
    case "USER_UPDATED":
      return "CRITICAL"; // 🔴 cambio de datos
    case "COORDINATOR_DECISION_SAVED":
      return "DECISION"; // 🟡
    case "ADMIN_DECISION_SAVED":
      return "CRITICAL"; // 🔴 decisión final (impacto alto)
    default:
      return "INFO";
  }
}

export function severityBadge(sev: Severity) {
  const base =
    "text-[10px] px-2 py-1 rounded-full border uppercase tracking-widest";

  if (sev === "INFO") {
    return (
      <span className={`${base} border-emerald-500/30 bg-emerald-500/10 text-emerald-300`}>
        🟢 informativo
      </span>
    );
  }
  if (sev === "DECISION") {
    return (
      <span className={`${base} border-amber-500/30 bg-amber-500/10 text-amber-300`}>
        🟡 decisión
      </span>
    );
  }
  return (
    <span className={`${base} border-rose-500/30 bg-rose-500/10 text-rose-300`}>
      🔴 crítico
    </span>
  );
}

export function actionLabel(action: AdminAuditAction) {
  switch (action) {
    case "USER_CREATED":
      return "Usuario creado";
    case "USER_UPDATED":
      return "Usuario actualizado";
    case "COORDINATOR_DECISION_SAVED":
      return "Decisión coordinador";
    case "ADMIN_DECISION_SAVED":
      return "Decisión admin";
    default:
      return action;
  }
}

export function entityLabel(t: AdminAuditEntityType) {
  switch (t) {
    case "USER":
      return "Usuario";
    case "EVALUATION":
      return "Evaluación";
    case "SYSTEM":
      return "Sistema";
    default:
      return "Sistema";
  }
}

export function iconForAction(action: AdminAuditAction) {
  switch (action) {
    case "USER_CREATED":
      return <UserPlus className="w-4 h-4" />;
    case "USER_UPDATED":
      return <UserCog className="w-4 h-4" />;
    case "COORDINATOR_DECISION_SAVED":
      return <ShieldCheck className="w-4 h-4" />;
    case "ADMIN_DECISION_SAVED":
      return <FileText className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

/** helpers que ya usas en timeline */
export function safeDate(iso?: string) {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}
export function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
export function formatDayTitle(d: Date) {
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
export function formatTime(d: Date) {
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function metaChips(meta?: Record<string, any>) {
  const md = meta ?? {};
  const out: Array<{ k: string; v: string }> = [];
  if (md.email) out.push({ k: "email", v: String(md.email) });
  if (md.role) out.push({ k: "rol", v: String(md.role) });
  if (md.status) out.push({ k: "estado", v: String(md.status) });
  if (md.candidateName) out.push({ k: "candidato", v: String(md.candidateName) });
  if (md.source) out.push({ k: "origen", v: String(md.source) });
  return out.slice(0, 4);
}

export function buildHumanLine(ev: AdminAuditEvent) {
  const md = ev.meta ?? {};
  const actor =
    ev.actorRole === "ADMIN" ? "Admin" :
    ev.actorRole === "COORDINATOR" ? "Coordinador" :
    "Usuario";

  const target =
    ev.entityType === "USER"
      ? md.email ? `usuario ${md.email}` : "un usuario"
      : ev.entityType === "EVALUATION"
      ? md.candidateName ? `evaluación de ${md.candidateName}` : "una evaluación"
      : "el sistema";

  switch (ev.action) {
    case "USER_CREATED":
      return `${actor} creó ${target}.`;
    case "USER_UPDATED":
      return `${actor} actualizó ${target}.`;
    case "COORDINATOR_DECISION_SAVED":
      return `Coordinador registró una decisión en ${target}.`;
    case "ADMIN_DECISION_SAVED":
      return `Admin registró la decisión final en ${target}.`;
    default:
      return `${actor} realizó ${actionLabel(ev.action)} sobre ${target}.`;
  }
}
