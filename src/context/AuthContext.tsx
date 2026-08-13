// src/context/AuthContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { AUTH_STORAGE_KEY, setUnauthorizedHandler, isTokenExpired, getTokenExpiration, clearAuthStorage } from "../services/apiClient";
import { auditAppend } from "../services/auditService";
import * as authService from "../services/authService";
import type { LoginResponseUser, SelectionCapability } from "../services/authService";
import type { AuditActor } from "../types";
import { markBootPending, clearBootPending } from "../features/boot/appBootStorage";

export type Role = "leader" | "coordinator" | "admin";

export type BackendRole = "ADMIN" | "COORDINADOR" | "LIDER";
export type CharlasProductRole = "ADMIN" | "INTERVIEWER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  backendRole: BackendRole;
  productRole: CharlasProductRole;
  schoolId: string | null;
  /** URL de foto de perfil desde Google OAuth */
  googlePicture?: string | null;
  capabilities: SelectionCapability[];
}

type StoredAuth = {
  accessToken?: string;
  user?: AuthUser;
  expiresAt?: number;
};

type LoginMethod = "google" | "dev-email";

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  loginWithGoogle: (accessToken: string) => Promise<AuthUser>;
  loginWithEmailOnly: (email: string) => Promise<AuthUser>;
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
    if (!parsed?.accessToken) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAxiosAuthHeader(undefined);
      return null;
    }

    if (isTokenExpired(parsed.accessToken)) {
      console.info("[AuthContext] Token expirado al iniciar app, limpiando sesión");
      clearAuthStorage();
      setAxiosAuthHeader(undefined);
      return null;
    }

    if (parsed.user) {
      parsed.user.productRole =
        parsed.user.productRole ??
        (parsed.user.backendRole === "ADMIN" ? "ADMIN" : "INTERVIEWER");
      // Recalcula el mapping para que sesiones persistidas no conserven
      // capacidades legacy retiradas por una nueva versión del producto.
      parsed.user.capabilities = capabilitiesForRole(parsed.user.backendRole);
    }
    setAxiosAuthHeader(parsed.accessToken);
    return parsed;
  } catch (err) {
    console.warn("No se pudo leer auth desde localStorage", err);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAxiosAuthHeader(undefined);
    return null;
  }
}

function buildAuthUser(backendUser: LoginResponseUser): AuthUser {
  const uiRole = mapBackendRoleToUiRole(backendUser.role);

  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.fullName || backendUser.email.split("@")[0],
    role: uiRole,
    backendRole: backendUser.role,
    productRole:
      backendUser.productRole ??
      (backendUser.role === "ADMIN" ? "ADMIN" : "INTERVIEWER"),
    schoolId: backendUser.schoolId,
    googlePicture: backendUser.googlePicture ?? null,
    capabilities: [
      ...new Set([
        ...capabilitiesForRole(backendUser.role),
        ...(backendUser.capabilities ?? []),
      ]),
    ],
  };
}

function capabilitiesForRole(role: BackendRole): SelectionCapability[] {
  const interviewer: SelectionCapability[] = [
    "vacancy.read",
    "process.read",
    "candidate.read",
    "participant.read",
    "interview.read",
    "interview.execute",
  ];
  if (role === "ADMIN") {
    return [
      ...interviewer,
      "process.read_all",
      "vacancy.sync",
      "process.manage",
      "candidate.manage",
      "application.manage",
      "template.read",
      "template.manage",
      "template.publish",
      "participant.manage",
      "interview.assign",
      "interview.read_all",
      "intelligence.read",
      "intelligence.generate",
      "intelligence.regenerate",
      "decision.read",
      "decision.manage",
    ];
  }
  if (role === "COORDINADOR") {
    return [
      ...interviewer,
      "process.read_all",
      "process.manage",
      "candidate.manage",
      "application.manage",
      "template.read",
      "participant.manage",
      "interview.assign",
      "interview.read_all",
      "intelligence.read",
      "intelligence.generate",
      "decision.read",
    ];
  }
  return interviewer;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const boot = useMemo(() => readStoredAuth(), []);

  const [user, setUser] = useState<AuthUser | null>(() => boot?.user ?? null);
  const [isReady, setIsReady] = useState<boolean>(() => true);

  const applyLoginSuccess = useCallback(
    (jwt: string, backendUser: LoginResponseUser, method: LoginMethod): AuthUser => {
      const authUser = buildAuthUser(backendUser);

      setAxiosAuthHeader(jwt);

      const expDate = getTokenExpiration(jwt);
      const expiresAt = expDate ? expDate.getTime() : null;

      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ accessToken: jwt, user: authUser, expiresAt } satisfies StoredAuth)
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
        metadata: { email: authUser.email, role: authUser.role, method },
      });

      // Activa el splash post-login (AppBootProvider lo mostrara al detectar user + flag).
      markBootPending();

      setUser(authUser);
      setIsReady(true);
      return authUser;
    },
    []
  );

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
              expiresAt?: number;
            };

            localStorage.setItem(
              AUTH_STORAGE_KEY,
              JSON.stringify({ accessToken: parsed.accessToken, user: next, expiresAt: parsed.expiresAt })
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
    try {
      const data = await authService.loginWithGoogle(accessToken);
      return applyLoginSuccess(data.accessToken, data.user, "google");
    } catch (error: any) {
      console.error(
        "[AuthContext] Error en /auth/google:",
        error?.response?.data || error
      );
      throw error;
    }
  };

  const loginWithEmailOnly = async (email: string): Promise<AuthUser> => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const data = await authService.loginWithEmailOnly(normalizedEmail);
      return applyLoginSuccess(data.accessToken, data.user, "dev-email");
    } catch (error: any) {
      console.error(
        "[AuthContext] Error en /auth/dev/email:",
        error?.response?.data || error
      );
      throw error;
    }
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
    clearAuthStorage();
    clearBootPending();
    setAxiosAuthHeader(undefined);
    setIsReady(true);
  }, [user]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ user, isReady, loginWithGoogle, loginWithEmailOnly, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
