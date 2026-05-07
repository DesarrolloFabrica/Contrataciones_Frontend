import React from "react";
import {
  FileText,
  UserPlus,
  UserCog,
  ShieldCheck,
  Clock,
  Send,
  Upload,
  Link2,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  UserX,
  Briefcase,
} from "lucide-react";

import type {
  AdminAuditAction,
  AdminAuditEvent,
  AdminAuditEntityType,
} from "../../adminTypes";

export type Severity = "INFO" | "DECISION" | "CRITICAL";

/**
 * Acciones que SIEMPRE ocultamos (ruido).
 */
const HIDDEN_ACTIONS = new Set<AdminAuditAction>([
  "DETAIL_VIEWED",
]);

/**
 * Acciones "top" (las resaltamos y les damos severidad/labels mejores).
 */
const IMPORTANT_ACTIONS = new Set<AdminAuditAction>([
  "USER_CREATED",
  "USER_UPDATED",
  "COORDINATOR_DECISION_SAVED",
  "COORDINATOR_DECISION_CREATED",
  "COORDINATOR_DECISION_UPDATED",
  "EVALUATION_SUBMITTED",
  "CANDIDATE_CREATED",
  "DOCUMENT_UPLOADED",
  "HIRING_REQUEST_CREATED",
  "ADMIN_DECISION_BLOCKED",
]);

export function shouldShowEvent(
  ev: AdminAuditEvent,
  opts?: { hideAdmin?: boolean }
) {
  if (!ev) return false;

  if (HIDDEN_ACTIONS.has(ev.action)) return false;

  if (opts?.hideAdmin && ev.actorRole === "ADMIN") return false;

  return true;
}

export function severityForAction(action: AdminAuditAction): Severity {
  switch (action) {
    case "USER_CREATED":
    case "CANDIDATE_CREATED":
    case "HIRING_REQUEST_CREATED":
    case "DOCUMENT_UPLOADED":
    case "DOCUMENT_LINK_REGISTERED":
    case "EVALUATION_UPDATED":
    case "INTERVIEW_CREATED":
    case "EVALUATION_HIRING_REQUEST_ASSOCIATED":
    case "RESUME_MARKED_PRIMARY":
    case "EVALUATION_REPORT_ATTACHED":
    case "HIRING_REQUEST_UPDATED":
    case "CANDIDATE_UPDATED":
      return "INFO";
    case "COORDINATOR_DECISION_SAVED":
    case "COORDINATOR_DECISION_CREATED":
    case "COORDINATOR_DECISION_UPDATED":
    case "EVALUATION_SUBMITTED":
      return "DECISION";
    case "USER_UPDATED":
    case "ADMIN_DECISION_BLOCKED":
    case "USER_ACTIVATED":
    case "USER_DEACTIVATED":
      return "CRITICAL";
    default:
      return "INFO";
  }
}

export function severityBadge(sev: Severity) {
  const base =
    "text-[10px] px-2 py-1 rounded-full border uppercase tracking-widest";

  if (sev === "INFO") {
    return (
      <span
        className={`${base} border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300`}
      >
        informativo
      </span>
    );
  }
  if (sev === "DECISION") {
    return (
      <span
        className={`${base} border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300`}
      >
        decisión
      </span>
    );
  }
  return (
    <span
      className={`${base} border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300`}
    >
      crítico
    </span>
  );
}

export function actionLabel(action: AdminAuditAction) {
  switch (action) {
    case "USER_CREATED":
      return "Usuario creado";
    case "USER_UPDATED":
      return "Usuario actualizado";
    case "USER_ACTIVATED":
      return "Usuario activado";
    case "USER_DEACTIVATED":
      return "Usuario desactivado";
    case "COORDINATOR_DECISION_SAVED":
    case "COORDINATOR_DECISION_CREATED":
      return "Decisión coordinador";
    case "COORDINATOR_DECISION_UPDATED":
      return "Decisión coordinador actualizada";
    case "ADMIN_DECISION_SAVED":
      return "Decisión admin (legacy)";
    case "ADMIN_DECISION_BLOCKED":
      return "Intento admin bloqueado";
    case "CANDIDATE_CREATED":
      return "Candidato creado";
    case "CANDIDATE_UPDATED":
      return "Candidato actualizado";
    case "EVALUATION_SUBMITTED":
      return "Evaluación enviada";
    case "EVALUATION_UPDATED":
      return "Evaluación actualizada";
    case "EVALUATION_HIRING_REQUEST_ASSOCIATED":
      return "Evaluación vinculada a solicitud";
    case "INTERVIEW_CREATED":
      return "Entrevista creada";
    case "DOCUMENT_UPLOADED":
      return "Documento subido";
    case "DOCUMENT_LINK_REGISTERED":
      return "Link registrado";
    case "RESUME_MARKED_PRIMARY":
      return "Hoja de vida marcada principal";
    case "EVALUATION_REPORT_ATTACHED":
      return "Reporte adjuntado";
    case "HIRING_REQUEST_CREATED":
      return "Solicitud de contratación creada";
    case "HIRING_REQUEST_UPDATED":
      return "Solicitud actualizada";
    default:
      return String(action)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());
  }
}

