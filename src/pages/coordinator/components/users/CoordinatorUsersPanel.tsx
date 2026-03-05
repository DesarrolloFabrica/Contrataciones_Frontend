// src/pages/coordinator/components/users/CoordinatorUsersPanel.tsx
import React, { useMemo, useState, useCallback } from "react";
import { AlertCircle, Loader2, Users } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext"; // ajusta ruta si cambia
import { useTheme } from "../../../../context/ThemeContext";

import { useCoordinatorUsers } from "../../hooks/useCoordinatorUsers";

// Reutilizamos componentes de admin (tabla + modal)
import AdminUsersTable from "../../../admin/components/users/AdminUsersTable";
import AdminUserFormModal from "../../../admin/components/users/AdminUserFormModal";

import type { AdminUser } from "../../../admin/adminTypes";

const CoordinatorUsersPanel: React.FC = () => {
  const users = useCoordinatorUsers();
  const { user } = useAuth();

  // 1️⃣ primero se obtiene el schoolId del coordinador
    const coordinatorSchoolId = useMemo(() => {
    const raw =
      (user as any)?.schoolId ??
      (user as any)?.user?.schoolId ??
      (user as any)?.profile?.schoolId ??
      (user as any)?.payload?.schoolId ??
      null;

    return raw ? String(raw) : null;
  }, [user]);

  // 2️⃣ luego se deriva la validación
  const hasSchool = !!coordinatorSchoolId;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  // 3️⃣ ahora sí puedes usarlo en funciones
  const openCreate = () => {
    if (!hasSchool) {
      console.warn("El coordinador no tiene schoolId asignado.");
      return;
    }
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

  const showEmpty =
    !users.loading &&
    !users.error &&
    (users.users?.length ?? 0) === 0;

  // ✅ Credenciales “solo una vez” (si quieres mostrarlas como en admin)
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);

  const clearCredentials = () => setLastCreatedCredentials(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={[
        "rounded-3xl p-5 md:p-6 shadow-xl border",
        isDark
          ? "bg-[#050505]/70 border-white/10"
          : "bg-white border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.10)]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div
            className={[
              "w-10 h-10 rounded-2xl flex items-center justify-center",
              isDark
                ? "bg-white/5 border border-white/10"
                : "bg-emerald-50 border border-emerald-100",
            ].join(" ")}
          >
            <Users
              className={`w-5 h-5 ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
          </div>
          <div>
            <h2
              className={[
                "text-sm font-bold uppercase tracking-widest",
                isDark ? "text-gray-300" : "text-slate-900",
              ].join(" ")}
            >
              Líderes de mi escuela
            </h2>
            <p
              className={[
                "text-xs",
                isDark ? "text-gray-500" : "text-slate-600",
              ].join(" ")}
            >
              Crea y administra líderes (heredan tu escuela automáticamente).
            </p>
          </div>
        </div>

        
        <button
          type="button"
          onClick={openCreate}
          disabled={!hasSchool}
          title={!hasSchool ? "Tu usuario no tiene escuela asignada. Pide al administrador que la configure." : ""}
          className={[
            "px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-colors",
            hasSchool
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : isDark
                ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed",
          ].join(" ")}
        >
          + Crear líder
        </button>
      </div>
      {!hasSchool && (
        <div
          className={[
            "mb-4 rounded-2xl border px-4 py-3 text-xs",
            isDark
              ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
              : "border-amber-200 bg-amber-50 text-amber-700",
          ].join(" ")}
        >
          Tu usuario coordinador no tiene una <b>escuela asignada</b>.
          <br />
          No podrás crear líderes hasta que un administrador configure tu
          escuela.
        </div>
      )}

      {users.loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2
            className={`w-8 h-8 animate-spin ${
              isDark ? "text-emerald-500" : "text-emerald-600"
            }`}
          />
          <p
            className={`text-sm ${
              isDark ? "text-neutral-500" : "text-slate-600"
            }`}
          >
            Cargando líderes…
          </p>
        </div>
      )}

      {!users.loading && users.error && (
        <div
          className={[
            "flex flex-col items-center justify-center py-14 gap-3 rounded-2xl border",
            isDark
              ? "text-red-400 bg-red-500/5 border-red-500/10"
              : "text-red-600 bg-red-50 border-red-200",
          ].join(" ")}
        >
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm text-center max-w-md">{users.error}</p>
        </div>
      )}

      {!users.loading && !users.error && !showEmpty && (
        <AdminUsersTable
          users={users.users}
          onEdit={openEdit}
          onToggleActive={users.toggleActive}
          onResetPassword={async (id) => {
            const r = await users.resetPassword(id);
            // Si quieres mostrar el password temporal como en admin:
            // aquí necesitarías también el email del usuario, o que resetPassword retorne email.
          }}
        />
      )}

      {showEmpty && (
        <div
          className={[
            "mt-4 rounded-2xl border p-6",
            isDark
              ? "border-white/10 bg-black/20"
              : "border-slate-200 bg-slate-50",
          ].join(" ")}
        >
          <p
            className={`text-sm font-semibold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Sin líderes
          </p>
          <p
            className={`text-xs mt-1 ${
              isDark ? "text-neutral-400" : "text-slate-600"
            }`}
          >
            Aún no hay líderes creados para tu escuela.
          </p>
          <div className="mt-4">
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

      <AdminUserFormModal
        open={isCreateOpen}
        onClose={closeModal}
        forcedRole="LEADER"
        hideRoleSelect
        forcedSchoolId={coordinatorSchoolId}

        onCreate={async (dto) => {
          // ✅ el hook ya fuerza role=LEADER + schoolId=coordinatorSchoolId
          const res = await users.createLeader({
            name: dto.name,
            lastName: dto.lastName,
            email: dto.email,
            cedula: dto.cedula,
            mustChangePassword: dto.mustChangePassword,
            generatePassword: dto.generatePassword,
            password: dto.password,
          });
        
          if (!res.ok || !res.user?.email || !res.password) {
            // ✅ si falla, lanzamos error para que el modal lo capture
            throw new Error("No se pudo crear el líder.");
          }
        
          // ✅ para que el modal muestre credenciales “solo una vez”
          setLastCreatedCredentials({
            email: res.user.email,
            tempPassword: res.password,
          });
        }}
      
        // opcional: si no quieres edición, déjalo así
        onUpdate={async () => {}}
      
        editingUser={editUser}
        lastCreatedCredentials={lastCreatedCredentials}
        clearCredentials={clearCredentials}
      />

    </section>
  );
};

export default CoordinatorUsersPanel;
