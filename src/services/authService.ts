// src/services/authService.ts
import api, { AUTH_STORAGE_KEY } from "./apiClient";
import type { AuthResponse } from "../types";

/**
 * Login con email + password
 * POST /auth/login
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    email: email.toLowerCase().trim(),
    password,
  });

  // Persistir sesión (tu interceptor ya lee AUTH_STORAGE_KEY)
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));

  return data;
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
