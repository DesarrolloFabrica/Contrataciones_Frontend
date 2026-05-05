// src/context/AuthContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { AUTH_STORAGE_KEY, setUnauthorizedHandler } from "../services/apiClient";
import { auditAppend } from "../services/auditService";
import type { AuditActor } from "../types";

export type Role = "leader" | "coordinator" | "admin";

export type BackendRole = "ADMIN" | "COORDINADOR" | "LIDER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  backendRole: BackendRole;
  schoolId: string | null;
  /** URL de foto de perfil desde Google OAuth */
  googlePicture?: string | null;
}

type StoredAuth = {
  accessToken?: string;
  user?: AuthUser;
};

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  loginWithGoogle: (accessToken: string) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapBackendRoleToUiRole(backendRole: BackendRole): Role {
  if (backendRole === "ADMIN") return "admin";
  if (backendRole === "COORDINADOR") return "coordinator";
  return "leader";
}

function setAxiosAuthHeader(token?: string) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
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
  const boot = useMemo(() => readStoredAuth(), []);

  const [user, setUser] = useState<AuthUser | null>(() => boot?.user ?? null);
  const [isReady, setIsReady] = useState<boolean>(() => true);

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
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: next }));
          }
        } catch (err) {
          console.warn("[AuthContext] No se pudo persistir updateUser", err);
        }
      }

      return next;
    });
  };

  const loginWithGoogle = async (accessToken: string): Promise<AuthUser> => {
    let data: {
      accessToken?: string;
      user?: {
        id: string;
        email: string;
        role: BackendRole;
        schoolId: string | null;
        fullName?: string;
        googlePicture?: string | null;
      };
    };

    try {
      const resp = await api.post<typeof data>("/auth/google", { accessToken });
      data = resp.data;
    } catch (error: any) {
      console.error(
        "[AuthContext] Error en /auth/google:",
        error?.response?.data || error
      );
      throw error;
    }

    const { accessToken: jwt, user: backendUser } = data;

    if (!jwt || !backendUser) {
      throw new Error("Respuesta de Google login inválida");
    }

    const uiRole = mapBackendRoleToUiRole(backendUser.role);

    const authUser: AuthUser = {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.fullName || backendUser.email.split("@")[0],
      role: uiRole,
      backendRole: backendUser.role,
      schoolId: backendUser.schoolId,
      googlePicture: backendUser.googlePicture ?? null,
    };

    setAxiosAuthHeader(jwt);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ accessToken: jwt, user: authUser } satisfies StoredAuth)
    );

    const actor: AuditActor = {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role,
    };

    auditAppend({
      type: "LOGIN",
      actor,
      metadata: { email: authUser.email, role: authUser.role, method: "google" },
    });

    setUser(authUser);
    setIsReady(true);
    return authUser;
  };

  const logout = useCallback(() => {
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
  }, [user]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, isReady, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
