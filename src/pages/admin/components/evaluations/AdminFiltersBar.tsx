import React, { useEffect, useMemo } from "react";
import { Filter, Search, XCircle, Globe, Building2, GraduationCap } from "lucide-react";

type Props = {
  search: string;
  setSearch: (v: string) => void;

  selectedSchool: string | null;
  setSelectedSchool: (v: string | null) => void;
  schoolOptions: string[];

  selectedProgram: string | null;
  setSelectedProgram: (v: string | null) => void;
  programOptions: string[];

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
  selectedProgram,
  setSelectedProgram,
  programOptions,
  resultsCount,
}: Props) {
  const hasSearch = search.trim().length > 0;

  const scopeLevel = useMemo(() => {
    if (!selectedSchool) return "GLOBAL" as const;
    if (!selectedProgram) return "SCHOOL" as const;
    return "PROGRAM" as const;
  }, [selectedSchool, selectedProgram]);

  const hasFilters = hasSearch;

  const chips = useMemo(() => {
    const out: { key: string; label: string; icon: React.ReactNode }[] = [];
    if (scopeLevel === "GLOBAL") {
      out.push({ key: "g", label: "Vista Global", icon: <Globe className="w-4 h-4" /> });
    }
    if (scopeLevel === "SCHOOL") {
      out.push({
        key: "s",
        label: `Escuela: ${selectedSchool}`,
        icon: <Building2 className="w-4 h-4" />,
      });
    }
    if (scopeLevel === "PROGRAM") {
      out.push({
        key: "s",
        label: `Escuela: ${selectedSchool}`,
        icon: <Building2 className="w-4 h-4" />,
      });
      out.push({
        key: "p",
        label: `Programa: ${selectedProgram}`,
        icon: <GraduationCap className="w-4 h-4" />,
      });
    }
    if (hasSearch) out.push({ key: "q", label: `Búsqueda: "${search.trim()}"`, icon: <Search className="w-4 h-4" /> });
    return out;
  }, [scopeLevel, selectedSchool, selectedProgram, hasSearch, search]);

  const clearSearchOnly = () => setSearch("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearch("");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSearch]);

  return (
    <section className="sticky top-4 z-30">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden">
        <div className="px-5 md:px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 font-bold flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-300" />
              Filtros
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Refina por candidato (búsqueda). El scope se cambia desde el header.
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
              onClick={clearSearchOnly}
              className="px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2"
              title="Limpiar búsqueda"
            >
              <XCircle className="w-4 h-4 text-neutral-300" />
              Limpiar
            </button>
          )}
        </div>

        <div className="p-4 md:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="md:col-span-12 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>

              <input
                type="text"
                placeholder="Buscar candidato…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl pl-12 pr-12 py-3 text-sm text-white bg-[#0f1110] border border-white/10 placeholder-neutral-600 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />

              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title="Borrar búsqueda"
                >
                  <XCircle className="w-4 h-4 text-neutral-300" />
                </button>
              )}
            </div>
          </div>

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
                  {c.icon}
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
