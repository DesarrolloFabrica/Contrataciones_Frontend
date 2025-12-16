// src/pages/admin/components/users/AdminUsersHeader.tsx
import React, { useMemo } from "react";
import { Filter, Search, XCircle } from "lucide-react";
import type { AdminUserRole, AdminUserStatus } from "../../adminTypes";

type StatusFilter = "ALL" | AdminUserStatus;

type Props = {
  search: string;
  setSearch: (v: string) => void;

  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;

  roleFilter: AdminUserRole | "ALL";
  setRoleFilter: (v: AdminUserRole | "ALL") => void;

  roles: { value: AdminUserRole | "ALL"; label: string }[];

  metrics: {
    total: number;
    active: number;
    inactive: number;
    coordinators: number;
  };
};

const chipBase =
  "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest";

const statusLabel = (s: StatusFilter) => {
  switch (s) {
    case "ACTIVE":
      return "Activos";
    case "INACTIVE":
      return "Inactivos";
    default:
      return "Todos";
  }
};

const roleLabel = (role: AdminUserRole | "ALL") => {
  switch (role) {
    case "COORDINATOR":
      return "Coordinadores";
    case "LEADER":
      return "Líderes";
    case "ADMIN":
      return "Administradores";
    default:
      return "Todos los roles";
  }
};

const AdminUsersHeader: React.FC<Props> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  roles,
  metrics,
}) => {
  const hasFilters = useMemo(() => {
    return (
      search.trim().length > 0 || roleFilter !== "ALL" || statusFilter !== "ALL"
    );
  }, [search, roleFilter, statusFilter]);

  const clearAll = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  return (
    <div className="space-y-4 mb-4">
      {/* filters row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-7 relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o cédula…"
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>

          {/* clear filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              title="Limpiar búsqueda y filtros"
            >
              <XCircle className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* active chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {search.trim().length > 0 && (
            <span className={`${chipBase} border-white/10 bg-white/5 text-neutral-200 normal-case`}>
              <span className="text-neutral-400 uppercase tracking-widest text-[10px]">
                Búsqueda:
              </span>
              <b className="font-semibold">{search.trim()}</b>
            </span>
          )}

          {roleFilter !== "ALL" && (
            <span className={`${chipBase} border-cyan-500/20 bg-cyan-500/10 text-cyan-200`}>
              Rol: {roleLabel(roleFilter)}
            </span>
          )}

          {statusFilter !== "ALL" && (
            <span
              className={`${chipBase} ${
                statusFilter === "ACTIVE"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-500/20 bg-rose-500/10 text-rose-200"
              }`}
            >
              Estado: {statusLabel(statusFilter)}
            </span>
          )}
        </div>
      )}

      {/* mini metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#090909] border border-white/10 rounded-2xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">
            Total usuarios
          </p>
          <p className="text-xl font-black text-white">{metrics.total}</p>
        </div>

        <div className="bg-[#090909] border border-white/10 rounded-2xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">
            Activos
          </p>
          <p className="text-xl font-black text-emerald-400">{metrics.active}</p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Con acceso al sistema
          </p>
        </div>

        <div className="bg-[#090909] border border-white/10 rounded-2xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">
            Inactivos
          </p>
          <p className="text-xl font-black text-rose-400">{metrics.inactive}</p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Sin acceso temporal
          </p>
        </div>

        <div className="bg-[#090909] border border-white/10 rounded-2xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">
            Coordinadores
          </p>
          <p className="text-xl font-black text-cyan-300">{metrics.coordinators}</p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Rol operativo
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersHeader;
