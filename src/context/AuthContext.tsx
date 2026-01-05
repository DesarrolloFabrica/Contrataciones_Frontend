// src/context/AuthContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import api, { AUTH_STORAGE_KEY } from "../services/apiClient";
import { auditAppend } from "../services/auditService";
import type { AuditActor } from "../types";

// Roles que ya usas en el frontend (para rutas, etc.)
export type Role = "leader" | "coordinator" | "admin";

// Roles que vienen del backend
export type BackendRole = "ADMIN" | "COORDINADOR" | "LIDER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  // rol para la UI
  role: Role;
  // rol real de BD
  backendRole: BackendRole;
  schoolId: string | null;
  mustResetPassword?: boolean;
}

type StoredAuth = {
  accessToken?: string;
  user?: AuthUser;
};

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean; // ✅ clave para que ProtectedRoute espere
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;

  // ✅ NUEVO: actualizar parcialmente el user y persistirlo
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Traducción de rol backend → rol UI
function mapBackendRoleToUiRole(backendRole: BackendRole): Role {
  if (backendRole === "ADMIN") return "admin";
  if (backendRole === "COORDINADOR") return "coordinator";
  return "leader";
}

// helper para poner el header en axios
function setAxiosAuthHeader(token?: string) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

/** Lee localStorage de forma segura (sin romper si está corrupto) */
function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuth;

    // Si hay token, inyecta header YA (antes del primer render de rutas)
    if (parsed?.accessToken) setAxiosAuthHeader(parsed.accessToken);

    return parsed;
  } catch (err) {
    console.warn("No se pudo leer auth desde localStorage", err);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAxiosAuthHeader(undefined);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ✅ Hidratación sincrónica: evita “flash” de user=null en refresh
  const boot = useMemo(() => readStoredAuth(), []);

  const [user, setUser] = useState<AuthUser | null>(() => boot?.user ?? null);
  const [isReady, setIsReady] = useState<boolean>(() => true); // ✅ ya está listo desde el arranque

  // ✅ NUEVO: actualiza user en memoria + localStorage (mantiene accessToken)
  const updateUser = (patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const next = { ...prev, ...patch };

      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(AUTH_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as {
              accessToken?: string;
              user?: AuthUser;
            };

            localStorage.setItem(
              AUTH_STORAGE_KEY,
              JSON.stringify({ accessToken: parsed.accessToken, user: next })
            );
          } else {
            // raro, pero por si no existía
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: next }));
          }
        } catch (err) {
          console.warn("[AuthContext] No se pudo persistir updateUser", err);
        }
      }

      return next;
    });
  };

  // ✅ login: email + password
  const login = async (email: string, password: string): Promise<AuthUser> => {
    const cleanEmail = email.toLowerCase().trim();

    let data: {
      accessToken?: string;
      user?: {
        id: string;
        email: string;
        role: BackendRole;
        schoolId: string | null;
        fullName?: string;
        mustResetPassword?: boolean;
      };
    };

    try {
      const resp = await api.post<typeof data>("/auth/login", {
        email: cleanEmail,
        password,
      });
      data = resp.data;
    } catch (error: any) {
      console.error(
        "[AuthContext] Error en /auth/login:",
        error?.response?.data || error
      );
      throw error;
    }

    console.log("[AuthContext] login resp.data =", data);

    const { accessToken, user: backendUser } = data;

    if (!accessToken || !backendUser) {
      console.error(
        "[AuthContext] Respuesta inesperada de login, falta accessToken o user:",
        data
      );
      throw new Error("Respuesta de login inválida");
    }

    const uiRole = mapBackendRoleToUiRole(backendUser.role);

    const authUser: AuthUser = {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.fullName || backendUser.email.split("@")[0],
      role: uiRole,
      backendRole: backendUser.role,
      schoolId: backendUser.schoolId,
      mustResetPassword: backendUser.mustResetPassword,
    };

    // Inyectar header y persistir
    setAxiosAuthHeader(accessToken);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ accessToken, user: authUser } satisfies StoredAuth)
    );

    // Auditoría
    const actor: AuditActor = {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role,
    };

    auditAppend({
      type: "LOGIN",
      actor,
      metadata: { email: authUser.email, role: authUser.role },
    });

    setUser(authUser);
    setIsReady(true);
    return authUser;
  };

  const logout = () => {
    if (user) {
      auditAppend({
        type: "LOGOUT",
        actor: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        metadata: { email: user.email, role: user.role },
      });
    }

    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAxiosAuthHeader(undefined);
    setIsReady(true);
  };

  return (
    <AuthContext.Provider value={{ user, isReady, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
