// src/services/apiClient.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

export const AUTH_STORAGE_KEY = "cun-auth";

let onUnauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorizedHandler = handler;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const json = atob(payload);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getTokenExpiration(token: string): Date | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return new Date(payload.exp * 1000);
}

export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  if (!exp) return false;
  return Date.now() >= exp.getTime();
}

export function clearAuthStorage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// ✅ Limpia comillas, espacios y slash final (evita caer a localhost por un espacio)
const rawBaseUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3001";

const API_BASE_URL = rawBaseUrl
  .replace(/^"+|"+$/g, "") // quita "..."
  .trim() // quita espacios
  .replace(/\/+$/, ""); // quita trailing /

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const NO_AUTH_PATHS = ["/auth/google", "/auth/register", "/auth/refresh"];

function isNoAuthRoute(url?: string) {
  if (!url) return false;
  const path = url.split("?")[0];
  return NO_AUTH_PATHS.some((p) => path === p || path.endsWith(p));
}

function getStoredToken(): string | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  if (raw.startsWith("eyJ")) return raw;

  try {
    const parsed = JSON.parse(raw) as any;
    return (
      parsed?.accessToken ??
      parsed?.access_token ??
      parsed?.token ??
      parsed?.jwt ??
      null
    );
  } catch {
    const cleaned = raw.replace(/^"+|"+$/g, "").trim();
    return cleaned.startsWith("eyJ") ? cleaned : null;
  }
}

export function getStoredAuth(): { token: string | null; expiresAt: number | null } {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return { token: null, expiresAt: null };

  let token: string | null = null;
  let expiresAt: number | null = null;

  try {
    const parsed = JSON.parse(raw) as any;
    token = parsed?.accessToken ?? parsed?.access_token ?? parsed?.token ?? parsed?.jwt ?? null;
    expiresAt = parsed?.expiresAt ?? null;
  } catch {
    if (raw.startsWith("eyJ")) token = raw;
  }

  return { token, expiresAt };
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Normaliza headers a AxiosHeaders
  if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = AxiosHeaders.from(config.headers);
  }

  // ✅ Rutas sin auth
  if (isNoAuthRoute(config.url)) {
    config.headers.delete("Authorization");
    return config;
  }

  // ✅ Adjunta token
  if (typeof window !== "undefined") {
    const token = getStoredToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
    const data = error.response?.data;

    console.error("[apiClient] ERROR", status, url, data ?? error.message);

    if (status === 401) {
      clearAuthStorage();
      delete api.defaults.headers.common["Authorization"];
      onUnauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

export default api;
