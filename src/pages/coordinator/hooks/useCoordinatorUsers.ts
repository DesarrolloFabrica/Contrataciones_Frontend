// src/pages/coordinator/hooks/useCoordinatorUsers.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminUser, CreateAdminUserDto } from "../../admin/adminTypes";

import { adminMockDb } from "../../admin/utils/adminMockDb";

import { useAuth } from "../../../context/AuthContext";

type UseCoordinatorUsersResult = {
  users: AdminUser[];
  loading: boolean;
  error: string | null;

  createLeader: (
    dto: Omit<CreateAdminUserDto, "role" | "schoolId">
  ) => Promise<{ ok: boolean; user?: AdminUser }>;
  toggleActive: (id: string) => Promise<void>;
};

export function useCoordinatorUsers(): UseCoordinatorUsersResult {
  const { user } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

      const filtered = (all ?? []).filter((u) => {
        if (u.role !== "LEADER") return false;

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

      if (!coordinatorSchoolId) {
        return { ok: false };
      }

      try {
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

  return { users, loading, error, createLeader, toggleActive };
}
