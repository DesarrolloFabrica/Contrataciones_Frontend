// src/services/adminUsersService.ts
import api from "./apiClient";
import type { AdminUser, AdminUserRole, AdminUserStatus, ResetPasswordResult } from "../pages/admin/adminTypes";

type BackendRole = "ADMIN" | "COORDINADOR" | "LIDER";

const BASE_PATH = "/admin/users"; // <-- AJUSTA

const uiRoleToBackend = (r: AdminUserRole): BackendRole => {
  if (r === "COORDINATOR") return "COORDINADOR";
  if (r === "LEADER") return "LIDER";
  return "ADMIN";
};

// ✅ EDITAR
export async function apiUpdateUser(id: string, patch: Partial<AdminUser>) {
  const { data } = await api.patch(`${BASE_PATH}/${id}`, {
    ...patch,
    role: patch.role ? uiRoleToBackend(patch.role) : undefined,
  });
  return data;
}

// ✅ ACTIVAR / DESACTIVAR
export async function apiSetUserStatus(id: string, status: AdminUserStatus) {
  const { data } = await api.patch(`${BASE_PATH}/${id}`, { status });
  return data;
}

// ✅ RESETEAR CONTRASEÑA
export async function apiResetPassword(id: string): Promise<ResetPasswordResult> {
  const { data } = await api.post(`${BASE_PATH}/${id}/reset-password`);

  return {
    temporaryPassword: data?.temporaryPassword ?? data?.tempPassword ?? "",
  } as ResetPasswordResult;
}
