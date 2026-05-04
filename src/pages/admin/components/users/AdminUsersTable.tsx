// src/pages/admin/components/users/AdminUsersTable.tsx
import React from "react";
import type { AdminUser, ResetPasswordResult } from "../../adminTypes";
import AdminUserRowActions from "./AdminUserRowActions";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  users: AdminUser[];
  onEdit: (u: AdminUser) => void;
  onToggleActive: (id: string) => Promise<{ ok: boolean }>;
  onResetPassword: (id: string) => Promise<ResetPasswordResult | null>;
  onViewSecurity: (u: AdminUser) => void;
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
    case "COORDINATOR":
      return "Coordinador";
    case "LEADER":
      return "Líder";
    case "ADMIN":
      return "Administrador";
    default:
      return role;
  }
};

const roleBadge = (role: AdminUser["role"]) => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-500/10 text-purple-200 border border-purple-500/30";
    case "LEADER":
      return "bg-cyan-500/10 text-cyan-200 border border-cyan-500/30";
    case "COORDINATOR":
    default:
      return "bg-white/5 text-gray-200 border border-white/10";
  }
};

const statusBadge = (status: AdminUser["status"]) => {
  return status === "ACTIVE"
    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
    : "bg-rose-500/10 text-rose-300 border border-rose-500/30";
};

const AdminUsersTable: React.FC<Props> = ({
  users,
  onEdit,
  onToggleActive,
  onResetPassword,
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
      <div
        className={[
          "flex items-center justify-center py-12 text-sm rounded-2xl border",
          isDark
            ? "text-gray-500 border-white/10 bg-[#090909]"
            : "text-slate-500 border-slate-200 bg-slate-50",
        ].join(" ")}
      >
        No hay usuarios para los filtros actuales.
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
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Cédula</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody
            className={
              isDark ? "divide-y divide-white/5" : "divide-y divide-slate-100"
            }
          >
            {pageItems.map((u) => {
              const createdLabel = fmtDate(u.createdAt);
              const statusCls = statusBadge(u.status);
              const roleCls = roleBadge(u.role);

              return (
                <tr
                  key={u.id}
                  className={
                    isDark
                      ? "hover:bg-white/[0.03]"
                      : "hover:bg-cyan-50/40"
                  }
                >
                  {/* Usuario */}
                  <td className="px-4 py-3">
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

                      {u.mustChangePassword && (
                        <span
                          className={[
                            "mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            isDark
                              ? "bg-yellow-500/10 text-yellow-200 border-yellow-500/20"
                              : "bg-amber-50 text-amber-700 border-amber-200",
                          ].join(" ")}
                        >
                          Debe cambiar contraseña
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${roleCls}`}
                      title={u.role}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusCls}`}
                    >
                      {u.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  {/* Cédula */}
                  <td
                    className={[
                      "px-4 py-3",
                      isDark ? "text-gray-300" : "text-slate-800",
                    ].join(" ")}
                  >
                    {u.cedula ?? "—"}
                  </td>

                  {/* Creado */}
                  <td
                    className={[
                      "px-4 py-3",
                      isDark ? "text-gray-400" : "text-slate-500",
                    ].join(" ")}
                  >
                    {createdLabel}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <AdminUserRowActions
                        user={u}
                        onEdit={() => onEdit(u)}
                        onToggleActive={() => onToggleActive(u.id)}
                        onResetPassword={() => onResetPassword(u.id)}
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

      {/* Paginación inferior */}
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
              "h-8 px-3 rounded-xl border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors",
              safePage <= 1
                ? isDark
                  ? "bg-white/5 border-white/10 text-neutral-600 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-300 cursor-not-allowed"
                : isDark
                  ? "bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            Anterior
          </button>

          <span
            className={[
              "text-[11px]",
              isDark ? "text-gray-400" : "text-slate-500",
            ].join(" ")}
          >
            {safePage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className={[
              "h-8 px-3 rounded-xl border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors",
              safePage >= totalPages
                ? isDark
                  ? "bg-white/5 border-white/10 text-neutral-600 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-300 cursor-not-allowed"
                : isDark
                  ? "bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersTable;
