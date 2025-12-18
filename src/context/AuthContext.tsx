// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { AUTH_STORAGE_KEY } from "../services/apiClient";
import { auditAppend, type AuditActor } from "../services/auditService";

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

// 🔹 helper para poner / quitar el Authorization en axios
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

      if (parsed.accessToken) {
        setAxiosAuthHeader(parsed.accessToken);
      }

      if (parsed.user) {
        setUser(parsed.user);
      }
    } catch (err) {
      console.warn("No se pudo leer auth desde localStorage", err);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAxiosAuthHeader(undefined);
    }
  }, []);

  // 🔹 login: llama al backend y guarda token + usuario
 // 🔹 login: llama al backend y guarda token + usuario
  const login = async (email: string, name?: string): Promise<AuthUser> => {
    const cleanEmail = email.toLowerCase().trim();

    let resp;
    try {
      resp = await api.post("/auth/login-by-email", { email: cleanEmail });
    } catch (error: any) {
      console.error("[login] Error llamando al backend:", error?.response?.data || error);

      const msg =
        error?.response?.data?.message ??
        "No se pudo iniciar sesión. Verifica tu correo institucional.";

      throw new Error(msg);
    }

    const data: any = resp.data;
    console.log("[login] resp.data =", data);

    if (!data || !data.user) {
      console.error("[login] Respuesta sin 'user':", data);
      throw new Error(
        "Error en el servidor: la respuesta de login no contiene información de usuario."
      );
    }

    const backendUser = data.user;
    const backendRole = backendUser.role as BackendRole | undefined;

    if (!backendRole) {
      console.error("[login] Usuario sin 'role' en la respuesta:", backendUser);
      throw new Error(
        "Tu usuario no tiene un rol asignado en el sistema. Contacta al administrador."
      );
    }

    const uiRole = mapBackendRoleToUiRole(backendRole);

    const authUser: AuthUser = {
      id: backendUser.id,
      email: backendUser.email,
      name:
        name?.trim() ||
        backendUser.fullName ||
        backendUser.email.split("@")[0],
      role: uiRole,
      backendRole,
      schoolId: backendUser.schoolId,
    };

    // 👉 Inyectar el header Authorization
    setAxiosAuthHeader(data.accessToken);

    // 👉 Guardar en localStorage
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: data.accessToken,
        user: authUser,
      })
    );

    // 👉 Auditoría
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
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
