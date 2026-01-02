// src/pages/admin/utils/adminMockDb.ts

import type {
  AdminAuditAction,
  AdminAuditEntityType,
  AdminAuditEvent,
  AdminUser,
  AdminUserStatus,
  CreateAdminUserDto,
  ResetPasswordResult,
  UpdateAdminUserDto,
} from "../adminTypes";

const LS_KEY = "ADMIN_MOCK_DB_V1";
const SCOPE_KEY = "ADMIN_SCOPE_V1";

type AdminScope = {
  selectedSchool: string | null; // null => sin seleccionar
  selectedProgram: string | null; // null => sin seleccionar
  search: string;
};

function scopeDefault(): AdminScope {
  return { selectedSchool: null, selectedProgram: null, search: "" };
}

type MockDb = {
  users: AdminUser[];
  audit: AdminAuditEvent[];
  ui: {
    adminScope: AdminScope;
  };
};

const nowIso = () => new Date().toISOString();

const uid = () =>
  Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);

const seed: MockDb = {
  users: [
    {
      id: "u-admin-1",
      name: "Admin",
      lastName: "Global",
      email: "admin@cun.edu.co",
      cedula: null,
      role: "ADMIN",
      status: "ACTIVE",
      mustChangePassword: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "u-coord-1",
      name: "Camilo",
      lastName: "Rojas",
      email: "camilo.rojas@cun.edu.co",
      cedula: "1010101010",
      role: "COORDINATOR",
      status: "ACTIVE",
      mustChangePassword: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "u-coord-2",
      name: "Sebastián",
      lastName: "Montes",
      email: "sebastian.montes@cun.edu.co",
      cedula: "2020202020",
      role: "COORDINATOR",
      status: "ACTIVE",
      mustChangePassword: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ],
  audit: [],
  ui: {
    adminScope: scopeDefault(),
  },
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const load = (): MockDb => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return clone(seed);
    const parsed = JSON.parse(raw) as MockDb;

    // ✅ backward-safe
    if (!parsed.ui) parsed.ui = { adminScope: scopeDefault() };
    if (!parsed.ui.adminScope) parsed.ui.adminScope = scopeDefault();
    if (!parsed.audit) parsed.audit = [];
    if (!parsed.users) parsed.users = [];

    return parsed;
  } catch {
    return clone(seed);
  }
};

const save = (db: MockDb) => {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
};

const addAudit = (db: MockDb, ev: Omit<AdminAuditEvent, "id">) => {
  db.audit.unshift({ id: uid(), ...ev });
};

function genTempPassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const adminMockDb = {
  // -------------------------
  // SCOPE (persistencia UI admin)
  // -------------------------
  getAdminScope(): AdminScope {
    try {
      const raw = localStorage.getItem(SCOPE_KEY);
      if (!raw) return scopeDefault();
      const parsed = JSON.parse(raw) as Partial<AdminScope>;
      return {
        selectedSchool: parsed.selectedSchool ?? null,
        selectedProgram: parsed.selectedProgram ?? null,
        search: parsed.search ?? "",
      };
    } catch {
      return scopeDefault();
    }
  },

  setAdminScope(next: Partial<AdminScope>, actorUserId = "u-admin-1"): AdminScope {
    const cur = this.getAdminScope();

    const safe: AdminScope = {
      selectedSchool: next.selectedSchool ?? cur.selectedSchool ?? null,
      selectedProgram: next.selectedProgram ?? cur.selectedProgram ?? null,
      search: next.search ?? cur.search ?? "",
    };

    // ✅ 1) Persistimos scope “rápido” (solo UI)
    localStorage.setItem(SCOPE_KEY, JSON.stringify(safe));

    // ✅ 2) También lo guardamos en la DB mock
    const db = load();
    db.ui.adminScope = safe;

    // ✅ 3) Audit opcional de settings
    addAudit(db, {
      entityType: "SYSTEM",
      entityId: "SYSTEM",
      action: "SETTINGS_UPDATED" as AdminAuditAction,
      actorUserId,
      actorRole: "ADMIN",
      at: nowIso(),
      meta: { adminScope: safe },
    });

    save(db);
    return safe;
  },

  clearAdminScope(actorUserId = "u-admin-1"): void {
    localStorage.removeItem(SCOPE_KEY);

    const db = load();
    db.ui.adminScope = scopeDefault();

    addAudit(db, {
      entityType: "SYSTEM",
      entityId: "SYSTEM",
      action: "SETTINGS_UPDATED" as AdminAuditAction,
      actorUserId,
      actorRole: "ADMIN",
      at: nowIso(),
      meta: { adminScope: db.ui.adminScope, cleared: true },
    });

    save(db);
  },

  // -------------------------
  // USERS
  // -------------------------
  getUsers(): AdminUser[] {
    return load().users;
  },

  listUsers(): Promise<AdminUser[]> {
    return Promise.resolve(load().users);
  },

  createUser(
    dto: CreateAdminUserDto,
    actorUserId = "u-admin-1"
  ): Promise<{ user: AdminUser; password?: ResetPasswordResult }> {
    const db = load();

    const user: AdminUser = {
      id: uid(),
      name: dto.name.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim().toLowerCase(),
      cedula: dto.cedula?.trim() || null,
      role: dto.role,
      status: "ACTIVE",
      mustChangePassword: dto.mustChangePassword ?? true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    db.users.unshift(user);

    addAudit(db, {
      entityType: "USER",
      entityId: user.id,
      action: "USER_CREATED",
      actorUserId,
      actorRole: "ADMIN",
      at: nowIso(),
      meta: { email: user.email, role: user.role },
    });

    const password: ResetPasswordResult | undefined = dto.generatePassword
      ? { userId: user.id, temporaryPassword: genTempPassword() }
      : undefined;

    if (password) {
      addAudit(db, {
        entityType: "USER",
        entityId: user.id,
        action: "PASSWORD_RESET",
        actorUserId,
        actorRole: "ADMIN",
        at: nowIso(),
        meta: { reason: "AUTO_ON_CREATE" },
      });
    }

    save(db);
    return Promise.resolve({ user, password });
  },

  updateUser(
    userId: string,
    dto: UpdateAdminUserDto,
    actorUserId = "u-admin-1"
  ): Promise<AdminUser> {
    const db = load();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found");

    db.users[idx] = {
      ...db.users[idx],
      ...dto,
      cedula:
        dto.cedula !== undefined
          ? dto.cedula?.trim() || null
          : db.users[idx].cedula,
      updatedAt: nowIso(),
    };

    addAudit(db, {
      entityType: "USER",
      entityId: userId,
      action: "USER_UPDATED",
      actorUserId,
      actorRole: "ADMIN",
      at: nowIso(),
      meta: dto,
    });

    save(db);
    return Promise.resolve(db.users[idx]);
  },

  toggleUserActive(
    userId: string,
    actorUserId = "u-admin-1"
  ): Promise<AdminUser> {
    const db = load();
    const u = db.users.find((x) => x.id === userId);
    if (!u) throw new Error("User not found");

    const next: AdminUserStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    u.status = next;
    u.updatedAt = nowIso();

    addAudit(db, {
      entityType: "USER",
      entityId: userId,
      action: "USER_TOGGLED",
      actorUserId,
      actorRole: "ADMIN",
      at: nowIso(),
      meta: { status: next },
    });

    save(db);
    return Promise.resolve(u);
  },

  resetPassword(
    userId: string,
    actorUserId = "u-admin-1"
  ): Promise<ResetPasswordResult> {
    const db = load();
    const u = db.users.find((x) => x.id === userId);
    if (!u) throw new Error("User not found");

    u.mustChangePassword = true;
    u.updatedAt = nowIso();

    const res: ResetPasswordResult = {
      userId,
      temporaryPassword: genTempPassword(),
    };

    addAudit(db, {
      entityType: "USER",
      entityId: userId,
      action: "PASSWORD_RESET",
      actorUserId,
      actorRole: "ADMIN",
      at: nowIso(),
      meta: { email: u.email },
    });

    save(db);
    return Promise.resolve(res);
  },

  // -------------------------
  // AUDIT
  // -------------------------
  logEvent(ev: Omit<AdminAuditEvent, "id">): void {
    const db = load();
    addAudit(db, ev);
    save(db);
  },

  listAudit(
    entityType?: AdminAuditEntityType,
    entityId?: string
  ): Promise<AdminAuditEvent[]> {
    const db = load();
    let a = db.audit;

    if (entityType) a = a.filter((x) => x.entityType === entityType);
    if (entityId) a = a.filter((x) => x.entityId === entityId);

    return Promise.resolve(a);
  },

  listAuditGlobal(entityType?: AdminAuditEntityType): Promise<AdminAuditEvent[]> {
    const db = load();
    const all = db.audit ?? [];
    const filtered = entityType ? all.filter((x) => x.entityType === entityType) : all;
    return Promise.resolve(filtered);
  },

  // -------------------------
  // HELPERS
  // -------------------------
  logSystemEvent(
    action: AdminAuditAction,
    meta?: Record<string, any>,
    actorUserId = "u-admin-1"
  ): void {
    this.logEvent({
      entityType: "SYSTEM",
      entityId: "SYSTEM",
      action,
      actorUserId,
      actorRole: "ADMIN",
      at: nowIso(),
      meta,
    });
  },

  logUserEvent(
    userId: string,
    action: Extract<
      AdminAuditAction,
      "USER_CREATED" | "USER_UPDATED" | "USER_TOGGLED" | "PASSWORD_RESET"
    >,
    meta?: Record<string, any>,
    actorUserId = "u-admin-1"
  ): void {
    this.logEvent({
      entityType: "USER",
      entityId: userId,
      action,
      actorUserId,
      actorRole: "ADMIN",
      at: nowIso(),
      meta,
    });
  },

  logEvaluationEvent(
    evaluationId: string,
    action: Extract<AdminAuditAction, "DETAIL_VIEWED" | "PDF_EXPORTED">,
    meta?: Record<string, any>,
    actorUserId = "u-admin-1"
  ): void {
    this.logEvent({
      entityType: "EVALUATION",
      entityId: evaluationId,
      action,
      actorUserId,
      actorRole: "ADMIN",
      at: nowIso(),
      meta,
    });
  },

  addSystemAudit(params: {
    action: AdminAuditAction;
    meta?: Record<string, any>;
    actorUserId?: string;
  }): Promise<true> {
    this.logSystemEvent(params.action, params.meta, params.actorUserId ?? "u-admin-1");
    return Promise.resolve(true);
  },

  addUserAudit(params: {
    userId: string;
    action: Extract<
      AdminAuditAction,
      "USER_CREATED" | "USER_UPDATED" | "USER_TOGGLED" | "PASSWORD_RESET"
    >;
    meta?: Record<string, any>;
    actorUserId?: string;
  }): Promise<true> {
    this.logUserEvent(params.userId, params.action, params.meta, params.actorUserId ?? "u-admin-1");
    return Promise.resolve(true);
  },

  addEvaluationAudit(params: {
    evaluationId: string;
    action: Extract<AdminAuditAction, "DETAIL_VIEWED" | "PDF_EXPORTED">;
    meta?: Record<string, any>;
    actorUserId?: string;
  }): Promise<true> {
    this.logEvaluationEvent(
      params.evaluationId,
      params.action,
      params.meta,
      params.actorUserId ?? "u-admin-1"
    );
    return Promise.resolve(true);
  },


    // -------------------------
  // ALIASES (compatibilidad con hooks antiguos)
  // -------------------------
  getAdminUsers(): Promise<AdminUser[]> {
    return this.listUsers();
  },

  listAdminUsers(): Promise<AdminUser[]> {
    return this.listUsers();
  },

  createAdminUser(
    dto: CreateAdminUserDto,
    actorUserId = "u-admin-1"
  ): Promise<{ user: AdminUser; password?: ResetPasswordResult }> {
    return this.createUser(dto, actorUserId);
  },

  updateAdminUser(
    userId: string,
    dto: UpdateAdminUserDto,
    actorUserId = "u-admin-1"
  ): Promise<AdminUser> {
    return this.updateUser(userId, dto, actorUserId);
  },

  toggleAdminUserActive(
    userId: string,
    actorUserId = "u-admin-1"
  ): Promise<AdminUser> {
    return this.toggleUserActive(userId, actorUserId);
  },

  resetAdminUserPassword(
    userId: string,
    actorUserId = "u-admin-1"
  ): Promise<ResetPasswordResult> {
    return this.resetPassword(userId, actorUserId);
  },

};
