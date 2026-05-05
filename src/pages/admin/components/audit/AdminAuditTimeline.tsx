import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminAuditEvent } from "../../adminTypes";
import { useTheme } from "../../../../context/ThemeContext";
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
  hideAdminEvents?: boolean;
  paginate?: boolean;
  pageSize?: number;
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [events, hideAdminEvents, limit, pageSize, paginate]);

  const filtered = useMemo(() => {
    const base = (events ?? []).filter((ev) =>
      shouldShowEvent(ev, { hideAdmin: hideAdminEvents })
    );
    const ordered = [...base].sort((a, b) => {
      const ta = new Date(a.at).getTime();
      const tb = new Date(b.at).getTime();
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });
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
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [pageSlice]);

  if (filtered.length === 0) {
    return (
      <div className={`text-sm py-8 text-center ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
        Aún no hay actividad relevante.
      </div>
    );
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const from = paginate ? (page - 1) * pageSize + 1 : 1;
  const to = paginate ? Math.min(page * pageSize, total) : total;

  const pagBtn = (disabled: boolean) =>
    [
      "h-7 px-2.5 rounded-lg border text-[11px] font-medium transition flex items-center gap-1",
      disabled
        ? isDark
          ? "border-white/5 text-neutral-600 cursor-not-allowed"
          : "border-slate-200 text-slate-300 cursor-not-allowed"
        : isDark
          ? "border-white/10 text-neutral-300 hover:bg-white/5"
          : "border-slate-200 text-slate-600 hover:bg-slate-50",
    ].join(" ");

  return (
    <div className="space-y-4">
      {/* Header + pagination */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-[11px] uppercase tracking-widest font-semibold ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
            {title}
          </p>
        </div>
        {paginate && (
          <div className="flex items-center gap-2">
            <span className={`text-[11px] tabular-nums ${isDark ? "text-neutral-500" : "text-slate-400"}`}>
              {from}-{to} / {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={pagBtn(!canPrev)}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className={`text-[11px] min-w-[28px] text-center ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                {page}/{totalPages}
              </span>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={pagBtn(!canNext)}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Events by day */}
      <div className="space-y-5">
        {grouped.map((g) => (
          <div key={dayKey(g.date)} className="space-y-2">
            {!compact && (
              <p className={`text-[11px] uppercase tracking-widest font-medium ${isDark ? "text-neutral-500" : "text-slate-400"}`}>
                {formatDayTitle(g.date)}
              </p>
            )}
            <div className="space-y-2">
              {g.items.map((ev) => {
                const d = safeDate(ev.at);
                const time = d ? formatTime(d) : "";
                const chips = metaChips(ev.meta);
                const sev = severityForAction(ev.action);
                const icon = iconForAction(ev.action);

                return (
                  <div
                    key={ev.id}
                    className={[
                      "rounded-xl border p-4 flex items-start gap-3",
                      isDark
                        ? "border-white/10 bg-white/[0.02]"
                        : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <div className={[
                      "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                      isDark
                        ? "bg-white/5 border-white/10 text-neutral-300"
                        : "bg-slate-50 border-slate-200 text-slate-600",
                    ].join(" ")}>
                      {icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {buildHumanLine(ev)}
                        </p>
                        {severityBadge(sev)}
                      </div>
                      <div className={`mt-1 text-xs flex flex-wrap items-center gap-2 ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                        <span>{ev.actorRole === "ADMIN" ? "Admin" : ev.actorRole === "COORDINATOR" ? "Coordinador" : "Usuario"}</span>
                        <span className={`w-1 h-1 rounded-full ${isDark ? "bg-neutral-600" : "bg-slate-300"}`} />
                        <span>{actionLabel(ev.action)}</span>
                        {time && (
                          <>
                            <span className={`w-1 h-1 rounded-full ${isDark ? "bg-neutral-600" : "bg-slate-300"}`} />
                            <span>{time}</span>
                          </>
                        )}
                        <span className={`w-1 h-1 rounded-full ${isDark ? "bg-neutral-600" : "bg-slate-300"}`} />
                        <span>{entityLabel(ev.entityType)}</span>
                      </div>
                      {chips.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {chips.map((c) => (
                            <span
                              key={c.k}
                              className={[
                                "text-[10px] px-2 py-0.5 rounded-md border font-medium",
                                isDark
                                  ? "border-white/10 bg-white/[0.03] text-neutral-400"
                                  : "border-slate-200 bg-slate-50 text-slate-600",
                              ].join(" ")}
                            >
                              {c.k}: {c.v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
