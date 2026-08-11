// src/pages/coordinator/components/users/CoordinatorUsersPanel.tsx
import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
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

  return (
    <section className="space-y-6">
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-t-2 border-t-brand-500">
        {isDark && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-16 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-brand-500/8 via-brand-500/4 to-transparent blur-[100px]" />
            <div className="absolute -bottom-24 -left-12 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-brand-500/5 to-transparent blur-[80px]" />
          </div>
        )}

        <div
          className={`relative px-6 py-4 md:px-8 md:py-5 rounded-2xl ${
            isDark
              ? "bg-gradient-to-b from-[#0b232a]/92 via-[#091d22]/88 to-[#07171c] border-[#579689]/22 shadow-[0_22px_60px_-45px_rgba(88,190,161,0.28)]"
              : "bg-gradient-to-b from-white via-slate-50/80 to-white border-brand-500/20 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.06)]"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-5 lg:gap-6 items-center">
            <div className="min-w-0 flex items-center gap-5">
              <div
                className="relative shrink-0 flex items-center justify-center overflow-visible pointer-events-none h-16 w-16"
                aria-hidden
              >
                <div
                  className={`absolute inset-0 rounded-full blur-xl ${
                    isDark ? "bg-brand-500/20" : "bg-brand-500/15"
                  }`}
                />
                <div
                  className={`relative z-[1] flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur-sm md:h-14 md:w-14 ${
                    isDark
                      ? "border-brand-400/25 bg-brand-500/10"
                      : "border-brand-400/30 bg-brand-500/10"
                  }`}
                >
                  <Users
                    className={`h-6 w-6 md:h-7 md:w-7 ${
                      isDark ? "text-brand-200" : "text-brand-700"
                    }`}
                  />
                </div>
              </div>

              <div className="min-w-0 space-y-0.5">
                <h2
                  className={`text-xl md:text-2xl font-black leading-tight tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Lideres de{" "}
                  <span className="bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent">
                    mi escuela
                  </span>
                </h2>
                <p
                  className={`text-sm max-w-xl leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Crea y gestiona los lideres de tu escuela. Acceden con Google
                  <span className={`mx-1 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>@cun.edu.co</span>
                  una vez dados de alta.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openCreate}
                disabled={!hasSchool}
                title={!hasSchool ? "Tu usuario no tiene escuela asignada. Pide al administrador que la configure." : "Crear un nuevo lider"}
                className={[
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.18em] border transition-all duration-200",
                  hasSchool
                    ? isDark
                      ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-400/40 shadow-[0_8px_22px_rgba(16,185,129,0.30)] hover:from-brand-400 hover:to-brand-500 hover:shadow-[0_10px_28px_rgba(16,185,129,0.40)]"
                      : "bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-500 shadow-[0_8px_22px_rgba(16,185,129,0.30)] hover:from-brand-600 hover:to-brand-700 hover:shadow-[0_10px_28px_rgba(16,185,129,0.40)]"
                    : isDark
                      ? "border-white/10 bg-white/[0.03] text-white/30 cursor-not-allowed"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed",
                ].join(" ")}
              >
                <UserPlus className="w-4 h-4" />
                Crear lider
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WARNING IF NO SCHOOL */}
      {!hasSchool && (
        <div
          className={[
            "rounded-xl border px-5 py-4 flex items-start gap-3",
            isDark
              ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
              : "border-amber-200 bg-amber-50 text-amber-800",
          ].join(" ")}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold mb-1">Sin escuela asignada</p>
            <p>
              Tu usuario coordinador no tiene una{" "}
              <b>escuela asignada</b>. No podras crear lideres hasta que un
              administrador configure tu escuela.
            </p>
          </div>
        </div>
      )}

      {/* MAIN CARD: TABLE / LOADING / ERROR / EMPTY */}
      <div
        className={[
          "rounded-2xl border border-t-2 border-t-brand-500 overflow-hidden",
          isDark
            ? "bg-[#091d22]/82 border-[#579689]/22 backdrop-blur-xl shadow-[0_24px_80px_-70px_rgba(88,190,161,0.28)]"
            : "bg-white border-brand-500/20 shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
        ].join(" ")}
      >
        {/* TABLE HEADER STRIP */}
        {!users.loading && !users.error && !showEmpty && (
          <div
            className={[
              "px-5 md:px-6 py-3 border-b text-[10px] font-bold uppercase tracking-[0.16em] flex items-center justify-between",
              isDark
                ? "border-brand-500/20 bg-white/[0.02] text-slate-400"
                : "border-brand-500/15 bg-brand-50/40 text-slate-500",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <Users
                className={`w-3.5 h-3.5 ${isDark ? "text-brand-400" : "text-brand-600"}`}
              />
              <span>Listado de lideres</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isDark
                  ? "bg-brand-500/10 text-brand-300 border border-brand-500/20"
                  : "bg-brand-50 text-brand-700 border border-brand-200"
              }`}
            >
              {users.users?.length ?? 0} registros
            </span>
          </div>
        )}

        {users.loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2
              className={`w-8 h-8 animate-spin ${
                isDark ? "text-brand-400" : "text-brand-600"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Cargando lideres…
            </p>
          </div>
        )}

        {!users.loading && users.error && (
          <div
            className={[
              "flex flex-col items-center justify-center py-14 gap-3",
              isDark ? "text-rose-300" : "text-rose-600",
            ].join(" ")}
          >
            <div
              className={[
                "p-3 rounded-2xl border",
                isDark
                  ? "bg-rose-500/10 border-rose-500/20"
                  : "bg-rose-50 border-rose-200",
              ].join(" ")}
            >
              <AlertCircle className="w-7 h-7" />
            </div>
            <p className="text-sm text-center max-w-md font-medium">
              {users.error}
            </p>
          </div>
        )}

        {!users.loading && !users.error && !showEmpty && (
          <div className="p-2 md:p-3">
            <AdminUsersTable
              users={users.users}
              onEdit={openEdit}
              onToggleActive={users.toggleActive}
            />
          </div>
        )}

        {showEmpty && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div
              className={[
                "relative h-16 w-16 rounded-2xl flex items-center justify-center mb-5",
                isDark
                  ? "bg-brand-500/10 border border-brand-500/25"
                  : "bg-brand-50 border border-brand-200",
              ].join(" ")}
            >
              <Users
                className={`h-7 w-7 ${isDark ? "text-brand-300" : "text-brand-600"}`}
              />
            </div>
            <p
              className={`text-sm font-bold mb-1 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Aun no hay lideres
            </p>
            <p
              className={`text-xs max-w-sm mb-5 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Cuando un administrador te asigne una escuela, podras dar de alta
              a los lideres que contratan y evaluan docentes.
            </p>
            <button
              type="button"
              onClick={openCreate}
              disabled={!hasSchool}
              className={[
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.18em] border transition-all duration-200",
                hasSchool
                  ? isDark
                    ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-400/40 hover:from-brand-400 hover:to-brand-500"
                    : "bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-500 hover:from-brand-600 hover:to-brand-700"
                  : isDark
                    ? "border-white/10 bg-white/[0.03] text-white/30 cursor-not-allowed"
                    : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed",
              ].join(" ")}
            >
              <UserPlus className="w-4 h-4" />
              Crear primer lider
            </button>
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      {!showEmpty && !users.loading && !users.error && (
        <div
          className={[
            "rounded-xl border px-4 py-3 flex items-start gap-3",
            isDark
              ? "border-brand-500/15 bg-brand-500/[0.04] text-slate-400"
              : "border-brand-500/15 bg-brand-50/40 text-slate-600",
          ].join(" ")}
        >
          <CheckCircle2
            className={`w-4 h-4 mt-0.5 shrink-0 ${
              isDark ? "text-brand-400" : "text-brand-600"
            }`}
          />
          <p className="text-[11px] leading-relaxed">
            Los lideres dados de alta aqui recibiran un correo para completar
            su activacion con Google. La gestion de permisos y baja la realiza
            un administrador.
          </p>
        </div>
      )}

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

    </section>
  );
};

export default CoordinatorUsersPanel;
