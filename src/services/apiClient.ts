// src/services/apiClient.ts
import axios, { AxiosError, AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

export const AUTH_STORAGE_KEY = "cun-auth";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").trim();

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
  return NO_AUTH_PATHS.some((p) => path.endsWith(p) || path.includes(p));
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toUpperCase();

  // No-auth routes: no mandar Authorization
  if (isNoAuthRoute(config.url)) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.delete("Authorization");
    } else if (config.headers) {
      delete (config.headers as any).Authorization;
    }
    console.log("[apiClient] ->", method, config.url, "| (no-auth)");
    return config;
  }

  // Attach token
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { accessToken?: string };
        const token = parsed?.accessToken;

        if (token) {
          if (config.headers instanceof AxiosHeaders) {
            config.headers.set("Authorization", `Bearer ${token}`);
          } else {
            (config.headers as any) = {
              ...(config.headers as any),
              Authorization: `Bearer ${token}`,
            };
          }
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }

  console.log("[apiClient] ->", method, config.url);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
    const data = error.response?.data;

    console.error(
      "[apiClient] ERROR",
      status,
      url,
      data ? JSON.stringify(data, null, 2) : error.message
    );

    if (status === 401) localStorage.removeItem(AUTH_STORAGE_KEY);
    return Promise.reject(error);
  }
);

export default api;