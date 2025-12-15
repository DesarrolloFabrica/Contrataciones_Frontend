// src/pages/admin/components/users/AdminUsersPanel.tsx
import React, { useMemo, useState } from "react";
import { AlertCircle, Loader2, Users } from "lucide-react";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import type { AdminUser, AdminUserRole } from "../../adminTypes";

import AdminUsersHeader from "./AdminUsersHeader";
import AdminUsersTable from "./AdminUsersTable";
import AdminUserFormModal from "./AdminUserFormModal";

const AdminUsersPanel: React.FC = () => {
  const users = useAdminUsers();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const openCreate = () => {
    setEditUser(null);
    setIsCreateOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditUser(null);
  };

  const roles: { value: AdminUserRole | "ALL"; label: string }[] = useMemo(
    () => [
      { value: "ALL", label: "Todos los roles" },
      { value: "COORDINATOR", label: "Coordinadores" },
      { value: "LEADER", label: "Líderes" },
      { value: "ADMIN", label: "Admins" },
    ],
    []
  );

  return (
    <section className="bg-[#050505]/70 border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-300">
              Usuarios
            </h2>
            <p className="text-xs text-gray-500">
              Crea coordinadores y administra accesos (mock listo para backend).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest shadow-md transition-colors"
        >
          + Crear coordinador
        </button>
      </div>

      <AdminUsersHeader
        search={users.search}
        setSearch={users.setSearch}
        statusFilter={users.statusFilter}
        setStatusFilter={users.setStatusFilter}
        roleFilter={users.roleFilter}
        setRoleFilter={users.setRoleFilter}
        roles={roles}
        metrics={users.metrics}
      />

      {users.loading && (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-sm">Cargando usuarios…</p>
        </div>
      )}

      {!users.loading && users.error && (
        <div className="flex flex-col items-center justify-center py-14 text-red-400 gap-3 bg-red-500/5 rounded-2xl border border-red-500/10">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm text-center max-w-md">{users.error}</p>
        </div>
      )}

      {!users.loading && !users.error && (
        <AdminUsersTable
          users={users.filteredUsers}
          onEdit={openEdit}
          onToggleActive={users.toggleActive}
          onResetPassword={users.resetPassword}
        />
      )}

      <AdminUserFormModal
        open={isCreateOpen}
        onClose={closeModal}
        onCreate={users.createUser}
        onUpdate={users.updateUser}
        editingUser={editUser}
        lastCreatedCredentials={users.lastCreatedCredentials}
        clearCredentials={users.clearCredentials}
      />
    </section>
  );
};

export default AdminUsersPanel;
