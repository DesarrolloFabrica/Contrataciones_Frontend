// src/pages/admin/components/evaluations/AdminEvaluationsPanel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../../types";
import TeacherEvaluationItem from "../../../../components/TeacherEvaluationItem";
import { useTheme } from "../../../../context/ThemeContext";

function getProgramName(ev: TeacherEvaluationSummary) {
  return (
    (ev as any)?.candidate?.programNameSnapshot ??
    (ev as any)?.programNameSnapshot ??
    "Sin programa"
  );
}

function getCreatedAt(ev: TeacherEvaluationSummary) {
  const v =
    (ev as any)?.createdAt ??
    (ev as any)?.candidate?.createdAt ??
    (ev as any)?.updatedAt ??
    null;
  const t = v ? new Date(v).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

function getScore(ev: TeacherEvaluationSummary) {
  const v =
    (ev as any)?.analysis?.score ??
    (ev as any)?.score ??
    (ev as any)?.finalScore ??
    0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

type SortKey = "RECENT" | "SCORE_DESC" | "SCORE_ASC";

export default function AdminEvaluationsPanel(props: {
  filteredEvaluations: TeacherEvaluationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;

  selectedSchool: string;
  selectedProgram: string;

  search: string;
  setSearch: (v: string) => void;
}) {
  const {
    filteredEvaluations,
    selectedId,
    onSelect,
    selectedSchool,
    selectedProgram,
    search,
    setSearch,
  } = props;

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("RECENT");

  useEffect(() => {
    setPage(1);
  }, [selectedSchool, selectedProgram, sort, filteredEvaluations.length]);

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
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (!selectedId) return;
    const idx = sorted.findIndex((x) => x.id === selectedId);
    if (idx < 0) return;
    const nextPage = Math.floor(idx / PAGE_SIZE) + 1;
    if (nextPage !== safePage) setPage(nextPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, sorted]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, safePage]);

  useEffect(() => {
    if (!selectedId) return;
    const el = rowRefs.current[selectedId];
    if (!el) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId, safePage]);

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
    return keys.map((k) => ({ key: k, title: k, items: map.get(k)! }));
  }, [pageItems, selectedSchool, selectedProgram]);

  const contextLabel = useMemo(() => {
    const schoolLbl = selectedSchool === "TODAS" ? "Todas las escuelas" : selectedSchool;
    const progLbl = selectedProgram === "TODOS" ? "Todos los programas" : selectedProgram;
    return `${schoolLbl} · ${progLbl}`;
  }, [selectedSchool, selectedProgram]);

  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);

  const countLabel = useMemo(() => {
    const n = total;
    return `${n} ${n === 1 ? "registro" : "registros"}`;
  }, [total]);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "RECENT", label: "Recientes" },
    { value: "SCORE_DESC", label: "Score (alto → bajo)" },
    { value: "SCORE_ASC", label: "Score (bajo → alto)" },
  ];
  const [sortOpen, setSortOpen] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={[
        "relative rounded-[28px] overflow-hidden border",
        isDark
          ? "border-white/10 bg-[#0B0E10] shadow-[0_30px_120px_rgba(0,0,0,0.70)]"
          : "border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]",
      ].join(" ")}
    >
      {/* Fondo premium (solo oscuro) */}
      {isDark && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent" />
          <div className="absolute inset-0 [background:radial-gradient(1200px_circle_at_15%_0%,rgba(16,185,129,0.10),transparent_55%),radial-gradient(900px_circle_at_85%_25%,rgba(34,211,238,0.08),transparent_55%)]" />
        </div>
      )}

      {/* Header compacto */}
      <header
        className={[
          "relative px-6 pt-6 pb-4 border-b",
          isDark
            ? "border-white/10 bg-black/20 backdrop-blur-md"
            : "border-slate-200 bg-slate-50",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-2xl border",
                  isDark
                    ? "bg-emerald-500/10 border-emerald-400/20"
                    : "bg-emerald-50 border-emerald-100",
                ].join(" ")}
              >
                <Users
                  size={16}
                  className={isDark ? "text-emerald-300" : "text-emerald-600"}
                />
              </span>
              <div className="min-w-0">
                <h3
                  className={[
                    "font-extrabold text-sm tracking-[0.18em] uppercase",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  Evaluaciones
                </h3>
                <p
                  className={[
                    "text-xs mt-0.5 line-clamp-1",
                    isDark ? "text-white/50" : "text-slate-600",
                  ].join(" ")}
                  title={contextLabel}
                >
                  {contextLabel}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px]",
                  isDark
                    ? "border-white/10 bg-white/5 text-white/60"
                    : "border-slate-200 bg-white text-slate-600",
                ].join(" ")}
              >
                Mostrando{" "}
                <span
                  className={[
                    "mx-1 font-semibold",
                    isDark ? "text-white/90" : "text-slate-900",
                  ].join(" ")}
                >
                  {from}
                </span>
                –
                <span
                  className={[
                    "mx-1 font-semibold",
                    isDark ? "text-white/90" : "text-slate-900",
                  ].join(" ")}
                >
                  {to}
                </span>{" "}
                de{" "}
                <span
                  className={[
                    "mx-1 font-semibold",
                    isDark ? "text-white/90" : "text-slate-900",
                  ].join(" ")}
                >
                  {total}
                </span>
              </span>

              <span
                className={[
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px]",
                  isDark
                    ? "border-white/10 bg-white/5 text-white/60"
                    : "border-slate-200 bg-white text-slate-600",
                ].join(" ")}
              >
                {countLabel}
              </span>
            </div>
          </div>

          {/* Acción auxiliar (reservado para futuro: exportar / refrescar) */}
          <div className="shrink-0 hidden sm:flex items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px]",
                isDark
                  ? "border-white/10 bg-white/5 text-white/60"
                  : "border-slate-200 bg-white text-slate-600",
              ].join(" ")}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Panel
            </span>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div
        className={[
          "relative px-6 py-4 border-b",
          isDark ? "border-white/10" : "border-slate-200 bg-white",
        ].join(" ")}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative group flex-1 lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                className={[
                  "h-5 w-5 transition-colors",
                  isDark
                    ? "text-white/35 group-focus-within:text-emerald-300"
                    : "text-slate-400 group-focus-within:text-emerald-500",
                ].join(" ")}
              />
            </div>

            <input
              type="text"
              placeholder="Buscar candidato…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={[
                "w-full rounded-2xl pl-11 pr-24 py-2.5 text-sm outline-none transition-all",
                isDark
                  ? "text-white bg-black/40 border border-white/10 placeholder:text-white/25 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/10"
                  : "text-slate-900 bg-white border border-slate-300 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/40",
              ].join(" ")}
            />

            {search.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={[
                  "absolute right-2 top-1/2 -translate-y-1/2",
                  "px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition",
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700",
                ].join(" ")}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-end gap-3 flex-1">
            {/* Sort (select personalizado oscuro) */}
            <div className="flex items-center gap-2 relative">
              <span
                className={[
                  "text-[10px] uppercase tracking-[0.22em] font-bold",
                  isDark ? "text-white/35" : "text-slate-500",
                ].join(" ")}
              >
                Orden
              </span>
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className={[
                  "h-10 px-3 rounded-xl text-xs",
                  "outline-none flex items-center justify-between gap-2 min-w-[150px] border",
                  isDark
                    ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 focus-visible:border-emerald-400/40 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                    : "bg-white border-slate-300 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300/40",
                ].join(" ")}
              >
                <span className="truncate">
                  {sortOptions.find((o) => o.value === sort)?.label ?? "Recientes"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 ${
                    isDark ? "text-white/60" : "text-slate-500"
                  }`}
                />
              </button>

              {sortOpen && (
                <div
                  className={[
                    "absolute right-0 top-11 z-20 w-56 rounded-xl border overflow-hidden",
                    isDark
                      ? "border-white/10 bg-[#050608] shadow-[0_18px_45px_rgba(0,0,0,0.8)]"
                      : "border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.2)]",
                  ].join(" ")}
                >
                  {sortOptions.map((opt) => {
                    const isActive = opt.value === sort;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSort(opt.value);
                          setSortOpen(false);
                        }}
                        className={[
                          "w-full px-3 py-2 text-left text-xs transition-colors",
                          isActive
                            ? isDark
                              ? "bg-emerald-500/15 text-emerald-200"
                              : "bg-emerald-50 text-emerald-700"
                            : isDark
                              ? "bg-transparent text-white/80 hover:bg-white/5"
                              : "bg-transparent text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pager */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
                className={[
                  "h-10 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-2",
                  !canPrev
                    ? isDark
                      ? "bg-white/5 border-white/10 text-white/25 cursor-not-allowed"
                      : "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                    : isDark
                      ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50",
                ].join(" ")}
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
                Ant
              </button>

              <span
                className={[
                  "text-[11px] min-w-[60px] text-center",
                  isDark ? "text-white/45" : "text-slate-500",
                ].join(" ")}
              >
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext}
                className={[
                  "h-10 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-2",
                  !canNext
                    ? isDark
                      ? "bg-white/5 border-white/10 text-white/25 cursor-not-allowed"
                      : "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                    : isDark
                      ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50",
                ].join(" ")}
                title="Siguiente"
              >
                Sig
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="relative p-5">
        {total > 0 ? (
          <div className="space-y-6">
            {grouped.map((g) => (
              <div key={g.key} className="space-y-3">
                {g.title && (
                  <div className="flex items-center justify-between">
                    <p
                      className={[
                        "text-[11px] uppercase tracking-[0.22em] font-bold",
                        isDark ? "text-white/35" : "text-slate-500",
                      ].join(" ")}
                    >
                      {g.title}
                    </p>
                    <span
                      className={[
                        "text-[10px] font-bold px-2.5 py-1 rounded-full border",
                        isDark
                          ? "bg-white/5 text-white/50 border-white/10"
                          : "bg-slate-50 text-slate-600 border-slate-200",
                      ].join(" ")}
                    >
                      {g.items.length}
                    </span>
                  </div>
                )}

                {/* lista de evaluaciones con más aire entre filas */}
                <div className="space-y-4">
                  {g.items.map((ev) => {
                    const isSelected = selectedId === ev.id;
                    return (
                      <div
                        key={ev.id}
                        ref={(node) => {
                          rowRefs.current[ev.id] = node;
                        }}
                        className={[
                          "relative transition-transform duration-200 cursor-pointer select-none",
                          "hover:-translate-y-[2px]",
                          isSelected ? "scale-[1.01]" : "",
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
                        <TeacherEvaluationItem
                          evaluation={ev}
                          selected={isSelected}
                          footer={
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelect(ev.id);
                              }}
                              className={[
                                "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-colors",
                                isDark
                                  ? "bg-emerald-500/15 border-emerald-400/25 text-emerald-200 hover:bg-emerald-500/25 hover:border-emerald-400/40"
                                  : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.35)]",
                              ].join(" ")}
                            >
                              Ver detalle
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-white/55 gap-4 text-center px-6 py-12">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <Search size={28} className="opacity-60" />
            </div>
            <p className="text-sm font-semibold text-white/70">
              No se encontraron evaluaciones con los filtros actuales.
            </p>
            <p className="text-xs text-white/40 max-w-sm">
              Tip: selecciona una escuela y luego un programa, o limpia la búsqueda.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}