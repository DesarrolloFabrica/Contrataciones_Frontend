import React, { useMemo, useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Users, ShieldCheck, UserX, UserCheck } from "lucide-react";
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

  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const hasFilters = useMemo(() => {
    return search.trim().length > 0 || roleFilter !== "ALL" || statusFilter !== "ALL";
  }, [search, roleFilter, statusFilter]);

  const clearAll = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "ALL", label: "Todos" },
    { value: "ACTIVE", label: "Activos" },
    { value: "INACTIVE", label: "Inactivos" },
  ];

  const selectCls = [
    "h-10 px-3.5 rounded-xl text-xs font-medium border outline-none flex items-center gap-2 transition w-full",
    isDark
      ? "bg-white/[0.03] border-white/10 text-neutral-200 hover:border-white/20"
      : "bg-white border-slate-300 text-slate-700 hover:border-slate-400",
  ].join(" ");

  const ddCls = (open: boolean) =>
    [
      "absolute left-0 top-full mt-1.5 z-30 w-56 rounded-xl border p-1.5 backdrop-blur-xl shadow-xl animate-in fade-in zoom-in-95 duration-150",
      isDark
        ? "border-white/10 bg-[#0a0c0b]/95"
        : "border-slate-200 bg-white/95",
    ].join(" ");

  const ddItem = (active: boolean) =>
    [
      "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between",
      active
        ? isDark
          ? "bg-cyan-500/10 text-cyan-300"
          : "bg-cyan-50 text-cyan-700"
        : isDark
          ? "text-neutral-300 hover:bg-white/5"
          : "text-slate-700 hover:bg-slate-50",
    ].join(" ");

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className={`inline-flex items-center gap-1.5 ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
          <Users className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
          <span className={`${isDark ? "text-neutral-400" : "text-slate-500"}`}>
            <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{metrics.total}</span> usuarios
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
          <UserCheck className="w-3.5 h-3.5" />
          <span><span className="font-semibold">{metrics.active}</span> activos</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
          <UserX className="w-3.5 h-3.5" />
          <span><span className="font-semibold">{metrics.inactive}</span> inactivos</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span><span className="font-semibold">{metrics.coordinators}</span> coordinadores</span>
        </span>
      </div>

      <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />

      {/* Filters row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="relative group w-full lg:basis-1/2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className={`h-4 w-4 ${isDark ? "text-white/30" : "text-slate-400"}`} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o cédula…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={[
              "w-full h-10 rounded-xl pl-10 pr-10 text-sm outline-none transition-all",
              isDark
                ? "bg-white/[0.03] border border-white/10 placeholder:text-white/25 text-white focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10"
                : "bg-white border border-slate-300 placeholder:text-slate-400 text-slate-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/40",
            ].join(" ")}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 text-neutral-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 w-full lg:basis-1/2 gap-3">
          {/* Role filter */}
          <div className="relative" ref={roleRef}>
            <button
              type="button"
              onClick={() => setRoleOpen((o) => !o)}
              className={selectCls}
            >
              <span className="truncate flex-1 text-left">{roles.find((o) => o.value === roleFilter)?.label ?? "Rol"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition ${roleOpen ? "rotate-180" : ""} ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
            </button>
            {roleOpen && (
              <div className={ddCls(true)}>
                {roles.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setRoleFilter(opt.value); setRoleOpen(false); }}
                    className={ddItem(opt.value === roleFilter)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status filter */}
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => setStatusOpen((o) => !o)}
              className={selectCls}
            >
              <span className="truncate flex-1 text-left">{statusOptions.find((o) => o.value === statusFilter)?.label ?? "Estado"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition ${statusOpen ? "rotate-180" : ""} ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
            </button>
            {statusOpen && (
              <div className={ddCls(true)}>
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setStatusFilter(opt.value); setStatusOpen(false); }}
                    className={ddItem(opt.value === statusFilter)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {search.trim().length > 0 && (
            <span
              className={[
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition",
                isDark
                  ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300"
                  : "bg-cyan-50 border-cyan-200 text-cyan-700",
              ].join(" ")}
            >
              Búsqueda: <b className="font-semibold">{search.trim()}</b>
              <button type="button" onClick={() => setSearch("")} className="hover:bg-white/20 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {roleFilter !== "ALL" && (
            <span
              className={[
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition",
                isDark
                  ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300"
                  : "bg-cyan-50 border-cyan-200 text-cyan-700",
              ].join(" ")}
            >
              Rol: {roles.find((o) => o.value === roleFilter)?.label}
              <button type="button" onClick={() => setRoleFilter("ALL")} className="hover:bg-white/20 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter !== "ALL" && (
            <span
              className={[
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition",
                statusFilter === "ACTIVE"
                  ? isDark
                    ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300"
                    : "bg-cyan-50 border-cyan-200 text-cyan-700"
                  : isDark
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-300"
                    : "bg-rose-50 border-rose-200 text-rose-700",
              ].join(" ")}
            >
              Estado: {statusFilter === "ACTIVE" ? "Activos" : "Inactivos"}
              <button type="button" onClick={() => setStatusFilter("ALL")} className="hover:bg-white/20 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearAll}
            className={`text-[11px] underline ${
              isDark ? "text-neutral-500 hover:text-neutral-300" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersHeader;
