// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
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

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Cargar auth desde localStorage cuando monta el app
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        accessToken?: string;
        user?: AuthUser;
      };

      if (parsed.accessToken) setAxiosAuthHeader(parsed.accessToken);
      if (parsed.user) setUser(parsed.user);
    } catch (err) {
      console.warn("No se pudo leer auth desde localStorage", err);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAxiosAuthHeader(undefined);
    }
  }, []);

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
      console.error("[AuthContext] Error en /auth/login:", error?.response?.data || error);
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
      JSON.stringify({ accessToken, user: authUser })
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
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
