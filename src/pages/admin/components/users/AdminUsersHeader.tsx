// src/pages/admin/components/users/AdminUsersHeader.tsx
import React, { useMemo } from "react";
import { Filter, Search, XCircle } from "lucide-react";
import type { AdminUserRole, AdminUserStatus } from "../../adminTypes";
import { useTheme } from "../../../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
          <Search
            className={[
              "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2",
              isDark ? "text-gray-500" : "text-slate-400",
            ].join(" ")}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o cédula…"
            className={[
              "w-full rounded-xl pl-9 pr-3 py-2 text-sm outline-none transition-colors",
              isDark
                ? "bg-[#0A0A0A] border border-white/10 text-gray-200 focus:border-emerald-500/50"
                : "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
            ].join(" ")}
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Filter
            className={[
              "w-4 h-4",
              isDark ? "text-gray-500" : "text-slate-400",
            ].join(" ")}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className={[
              "w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors",
              isDark
                ? "bg-[#0A0A0A] border border-white/10 text-gray-200 focus:border-emerald-500/50"
                : "bg-white border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
            ].join(" ")}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={[
              "w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors",
              isDark
                ? "bg-[#0A0A0A] border border-white/10 text-gray-200 focus:border-emerald-500/50"
                : "bg-white border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
            ].join(" ")}
          >
            <option value="ALL">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      {/* active chips – franja fija para que no salten las tarjetas */}
      <div className="min-h-[34px] flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {hasFilters && (
            <>
              {search.trim().length > 0 && (
                <span
                  className={[
                    chipBase,
                    "normal-case",
                    isDark
                      ? "border-white/10 bg-white/5 text-neutral-200"
                      : "border-slate-200 bg-slate-100 text-slate-700",
                  ].join(" ")}
                >
                  <span className="text-neutral-400 uppercase tracking-widest text-[10px]">
                    Búsqueda:
                  </span>
                  <b className="font-semibold">{search.trim()}</b>
                </span>
              )}

              {roleFilter !== "ALL" && (
                <span
                  className={[
                    chipBase,
                    isDark
                      ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                      : "border-cyan-200 bg-cyan-50 text-cyan-700",
                  ].join(" ")}
                >
                  Rol: {roleLabel(roleFilter)}
                </span>
              )}

              {statusFilter !== "ALL" && (
                <span
                  className={[
                    chipBase,
                    statusFilter === "ACTIVE"
                      ? isDark
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : isDark
                        ? "border-rose-500/20 bg-rose-500/10 text-rose-200"
                        : "border-rose-200 bg-rose-50 text-rose-700",
                  ].join(" ")}
                >
                  Estado: {statusLabel(statusFilter)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Acción sutil para limpiar filtros */}
        <button
          type="button"
          onClick={clearAll}
          disabled={!hasFilters}
          className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-semibold transition-colors ${
            hasFilters
              ? isDark
                ? "text-neutral-400 hover:text-neutral-100"
                : "text-slate-500 hover:text-slate-800"
              : isDark
                ? "text-neutral-600 cursor-default"
                : "text-slate-300 cursor-default"
          }`}
          title="Limpiar búsqueda y filtros"
        >
          <XCircle className="w-3 h-3" />
          Limpiar filtros
        </button>
      </div>

      {/* mini metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className={[
            "rounded-2xl px-4 py-3 border",
            isDark
              ? "bg-[#090909] border-white/10"
              : "bg-white border-slate-200 shadow-sm",
          ].join(" ")}
        >
          <p
            className={[
              "text-[11px] uppercase tracking-widest",
              isDark ? "text-gray-500" : "text-slate-500",
            ].join(" ")}
          >
            Total usuarios
          </p>
          <p
            className={[
              "text-xl font-black",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            {metrics.total}
          </p>
        </div>

        <div
          className={[
            "rounded-2xl px-4 py-3 border",
            isDark
              ? "bg-[#090909] border-white/10"
              : "bg-white border-slate-200 shadow-sm",
          ].join(" ")}
        >
          <p
            className={[
              "text-[11px] uppercase tracking-widest",
              isDark ? "text-gray-500" : "text-slate-500",
            ].join(" ")}
          >
            Activos
          </p>
          <p
            className={[
              "text-xl font-black",
              isDark ? "text-emerald-400" : "text-emerald-600",
            ].join(" ")}
          >
            {metrics.active}
          </p>
          <p
            className={[
              "text-[11px] mt-1",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Con acceso al sistema
          </p>
        </div>

        <div
          className={[
            "rounded-2xl px-4 py-3 border",
            isDark
              ? "bg-[#090909] border-white/10"
              : "bg-white border-slate-200 shadow-sm",
          ].join(" ")}
        >
          <p
            className={[
              "text-[11px] uppercase tracking-widest",
              isDark ? "text-gray-500" : "text-slate-500",
            ].join(" ")}
          >
            Inactivos
          </p>
          <p
            className={[
              "text-xl font-black",
              isDark ? "text-rose-400" : "text-rose-600",
            ].join(" ")}
          >
            {metrics.inactive}
          </p>
          <p
            className={[
              "text-[11px] mt-1",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Sin acceso temporal
          </p>
        </div>

        <div
          className={[
            "rounded-2xl px-4 py-3 border",
            isDark
              ? "bg-[#090909] border-white/10"
              : "bg-white border-slate-200 shadow-sm",
          ].join(" ")}
        >
          <p
            className={[
              "text-[11px] uppercase tracking-widest",
              isDark ? "text-gray-500" : "text-slate-500",
            ].join(" ")}
          >
            Coordinadores
          </p>
          <p
            className={[
              "text-xl font-black",
              isDark ? "text-cyan-300" : "text-cyan-600",
            ].join(" ")}
          >
            {metrics.coordinators}
          </p>
          <p
            className={[
              "text-[11px] mt-1",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Rol operativo
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersHeader;
