import React, { useEffect, useMemo, useState } from "react";
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

  /**
   * ✅ MODO CLÁSICO (limit simple)
   * Si lo usas, recorta el total antes de paginar.
   */
  limit?: number;

  hideAdminEvents?: boolean;

  /**
   * ✅ Paginación interna del timeline
   * - Si ya paginas arriba en AdminAuditPanel, pon paginate={false}
   */
  paginate?: boolean;
  pageSize?: number; // default 30
};

export default function AdminAuditTimeline({
  title = "Historial de actividad",
  events,
  compact,
  limit,
  hideAdminEvents = false,
  paginate = true,
  pageSize = 10,
}: Props) {
  const [page, setPage] = useState(1); // 1-based

  // Si cambia el dataset (o filtros), reinicia a página 1
  useEffect(() => {
    setPage(1);
  }, [events, hideAdminEvents, limit, pageSize, paginate]);

  const filtered = useMemo(() => {
    const base = (events ?? []).filter((ev) =>
      shouldShowEvent(ev, { hideAdmin: hideAdminEvents })
    );

    // ✅ aseguramos orden descendente (por si events viene sin ordenar)
    const ordered = [...base].sort((a, b) => {
      const ta = new Date(a.at).getTime();
      const tb = new Date(b.at).getTime();
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });

    // ✅ limit clásico (recorta el universo antes de paginar)
    return typeof limit === "number" ? ordered.slice(0, limit) : ordered;
  }, [events, hideAdminEvents, limit]);

  const total = filtered.length;
  const totalPages = useMemo(() => {
    const t = Math.ceil(total / pageSize);
    return Math.max(1, Number.isFinite(t) ? t : 1);
  }, [total, pageSize]);

  const pageSlice = useMemo(() => {
    if (!paginate) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, paginate, page, pageSize]);

  const grouped = useMemo(() => {
    const map = new Map<string, { date: Date; items: AdminAuditEvent[] }>();

    for (const ev of pageSlice) {
      const d = safeDate(ev.at);
      if (!d) continue;

      const k = dayKey(d);
      if (!map.has(k)) map.set(k, { date: d, items: [] });
      map.get(k)!.items.push(ev);
    }

    // El slice ya viene ordenado desc, pero el grupo lo dejamos bien
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [pageSlice]);

  if (filtered.length === 0) {
    return (
      <div className="text-sm text-neutral-500 py-10 text-center">
        Aún no hay actividad relevante.
      </div>
    );
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const from = paginate ? (page - 1) * pageSize + 1 : 1;
  const to = paginate ? Math.min(page * pageSize, total) : total;

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

        {/* ✅ Controles de paginación (solo si paginate=true) */}
        {paginate && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-500 tabular-nums">
              {from}-{to} / {total}
            </span>

            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition ${
                !canPrev
                  ? "opacity-40 cursor-not-allowed border-white/10 text-neutral-500"
                  : "border-white/10 text-neutral-300 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={!canNext}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition ${
                !canNext
                  ? "opacity-40 cursor-not-allowed border-white/10 text-neutral-500"
                  : "border-white/10 text-neutral-300 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              Siguiente
            </button>
          </div>
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
