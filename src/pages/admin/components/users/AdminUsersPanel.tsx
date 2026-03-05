// src/pages/admin/components/users/AdminUsersPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Users, ShieldCheck, X, Copy, KeyRound } from "lucide-react";
import { createPortal } from "react-dom";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import type { AdminUser, AdminUserRole } from "../../adminTypes";
import { useTheme } from "../../../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
    <section
      className={[
        "relative rounded-[28px] overflow-hidden border",
        isDark
          ? "border-white/10 bg-[#0B0E10] shadow-[0_30px_120px_rgba(0,0,0,0.70)]"
          : "border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)]",
      ].join(" ")}
    >
      {/* Fondo premium alineado con Evaluaciones */}
      {isDark && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent" />
        </div>
      )}

      <div className="relative p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={[
                "w-10 h-10 rounded-2xl flex items-center justify-center border",
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-emerald-50 border-emerald-100",
              ].join(" ")}
            >
              <Users
                className={[
                  "w-5 h-5",
                  isDark ? "text-emerald-400" : "text-emerald-600",
                ].join(" ")}
              />
            </div>
            <div>
              <h2
                className={[
                  "text-sm font-bold uppercase tracking-widest",
                  isDark ? "text-gray-300" : "text-slate-900",
                ].join(" ")}
              >
                Usuarios
              </h2>
              <p
                className={[
                  "text-xs",
                  isDark ? "text-gray-500" : "text-slate-600",
                ].join(" ")}
              >
                Administra accesos, roles y recuperación de contraseñas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest shadow-[0_10px_25px_rgba(16,185,129,0.35)] transition-colors"
          >
            + Crear usuario
          </button>
        </div>

        {/* Layout principal: filtros/metricas arriba y tabla debajo (como panel de líder) */}
        <div className="space-y-5">
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

          <div className="space-y-4">
            {users.loading && (
              <div
                className={[
                  "flex flex-col items-center justify-center py-16 gap-3",
                  isDark ? "text-neutral-500" : "text-slate-500",
                ].join(" ")}
              >
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
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
                onResetPassword={users.resetPassword}
                onViewSecurity={openSecurity} // ✅ NEW
              />
            )}

            {showEmpty && (
              <div
                className={[
                  "rounded-2xl border p-6",
                  isDark
                    ? "border-white/10 bg-black/20"
                    : "border-slate-200 bg-slate-50",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-sm font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  Sin resultados
                </p>
                <p
                  className={[
                    "text-xs mt-1",
                    isDark ? "text-neutral-400" : "text-slate-600",
                  ].join(" ")}
                >
                  No encontramos usuarios con los filtros actuales. Prueba limpiar la
                  búsqueda o seleccionar “Todos los roles”.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => users.setSearch("")}
                    className={[
                      "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border",
                      isDark
                        ? "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-100"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700",
                    ].join(" ")}
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
                    className={[
                      "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border",
                      isDark
                        ? "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-100"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700",
                    ].join(" ")}
                  >
                    Limpiar filtros
                  </button>

                  <button
                    type="button"
                    onClick={openCreate}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest shadow-[0_8px_20px_rgba(16,185,129,0.35)]"
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
          lastCreatedCredentials={users.lastCreatedCredentials}
          clearCredentials={users.clearCredentials}
        />

        {/* ✅ NEW: Drawer Estado y Seguridad */}
        {securityOpen &&
          securityUser &&
          createPortal(
            <div className="fixed inset-0 z-[10050]">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
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
                    "px-5 py-4 border-b flex items-start justify-between",
                    isDark
                      ? "border-white/10"
                      : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <div>
                    <p
                      className={[
                        "text-[11px] uppercase tracking-widest font-bold flex items-center gap-2",
                        isDark ? "text-emerald-300" : "text-emerald-700",
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
                <div className="p-5 space-y-4">
                  <div
                    className={[
                      "rounded-2xl border p-4 space-y-2",
                      isDark
                        ? "border-white/10 bg-black/25"
                        : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={[
                          "text-[11px] uppercase tracking-widest",
                          isDark
                            ? "text-neutral-500"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        Rol
                      </p>
                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {roleLabel(securityUser.role)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={[
                          "text-[11px] uppercase tracking-widest",
                          isDark
                            ? "text-neutral-500"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        Estado
                      </p>
                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {securityUser.status === "ACTIVE"
                          ? "Activo"
                          : "Inactivo"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={[
                          "text-[11px] uppercase tracking-widest",
                          isDark
                            ? "text-neutral-500"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        Debe cambiar contraseña
                      </p>
                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {securityUser.mustChangePassword ? "Sí" : "No"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={[
                          "text-[11px] uppercase tracking-widest",
                          isDark
                            ? "text-neutral-500"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        Creado
                      </p>
                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {fmtDateTime(securityUser.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Reset password action */}
                  <div
                    className={[
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-[#090909]"
                        : "border-amber-100 bg-amber-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p
                          className={[
                            "text-sm font-semibold flex items-center gap-2",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          Resetear contraseña
                        </p>
                        <p
                          className={[
                            "text-xs mt-1",
                            isDark
                              ? "text-neutral-400"
                              : "text-slate-600",
                          ].join(" ")}
                        >
                          Genera una contraseña temporal nueva. Se muestra
                          una sola vez.
                        </p>
                      </div>

                      <button
                        onClick={runResetFromDrawer}
                        disabled={resetBusy}
                        className={[
                          "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors",
                          resetBusy
                            ? "bg-white/5 text-neutral-500 border-white/10 cursor-not-allowed"
                            : isDark
                              ? "bg-amber-500/10 text-amber-200 border-amber-500/20 hover:bg-amber-500/15"
                              : "bg-amber-500 text-white border-amber-500 hover:bg-amber-400 shadow-[0_8px_20px_rgba(245,158,11,0.35)]",
                        ].join(" ")}
                      >
                        {resetBusy ? "Procesando..." : "Reset"}
                      </button>
                    </div>

                    {tempPassword !== null && (
                      <div className="mt-3">
                        {tempPassword ? (
                          <div
                            className={[
                              "rounded-xl border p-3 flex items-start justify-between gap-2",
                              isDark
                                ? "border-emerald-500/20 bg-emerald-500/10"
                                : "border-emerald-200 bg-emerald-50",
                            ].join(" ")}
                          >
                            <div className="min-w-0">
                              <p
                                className={[
                                  "text-[11px] uppercase tracking-widest font-bold",
                                  isDark
                                    ? "text-emerald-300"
                                    : "text-emerald-700",
                                ].join(" ")}
                              >
                                Temporal generada
                              </p>
                              <p
                                className={[
                                  "text-sm break-all mt-1 font-mono",
                                  isDark
                                    ? "text-white"
                                    : "text-emerald-900",
                                ].join(" ")}
                              >
                                {tempPassword}
                              </p>
                            </div>

                            <button
                              onClick={async () => {
                                await copyText(tempPassword);
                                setTempCopied(true);
                                setTimeout(() => setTempCopied(false), 1200);
                              }}
                              className={[
                                "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 border",
                                isDark
                                  ? "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-100"
                                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700",
                              ].join(" ")}
                            >
                              <Copy className="w-4 h-4" />
                              {tempCopied ? "Copiado" : "Copiar"}
                            </button>
                          </div>
                        ) : (
                          <div
                            className={[
                              "rounded-xl border p-3",
                              isDark
                                ? "border-rose-500/20 bg-rose-500/10"
                                : "border-rose-200 bg-rose-50",
                            ].join(" ")}
                          >
                            <p
                              className={[
                                "text-sm font-semibold",
                                isDark
                                  ? "text-rose-200"
                                  : "text-rose-700",
                              ].join(" ")}
                            >
                              No se pudo generar la contraseña temporal.
                            </p>
                            <p
                              className={[
                                "text-xs mt-1",
                                isDark
                                  ? "text-neutral-400"
                                  : "text-slate-600",
                              ].join(" ")}
                            >
                              Revisa backend o intenta de nuevo.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className={[
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-black/20"
                        : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <p
                      className={[
                        "text-[11px] uppercase tracking-widest",
                        isDark ? "text-neutral-500" : "text-slate-500",
                      ].join(" ")}
                    >
                      Recomendación
                    </p>
                    <p
                      className={[
                        "text-xs mt-1",
                        isDark ? "text-neutral-400" : "text-slate-600",
                      ].join(" ")}
                    >
                      No guardes contraseñas en el panel. Para acceso
                      posterior, usa <b>Resetear contraseña</b> y comparte
                      por un canal seguro.
                    </p>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </section>
  );
};

export default AdminUsersPanel;
