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
    <div className="relative w-full space-y-4 animate-in fade-in duration-300">
      {/* Header — misma línea que coordinador/líder */}
      <section
        className={[
          "relative overflow-hidden rounded-2xl border px-4 py-4 md:px-5",
          isDark
            ? "border-white/[0.08] bg-gradient-to-r from-[#0f1f23] via-[#0d1a1e] to-[#102226]"
            : "border-slate-200/80 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.2)]",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl",
            isDark ? "bg-emerald-500/12" : "bg-emerald-400/15",
          ].join(" ")}
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                isDark
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className={`text-xl font-bold tracking-tight md:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                Usuarios
              </h1>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Gestión de roles y acceso con Google institucional (@cun.edu.co)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.8)] transition hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            Crear usuario
          </button>
        </div>
      </section>

      {/* Card principal: filtros + tabla */}
      <section
        className={[
          "overflow-hidden rounded-2xl border",
          isDark
            ? "border-white/[0.08] bg-[#0d252b]"
            : "border-slate-200/80 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.18)]",
        ].join(" ")}
      >
        <div
          className={`h-1 w-full ${
            isDark
              ? "bg-gradient-to-r from-emerald-500/70 via-teal-400/50 to-transparent"
              : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300"
          }`}
        />

        <div className="space-y-4 p-4 md:p-5">
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
        </div>

        <div className={`border-t ${isDark ? "border-white/10" : "border-slate-100"}`} />

        {!users.loading && !users.error && !showEmpty && (
          <div
            className={[
              "flex items-center justify-between border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] md:px-5",
              isDark
                ? "border-white/10 bg-white/[0.03] text-slate-400"
                : "border-slate-100 bg-slate-50 text-slate-500",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <Users className={`h-3.5 w-3.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <span>Listado de usuarios</span>
            </div>
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                isDark
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {users.filteredUsers?.length ?? 0} resultados
            </span>
          </div>
        )}

        {users.loading && (
          <div className={`flex flex-col items-center justify-center gap-3 py-16 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <span className="text-sm">Cargando usuarios…</span>
          </div>
        )}

        {!users.loading && users.error && (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center">
            <div className={`rounded-xl p-3 ${isDark ? "bg-rose-500/10" : "bg-rose-50"}`}>
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{users.error}</p>
          </div>
        )}

        {!users.loading && !users.error && !showEmpty && (
          <AdminUsersTable
            users={users.filteredUsers}
            onEdit={openEdit}
            onToggleActive={users.toggleActive}
            onViewSecurity={openSecurity}
            variant="embedded"
          />
        )}

        {showEmpty && (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <div
              className={[
                "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-400",
              ].join(" ")}
            >
              <Users className="h-6 w-6" />
            </div>
            <p className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Sin resultados
            </p>
            <p className={`mt-1 max-w-sm text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              No encontramos usuarios con los filtros actuales.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  users.setSearch("");
                  users.setRoleFilter("ALL");
                  users.setStatusFilter("ALL");
                }}
                className={[
                  "rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
                  isDark
                    ? "border-white/10 text-slate-200 hover:bg-white/[0.06]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.8)] hover:bg-emerald-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Crear usuario
              </button>
            </div>
          </div>
        )}
      </section>

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
                  ? "bg-[#0d252b] border-white/10"
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
                      isDark ? "text-brand-300" : "text-brand-700",
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
                      ? "border-[#579689]/18 bg-[#07171c]/55"
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
