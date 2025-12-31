// src/pages/admin/components/audit/mock/auditMockData.ts
import type { AdminAuditEvent } from "../../../adminTypes";

const nowMinus = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();

export const auditMockEvents: AdminAuditEvent[] = [
  {
    id: "ev-0001",
    at: nowMinus(5),
    entityType: "USER",
    entityId: "u-100",
    action: "USER_CREATED",
    actorUserId: "u-admin-1",
    actorRole: "ADMIN",
    meta: {
      email: "nuevo.usuario@cun.edu.co",
      role: "COORDINATOR",
      source: "AdminConsole",
    },
  },
  {
    id: "ev-0002",
    at: nowMinus(12),
    entityType: "USER",
    entityId: "u-100",
    action: "USER_UPDATED",
    actorUserId: "u-admin-1",
    actorRole: "ADMIN",
    meta: {
      email: "nuevo.usuario@cun.edu.co",
      status: "ACTIVE",
      source: "AdminConsole",
    },
  },
  {
    id: "ev-0003",
    at: nowMinus(25),
    entityType: "EVALUATION",
    entityId: "eval-700cb5b7",
    action: "COORDINATOR_DECISION_SAVED",
    actorUserId: "u-coord-1",
    actorRole: "COORDINATOR",
    meta: {
      candidateName: "María Pérez",
      status: "RECOMMENDED",
      score: 82,
      source: "CoordinatorConsole",
    },
  },
  {
    id: "ev-0004",
    at: nowMinus(33),
    entityType: "EVALUATION",
    entityId: "eval-5c792e6a",
    action: "COORDINATOR_DECISION_SAVED",
    actorUserId: "u-coord-2",
    actorRole: "COORDINATOR",
    meta: {
      candidateName: "Juan Díaz",
      status: "NOT_RECOMMENDED",
      score: 48,
      source: "CoordinatorConsole",
    },
  },
  {
    id: "ev-0005",
    at: nowMinus(55),
    entityType: "EVALUATION",
    entityId: "eval-5c792e6a",
    action: "ADMIN_DECISION_SAVED",
    actorUserId: "u-admin-1",
    actorRole: "ADMIN",
    meta: {
      candidateName: "Juan Díaz",
      status: "NOT_RECOMMENDED",
      source: "AdminConsole",
    },
  },

  // ❌ Este NO debería mostrarse si ya lo estás ocultando (DETAIL_VIEWED)
  {
    id: "ev-0006",
    at: nowMinus(65),
    entityType: "EVALUATION",
    entityId: "eval-5c792e6a",
    action: "DETAIL_VIEWED",
    actorUserId: "u-admin-1",
    actorRole: "ADMIN",
    meta: {
      candidateName: "Juan Díaz",
      source: "AdminConsole",
    },
  },
];
