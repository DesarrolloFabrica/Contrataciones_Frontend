// src/pages/admin/hooks/useAdminUsers.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AdminUser,
  AdminUserStatus,
  AdminUserRole,
  CreateAdminUserDto,
  UpdateAdminUserDto,
  ResetPasswordResult,
  AdminAuditAction,
} from "../adminTypes";
import { adminMockDb } from "../utils/adminMockDb";

type StatusFilter = "ALL" | AdminUserStatus;

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const safeTrim = (s?: string | null) => (s ?? "").trim();

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

/**
 * ✅ ÚNICO punto para auditoría del sistema
 * Soporta ambas firmas (logSystemEvent / addSystemAudit)
 */
async function auditSystem(action: AdminAuditAction, meta: Record<string, any>) {
  try {
    if ((adminMockDb as any).logSystemEvent) {
      (adminMockDb as any).logSystemEvent(action, meta);
      return;
    }
    if ((adminMockDb as any).addSystemAudit) {
      await (adminMockDb as any).addSystemAudit({ action, meta });
      return;
    }
  } catch (e) {
    // No bloquea UI si falla auditoría (mock)
    console.warn("Audit system failed:", e);
  }
}

export function useAdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | "ALL">("ALL");

  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await adminMockDb.listUsers();
      const sorted = [...list].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
      setUsers(sorted);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el módulo de usuarios.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    let base = [...users];

    if (roleFilter !== "ALL") base = base.filter((u) => u.role === roleFilter);
    if (statusFilter !== "ALL")
      base = base.filter((u) => u.status === statusFilter);

    const q = search.trim().toLowerCase();
    if (q) {
      base = base.filter((u) => {
        const name = `${u.name} ${u.lastName}`.toLowerCase();
        const email = u.email.toLowerCase();
        const ced = (u.cedula ?? "").toLowerCase();
        return name.includes(q) || email.includes(q) || ced.includes(q);
      });
    }

    return base;
  }, [users, search, statusFilter, roleFilter]);

  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const inactive = total - active;
    const coordinators = users.filter((u) => u.role === "COORDINATOR").length;
    return { total, active, inactive, coordinators };
  }, [users]);

  const createUser = useCallback(
    async (dto: CreateAdminUserDto) => {
      setError(null);

      const email = normalizeEmail(dto.email);

      // ✅ validaciones claras
      if (!safeTrim(dto.name) || !safeTrim(dto.lastName)) {
        setError("Nombre y apellido son obligatorios.");
        return { ok: false as const };
      }
      if (!isValidEmail(email)) {
        setError("El correo no es válido.");
        return { ok: false as const };
      }
      if (users.some((u) => normalizeEmail(u.email) === email)) {
        setError("Ya existe un usuario con ese correo.");
        return { ok: false as const };
      }

      if (!dto.generatePassword) {
        const p = dto.password ?? "";
        if (p.trim().length < 8) {
          setError("La contraseña debe tener al menos 8 caracteres.");
          return { ok: false as const };
        }
      }

      try {
        const res = await adminMockDb.createUser({
          ...dto,
          email,
          name: safeTrim(dto.name),
          lastName: safeTrim(dto.lastName),
          cedula: dto.cedula ? safeTrim(dto.cedula) : null,
          password: dto.generatePassword ? undefined : dto.password,
        });

        await load();

        // ✅ la contraseña que mostramos una sola vez
        const passwordToShow = dto.generatePassword
          ? res.password?.temporaryPassword || ""
          : dto.password ?? "";

        setLastCreatedCredentials({ email, password: passwordToShow });

        await auditSystem("USER_CREATED", {
          email,
          role: dto.role,
          generated: dto.generatePassword,
        });

        return {
          ok: true as const,
          user: res.user,
          password: passwordToShow,
        };
      } catch (e) {
        console.error(e);
        setError("No se pudo crear el usuario.");
        return { ok: false as const };
      }
    },
    [users, load]
  );

  const updateUser = useCallback(
    async (id: string, patch: UpdateAdminUserDto) => {
      setError(null);
      try {
        await adminMockDb.updateUser(id, {
          ...patch,
          cedula:
            patch.cedula === undefined
              ? undefined
              : patch.cedula?.trim() || null,
        });

        await load();

        await auditSystem("USER_UPDATED", { userId: id, patch });

        return { ok: true as const };
      } catch (e) {
        console.error(e);
        setError("No se pudo actualizar el usuario.");
        return { ok: false as const };
      }
    },
    [load]
  );

  const toggleActive = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const updated = await adminMockDb.toggleUserActive(id);
        await load();

        await auditSystem("USER_TOGGLED", { userId: id, status: updated.status });

        return { ok: true as const };
      } catch (e) {
        console.error(e);
        setError("No se pudo cambiar el estado del usuario.");
        return { ok: false as const };
      }
    },
    [load]
  );

  const resetPassword = useCallback(
    async (id: string): Promise<ResetPasswordResult | null> => {
      setError(null);
      try {
        const res = await adminMockDb.resetPassword(id);
        await load();

        await auditSystem("PASSWORD_RESET", { userId: id });

        return res;
      } catch (e) {
        console.error(e);
        setError("No se pudo resetear la contraseña.");
        return null;
      }
    },
    [load]
  );

  const clearCredentials = useCallback(() => {
    setLastCreatedCredentials(null);
  }, []);

  return {
    loading,
    error,
    users,
    filteredUsers,
    metrics,

    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,

    reload: load,
    createUser,
    updateUser,
    toggleActive,
    resetPassword,

    lastCreatedCredentials,
    clearCredentials,
  };
}
