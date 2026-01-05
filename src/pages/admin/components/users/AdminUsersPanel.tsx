// src/pages/admin/components/users/AdminUsersPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Users, ShieldCheck, X, Copy, KeyRound } from "lucide-react";
import { createPortal } from "react-dom";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import type { AdminUser, AdminUserRole } from "../../adminTypes";

import AdminUsersHeader from "./AdminUsersHeader";
import AdminUsersTable from "./AdminUsersTable";
import AdminUserFormModal from "./AdminUserFormModal";



// ✅ helpers
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

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

type Props = {
  scope: { selectedSchool: string | null; selectedProgram: string | null };
};

const AdminUsersPanel: React.FC<Props> = ({ scope }) => {
  const users = useAdminUsers(scope);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  // ✅ NEW: drawer state
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityUser, setSecurityUser] = useState<AdminUser | null>(null);

  // ✅ NEW: mostrar temporal generada desde drawer
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [tempCopied, setTempCopied] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

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

  // ✅ NEW: open security drawer
  const openSecurity = (u: AdminUser) => {
    setSecurityUser(u);
    setTempPassword(null);
    setTempCopied(false);
    setSecurityOpen(true);
  };

  const closeSecurity = () => {
    setSecurityOpen(false);
    setSecurityUser(null);
    setTempPassword(null);
    setTempCopied(false);
    setResetBusy(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.count("AdminUsersPanel render");
  });

  // ✅ NEW: reset desde drawer (recomendado para “tener credenciales” luego)
  const runResetFromDrawer = async () => {
    if (!securityUser) return;
    setResetBusy(true);
    setTempPassword(null);
    setTempCopied(false);

    try {
      const res = await users.resetPassword(securityUser.id);
      if (res?.temporaryPassword) {
        setTempPassword(res.temporaryPassword);
      } else {
        setTempPassword(""); // indica fallo
      }
    } catch {
      setTempPassword("");
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <section className="bg-[#050505]/70 border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-300">Usuarios</h2>
            <p className="text-xs text-gray-500">Administra accesos, roles y recuperación de contraseñas.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest shadow-md transition-colors"
        >
          + Crear usuario
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

      {!users.loading && !users.error && !showEmpty && (
        <AdminUsersTable
          users={users.filteredUsers}
          onEdit={openEdit}
          onToggleActive={users.toggleActive}
          onResetPassword={users.resetPassword}
          onViewSecurity={openSecurity} // ✅ NEW
        />
      )}

      {showEmpty && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-6">
          <p className="text-sm text-white font-semibold">Sin resultados</p>
          <p className="text-xs text-neutral-400 mt-1">
            No encontramos usuarios con los filtros actuales. Prueba limpiar la búsqueda o seleccionar “Todos los roles”.
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
              onClick={() => {
                users.setSearch("");
                users.setRoleFilter("ALL");
                users.setStatusFilter("ALL");
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest"
            >
              Limpiar filtros
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest"
            >
              Crear usuario
            </button>
          </div>
        </div>
      )}

      <AdminUserFormModal
        open={isCreateOpen}
        onClose={closeModal}
        onCreate={users.createUser}           // debe ser async y devolver Promise<void>
        onUpdate={users.updateUser}           // debe ser async y devolver Promise<void>
        editingUser={editUser}               // 👈 OJO: usa el state local del panel
        lastCreatedCredentials={users.lastCreatedCredentials}
        clearCredentials={users.clearCredentials}
        // ❌ NO forcedRole / forcedSchoolId aquí, porque Admin decide
      />

      {/* ✅ NEW: Drawer Estado y Seguridad */}
      {securityOpen && securityUser &&
        createPortal(
          <div className="fixed inset-0 z-[10050]">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeSecurity} />

            <div className="absolute inset-y-0 right-0 w-full max-w-md bg-[#070707] border-l border-white/10 shadow-2xl">
              {/* header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-emerald-300 font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Estado y seguridad
                  </p>
                  <h3 className="text-lg font-black text-white mt-1">
                    {securityUser.name} {securityUser.lastName}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">{securityUser.email}</p>
                </div>

                <button
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  onClick={closeSecurity}
                  title="Cerrar"
                >
                  <X className="w-4 h-4 text-gray-200" />
                </button>
              </div>

              {/* body */}
              <div className="p-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-widest text-neutral-500">Rol</p>
                    <p className="text-sm text-white">{roleLabel(securityUser.role)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-widest text-neutral-500">Estado</p>
                    <p className="text-sm text-white">{securityUser.status === "ACTIVE" ? "Activo" : "Inactivo"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-widest text-neutral-500">Debe cambiar contraseña</p>
                    <p className="text-sm text-white">{securityUser.mustChangePassword ? "Sí" : "No"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-widest text-neutral-500">Creado</p>
                    <p className="text-sm text-white">{fmtDateTime(securityUser.createdAt)}</p>
                  </div>
                </div>

                {/* Reset password action */}
                <div className="rounded-2xl border border-white/10 bg-[#090909] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-white font-semibold flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-amber-300" />
                        Resetear contraseña
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Genera una contraseña temporal nueva. Se muestra una sola vez.
                      </p>
                    </div>

                    <button
                      onClick={runResetFromDrawer}
                      disabled={resetBusy}
                      className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors ${
                        resetBusy
                          ? "bg-white/5 text-neutral-500 border-white/10 cursor-not-allowed"
                          : "bg-amber-500/10 text-amber-200 border-amber-500/20 hover:bg-amber-500/15"
                      }`}
                    >
                      {resetBusy ? "Procesando..." : "Reset"}
                    </button>
                  </div>

                  {tempPassword !== null && (
                    <div className="mt-3">
                      {tempPassword ? (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-widest text-emerald-300 font-bold">
                              Temporal generada
                            </p>
                            <p className="text-sm text-white break-all mt-1">{tempPassword}</p>
                          </div>

                          <button
                            onClick={async () => {
                              await copyText(tempPassword);
                              setTempCopied(true);
                              setTimeout(() => setTempCopied(false), 1200);
                            }}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            {tempCopied ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                          <p className="text-sm text-rose-200 font-semibold">No se pudo generar la contraseña temporal.</p>
                          <p className="text-xs text-neutral-400 mt-1">Revisa backend o intenta de nuevo.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-widest text-neutral-500">Recomendación</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    No guardes contraseñas en el panel. Para acceso posterior, usa <b>Resetear contraseña</b> y comparte por un canal seguro.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </section>
  );
};

export default AdminUsersPanel;
