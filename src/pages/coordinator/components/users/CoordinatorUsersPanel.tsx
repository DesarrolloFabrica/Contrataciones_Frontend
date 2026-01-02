// src/pages/coordinator/components/users/CoordinatorUsersPanel.tsx
import React, { useMemo, useState } from "react";
import { AlertCircle, Loader2, Users } from "lucide-react";

// ✅ Hook nuevo (lo haremos después): listado + createUser ya restringido a líderes de su escuela
import { useCoordinatorUsers } from "../../hooks/useCoordinatorUsers";

import type { AdminUser, AdminUserRole } from "../../../admin/adminTypes"; 
// ^ reutilizamos tipos si ya existen. Si tienes tipos separados para coordinador, ajusta ruta.

import AdminUsersHeader from "../../../admin/components/users/AdminUsersHeader";
import AdminUsersTable from "../../../admin/components/users/AdminUsersTable";
import AdminUserFormModal from "../../../admin/components/users/AdminUserFormModal";

const CoordinatorUsersPanel: React.FC = () => {
  // ✅ trae usuarios restringidos (solo líderes de la escuela del coordinador)
  const users = useCoordinatorUsers();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const openCreate = () => {
    // ✅ Coordinador solo crea LÍDER: modal abrirá en modo crear (sin edición)
    setEditUser(null);
    setIsCreateOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    // ✅ Si permites editar líderes, ok. Si NO, luego lo bloqueamos en tabla/actions.
    setEditUser(u);
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditUser(null);
  };

  // ✅ Roles visibles para Coordinador (solo Líder)
  const roles: { value: AdminUserRole | "ALL"; label: string }[] = useMemo(
    () => [
      { value: "ALL", label: "Todos los roles" }, // opcional
      { value: "LEADER", label: "Líderes" },
    ],
    []
  );

  const showEmpty =
    !users.loading &&
    !users.error &&
    (users.filteredUsers?.length ?? 0) === 0;

  return (
    <section className="bg-[#050505]/70 border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-300">
              Líderes de mi escuela
            </h2>
            <p className="text-xs text-gray-500">
              Crea y gestiona usuarios Líder asociados a tu escuela.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest shadow-md transition-colors"
        >
          + Crear líder
        </button>
      </div>

      {/* ✅ Header reutilizado. Si quieres, podemos ocultar el filtro de roles en esta vista */}
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

      {!users.loading && !users.error && !showEmpty && (
        <AdminUsersTable
          users={users.filteredUsers}
          onEdit={openEdit}
          onToggleActive={users.toggleActive}
          onResetPassword={users.resetPassword}
        />
      )}

      {showEmpty && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-6">
          <p className="text-sm text-white font-semibold">Sin resultados</p>
          <p className="text-xs text-neutral-400 mt-1">
            No encontramos líderes con los filtros actuales.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => users.setSearch("")}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest"
            >
              Limpiar búsqueda
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest"
            >
              Crear líder
            </button>
          </div>
        </div>
      )}

      {/* ✅ Reutilizamos el mismo modal, pero el hook/users.createUser será el que fuerza:
          role=LEADER y schoolId = coordinator.schoolId */}
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

export default CoordinatorUsersPanel;
