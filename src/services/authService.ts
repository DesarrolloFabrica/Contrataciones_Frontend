// src/services/authService.ts
import api from "./apiClient";
import type { AuthResponse } from "../types";

/**
 * Hace login contra el backend usando solo el correo institucional.
 * POST /auth/login-by-email
 */
export async function loginByEmail(email: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login-by-email", {
    email: email.toLowerCase().trim(),
  });

  return data;
}
