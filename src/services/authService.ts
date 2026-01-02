// src/services/authService.ts
import api from "./apiClient";

export type BackendUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  schoolId?: string | null;
  mustResetPassword?: boolean;
};

export type LoginResponse = {
  accessToken: string;
  user: BackendUser;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  ok: boolean;
  message?: string;
};

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

// ✅ Overloads (acepta 1 objeto o 2 strings)
export async function changePassword(
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse>;
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse>;
export async function changePassword(
  a: string | ChangePasswordPayload,
  b?: string
): Promise<ChangePasswordResponse> {
  const payload: ChangePasswordPayload =
    typeof a === "string"
      ? { currentPassword: a, newPassword: b ?? "" }
      : a;

  const { data } = await api.post<ChangePasswordResponse>(
    "/auth/change-password",
    payload
  );
  return data;
}

export const authService = {
  login,
  changePassword,
};
