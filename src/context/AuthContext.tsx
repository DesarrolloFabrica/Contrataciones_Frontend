// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auditAppend } from "../services/auditService";
import type { AuditActor } from "../types";

export type Role = "leader" | "coordinator" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, name?: string) => AuthUser;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "ope-cun:user";

function guessRoleFromEmail(email: string): Role {
  const lower = email.toLowerCase();

  if (lower.includes("admin")) return "admin";
  if (lower.includes("coord") || lower.includes("coordinador")) {
    return "coordinator";
  }
  // por defecto, líder
  return "leader";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        setUser(parsed);
      }
    } catch (err) {
      console.warn("No se pudo leer usuario desde localStorage", err);
    }
  }, []);

  // Persistir en localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, name?: string): AuthUser => {
    const role = guessRoleFromEmail(email);
    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      email,
      name: name || email.split("@")[0],
      role,
    };

    const actor: AuditActor = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    auditAppend({
      type: "LOGIN",
      actor,
      metadata: { email: newUser.email, role: newUser.role },
    });

    setUser(newUser);
    return newUser;
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
