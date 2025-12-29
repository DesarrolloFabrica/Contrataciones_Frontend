// src/pages/admin/components/audit/AdminAuditTimeline.tsx
import React, { useMemo, useState } from "react";
import type { AdminAuditEvent } from "../../adminTypes";
import {
  buildHumanLine,
  entityLabel,
  formatDayTitle,
  formatTime,
  dayKey,
  safeDate,
  iconForAction,
  metaChips,
  actionLabel,
  severityForAction,
  severityBadge,
  shouldShowEvent,
} from "./auditFormat";

type Props = {
  title?: string;
  events: AdminAuditEvent[];
  compact?: boolean;
  limit?: number;
  hideAdminEvents?: boolean; // ✅ oculta acciones del ADMIN si quieres
};

export default function AdminAuditTimeline({
  title = "Historial de actividad",
  events,
  compact,
  limit,
  hideAdminEvents = false,
}: Props) {
  const [showMeta, setShowMeta] = useState(false);

  const filtered = useMemo(() => {
    const base = (events ?? []).filter((ev) =>
      shouldShowEvent(ev, { hideAdmin: hideAdminEvents })
    );
    return typeof limit === "number" ? base.slice(0, limit) : base;
  }, [events, limit, hideAdminEvents]);

  const grouped = useMemo(() => {
    const map = new Map<string, { date: Date; items: AdminAuditEvent[] }>();
    for (const ev of filtered) {
      const d = safeDate(ev.at);
      if (!d) continue;
      const k = dayKey(d);
      if (!map.has(k)) map.set(k, { date: d, items: [] });
      map.get(k)!.items.push(ev);
    }
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [filtered]);

  if (filtered.length === 0) {
    return (
      <div className="text-sm text-neutral-500 py-10 text-center">
        Aún no hay actividad relevante.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-neutral-500">
            {title}
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            Eventos resumidos en lenguaje humano (sin ruido técnico).
          </p>
        </div>

        {!compact && (
          <button
            type="button"
            onClick={() => setShowMeta((s) => !s)}
            className="text-xs px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
          >
            {showMeta ? "Ocultar detalles" : "Ver detalles"}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {grouped.map((g) => (
          <div key={dayKey(g.date)} className="space-y-2">
            {!compact && (
              <div className="text-[11px] uppercase tracking-widest text-neutral-600">
                {formatDayTitle(g.date)}
              </div>
            )}

            <div className="space-y-2">
              {g.items.map((ev) => {
                const d = safeDate(ev.at);
                const time = d ? formatTime(d) : "";
                const chips = metaChips(ev.meta);
                const sev = severityForAction(ev.action);

                return (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {iconForAction(ev.action)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm text-white font-semibold">
                            {buildHumanLine(ev)}
                          </p>
                          {severityBadge(sev)}
                        </div>

                        <div className="mt-1 text-xs text-neutral-500 flex flex-wrap items-center gap-2">
                          <span>Acción: {actionLabel(ev.action)}</span>
                          {time && (
                            <>
                              <span>•</span>
                              <span>{time}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{entityLabel(ev.entityType)}</span>
                        </div>

                        {chips.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {chips.map((c) => (
                              <span
                                key={c.k}
                                className="text-[11px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300"
                              >
                                {c.k}: {c.v}
                              </span>
                            ))}
                          </div>
                        )}

                        {showMeta && !compact && ev.meta && (
                          <pre className="mt-2 text-[11px] text-neutral-400 bg-black/30 border border-white/10 rounded-xl p-3 overflow-auto max-h-40">
                            {JSON.stringify(ev.meta, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>

                    {!compact && (
                      <span className="text-[11px] text-neutral-600 shrink-0">
                        {ev.id?.slice(0, 8)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
