// src/pages/admin/hooks/useAdminUsers.ts
import { useEffect, useMemo, useState } from "react";
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from "../adminTypes";

import {
  usersService,
  type BackendUser,
  type BackendRole,
} from "../../../services/usersService";

type RoleFilter = AdminUserRole | "ALL";
type StatusFilter = AdminUserStatus | "ALL";

type ScopeArgs = {
  selectedSchool: string | null;
  selectedProgram: string | null;
};

const norm = (v: any) => String(v ?? "").trim().toLowerCase();

const pickUserSchool = (u: any) =>
  u?.school?.name ?? u?.schoolName ?? u?.school ?? u?.schoolNameSnapshot ?? "";

const pickUserProgram = (u: any) =>
  u?.programName ?? u?.program ?? u?.programNameSnapshot ?? "";

// UI role -> Backend role (tu backend usa ES)
function uiRoleToBackend(role: AdminUserRole): BackendRole {
  if (role === "ADMIN") return "ADMIN";
  if (role === "COORDINATOR") return "COORDINADOR";
  return "LIDER";
}

// Helpers para fechas seguras (por si backend no las manda)
function toIso(v: any) {
  if (!v) return new Date().toISOString();
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// BackendUser -> AdminUser (para el panel)
function backendToAdminUser(b: BackendUser): AdminUser {
const full = String((b as any).fullName ?? "").trim();
  const parts = full ? full.split(/\s+/) : [];
  const name = parts.shift() ?? "";
  const lastName = parts.join(" ");

  const roleUi: AdminUserRole =
    b.role === "ADMIN"
      ? "ADMIN"
      : b.role === "COORDINADOR"
      ? "COORDINATOR"
      : "LEADER";

  const isActive = (b as any).isActive !== false;
  const statusUi: AdminUserStatus = isActive ? "ACTIVE" : "INACTIVE";

  const mustChangePassword = Boolean((b as any).mustResetPassword);

  // ✅ Solo propiedades "válidas" en AdminUser (según tu TS actual)
  const u = {
    id: b.id,
    email: b.email,
    name,
    lastName,
    cedula: "",
    role: roleUi,
    status: statusUi,
    mustChangePassword,
    createdAt: toIso((b as any).createdAt),
    updatedAt: toIso((b as any).updatedAt),
  } as AdminUser;

  // ✅ Si quieres seguir teniendo estos campos para UI/búsqueda sin tocar adminTypes:
  (u as any).schoolName = pickUserSchool(b);
  (u as any).programName = pickUserProgram(b);
  
  return u;
}

function buildFullName(dto: any) {
  const fullName =
    dto.fullName ??
    [dto.name, dto.lastName].filter(Boolean).join(" ") ??
    [dto.nombres, dto.apellidos].filter(Boolean).join(" ");
  return String(fullName || "").trim().replace(/\s+/g, " ");
}

export function useAdminUsers(scope: ScopeArgs) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);

  const clearCredentials = () => setLastCreatedCredentials(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const backendUsers = await usersService.list();
      const mapped = (backendUsers ?? []).map(backendToAdminUser);
      setUsers(mapped);
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo cargar la lista de usuarios.";
      setError(msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await loadUsers();
    })();

    return () => {
      alive = false;
    };
  }, [scope.selectedSchool, scope.selectedProgram]);

  // Scope filter
  const scopedUsers = useMemo(() => {
    let base = [...(users ?? [])];

    if (scope.selectedSchool) {
      const s = norm(scope.selectedSchool);
      base = base.filter((u: any) => {
        const us = norm(pickUserSchool(u));
        return !us || us === s;
      });
    }

    if (scope.selectedSchool && scope.selectedProgram) {
      const p = norm(scope.selectedProgram);
      base = base.filter((u: any) => {
        const up = norm(pickUserProgram(u));
        return !up || up === p;
      });
    }

    return base;
  }, [users, scope.selectedSchool, scope.selectedProgram]);

  // Filters + search
  const filteredUsers = useMemo(() => {
    let base = [...scopedUsers];

    if (roleFilter !== "ALL") base = base.filter((u: any) => u.role === roleFilter);
    if (statusFilter !== "ALL") base = base.filter((u: any) => u.status === statusFilter);

    const q = norm(search);
    if (q) {
      base = base.filter((u: any) => {
        const blob = [
          u?.name,
          u?.lastName,
          u?.email,
          u?.cedula,
          u?.role,
          u?.status,
          pickUserSchool(u),
          pickUserProgram(u),
          u?.id,
        ]
          .filter(Boolean)
          .map(norm)
          .join(" ");
        return blob.includes(q);
      });
    }

    return base;
  }, [scopedUsers, roleFilter, statusFilter, search]);

  // Metrics
  const metrics = useMemo(() => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter((u: any) => u.status === "ACTIVE").length;
    const inactive = filteredUsers.filter((u: any) => u.status === "INACTIVE").length;

    const leaders = filteredUsers.filter((u: any) => u.role === "LEADER").length;
    const coordinators = filteredUsers.filter((u: any) => u.role === "COORDINATOR").length;
    const admins = filteredUsers.filter((u: any) => u.role === "ADMIN").length;

    return { total, active, inactive, leaders, coordinators, admins };
  }, [filteredUsers]);

  // Actions (backend real)
  const createUser = async (dto: CreateAdminUserDto) => {
    clearCredentials();

    const fullName = buildFullName(dto);
    const email = String((dto as any).email || "").trim();

    const uiRole = (dto as any).role as AdminUserRole;
    const backendRole = uiRoleToBackend(uiRole);

    // UI: mustChangePassword  -> Backend: mustResetPassword
    const mustChangePassword = Boolean(
      (dto as any).mustChangePassword ??
        (dto as any).mustResetPassword ??
        (dto as any).forceResetPassword ??
        true
    );

    const generatePassword = Boolean((dto as any).generatePassword ?? true);
    const password = (dto as any).password;

    const schoolId = (dto as any).schoolId ?? null;

    const res = await usersService.create({
      email,
      fullName,
      role: backendRole,
      schoolId,
      mustResetPassword: mustChangePassword,
      generatePassword,
      password,
      isActive: true,
    });

    await loadUsers();

    const temp =
      (res as any)?.password?.temporaryPassword ||
      (res as any)?.generatedPassword ||
      (res as any)?.temporaryPassword;

    if (temp && email) {
      setLastCreatedCredentials({ email, tempPassword: String(temp) });
    }
  };

  const updateUser = async (userId: string, dto: UpdateAdminUserDto) => {
    const payload: any = {};

    if ((dto as any).email) payload.email = String((dto as any).email).trim();
    const fullName = buildFullName(dto);
    if (fullName) payload.fullName = fullName;

    if ((dto as any).role) payload.role = uiRoleToBackend((dto as any).role);

    if ((dto as any).status === "ACTIVE") payload.isActive = true;
    if ((dto as any).status === "INACTIVE") payload.isActive = false;

    // UI mustChangePassword -> backend mustResetPassword
    if ((dto as any).mustChangePassword !== undefined) {
      payload.mustResetPassword = Boolean((dto as any).mustChangePassword);
    } else if ((dto as any).mustResetPassword !== undefined) {
      payload.mustResetPassword = Boolean((dto as any).mustResetPassword);
    }

    if ((dto as any).schoolId !== undefined) payload.schoolId = (dto as any).schoolId;

    await usersService.update(userId, payload);
    await loadUsers();
  };

  const toggleActive = async (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (!u) return;

    const nextActive = u.status !== "ACTIVE";
    await usersService.setActive(userId, nextActive);
    await loadUsers();
  };

  const resetPassword = async (userId: string) => {
    clearCredentials();

    const res = await usersService.resetPassword(userId);
    await loadUsers();

    const temp =
      (res as any)?.password?.temporaryPassword ||
      (res as any)?.temporaryPassword ||
      (res as any)?.generatedPassword ||
      (res as any)?.tempPassword;

    const u = users.find((x) => x.id === userId);
    if (temp && u?.email) {
      setLastCreatedCredentials({ email: u.email, tempPassword: String(temp) });
    }
  };

  const openEdit = (u: AdminUser) => setEditUser(u);

  return {
    users,
    filteredUsers,
    loading,
    error,

    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,

    metrics,

    editUser,
    openEdit,
    setEditUser,

    createUser,
    updateUser,
    toggleActive,
    resetPassword,

    lastCreatedCredentials,
    clearCredentials,
  };
}
