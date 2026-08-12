// src/pages/coordinator/components/users/CoordinatorUsersPanel.tsx
import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { useTheme } from "../../../../context/ThemeContext";

import { useCoordinatorUsers } from "../../hooks/useCoordinatorUsers";

import AdminUsersTable from "../../../admin/components/users/AdminUsersTable";
import AdminUserFormModal from "../../../admin/components/users/AdminUserFormModal";

import type { AdminUser } from "../../../admin/adminTypes";

const CoordinatorUsersPanel: React.FC = () => {
  const users = useCoordinatorUsers();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const coordinatorSchoolId = useMemo(() => {
    const raw =
      (user as any)?.schoolId ??
      (user as any)?.user?.schoolId ??
      (user as any)?.profile?.schoolId ??
      (user as any)?.payload?.schoolId ??
      null;

    return raw ? String(raw) : null;
  }, [user]);

  const hasSchool = !!coordinatorSchoolId;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

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

  const recordCount = users.users?.length ?? 0;

  return (
    <div className="relative w-full space-y-4 animate-in fade-in duration-300">
      {/* Header — misma línea que historial del líder */}
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
                Lideres de{" "}
                <span className={isDark ? "text-emerald-400" : "text-emerald-600"}>mi escuela</span>
              </h1>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Crea y gestiona los lideres de tu escuela. Acceden con Google @cun.edu.co
                {!users.loading && !users.error ? ` · ${recordCount} registro${recordCount === 1 ? "" : "s"}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={!hasSchool}
            title={
              !hasSchool
                ? "Tu usuario no tiene escuela asignada. Pide al administrador que la configure."
                : "Crear un nuevo lider"
            }
            className={[
              "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition",
              hasSchool
                ? "bg-emerald-600 shadow-[0_10px_24px_-12px_rgba(16,185,129,0.8)] hover:bg-emerald-500"
                : isDark
                  ? "cursor-not-allowed bg-white/5 text-white/30"
                  : "cursor-not-allowed bg-slate-200 text-slate-400",
            ].join(" ")}
          >
            <UserPlus className="h-4 w-4" />
            Crear lider
          </button>
        </div>
      </section>

      {!hasSchool && (
        <div
          className={[
            "flex items-start gap-3 rounded-xl border px-4 py-3",
            isDark
              ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
              : "border-amber-200 bg-amber-50 text-amber-800",
          ].join(" ")}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-xs leading-relaxed">
            <p className="mb-0.5 font-bold">Sin escuela asignada</p>
            <p>
              Tu usuario coordinador no tiene una <b>escuela asignada</b>. No podras crear lideres
              hasta que un administrador configure tu escuela.
            </p>
          </div>
        </div>
      )}

      {/* Tabla — un solo card, sin rebordes internos extras */}
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
              <span>Listado de lideres</span>
            </div>
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                isDark
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {recordCount} registros
            </span>
          </div>
        )}

        {users.loading && (
          <div className={`flex flex-col items-center justify-center gap-3 py-16 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <span className="text-sm">Cargando lideres...</span>
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
              Aun no hay lideres
            </p>
            <p className={`mt-1 max-w-sm text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Cuando un administrador te asigne una escuela, podras dar de alta a los lideres que
              contratan y evaluan docentes.
            </p>
            <button
              type="button"
              onClick={openCreate}
              disabled={!hasSchool}
              className={[
                "mt-4 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition",
                hasSchool
                  ? "bg-emerald-600 text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.8)] hover:bg-emerald-500"
                  : isDark
                    ? "cursor-not-allowed border border-white/10 text-white/30"
                    : "cursor-not-allowed border border-slate-200 text-slate-400",
              ].join(" ")}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Crear primer lider
            </button>
          </div>
        )}

        {!users.loading && !users.error && !showEmpty && (
          <AdminUsersTable
            users={users.users}
            onEdit={openEdit}
            onToggleActive={users.toggleActive}
            variant="embedded"
          />
        )}
      </section>

      <AdminUserFormModal
        open={isCreateOpen}
        onClose={closeModal}
        forcedRole="LEADER"
        hideRoleSelect
        forcedSchoolId={coordinatorSchoolId}
        onCreate={async (dto) => {
          const res = await users.createLeader({
            name: dto.name,
            lastName: dto.lastName,
            email: dto.email,
            cedula: dto.cedula,
          });

          if (!res.ok || !res.user?.email) {
            throw new Error("No se pudo crear el líder.");
          }
        }}
        onUpdate={async () => {}}
        editingUser={editUser}
      />
    </div>
  );
};

export default CoordinatorUsersPanel;
