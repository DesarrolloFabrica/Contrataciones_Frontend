// src/pages/admin/hooks/useAdminUsers.ts
import { useEffect, useMemo, useState } from "react";
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from "../adminTypes";
import { adminMockDb } from "../utils/adminMockDb";

type RoleFilter = AdminUserRole | "ALL";
type StatusFilter = AdminUserStatus | "ALL";

type ScopeArgs = {
  selectedSchool: string | null;
  selectedProgram: string | null;
};

const norm = (v: any) => String(v ?? "").trim().toLowerCase();

// ⚠️ AdminUser probablemente no tiene school/program aún.
// Igual lo dejamos future-proof por si luego lo agregas desde backend.
const pickUserSchool = (u: any) =>
  u?.schoolName ?? u?.school ?? u?.schoolNameSnapshot ?? "";

const pickUserProgram = (u: any) =>
  u?.programName ?? u?.program ?? u?.programNameSnapshot ?? "";

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

  // ✅ Load users (mockdb)
  useEffect(() => {
    let alive = true;

    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminMockDb.listUsers();
        if (!alive) return;
        setUsers(data ?? []);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("No se pudo cargar la lista de usuarios.");
        setUsers([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    loadUsers();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ Scope filter
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

  // ✅ Filters + search
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

  // ✅ Metrics
  const metrics = useMemo(() => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter((u: any) => u.status === "ACTIVE").length;
    const inactive = filteredUsers.filter((u: any) => u.status === "INACTIVE").length;

    const leaders = filteredUsers.filter((u: any) => u.role === "LEADER").length;
    const coordinators = filteredUsers.filter((u: any) => u.role === "COORDINATOR").length;
    const admins = filteredUsers.filter((u: any) => u.role === "ADMIN").length;

    return { total, active, inactive, leaders, coordinators, admins };
  }, [filteredUsers]);

  // ✅ Actions (mockdb)
  const createUser = async (dto: CreateAdminUserDto) => {
    const res = await adminMockDb.createUser(dto);
    const next = await adminMockDb.listUsers();
    setUsers(next ?? []);

    if (res?.password?.temporaryPassword && res?.user?.email) {
      setLastCreatedCredentials({
        email: res.user.email,
        tempPassword: res.password.temporaryPassword,
      });
    }
  };

  const updateUser = async (userId: string, dto: UpdateAdminUserDto) => {
    await adminMockDb.updateUser(userId, dto);
    const next = await adminMockDb.listUsers();
    setUsers(next ?? []);
  };

  const toggleActive = async (userId: string) => {
    await adminMockDb.toggleUserActive(userId);
    const next = await adminMockDb.listUsers();
    setUsers(next ?? []);
  };

  const resetPassword = async (userId: string) => {
    const res = await adminMockDb.resetPassword(userId);
    const next = await adminMockDb.listUsers();
    setUsers(next ?? []);

    if (res?.temporaryPassword) {
      const u = (next ?? []).find((x) => x.id === userId);
      if (u?.email) {
        setLastCreatedCredentials({ email: u.email, tempPassword: res.temporaryPassword });
      }
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