export function entityLabel(t: AdminAuditEntityType) {
  switch (t) {
    case "USER":
      return "Usuario";
    case "EVALUATION":
    case "TEACHER_EVALUATION":
      return "Evaluación";
    case "SYSTEM":
      return "Sistema";
    case "TEACHER_CANDIDATE":
      return "Candidato";
    case "CANDIDATE_DOCUMENT":
      return "Documento";
    case "HIRING_REQUEST":
      return "Solicitud";
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
    case "USER_ACTIVATED":
      return <UserCheck className="w-4 h-4" />;
    case "USER_DEACTIVATED":
      return <UserX className="w-4 h-4" />;
    case "COORDINATOR_DECISION_SAVED":
    case "COORDINATOR_DECISION_CREATED":
    case "COORDINATOR_DECISION_UPDATED":
      return <ShieldCheck className="w-4 h-4" />;
    case "ADMIN_DECISION_SAVED":
      return <FileText className="w-4 h-4" />;
    case "ADMIN_DECISION_BLOCKED":
      return <AlertTriangle className="w-4 h-4" />;
    case "CANDIDATE_CREATED":
    case "CANDIDATE_UPDATED":
      return <UserPlus className="w-4 h-4" />;
    case "EVALUATION_SUBMITTED":
      return <Send className="w-4 h-4" />;
    case "EVALUATION_UPDATED":
    case "INTERVIEW_CREATED":
      return <FileText className="w-4 h-4" />;
    case "EVALUATION_HIRING_REQUEST_ASSOCIATED":
      return <Briefcase className="w-4 h-4" />;
    case "DOCUMENT_UPLOADED":
      return <Upload className="w-4 h-4" />;
    case "DOCUMENT_LINK_REGISTERED":
      return <Link2 className="w-4 h-4" />;
    case "RESUME_MARKED_PRIMARY":
      return <FileText className="w-4 h-4" />;
    case "EVALUATION_REPORT_ATTACHED":
      return <FileText className="w-4 h-4" />;
    case "HIRING_REQUEST_CREATED":
    case "HIRING_REQUEST_UPDATED":
      return <Briefcase className="w-4 h-4" />;
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
  if (md.verdict) out.push({ k: "veredicto", v: String(md.verdict) });
  if (md.reason) out.push({ k: "razón", v: String(md.reason) });

  return out.slice(0, 5);
}

export function buildHumanLine(ev: AdminAuditEvent) {
  const md = ev.meta ?? {};

  const actor =
    ev.actorRole === "ADMIN"
      ? "Admin"
      : ev.actorRole === "COORDINATOR"
      ? "Coordinador"
      : ev.actorRole === "LEADER"
      ? "Líder"
      : "Usuario";

  const target =
    ev.entityType === "USER"
      ? md.email
        ? `usuario ${md.email}`
        : "un usuario"
      : ev.entityType === "EVALUATION" || ev.entityType === "TEACHER_EVALUATION"
      ? md.candidateName
        ? `evaluación de ${md.candidateName}`
        : "una evaluación"
      : ev.entityType === "TEACHER_CANDIDATE"
      ? md.candidateName
        ? `candidato ${md.candidateName}`
        : "un candidato"
      : ev.entityType === "CANDIDATE_DOCUMENT"
      ? md.fileName
        ? `documento ${md.fileName}`
        : "un documento"
      : ev.entityType === "HIRING_REQUEST"
      ? md.positionName
        ? `solicitud ${md.positionName}`
        : "una solicitud"
      : "el sistema";

  switch (ev.action) {
    case "USER_CREATED":
      return `${actor} creó ${target}.`;
    case "USER_UPDATED":
      return `${actor} actualizó ${target}.`;
    case "USER_ACTIVATED":
      return `${actor} activó ${target}.`;
    case "USER_DEACTIVATED":
      return `${actor} desactivó ${target}.`;
    case "COORDINATOR_DECISION_SAVED":
    case "COORDINATOR_DECISION_CREATED":
      return `Coordinador registró decisión en ${target}.`;
    case "COORDINATOR_DECISION_UPDATED":
      return `Coordinador actualizó su decisión en ${target}.`;
    case "ADMIN_DECISION_SAVED":
      return `Admin registró decisión (legacy) en ${target}.`;
    case "ADMIN_DECISION_BLOCKED":
      return `Intento de decisión admin bloqueado en ${target}.`;
    case "CANDIDATE_CREATED":
      return `${actor} creó ${target}.`;
    case "CANDIDATE_UPDATED":
      return `${actor} actualizó ${target}.`;
    case "EVALUATION_SUBMITTED":
      return `${actor} envió ${target} con análisis IA.`;
    case "EVALUATION_UPDATED":
      return `${actor} actualizó ${target}.`;
    case "EVALUATION_HIRING_REQUEST_ASSOCIATED":
      return `${actor} vinculó ${target} a solicitud.`;
    case "INTERVIEW_CREATED":
      return `${actor} creó entrevista para ${target}.`;
    case "DOCUMENT_UPLOADED":
      return `${actor} subió ${target}.`;
    case "DOCUMENT_LINK_REGISTERED":
      return `${actor} registró link para ${target}.`;
    case "RESUME_MARKED_PRIMARY":
      return `${actor} marcó hoja de vida principal en ${target}.`;
    case "EVALUATION_REPORT_ATTACHED":
      return `${actor} adjuntó reporte a ${target}.`;
    case "HIRING_REQUEST_CREATED":
      return `${actor} creó ${target}.`;
    case "HIRING_REQUEST_UPDATED":
      return `${actor} actualizó ${target}.`;
    default:
      return `${actor} realizó "${actionLabel(ev.action)}" sobre ${target}.`;
  }
}
