// src/pages/admin/components/evaluations/AdminFiltersBar.tsx
import React, { useEffect, useMemo } from "react";
import { Filter, Search, XCircle } from "lucide-react";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  selectedSchool: string;
  setSelectedSchool: (v: string) => void;
  schoolOptions: string[];

  // (Opcional) si quieres mostrar "X resultados"
  resultsCount?: number;
};

const chipBase =
  "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold tracking-widest";

export default function AdminFiltersBar({
  search,
  setSearch,
  selectedSchool,
  setSelectedSchool,
  schoolOptions,
  resultsCount,
}: Props) {
  const hasSearch = search.trim().length > 0;
  const hasSchool = selectedSchool !== "TODAS";
  const hasFilters = hasSearch || hasSchool;

  const chips = useMemo(() => {
    const out: { key: string; label: string }[] = [];
    if (hasSearch) out.push({ key: "q", label: `Búsqueda: "${search.trim()}"` });
    if (hasSchool) out.push({ key: "s", label: `Escuela: ${selectedSchool}` });
    return out;
  }, [hasSearch, hasSchool, search, selectedSchool]);

  const clearAll = () => {
    setSearch("");
    setSelectedSchool("TODAS");
  };

  // UX: Esc limpia solo la búsqueda
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearch("");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSearch]);

  return (
    <section className="sticky top-4 z-30">
      <div
        className="
          rounded-3xl border border-white/10
          bg-gradient-to-b from-white/[0.06] to-white/[0.02]
          backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.55)]
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="px-5 md:px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 font-bold flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-300" />
              Filtros
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Refina la lista por candidato o escuela.
              {typeof resultsCount === "number" && (
                <span className="ml-2 text-neutral-400">
                  · <b className="text-neutral-200">{resultsCount}</b> resultados
                </span>
              )}
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="
                px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest
                bg-white/5 hover:bg-white/10 border border-white/10
                flex items-center gap-2
              "
              title="Limpiar filtros"
            >
              <XCircle className="w-4 h-4 text-neutral-300" />
              Limpiar
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 md:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="md:col-span-7 relative group">
              <label className="sr-only" htmlFor="admin-search">
                Buscar candidato, escuela o programa
              </label>

              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>

              <input
                id="admin-search"
                type="text"
                placeholder="Buscar candidato, escuela o programa…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full rounded-2xl pl-12 pr-12 py-3 text-sm text-white
                  bg-[#0f1110] border border-white/10
                  placeholder-neutral-600 outline-none
                  focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10
                  transition-all
                "
              />

              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10
                    transition-colors
                  "
                  title="Borrar búsqueda"
                  aria-label="Borrar búsqueda"
                >
                  <XCircle className="w-4 h-4 text-neutral-300" />
                </button>
              )}
            </div>

            {/* School */}
            <div className="md:col-span-5 relative group">
              <label className="sr-only" htmlFor="admin-school">
                Filtrar por escuela
              </label>

              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>

              <select
                id="admin-school"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="
                  w-full rounded-2xl pl-12 pr-10 py-3 text-sm text-white
                  bg-[#0f1110] border border-white/10
                  outline-none appearance-none cursor-pointer
                  focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10
                  transition-all
                "
              >
                <option value="TODAS">Todas las escuelas</option>
                {schoolOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-600 font-bold">
                Activos:
              </span>
              {chips.map((c) => (
                <span
                  key={c.key}
                  className={`${chipBase} border-emerald-500/20 bg-emerald-500/10 text-emerald-200`}
                >
                  {c.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
