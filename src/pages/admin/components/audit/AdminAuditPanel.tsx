import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminAuditEvent, TimelineTab } from "../../adminTypes";
import AdminAuditTimeline from "./AdminAuditTimeline";
import { useTheme } from "../../../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [timelineTab, setTimelineTab] = useState<TimelineTab>(defaultTab);
  const [pageSize, setPageSize] = useState<number>(30);
  const [page, setPage] = useState<number>(1);

  const effectiveTab = useMemo(() => {
    if (!evaluationId) return "GLOBAL";
    return timelineTab;
  }, [evaluationId, timelineTab]);

  const events = useMemo(() => {
    const arr = effectiveTab === "EVAL" ? activityByEval : activityGlobal;
    return Array.isArray(arr) ? arr : [];
  }, [effectiveTab, activityByEval, activityGlobal]);

  const total = events.length;

  const totalPages = useMemo(() => {
    const t = Math.ceil(total / pageSize);
    return Math.max(1, Number.isFinite(t) ? t : 1);
  }, [total, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [effectiveTab, pageSize, evaluationId]);

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

  const tabBtn = (active: boolean, disabled = false) =>
    [
      "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border",
      disabled ? "opacity-40 cursor-not-allowed" : "",
      active
        ? isDark
          ? "bg-white/10 text-white border-white/10"
          : "bg-white text-slate-900 border-slate-200 shadow-sm"
        : isDark
          ? "border-transparent text-neutral-500 hover:text-neutral-300"
          : "border-transparent text-slate-500 hover:text-slate-700",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="space-y-4">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between gap-3">
        <p className={`text-[11px] uppercase tracking-widest font-semibold ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
          Actividad
        </p>
        <div className="flex items-center gap-1 p-0.5 rounded-lg border bg-white/[0.02]">
          <button
            type="button"
            disabled={!evaluationId}
            onClick={() => setTimelineTab("EVAL")}
            className={tabBtn(effectiveTab === "EVAL", !evaluationId)}
          >
            Esta evaluación
          </button>
          <button
            type="button"
            onClick={() => setTimelineTab("GLOBAL")}
            className={tabBtn(effectiveTab === "GLOBAL")}
          >
            Global
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3`}>
        <div className={`text-xs flex items-center gap-2 ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
          <span className="uppercase tracking-wider">Mostrando</span>
          <span className={`font-semibold tabular-nums ${isDark ? "text-neutral-200" : "text-slate-700"}`}>
            {from}-{to}
          </span>
          <span className="uppercase tracking-wider">de</span>
          <span className={`font-semibold tabular-nums ${isDark ? "text-neutral-200" : "text-slate-700"}`}>
            {total}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
              Por página
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={[
                "h-8 px-2.5 rounded-lg text-[11px] outline-none border transition",
                isDark
                  ? "bg-white/[0.03] border-white/10 text-neutral-200 hover:border-white/20"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300",
              ].join(" ")}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              className={[
                "h-7 px-2.5 rounded-lg border text-[11px] font-medium transition flex items-center gap-1",
                !canPrev
                  ? isDark
                    ? "border-white/5 text-neutral-600 cursor-not-allowed"
                    : "border-slate-200 text-slate-300 cursor-not-allowed"
                  : isDark
                    ? "border-white/10 text-neutral-300 hover:bg-white/5"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              <ChevronLeft className="w-3 h-3" />
              Anterior
            </button>
            <span className={`text-[11px] min-w-[36px] text-center ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
              {page}/{totalPages}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              className={[
                "h-7 px-2.5 rounded-lg border text-[11px] font-medium transition flex items-center gap-1",
                !canNext
                  ? isDark
                    ? "border-white/5 text-neutral-600 cursor-not-allowed"
                    : "border-slate-200 text-slate-300 cursor-not-allowed"
                  : isDark
                    ? "border-white/10 text-neutral-300 hover:bg-white/5"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              Siguiente
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <AdminAuditTimeline
        title={effectiveTab === "EVAL" ? "Actividad de esta evaluación" : "Actividad global"}
        events={paginated}
        compact
      />
    </div>
  );
};

export default AdminAuditPanel;
