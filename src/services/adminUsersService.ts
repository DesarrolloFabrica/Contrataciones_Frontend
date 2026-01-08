// src/services/adminUsersService.ts
import api from "./apiClient";
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
  ResetPasswordResult,
} from "../pages/admin/adminTypes";

type BackendRole = "ADMIN" | "COORDINADOR" | "LIDER";

const ADMIN_BASE_PATH = "/admin/users";
const USERS_BASE_PATH = "/users";

const uiRoleToBackend = (r: AdminUserRole): BackendRole => {
  if (r === "COORDINATOR") return "COORDINADOR";
  if (r === "LEADER") return "LIDER";
  return "ADMIN";
};

export type UserBasic = {
  id: string;
  fullName: string;
  email: string | null;
  role: string | null;
  schoolId: string | null;
  isActive?: boolean | null;
};

const pickName = (u: any) => {
  const direct =
    u?.fullName ??
    u?.fullname ??
    u?.displayName ??
    u?.name ??
    u?.nombre ??
    null;

  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const first =
    u?.firstName ??
    u?.firstname ??
    u?.givenName ??
    u?.given_name ??
    u?.nombre ??
    "";
  const last =
    u?.lastName ??
    u?.lastname ??
    u?.familyName ??
    u?.family_name ??
    u?.apellido ??
    "";

  const joined = `${String(first || "").trim()} ${String(last || "").trim()}`.trim();
  return joined || null;
};

const normalizeUserBasic = (data: any): UserBasic | null => {
  if (!data) return null;

  const u = data?.user ?? data?.data ?? data;

  const id = String(u?.id ?? u?.userId ?? u?._id ?? "").trim();
  if (!id) return null;

  const fullName = pickName(u) ?? id;

  const emailRaw = u?.email ?? u?.mail ?? u?.correo ?? u?.username ?? null;
  const email =
    typeof emailRaw === "string" && emailRaw.trim() ? emailRaw.trim() : null;

  const roleRaw = u?.role ?? u?.rol ?? null;
  const role =
    typeof roleRaw === "string" && roleRaw.trim() ? roleRaw.trim() : null;

  const schoolIdRaw = u?.schoolId ?? u?.school_id ?? null;
  const schoolId =
    typeof schoolIdRaw === "string" && schoolIdRaw.trim()
      ? schoolIdRaw.trim()
      : schoolIdRaw
      ? String(schoolIdRaw)
      : null;

  const isActive =
    typeof u?.isActive === "boolean"
      ? u.isActive
      : typeof u?.active === "boolean"
      ? u.active
      : null;

  return { id, fullName, email, role, schoolId, isActive };
};

export async function apiGetUserBasicById(id: string): Promise<UserBasic | null> {
  const clean = String(id ?? "").trim();
  if (!clean) return null;

  // 0) /users/:id/basic (si existe)
  try {
    const { data } = await api.get(`${USERS_BASE_PATH}/${clean}/basic`);
    const parsed = normalizeUserBasic(data);
    if (parsed) return parsed;
  } catch (e: any) {
    if (e?.response?.status !== 404) throw e;
  }

  // 1) /users/:id
  try {
    const { data } = await api.get(`${USERS_BASE_PATH}/${clean}`);
    const parsed = normalizeUserBasic(data);
    if (parsed) return parsed;
  } catch (e: any) {
    if (e?.response?.status !== 404) throw e;
  }

  // 2) /admin/users/:id (opcional)
  try {
    const { data } = await api.get(`${ADMIN_BASE_PATH}/${clean}`);
    return normalizeUserBasic(data);
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

// ✅ EDITAR (tu backend real es PATCH /users/:id)
export async function apiUpdateUser(id: string, patch: Partial<AdminUser>) {
  const { data } = await api.patch(`${USERS_BASE_PATH}/${id}`, {
    ...patch,
    role: patch.role ? uiRoleToBackend(patch.role) : undefined,
  });
  return data;
}

// ✅ ACTIVAR / DESACTIVAR (tu backend: /users/:id/activate | /users/:id/deactivate)
export async function apiSetUserStatus(id: string, status: AdminUserStatus) {
  const s = String(status).toUpperCase();
  const shouldActivate = s === "ACTIVE" || s === "ACTIVO" || s === "ENABLED";

  const path = shouldActivate
    ? `${USERS_BASE_PATH}/${id}/activate`
    : `${USERS_BASE_PATH}/${id}/deactivate`;

  const { data } = await api.patch(path);
  return data;
}

// ✅ RESETEAR CONTRASEÑA
// ResetPasswordResult exige { userId, temporaryPassword }
export async function apiResetPassword(id: string): Promise<ResetPasswordResult> {
  const userId = String(id);

  // 1) intenta /users/:id/reset-password
  try {
    const { data } = await api.post(`${USERS_BASE_PATH}/${id}/reset-password`);
    return {
      userId,
      temporaryPassword: data?.temporaryPassword ?? data?.tempPassword ?? "",
    };
  } catch (e: any) {
    // 2) fallback /admin/users/:id/reset-password (si existe)
    const { data } = await api.post(`${ADMIN_BASE_PATH}/${id}/reset-password`);
    return {
      userId,
      temporaryPassword: data?.temporaryPassword ?? data?.tempPassword ?? "",
    };
  }
}
