// src/services/apiClient.ts
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

export const AUTH_STORAGE_KEY = "cun-auth";

function cleanBaseUrl(v?: string) {
  return (v ?? "").trim().replace(/\/$/, "");
}

const API_BASE_URL = cleanBaseUrl(import.meta.env.VITE_API_URL) || "http://localhost:3001";

console.log("[apiClient] MODE:", import.meta.env.MODE);
console.log("[apiClient] baseURL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

const NO_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

function isNoAuthRoute(url?: string) {
  if (!url) return false;
  const path = url.split("?")[0];
  return NO_AUTH_PATHS.some((p) => path === p || path.endsWith(p) || path.includes(p));
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toUpperCase();
  const url = config.url ?? "";

  // No-auth routes
  if (isNoAuthRoute(url)) {
    // AxiosHeaders (v1) o objeto plano
    config.headers?.delete?.("Authorization");
    if (config.headers && !(config.headers as any).delete) {
      delete (config.headers as any).Authorization;
    }
    console.log("[apiClient] ->", method, url, "(no-auth)");
    return config;
  }

  // Attach token
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { accessToken?: string };
      const token = parsed?.accessToken;

      if (token) {
        if (config.headers?.set) config.headers.set("Authorization", `Bearer ${token}`);
        else (config.headers as any) = { ...(config.headers as any), Authorization: `Bearer ${token}` };
      }
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  console.log("[apiClient] ->", method, url);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = (error.config?.baseURL ?? "") + (error.config?.url ?? "");
    const data = error.response?.data;

    console.error("[apiClient] ERROR", status, url, data);

    if (status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    return Promise.reject(error);
  }
);

export default api;
