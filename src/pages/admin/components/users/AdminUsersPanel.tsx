import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Users, ShieldCheck, X, Plus } from "lucide-react";
import { createPortal } from "react-dom";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import type { AdminUser, AdminUserRole } from "../../adminTypes";
import { useTheme } from "../../../../context/ThemeContext";

import AdminUsersHeader from "./AdminUsersHeader";
import AdminUsersTable from "./AdminUsersTable";
import AdminUserFormModal from "./AdminUserFormModal";

const fmtDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CO", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const roleLabel = (role: AdminUser["role"]) => {
  switch (role) {
    case "COORDINATOR": return "Coordinador";
    case "LEADER": return "Líder";
    case "ADMIN": return "Administrador";
    default: return role;
  }
};

type Props = {
  scope: { selectedSchool: string | null; selectedProgram: string | null };
};

const AdminUsersPanel: React.FC<Props> = ({ scope }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const users = useAdminUsers(scope);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityUser, setSecurityUser] = useState<AdminUser | null>(null);

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

  const openSecurity = (u: AdminUser) => {
    setSecurityUser(u);
    setSecurityOpen(true);
  };

  const closeSecurity = () => {
    setSecurityOpen(false);
    setSecurityUser(null);
  };

  const roles: { value: AdminUserRole | "ALL"; label: string }[] = useMemo(
    () => [
      { value: "ALL", label: "Todos los roles" },
      { value: "COORDINATOR", label: "Coordinadores" },
      { value: "LEADER", label: "Líderes" },
      { value: "ADMIN", label: "Administradores" },
    ],
    []
  );

  const showEmpty = !users.loading && !users.error && (users.filteredUsers?.length ?? 0) === 0;

  useEffect(() => {
    console.count("AdminUsersPanel mount");
  }, []);

  return (
    <div className="space-y-5">
      {/* Section 1: Title + actions */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Usuarios
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
              Gestión de roles y acceso con Google institucional (@cun.edu.co).
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="h-10 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Crear usuario
          </button>
        </div>
      </div>

      {/* Section 2: Main card */}
      <div
        className={[
          "rounded-2xl border p-5 md:p-6 space-y-5",
          isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200",
        ].join(" ")}
      >
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

        <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />

        <div className="space-y-4">
          {/* Results count */}
          <div className="flex items-center gap-2 text-xs">
            <span className={isDark ? "text-neutral-400" : "text-slate-500"}>
              {users.filteredUsers?.length ?? 0} {users.filteredUsers?.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          {users.loading && (
            <div
              className={[
                "flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border",
                isDark
                  ? "text-neutral-500 border-white/10 bg-black/10"
                  : "text-slate-500 border-slate-200 bg-slate-50",
              ].join(" ")}
            >
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              <p className="text-sm">Cargando usuarios…</p>
            </div>
          )}

          {!users.loading && users.error && (
            <div
              className={[
                "flex flex-col items-center justify-center py-14 gap-3 rounded-2xl border",
                isDark
                  ? "text-red-400 bg-red-500/5 border-red-500/10"
                  : "text-red-700 bg-red-50 border-red-200",
              ].join(" ")}
            >
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm text-center max-w-md">{users.error}</p>
            </div>
          )}

          {!users.loading && !users.error && !showEmpty && (
            <AdminUsersTable
              users={users.filteredUsers}
              onEdit={openEdit}
              onToggleActive={users.toggleActive}
              onViewSecurity={openSecurity}
            />
          )}

          {showEmpty && (
            <div
              className={[
                "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-16",
                isDark
                  ? "border-white/10 bg-black/10 text-neutral-400"
                  : "border-slate-200 bg-slate-50 text-slate-500",
              ].join(" ")}
            >
              <Users className="w-8 h-8 opacity-50" />
              <p className="text-sm font-medium">Sin resultados</p>
              <p className="text-xs opacity-60">
                No encontramos usuarios con los filtros actuales.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { users.setSearch(""); users.setRoleFilter("ALL"); users.setStatusFilter("ALL"); }}
                  className={[
                    "px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest border transition",
                    isDark
                      ? "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700",
                  ].join(" ")}
                >
                  Limpiar filtros
                </button>
                <button
                  type="button"
                  onClick={openCreate}
                  className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/25"
                >
                  Crear usuario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminUserFormModal
        open={isCreateOpen}
        onClose={closeModal}
        onCreate={users.createUser}
        onUpdate={users.updateUser}
        editingUser={editUser}
      />

      {/* Security Drawer */}
      {securityOpen &&
        securityUser &&
        createPortal(
          <div className="fixed inset-0 z-[10050]">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeSecurity}
            />

            <div
              className={[
                "absolute inset-y-0 right-0 w-full max-w-md border-l shadow-2xl",
                isDark
                  ? "bg-[#070707] border-white/10"
                  : "bg-white border-slate-200",
              ].join(" ")}
            >
              {/* header */}
              <div
                className={[
                  "px-6 py-5 border-b flex items-start justify-between",
                  isDark
                    ? "border-white/10"
                    : "border-slate-200 bg-slate-50",
                ].join(" ")}
              >
                <div>
                  <p
                    className={[
                      "text-[11px] uppercase tracking-widest font-bold flex items-center gap-2",
                      isDark ? "text-cyan-300" : "text-cyan-700",
                    ].join(" ")}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Estado y seguridad
                  </p>
                  <h3
                    className={[
                      "text-lg font-black mt-1",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    {securityUser.name} {securityUser.lastName}
                  </h3>
                  <p
                    className={[
                      "text-xs mt-1",
                      isDark ? "text-neutral-400" : "text-slate-600",
                    ].join(" ")}
                  >
                    {securityUser.email}
                  </p>
                </div>

                <button
                  className={[
                    "p-2 rounded-xl border transition-colors",
                    isDark
                      ? "bg-white/5 hover:bg-white/10 border-white/10"
                      : "bg-white hover:bg-slate-100 border-slate-200",
                  ].join(" ")}
                  onClick={closeSecurity}
                  title="Cerrar"
                >
                  <X
                    className={[
                      "w-4 h-4",
                      isDark ? "text-gray-200" : "text-slate-500",
                    ].join(" ")}
                  />
                </button>
              </div>

              {/* body */}
              <div className="p-6 space-y-4">
                <div
                  className={[
                    "rounded-2xl border p-4 space-y-2",
                    isDark
                      ? "border-white/10 bg-black/25"
                      : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                      Rol
                    </p>
                    <p className={`text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                      {roleLabel(securityUser.role)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                      Estado
                    </p>
                    <p className={`text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                      {securityUser.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                      Acceso
                    </p>
                    <p className={`text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                      Google @cun.edu.co
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                      Creado
                    </p>
                    <p className={`text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                      {fmtDateTime(securityUser.createdAt)}
                    </p>
                  </div>
                </div>

                <div
                  className={[
                    "rounded-2xl border p-4",
                    isDark
                      ? "border-white/10 bg-black/20"
                      : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <p className={`text-[11px] uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                    Nota
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
                    El usuario inicia sesión únicamente con su cuenta institucional en Google. No hay contraseñas locales en el sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AdminUsersPanel;
