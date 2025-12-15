// src/pages/admin/components/users/AdminUsersTable.tsx
import React from "react";
import type { AdminUser, ResetPasswordResult } from "../../adminTypes";
import AdminUserRowActions from "./AdminUserRowActions";

type Props = {
  users: AdminUser[];
  onEdit: (u: AdminUser) => void;
  onToggleActive: (id: string) => Promise<{ ok: boolean }>;
  onResetPassword: (id: string) => Promise<ResetPasswordResult | null>;
};

const fmtDate = (iso: string) => {
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
}) => {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm border border-white/10 rounded-2xl bg-[#090909]">
        No hay usuarios para los filtros actuales.
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#090909]">
      <div className="max-h-[520px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#0B0B0B] border-b border-white/10 z-10">
            <tr className="text-left text-[11px] uppercase tracking-widest text-gray-500">
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Cédula</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {users.map((u) => {
              const createdLabel = fmtDate(u.createdAt);
              const statusCls = statusBadge(u.status);
              const roleCls = roleBadge(u.role);

              return (
                <tr key={u.id} className="hover:bg-white/[0.03]">
                  {/* Usuario */}
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {u.name} {u.lastName}
                      </p>
                      <p className="text-[12px] text-gray-500 truncate">{u.email}</p>

                      {/* Señal útil para soporte */}
                      {u.mustChangePassword && (
                        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-200 border border-yellow-500/20">
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
                  <td className="px-4 py-3 text-gray-300">{u.cedula ?? "—"}</td>

                  {/* Creado */}
                  <td className="px-4 py-3 text-gray-400">{createdLabel}</td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <AdminUserRowActions
                        user={u}
                        onEdit={() => onEdit(u)}
                        onToggleActive={async () => {
                          await onToggleActive(u.id);
                        }}
                        onResetPassword={async () => {
                          return await onResetPassword(u.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersTable;
