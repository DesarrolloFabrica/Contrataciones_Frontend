// src/pages/admin/components/users/AdminUsersHeader.tsx
import React from "react";
import { Filter, Search } from "lucide-react";
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

        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      {/* mini metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#090909] border border-white/10 rounded-2xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">
            Total
          </p>
          <p className="text-xl font-black text-white">{metrics.total}</p>
        </div>
        <div className="bg-[#090909] border border-white/10 rounded-2xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">
            Activos
          </p>
          <p className="text-xl font-black text-emerald-400">{metrics.active}</p>
        </div>
        <div className="bg-[#090909] border border-white/10 rounded-2xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">
            Inactivos
          </p>
          <p className="text-xl font-black text-rose-400">{metrics.inactive}</p>
        </div>
        <div className="bg-[#090909] border border-white/10 rounded-2xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">
            Coordinadores
          </p>
          <p className="text-xl font-black text-cyan-300">
            {metrics.coordinators}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersHeader;
