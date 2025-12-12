// src/services/apiClient.ts
import axios from "axios";

// Tomamos la URL del backend desde las variables de entorno
// - En producción: VITE_API_BASE_URL  (Cloud Run)
// - En local, si quieres, puedes dejar VITE_API_URL o un fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

console.log("[apiClient] usando baseURL:", API_BASE_URL);

// Cliente HTTP reutilizable
const api = axios.create({
  baseURL: API_BASE_URL,
  // si algún día necesitas cookies:
  // withCredentials: true,
});

export default api;
