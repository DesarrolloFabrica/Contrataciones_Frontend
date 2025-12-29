// src/pages/admin/components/evaluations/AdminEvaluationsPanel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../../types";
import TeacherEvaluationItem from "../../../../components/TeacherEvaluationItem";

function getProgramName(ev: TeacherEvaluationSummary) {
  return (
    (ev as any)?.candidate?.programNameSnapshot ??
    (ev as any)?.programNameSnapshot ??
    "Sin programa"
  );
}

function getCreatedAt(ev: TeacherEvaluationSummary) {
  // adapta si tienes otro campo real
  const v =
    (ev as any)?.createdAt ??
    (ev as any)?.candidate?.createdAt ??
    (ev as any)?.updatedAt ??
    null;
  const t = v ? new Date(v).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

function getScore(ev: TeacherEvaluationSummary) {
  // adapta según tu data real
  const v = (ev as any)?.analysis?.score ?? (ev as any)?.score ?? (ev as any)?.finalScore ?? 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

type SortKey = "RECENT" | "SCORE_DESC" | "SCORE_ASC";

export default function AdminEvaluationsPanel(props: {
  filteredEvaluations: TeacherEvaluationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;

  // ✅ contexto del scope
  selectedSchool: string;
  selectedProgram: string;
}) {
  const { filteredEvaluations, selectedId, onSelect, selectedSchool, selectedProgram } = props;

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ✅ Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortKey>("RECENT");

  // ✅ Reset page on filters / scope change (para no quedarte en pag 9 sin data)
  useEffect(() => {
    setPage(1);
  }, [selectedSchool, selectedProgram, pageSize, sort, filteredEvaluations.length]);

  // ✅ Sorting (ejecutivo)
  const sorted = useMemo(() => {
    const base = [...(filteredEvaluations ?? [])];

    if (sort === "RECENT") {
      base.sort((a, b) => getCreatedAt(b) - getCreatedAt(a));
      return base;
    }

    if (sort === "SCORE_DESC") {
      base.sort((a, b) => getScore(b) - getScore(a));
      return base;
    }

    base.sort((a, b) => getScore(a) - getScore(b));
    return base;
  }, [filteredEvaluations, sort]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  // ✅ Si el usuario selecciona algo en otra página, saltar a esa página
  useEffect(() => {
    if (!selectedId) return;
    const idx = sorted.findIndex((x) => x.id === selectedId);
    if (idx < 0) return;

    const nextPage = Math.floor(idx / pageSize) + 1;
    if (nextPage !== safePage) setPage(nextPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, sorted, pageSize]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

  // ✅ Scroll to selected row (solo si está en la página)
  useEffect(() => {
    if (!selectedId) return;
    const el = rowRefs.current[selectedId];
    if (!el) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId, safePage]);

  const countLabel = useMemo(() => {
    const n = total;
    return `${n} ${n === 1 ? "registro" : "registros"}`;
  }, [total]);

  // ✅ Agrupación por programa SOLO para la página actual
  const grouped = useMemo(() => {
    const shouldGroup = selectedSchool !== "TODAS" && selectedProgram === "TODOS";

    if (!shouldGroup) {
      return [{ key: "LIST", title: null as string | null, items: pageItems }];
    }

    const map = new Map<string, TeacherEvaluationSummary[]>();
    for (const ev of pageItems) {
      const p = getProgramName(ev);
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(ev);
    }

    const keys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b, "es"));

    return keys.map((k) => ({
      key: k,
      title: k,
      items: map.get(k)!,
    }));
  }, [pageItems, selectedSchool, selectedProgram]);

  const contextLabel = useMemo(() => {
    const schoolLbl = selectedSchool === "TODAS" ? "Todas las escuelas" : selectedSchool;
    const progLbl = selectedProgram === "TODOS" ? "Todos los programas" : selectedProgram;
    return `${schoolLbl} · ${progLbl}`;
  }, [selectedSchool, selectedProgram]);

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
            <Users size={16} className="text-cyan-400" />
            Evaluaciones
          </h3>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-1" title={contextLabel}>
            {contextLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-neutral-400 border border-white/5">
            {countLabel}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
        <div className="text-[11px] text-neutral-500">
          Mostrando <span className="text-neutral-200 font-semibold">{from}</span>–
          <span className="text-neutral-200 font-semibold">{to}</span> de{" "}
          <span className="text-neutral-200 font-semibold">{total}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
              Orden
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-200 outline-none focus:border-emerald-500/30"
            >
              <option value="RECENT">Recientes</option>
              <option value="SCORE_DESC">Score (alto → bajo)</option>
              <option value="SCORE_ASC">Score (bajo → alto)</option>
            </select>
          </div>

          {/* Page size */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
              Por página
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-200 outline-none focus:border-emerald-500/30"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Pager */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className={[
                "h-9 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-2",
                safePage <= 1
                  ? "bg-white/5 border-white/10 text-neutral-600 cursor-not-allowed"
                  : "bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10",
              ].join(" ")}
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              Ant
            </button>

            <span className="text-[11px] text-neutral-500">
              {safePage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className={[
                "h-9 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-2",
                safePage >= totalPages
                  ? "bg-white/5 border-white/10 text-neutral-600 cursor-not-allowed"
                  : "bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10",
              ].join(" ")}
              title="Siguiente"
            >
              Sig
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* List (scroll interno premium) */}
      <div className="p-4">
        {total > 0 ? (
          <div className="max-h-[680px] overflow-auto pr-1 scrollbar-pro">
            <div className="space-y-5">
              {grouped.map((g) => (
                <div key={g.key} className="space-y-3">
                  {g.title && (
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
                        {g.title}
                      </p>
                      <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-neutral-500 border border-white/5">
                        {g.items.length}
                      </span>
                    </div>
                  )}

                  {g.items.map((ev) => {
                    const isSelected = selectedId === ev.id;
                    return (
                      <div
                        key={ev.id}
                        ref={(node) => {
                          rowRefs.current[ev.id] = node;
                        }}
                        className={[
                          "rounded-2xl transition-all cursor-pointer select-none",
                          "hover:bg-white/[0.02]",
                          isSelected ? "ring-1 ring-emerald-500/40" : "ring-0",
                        ].join(" ")}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={() => onSelect(ev.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(ev.id);
                          }
                        }}
                      >
                        <TeacherEvaluationItem evaluation={ev} selected={isSelected} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-600 gap-4 text-center px-6 py-10">
            <div className="p-4 bg-white/5 rounded-full">
              <Search size={32} className="opacity-50" />
            </div>
            <p className="text-sm">No se encontraron evaluaciones con los filtros actuales.</p>
            <p className="text-xs text-neutral-500 max-w-sm">
              Tip: selecciona una escuela y luego un programa, o limpia la búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
