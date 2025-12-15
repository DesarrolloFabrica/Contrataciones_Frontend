// src/pages/admin/hooks/useAdminUsers.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import type {
  AdminUser,
  AdminUserStatus,
  AdminUserRole,
  CreateAdminUserDto,
  UpdateAdminUserDto,
  ResetPasswordResult,
} from "../adminTypes";

type StatusFilter = "ALL" | AdminUserStatus;

const LS_KEY = "OPECUN_ADMIN_USERS_V1";

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function safeTrim(s?: string | null) {
  return (s ?? "").trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function generatePassword(length = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*?";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function readUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdminUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: AdminUser[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

function seedIfEmpty() {
  const existing = readUsers();
  if (existing.length > 0) return existing;

  const seed: AdminUser[] = [
    {
      id: uid(),
      name: "Camilo",
      lastName: "Rojas",
      email: "camilo.rojas@cun.edu.co",
      cedula: "1010101010",
      role: "COORDINATOR",
      status: "ACTIVE",
      mustChangePassword: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      name: "Sebastián",
      lastName: "Montes",
      email: "sebastian.montes@cun.edu.co",
      cedula: "2020202020",
      role: "COORDINATOR",
      status: "ACTIVE",
      mustChangePassword: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      name: "Admin",
      lastName: "Global",
      email: "admin@cun.edu.co",
      cedula: null,
      role: "ADMIN",
      status: "ACTIVE",
      mustChangePassword: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  writeUsers(seed);
  return seed;
}

export function useAdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | "ALL">("ALL");

  // para UX: mostrar contraseña temporal una sola vez
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const seeded = seedIfEmpty();
      // orden por fecha desc
      const sorted = [...seeded].sort((a, b) => {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return db - da;
      });
      setUsers(sorted);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el módulo de usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    let base = [...users];

    if (roleFilter !== "ALL") {
      base = base.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== "ALL") {
      base = base.filter((u) => u.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      base = base.filter((u) => {
        const name = `${u.name} ${u.lastName}`.toLowerCase();
        const email = u.email.toLowerCase();
        const ced = (u.cedula ?? "").toLowerCase();
        return name.includes(q) || email.includes(q) || ced.includes(q);
      });
    }

    return base;
  }, [users, search, statusFilter, roleFilter]);

  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const inactive = total - active;
    const coordinators = users.filter((u) => u.role === "COORDINATOR").length;
    return { total, active, inactive, coordinators };
  }, [users]);

  const createUser = useCallback((dto: CreateAdminUserDto) => {
    setError(null);

    const email = normalizeEmail(dto.email);

    if (!safeTrim(dto.name) || !safeTrim(dto.lastName)) {
      setError("Nombre y apellido son obligatorios.");
      return { ok: false as const };
    }
    if (!isValidEmail(email)) {
      setError("El correo no es válido.");
      return { ok: false as const };
    }

    // unique email
    if (users.some((u) => normalizeEmail(u.email) === email)) {
      setError("Ya existe un usuario con ese correo.");
      return { ok: false as const };
    }

    let password = "";
    if (dto.generatePassword) {
      password = generatePassword(12);
    } else {
      password = dto.password ?? "";
      if (password.trim().length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return { ok: false as const };
      }
    }

    const newUser: AdminUser = {
      id: uid(),
      name: safeTrim(dto.name),
      lastName: safeTrim(dto.lastName),
      email,
      cedula: dto.cedula ? safeTrim(dto.cedula) : null,
      role: dto.role,
      status: "ACTIVE",
      mustChangePassword: dto.mustChangePassword,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    const next = [newUser, ...users];
    setUsers(next);
    writeUsers(next);

    // 👇 solo se muestra una vez en UI
    setLastCreatedCredentials({ email, password });

    return { ok: true as const, user: newUser, password };
  }, [users]);

  const updateUser = useCallback((id: string, patch: UpdateAdminUserDto) => {
    setError(null);
    const next = users.map((u) => {
      if (u.id !== id) return u;
      return {
        ...u,
        ...patch,
        cedula: patch.cedula === undefined ? u.cedula : patch.cedula,
        updatedAt: nowIso(),
      };
    });
    setUsers(next);
    writeUsers(next);
    return { ok: true as const };
  }, [users]);

  const toggleActive = useCallback((id: string) => {
    setError(null);
    const target = users.find((u) => u.id === id);
    if (!target) return { ok: false as const };

    const nextStatus: AdminUserStatus =
      target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    return updateUser(id, { status: nextStatus });
  }, [users, updateUser]);

  const resetPassword = useCallback((id: string): ResetPasswordResult | null => {
    setError(null);
    const target = users.find((u) => u.id === id);
    if (!target) return null;

    const temp = generatePassword(12);

    // en backend real: guardar hash + mustChangePassword=true
    // aquí solo devolvemos la temporal para UI
    updateUser(id, { mustChangePassword: true });

    return { userId: id, temporaryPassword: temp };
  }, [users, updateUser]);

  const clearCredentials = useCallback(() => {
    setLastCreatedCredentials(null);
  }, []);

  return {
    // state
    loading,
    error,
    users,
    filteredUsers,
    metrics,

    // filters
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,

    // actions
    reload: load,
    createUser,
    updateUser,
    toggleActive,
    resetPassword,

    // UX
    lastCreatedCredentials,
    clearCredentials,
  };
}
