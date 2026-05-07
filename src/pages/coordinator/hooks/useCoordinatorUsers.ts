// src/pages/coordinator/hooks/useCoordinatorUsers.ts
import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import {
  usersService,
  type BackendUser,
  type CreateBackendUserDto,
} from "../../../services/usersService";
import { queryKeys } from "../../../services/queryKeys";
import type { AdminUser, CreateAdminUserDto } from "../../admin/adminTypes";

type UseCoordinatorUsersResult = {
  users: AdminUser[];
  loading: boolean;
  error: string | null;

  createLeader: (
    dto: Omit<CreateAdminUserDto, "role" | "schoolId">
  ) => Promise<{ ok: boolean; user?: AdminUser }>;
  toggleActive: (id: string) => Promise<void>;
};

const norm = (v: any) => String(v ?? "").trim().toLowerCase();

const pickUserSchool = (u: any) =>
  u?.school?.name ?? u?.schoolName ?? u?.school ?? u?.schoolNameSnapshot ?? "";

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

  const roleUi: AdminUser["role"] =
    b.role === "ADMIN"
      ? "ADMIN"
      : b.role === "COORDINADOR"
      ? "COORDINATOR"
      : "LEADER";

  const isActive = (b as any).isActive !== false;
  const statusUi: AdminUser["status"] = isActive ? "ACTIVE" : "INACTIVE";

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
  (u as any).schoolId = (b as any).schoolId ?? null;

  return u;
}

export function useCoordinatorUsers(): UseCoordinatorUsersResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const coordinatorSchoolId = useMemo(() => {
    const raw =
      (user as any)?.schoolId ??
      (user as any)?.user?.schoolId ??
      (user as any)?.profile?.schoolId ??
      null;
    return raw ? String(raw) : null;
  }, [user]);

  const { data: backendUsers = [], isLoading, error: queryError } = useQuery<BackendUser[]>({
    queryKey: queryKeys.users.list(),
    queryFn: usersService.list,
    staleTime: 1000 * 60 * 5,
  });

  const users = useMemo(() => {
    const all = (backendUsers ?? []).map(backendToAdminUser);

    return all.filter((u) => {
      if (u.role !== "LEADER") return false;
      if (!coordinatorSchoolId) return false;
      const uSchool = String((u as any).schoolId ?? "");
      return uSchool === coordinatorSchoolId;
    });
  }, [backendUsers, coordinatorSchoolId]);

  const error = queryError
    ? (queryError as Error)?.message ?? "No se pudieron cargar los usuarios."
    : null;

  const createMutation = useMutation({
    mutationFn: async (dto: CreateBackendUserDto) => usersService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      usersService.setActive(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });

  const createLeader = useCallback(
    async (dtoBase: Omit<CreateAdminUserDto, "role" | "schoolId">) => {
      if (!coordinatorSchoolId) {
        return { ok: false };
      }

      try {
        const fullName = [dtoBase.name, dtoBase.lastName].filter(Boolean).join(" ").trim();

        await createMutation.mutateAsync({
          email: String(dtoBase.email).trim(),
          fullName,
          role: "LIDER",
          schoolId: coordinatorSchoolId,
          isActive: true,
        });

        return { ok: true };
      } catch {
        return { ok: false };
      }
    },
    [coordinatorSchoolId, createMutation]
  );

  const toggleActive = useCallback(
    async (id: string) => {
      const u = users.find((x) => x.id === id);
      if (!u) return;

      const nextActive = u.status !== "ACTIVE";
      await setActiveMutation.mutateAsync({ userId: id, isActive: nextActive });
    },
    [users, setActiveMutation]
  );

  return { users, loading: isLoading, error, createLeader, toggleActive };
}
