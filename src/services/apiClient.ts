// src/services/apiClient.ts
import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

export const AUTH_STORAGE_KEY = "cun-auth";

// ✅ Limpia comillas, espacios y slash final (evita caer a localhost por un espacio)
const rawBaseUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

const API_BASE_URL = rawBaseUrl
  .replace(/^"+|"+$/g, "")   // quita "..."
  .trim()                    // quita espacios
  .replace(/\/+$/, "");      // quita trailing /

console.log("[apiClient] MODE:", import.meta.env.MODE);
console.log("[apiClient] usando baseURL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const NO_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

function isNoAuthRoute(url?: string) {
  if (!url) return false;
  const path = url.split("?")[0];
  return NO_AUTH_PATHS.some((p) => path === p || path.endsWith(p));
}

function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed?.accessToken ?? null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Normaliza headers a AxiosHeaders
  if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = AxiosHeaders.from(config.headers);
  }

  // ✅ Rutas sin auth
  if (isNoAuthRoute(config.url)) {
    config.headers.delete("Authorization");
    console.log("[apiClient] ->", config.method?.toUpperCase(), config.url, "| (no-auth)");
    return config;
  }

  // ✅ Adjunta token
  if (typeof window !== "undefined") {
    const token = getStoredToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }

  console.log("[apiClient] ->", config.method?.toUpperCase(), config.url);
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
  console.warn("[apiClient] 401 detectado. No borro cun-auth automáticamente.");
}
    return Promise.reject(error);
  }
);

export default api;
