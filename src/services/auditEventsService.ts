import api from "./apiClient";
import type { AdminAuditEntityType, AdminAuditEvent } from "../pages/admin/adminTypes";

type AuditEventApi = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorUserId: string | null;
  actorRole: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
};

function normalizeEntityType(v?: string | null): AdminAuditEntityType {
  const t = String(v ?? "").toUpperCase();
  if (t.includes("EVALUATION")) return "EVALUATION";
  if (t.includes("USER")) return "USER";
  return "SYSTEM";
}

export async function listAuditEvents(params?: {
  entityType?: AdminAuditEntityType;
  entityId?: string;
  limit?: number;
}): Promise<AdminAuditEvent[]> {
  const query: Record<string, string | number> = {
    limit: params?.limit ?? 200,
  };

  if (params?.entityType) query.entityType = params.entityType;
  if (params?.entityId) query.entityId = params.entityId;

  const { data } = await api.get<AuditEventApi[]>("/audit-events", { params: query });
  const rows = Array.isArray(data) ? data : [];

  return rows.map((r) => ({
    id: r.id,
    entityType: normalizeEntityType(r.entityType),
    entityId: r.entityId ?? "GLOBAL",
    action: (r.action ?? "SETTINGS_UPDATED") as any,
    actorUserId: r.actorUserId ?? "system",
    actorRole: (String(r.actorRole ?? "ADMIN").toUpperCase() === "COORDINADOR"
      ? "COORDINATOR"
      : String(r.actorRole ?? "ADMIN").toUpperCase() === "LIDER"
      ? "LEADER"
      : "ADMIN") as any,
    at: r.createdAt,
    meta: r.metadata ?? {},
  }));
}
