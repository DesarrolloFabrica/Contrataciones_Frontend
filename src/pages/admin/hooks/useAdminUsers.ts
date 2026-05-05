// src/pages/admin/hooks/useAdminUsers.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function uiRoleToBackend(role: AdminUserRole): BackendRole {
  if (role === "ADMIN") return "ADMIN";
  if (role === "COORDINATOR") return "COORDINADOR";
  return "LIDER";
}

function toIso(v: any) {
  if (!v) return new Date().toISOString();
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

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

  const u = {
    id: b.id,
    email: b.email,
    name,
    lastName,
    cedula: String((b as any).cedula ?? ""),
    role: roleUi,
    status: statusUi,
    createdAt: toIso((b as any).createdAt),
    updatedAt: toIso((b as any).updatedAt),
  } as AdminUser;

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
  const selectedSchool = scope?.selectedSchool ?? null;
  const selectedProgram = scope?.selectedProgram ?? null;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const inFlightRef = useRef(false);

  const loadUsers = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

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
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await loadUsers();
    })();
    return () => {
      alive = false;
    };
  }, [loadUsers]);

  const scopedUsers = useMemo(() => {
    let base = [...(users ?? [])];

    if (selectedSchool) {
      const s = norm(selectedSchool);
      base = base.filter((u: any) => {
        const us = norm(pickUserSchool(u));
        return !us || us === s;
      });
    }

    if (selectedSchool && selectedProgram) {
      const p = norm(selectedProgram);
      base = base.filter((u: any) => {
        const up = norm(pickUserProgram(u));
        return !up || up === p;
      });
    }

    return base;
  }, [users, selectedSchool, selectedProgram]);

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

  const metrics = useMemo(() => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter((u: any) => u.status === "ACTIVE").length;
    const inactive = filteredUsers.filter((u: any) => u.status === "INACTIVE").length;

    const leaders = filteredUsers.filter((u: any) => u.role === "LEADER").length;
    const coordinators = filteredUsers.filter((u: any) => u.role === "COORDINATOR").length;
    const admins = filteredUsers.filter((u: any) => u.role === "ADMIN").length;

    return { total, active, inactive, leaders, coordinators, admins };
  }, [filteredUsers]);

  const createUser = useCallback(
    async (dto: CreateAdminUserDto): Promise<void> => {
      const fullName = buildFullName(dto);
      const email = String((dto as any).email || "").trim();
      const uiRole = (dto as any).role as AdminUserRole;
      const backendRole = uiRoleToBackend(uiRole);
      const schoolId = (dto as any).schoolId ?? null;

      await usersService.create({
        email,
        fullName,
        role: backendRole,
        schoolId,
        isActive: true,
      } as any);

      await loadUsers();
    },
    [loadUsers]
  );

  const updateUser = useCallback(
    async (userId: string, dto: UpdateAdminUserDto) => {
      const payload: any = {};

      if ((dto as any).email) payload.email = String((dto as any).email).trim();
      const fullName = buildFullName(dto);
      if (fullName) payload.fullName = fullName;

      if ((dto as any).role) payload.role = uiRoleToBackend((dto as any).role);

      if ((dto as any).status === "ACTIVE") payload.isActive = true;
      if ((dto as any).status === "INACTIVE") payload.isActive = false;

      if ((dto as any).schoolId !== undefined) payload.schoolId = (dto as any).schoolId;
      if ((dto as any).cedula !== undefined) payload.cedula = String((dto as any).cedula).trim();

      await usersService.update(userId, payload);
      await loadUsers();
    },
    [loadUsers]
  );

  const toggleActive = useCallback(
    async (userId: string) => {
      const u = users.find((x) => x.id === userId);
      if (!u) return { ok: false };

      const nextActive = u.status !== "ACTIVE";
      await usersService.setActive(userId, nextActive);
      await loadUsers();
      return { ok: true };
    },
    [users, loadUsers]
  );

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

    reload: loadUsers,
  };
}
