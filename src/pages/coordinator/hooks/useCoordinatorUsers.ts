// src/pages/coordinator/hooks/useCoordinatorUsers.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminUser, CreateAdminUserDto } from "../../admin/adminTypes"; 
// ⚠️ Ajusta la ruta si tus types no están ahí. Mira dónde está adminTypes en tu proyecto.

import { adminMockDb } from "../../admin/utils/adminMockDb"; 
// ⚠️ Ajusta la ruta según tu árbol real.
// Tú pegaste: src/pages/admin/utils/adminMockDb.ts

import { useAuth } from "../../../context/AuthContext"; 
// ⚠️ Ajusta si tu AuthContext está en otra ruta

type UseCoordinatorUsersResult = {
  users: AdminUser[];
  loading: boolean;
  error: string | null;

  // Acciones
  createLeader: (dto: Omit<CreateAdminUserDto, "role" | "schoolId">) => Promise<{ ok: boolean; password?: string; user?: AdminUser }>;
  toggleActive: (id: string) => Promise<void>;
  resetPassword: (id: string) => Promise<{ ok: boolean; password?: string }>;
};

export function useCoordinatorUsers(): UseCoordinatorUsersResult {
  const { user } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ schoolId del coordinador (debe existir para heredar)
  const coordinatorSchoolId = useMemo(() => {
    const raw =
      (user as any)?.schoolId ??
      (user as any)?.user?.schoolId ??
      (user as any)?.profile?.schoolId ??
      null;
    return raw ? String(raw) : null;
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const all = await adminMockDb.listUsers();

      // ✅ Coordinador solo ve líderes de su escuela (y opcionalmente a sí mismo)
      const filtered = (all ?? []).filter((u) => {
        // muestra solo líderes
        if (u.role !== "LEADER") return false;

        // y solo de su misma escuela
        if (!coordinatorSchoolId) return false;
        return String((u as any).schoolId ?? "") === coordinatorSchoolId;
      });

      setUsers(filtered);
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar los usuarios.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [coordinatorSchoolId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLeader = useCallback(
    async (dtoBase: Omit<CreateAdminUserDto, "role" | "schoolId">) => {
      setError(null);

      // ✅ Si el coordinador no tiene schoolId, bloqueamos
      if (!coordinatorSchoolId) {
        return { ok: false };
      }

      try {
        // ✅ Forzamos rol y schoolId (herencia)
        const dto: CreateAdminUserDto = {
          ...dtoBase,
          role: "LEADER",
          schoolId: coordinatorSchoolId,
        } as any;

        const res = await adminMockDb.createUser(dto, (user as any)?.id ?? "u-coord-1");
        await refresh();

        return {
          ok: true,
          user: res.user,
          password: res.password?.temporaryPassword,
        };
      } catch (e: any) {
        setError(e?.message ?? "No se pudo crear el líder.");
        return { ok: false };
      }
    },
    [coordinatorSchoolId, refresh, user]
  );

  const toggleActive = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await adminMockDb.toggleUserActive(id, (user as any)?.id ?? "u-coord-1");
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? "No se pudo cambiar el estado del usuario.");
      }
    },
    [refresh, user]
  );

  const resetPassword = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const res = await adminMockDb.resetPassword(id, (user as any)?.id ?? "u-coord-1");
        return { ok: true, password: res.temporaryPassword };
      } catch (e: any) {
        setError(e?.message ?? "No se pudo resetear la contraseña.");
        return { ok: false };
      } finally {
        await refresh();
      }
    },
    [refresh, user]
  );

  return { users, loading, error, createLeader, toggleActive, resetPassword };
}
