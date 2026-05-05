import React from "react";
import { ChevronLeft, ChevronRight, Search, ShieldCheck } from "lucide-react";
import type { AdminUser } from "../../adminTypes";
import AdminUserRowActions from "./AdminUserRowActions";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  users: AdminUser[];
  onEdit: (u: AdminUser) => void;
  onToggleActive: (id: string) => Promise<{ ok: boolean }>;
  onViewSecurity?: (u: AdminUser) => void;
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const roleLabel = (role: AdminUser["role"]) => {
  switch (role) {
    case "COORDINATOR": return "Coordinador";
    case "LEADER": return "Líder";
    case "ADMIN": return "Administrador";
    default: return role;
  }
};

const roleConfig: Record<AdminUser["role"], { badge: string }> = {
  ADMIN: {
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
  },
  LEADER: {
    badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30",
  },
  COORDINATOR: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  },
};

const statusConfig: Record<AdminUser["status"], { badge: string; dot: string }> = {
  ACTIVE: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  INACTIVE: {
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
    dot: "bg-rose-500",
  },
};

const AdminUsersTable: React.FC<Props> = ({
  users,
  onEdit,
  onToggleActive,
  onViewSecurity,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pageSize = 10;
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [users?.length]);

  const total = users?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  const pageItems = React.useMemo(() => {
    if (!users?.length) return [];
    const start = (safePage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, safePage, pageSize]);

  if (!total) {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-16 ${
        isDark ? "border-white/10 bg-black/10 text-neutral-400" : "border-slate-200 bg-slate-50 text-slate-500"
      }`}>
        <Search className="w-8 h-8 opacity-50" />
        <p className="text-sm font-medium">No se encontraron usuarios</p>
        <p className="text-xs opacity-60">Ajusta los filtros o crea un nuevo usuario.</p>
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-2xl overflow-hidden border",
        isDark
          ? "border-white/10 bg-[#090909]"
          : "border-slate-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead
            className={[
              "sticky top-0 z-10 border-b",
              isDark
                ? "bg-[#0B0B0B] border-white/10"
                : "bg-slate-50 border-slate-200",
            ].join(" ")}
          >
            <tr
              className={[
                "text-left text-[11px] uppercase tracking-widest",
                isDark ? "text-gray-500" : "text-slate-500",
              ].join(" ")}
            >
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Cédula</th>
              <th className="px-4 py-3 font-semibold">Creado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody
            className={
              isDark ? "divide-y divide-white/5" : "divide-y divide-slate-100"
            }
          >
            {pageItems.map((u) => {
              const createdLabel = fmtDate(u.createdAt);
              const roleCfg = roleConfig[u.role];
              const statusCfg = statusConfig[u.status];

              return (
                <tr
                  key={u.id}
                  className={
                    isDark
                      ? "hover:bg-white/[0.03] transition-colors"
                      : "hover:bg-cyan-50/40 transition-colors"
                  }
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={[
                          "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0",
                          isDark
                            ? "bg-white/5 border-white/10"
                            : "bg-cyan-50 border-cyan-100",
                        ].join(" ")}
                      >
                        <ShieldCheck
                          className={[
                            "w-4 h-4",
                            isDark ? "text-cyan-400" : "text-cyan-600",
                          ].join(" ")}
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={[
                            "font-semibold truncate",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          {u.name} {u.lastName}
                        </p>
                        <p
                          className={[
                            "text-[12px] truncate",
                            isDark ? "text-gray-500" : "text-slate-700",
                          ].join(" ")}
                        >
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${roleCfg.badge}`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusCfg.badge}`}
                      >
                        {u.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>

                  <td
                    className={[
                      "px-4 py-3.5",
                      isDark ? "text-gray-300" : "text-slate-800",
                    ].join(" ")}
                  >
                    {u.cedula ?? "—"}
                  </td>

                  <td
                    className={[
                      "px-4 py-3.5",
                      isDark ? "text-gray-400" : "text-slate-500",
                    ].join(" ")}
                  >
                    {createdLabel}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      <AdminUserRowActions
                        user={u}
                        onEdit={() => onEdit(u)}
                        onToggleActive={() => onToggleActive(u.id)}
                        onViewSecurity={onViewSecurity}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className={[
          "flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 border-t",
          isDark
            ? "border-white/10 bg-[#0B0B0B]"
            : "border-slate-200 bg-slate-50",
        ].join(" ")}
      >
        <p
          className={[
            "text-[11px]",
            isDark ? "text-gray-500" : "text-slate-500",
          ].join(" ")}
        >
          Mostrando{" "}
          <span
            className={[
              "font-semibold",
              isDark ? "text-gray-200" : "text-slate-800",
            ].join(" ")}
          >
            {from}
          </span>
          {" – "}
          <span
            className={[
              "font-semibold",
              isDark ? "text-gray-200" : "text-slate-800",
            ].join(" ")}
          >
            {to}
          </span>{" "}
          de{" "}
          <span
            className={[
              "font-semibold",
              isDark ? "text-gray-200" : "text-slate-800",
            ].join(" ")}
          >
            {total}
          </span>{" "}
          usuarios
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className={[
              "h-8 px-3 rounded-lg border text-[11px] font-medium transition flex items-center gap-1",
              safePage <= 1
                ? isDark
                  ? "border-white/5 text-neutral-600 cursor-not-allowed"
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
                : isDark
                  ? "border-white/10 text-neutral-300 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>

          <span
            className={[
              "text-[11px] min-w-[40px] text-center",
              isDark ? "text-neutral-400" : "text-slate-500",
            ].join(" ")}
          >
            {safePage}/{totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className={[
              "h-8 px-3 rounded-lg border text-[11px] font-medium transition flex items-center gap-1",
              safePage >= totalPages
                ? isDark
                  ? "border-white/5 text-neutral-600 cursor-not-allowed"
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
                : isDark
                  ? "border-white/10 text-neutral-300 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            Siguiente
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersTable;
