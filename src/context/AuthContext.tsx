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
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, name?: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Traducción de rol backend → rol UI
function mapBackendRoleToUiRole(backendRole: BackendRole): Role {
  if (backendRole === "ADMIN") return "admin";
  if (backendRole === "COORDINADOR") return "coordinator";
  return "leader";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // 🔹 Cargar auth desde localStorage cuando monta el app
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        accessToken?: string;
        user?: AuthUser;
      };

      if (parsed.user) {
        setUser(parsed.user);
      }
    } catch (err) {
      console.warn("No se pudo leer auth desde localStorage", err);
    }
  }, []);

  // 🔹 login: ahora SÍ llama al backend
  const login = async (email: string, name?: string): Promise<AuthUser> => {
    // 1) llamar al backend
    const resp = await api.post<{
      accessToken: string;
      user: {
        id: string;
        email: string;
        role: BackendRole;
        schoolId: string | null;
      };
    }>("/auth/login-by-email", { email });

    const backendUser = resp.data.user;
    const uiRole = mapBackendRoleToUiRole(backendUser.role);

    // 2) construir AuthUser para el frontend
    const authUser: AuthUser = {
      id: backendUser.id,
      email: backendUser.email,
      name: name || backendUser.email.split("@")[0],
      role: uiRole,
      backendRole: backendUser.role,
      schoolId: backendUser.schoolId,
    };

    // 3) guardar token + user en localStorage (clave cun-auth)
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: resp.data.accessToken,
        user: authUser,
      })
    );

    // 4) log de auditoría
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
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
