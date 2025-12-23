// src/services/apiClient.ts
import axios, { AxiosRequestHeaders } from "axios";

export const AUTH_STORAGE_KEY = "cun-auth";

// Usamos SIEMPRE la misma variable, en dev y en prod
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

console.log("[apiClient] MODE:", import.meta.env.MODE);
console.log("[apiClient] usando baseURL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { accessToken?: string };
        if (parsed.accessToken) {
          const headers: AxiosRequestHeaders =
            (config.headers || {}) as AxiosRequestHeaders;

          headers.Authorization = `Bearer ${parsed.accessToken}`;
          config.headers = headers;

          console.log(
            "[apiClient] ->",
            config.method?.toUpperCase(),
            config.url,
            "| Authorization:",
            headers.Authorization
          );
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }
  return config;
  
});

export default api;
