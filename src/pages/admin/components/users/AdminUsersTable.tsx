// src/pages/admin/components/users/AdminUsersTable.tsx
import React from "react";
import type { AdminUser, ResetPasswordResult } from "../../adminTypes";
import AdminUserRowActions from "./AdminUserRowActions";

type Props = {
  users: AdminUser[];
  onEdit: (u: AdminUser) => void;
  onToggleActive: (id: string) => { ok: boolean };
  onResetPassword: (id: string) => ResetPasswordResult | null;
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
              const created = new Date(u.createdAt);
              const createdLabel = isNaN(created.getTime())
                ? "-"
                : created.toLocaleString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  });

              const statusBadge =
                u.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-300 border border-rose-500/30";

              return (
                <tr key={u.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">
                      {u.name} {u.lastName}
                    </p>
                    <p className="text-[12px] text-gray-500">{u.email}</p>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-gray-200">
                      {u.role}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusBadge}`}
                    >
                      {u.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-300">
                    {u.cedula ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-400">{createdLabel}</td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <AdminUserRowActions
                        user={u}
                        onEdit={() => onEdit(u)}
                        onToggleActive={() => onToggleActive(u.id)}
                        onResetPassword={() => onResetPassword(u.id)}
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
