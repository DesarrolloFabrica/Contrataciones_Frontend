import React, { useMemo, useState } from "react";
import { ScrollText, Loader2 } from "lucide-react";
import type { AdminAuditEntityType, AdminAuditEvent } from "../../adminTypes";
import { useAdminAudit } from "../../hooks/useAdminAudit";
import AdminAuditTimeline from "./AdminAuditTimeline";
import { shouldShowEvent } from "./auditFormat";
import { useTheme } from "../../../../context/ThemeContext";

const pill =
  "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border";

type FilterType = AdminAuditEntityType | "ALL";

function countByType(audit: AdminAuditEvent[]) {
  return audit.reduce(
    (acc, ev) => {
      acc.ALL += 1;
      acc[ev.entityType] += 1;
      return acc;
    },
    { ALL: 0, SYSTEM: 0, USER: 0, EVALUATION: 0 } as Record<FilterType, number>
  );
}

type Props = {
  selectedSchool: string | null;
  selectedProgram: string | null;
};

export default function AdminAuditGlobalPanel({
  selectedSchool,
  selectedProgram,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [entityType, setEntityType] = useState<FilterType>("ALL");
  const [hideAdmin, setHideAdmin] = useState(false);

  const { audit, loadingAudit, errorAudit } = useAdminAudit({
    entityType: entityType === "ALL" ? undefined : entityType,
    schoolName: selectedSchool ?? undefined,
    programName: selectedProgram ?? undefined,
  });

  const countsTotal = useMemo(() => countByType(audit), [audit]);

  const relevantEvents = useMemo(() => {
    return (audit ?? []).filter((ev) => shouldShowEvent(ev, { hideAdmin }));
  }, [audit, hideAdmin]);

  const countsRelevant = useMemo(() => countByType(relevantEvents), [relevantEvents]);

  const tabs: { id: FilterType; label: string }[] = [
    { id: "ALL", label: "Todo" },
    { id: "SYSTEM", label: "Sistema" },
    { id: "USER", label: "Usuarios" },
    { id: "EVALUATION", label: "Evaluaciones" },
  ];

  return (
    <div className="space-y-5">
      {/* Section 1: Title */}
      <div>
        <h1 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
          Auditoría
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
          Trazabilidad completa de acciones del sistema.
        </p>
      </div>

      {/* Section 2: Main card */}
      <div
        className={[
          "rounded-2xl border overflow-hidden",
          isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white shadow-sm",
        ].join(" ")}
      >
        {/* Header bar */}
        <div className={[
          "px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3",
          isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50",
        ].join(" ")}>
          <div className="flex items-center gap-3">
            <div className={[
              "w-9 h-9 rounded-xl flex items-center justify-center border",
              isDark ? "bg-white/5 border-white/10 text-amber-400" : "bg-amber-50 border-amber-100 text-amber-600",
            ].join(" ")}>
              <ScrollText className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-widest font-semibold ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                Historial de actividad
              </p>
              <p className={`text-xs ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                Eventos importantes del sistema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHideAdmin((s) => !s)}
              className={[
                pill,
                hideAdmin
                  ? isDark
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                    : "border-cyan-200 bg-cyan-50 text-cyan-700"
                  : isDark
                    ? "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              ].join(" ")}
            >
              {hideAdmin ? "Ocultando ADMIN" : "Mostrar ADMIN"}
            </button>

            <span className={`text-xs ${isDark ? "text-neutral-500" : "text-slate-400"}`}>
              {loadingAudit ? (
                "..."
              ) : (
                <>
                  <span className={`font-semibold ${isDark ? "text-neutral-200" : "text-slate-700"}`}>
                    {countsRelevant.ALL}
                  </span>{" "}
                  eventos
                </>
              )}
            </span>
          </div>
        </div>

        {/* Filter pills */}
        <div className={[
          "px-5 py-3 border-b flex flex-wrap gap-2",
          isDark ? "border-white/5 bg-black/10" : "border-slate-100 bg-slate-50/50",
        ].join(" ")}>
          <div className="inline-flex p-0.5 rounded-lg border bg-white/[0.02]">
            {tabs.map((t) => {
              const active = entityType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEntityType(t.id)}
                  className={[
                    "px-3.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200",
                    active
                      ? isDark
                        ? "bg-white/10 text-white shadow-sm"
                        : "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : isDark
                        ? "text-neutral-500 hover:text-neutral-300"
                        : "text-slate-500 hover:text-slate-700",
                  ].join(" ")}
                >
                  {t.label}
                  <span className="ml-1.5 opacity-60">
                    {loadingAudit ? "…" : countsRelevant[t.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className={[
          isDark ? "bg-black/20" : "bg-slate-50/30",
        ].join(" ")}>
          {loadingAudit ? (
            <div className={[
              "flex items-center gap-2 text-sm py-10 justify-center",
              isDark ? "text-neutral-400" : "text-slate-500",
            ].join(" ")}>
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando auditoría...
            </div>
          ) : errorAudit ? (
            <div className={[
              "text-sm py-10 text-center",
              isDark ? "text-rose-300" : "text-rose-600",
            ].join(" ")}>
              {errorAudit}
            </div>
          ) : relevantEvents.length === 0 ? (
            <div className={[
              "text-sm py-10 text-center",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}>
              No hay eventos registrados aún.
              <div className={[
                "text-xs mt-2",
                isDark ? "text-neutral-600" : "text-slate-400",
              ].join(" ")}>
                Prueba desactivar "Ocultando ADMIN" o cambia el filtro.
              </div>
            </div>
          ) : (
            <div className="p-5">
              <AdminAuditTimeline
                events={audit}
                hideAdminEvents={hideAdmin}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
