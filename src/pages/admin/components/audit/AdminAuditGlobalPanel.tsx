// src/pages/admin/components/audit/AdminAuditGlobalPanel.tsx
import React, { useMemo, useState } from "react";
import { ScrollText, Filter, Loader2 } from "lucide-react";
import type { AdminAuditEntityType, AdminAuditEvent } from "../../adminTypes";
import { useAdminAudit } from "../../hooks/useAdminAudit";
import AdminAuditTimeline from "./AdminAuditTimeline";

const pill =
  "px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2";

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

export default function AdminAuditGlobalPanel() {
  const [entityType, setEntityType] = useState<FilterType>("ALL");

  const { audit, loadingAudit } = useAdminAudit({
    entityType: entityType === "ALL" ? undefined : entityType,
  });

  const counts = useMemo(() => countByType(audit), [audit]);

  const tabs: { id: FilterType; label: string }[] = [
    { id: "ALL", label: "Todo" },
    { id: "SYSTEM", label: "Sistema" },
    { id: "USER", label: "Usuarios" },
    { id: "EVALUATION", label: "Evaluaciones" },
  ];

  return (
    <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <ScrollText className="w-5 h-5 text-amber-300" />
          </div>

          <div className="min-w-0">
            <div className="text-white font-bold text-sm uppercase tracking-wide">
              Auditoría Global
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Solo cambios importantes (usuarios + decisiones). Se oculta ruido como “detalle consultado”.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
          <Filter className="w-4 h-4" />
          <span>{counts.ALL} eventos</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 flex flex-wrap gap-2 border-b border-white/5 bg-black/20">
        {tabs.map((t) => {
          const active = entityType === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setEntityType(t.id)}
              className={`${pill} ${
                active
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
              }`}
            >
              {t.label}
              <span className="ml-1 text-[10px] opacity-70">
                ({counts[t.id]})
              </span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="p-4 bg-[#0a0a0a]/50">
        {loadingAudit ? (
          <div className="flex items-center gap-2 text-sm text-neutral-400 py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando auditoría...
          </div>
        ) : audit.length === 0 ? (
          <div className="text-sm text-neutral-500 py-10 text-center">
            No hay eventos de auditoría para este filtro.
          </div>
        ) : (
          <AdminAuditTimeline
            title="Historial de actividad"
            events={audit}
            hideAdminEvents // ✅ oculta lo que hace el Admin
          />
        )}
      </div>
    </div>
  );
}
