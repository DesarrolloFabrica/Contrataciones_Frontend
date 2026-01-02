// src/pages/admin/components/audit/AdminAuditPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { AdminAuditEvent, TimelineTab } from "../../adminTypes";
import AdminAuditTimeline from "./AdminAuditTimeline";

type Props = {
  evaluationId?: string | null;
  activityByEval: AdminAuditEvent[];
  activityGlobal: AdminAuditEvent[];
  defaultTab?: TimelineTab;
};

const PAGE_SIZE_OPTIONS = [15, 30, 50] as const;

const AdminAuditPanel: React.FC<Props> = ({
  evaluationId,
  activityByEval,
  activityGlobal,
  defaultTab = "EVAL",
}) => {
  const [timelineTab, setTimelineTab] = useState<TimelineTab>(defaultTab);

  // ✅ Paginación
  const [pageSize, setPageSize] = useState<number>(30);
  const [page, setPage] = useState<number>(1); // 1-based

  const effectiveTab = useMemo(() => {
    if (!evaluationId) return "GLOBAL";
    return timelineTab;
  }, [evaluationId, timelineTab]);

  // ✅ dataset activo
  const events = useMemo(() => {
    const arr = effectiveTab === "EVAL" ? activityByEval : activityGlobal;
    return Array.isArray(arr) ? arr : [];
  }, [effectiveTab, activityByEval, activityGlobal]);

  // ✅ total
  const total = events.length;

  // ✅ total pages
  const totalPages = useMemo(() => {
    const t = Math.ceil(total / pageSize);
    return Math.max(1, Number.isFinite(t) ? t : 1);
  }, [total, pageSize]);

  // ✅ clamp page cuando cambie dataset/pageSize
  useEffect(() => {
    setPage(1);
  }, [effectiveTab, pageSize, evaluationId]);

  // ✅ slice de página (asumimos events ya viene ordenado desc por el hook/mock)
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return events.slice(start, end);
  }, [events, page, pageSize]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(page * pageSize, total);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="space-y-3">
      {/* Header + tabs */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-gray-500">
          Actividad
        </p>

        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            disabled={!evaluationId}
            onClick={() => setTimelineTab("EVAL")}
            className={`px-3 py-1 rounded-full border transition ${
              effectiveTab === "EVAL"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-gray-400 hover:border-emerald-500/40"
            } ${!evaluationId ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            Esta evaluación
          </button>

          <button
            type="button"
            onClick={() => setTimelineTab("GLOBAL")}
            className={`px-3 py-1 rounded-full border transition ${
              effectiveTab === "GLOBAL"
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 text-gray-400 hover:border-cyan-500/40"
            }`}
          >
            Global
          </button>
        </div>
      </div>

      {/* Toolbar paginación */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="text-[11px] text-neutral-500 flex items-center gap-2">
          <span className="uppercase tracking-widest">Mostrando</span>
          <span className="text-neutral-300 font-semibold tabular-nums">
            {from}-{to}
          </span>
          <span className="uppercase tracking-widest">de</span>
          <span className="text-neutral-300 font-semibold tabular-nums">
            {total}
          </span>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2">
          {/* Page size */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-500 uppercase tracking-widest">
              Por página
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-1.5 rounded-full border border-white/10 bg-black/20 text-[11px] text-neutral-200 outline-none hover:border-white/20"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Pager */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              className={`px-3 py-1.5 rounded-full border text-[11px] uppercase tracking-widest transition ${
                !canPrev
                  ? "opacity-40 cursor-not-allowed border-white/10 text-neutral-500"
                  : "border-white/10 text-neutral-300 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              Anterior
            </button>

            <span className="text-[11px] text-neutral-500 tabular-nums">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              className={`px-3 py-1.5 rounded-full border text-[11px] uppercase tracking-widest transition ${
                !canNext
                  ? "opacity-40 cursor-not-allowed border-white/10 text-neutral-500"
                  : "border-white/10 text-neutral-300 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Timeline (ya paginado) */}
      <AdminAuditTimeline
        title={effectiveTab === "EVAL" ? "Actividad de esta evaluación" : "Actividad global"}
        events={paginated}
        compact
        // ❌ OJO: ya no usamos limit aquí, porque paginamos arriba
      />
    </div>
  );
};

export default AdminAuditPanel;
