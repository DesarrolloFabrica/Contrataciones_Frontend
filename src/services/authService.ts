// src/services/authService.ts
import api from "./apiClient";

export type BackendUser = {
  id: string;
  email: string;
  fullName: string;
  role: string; // o "ADMIN" | "COORDINATOR" | "LEADER", etc.
  schoolId?: string | null;
  mustResetPassword?: boolean;
};

export type LoginResponse = {
  accessToken: string;
  user: BackendUser;
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
