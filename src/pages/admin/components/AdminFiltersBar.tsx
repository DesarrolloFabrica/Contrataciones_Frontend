// src/pages/admin/components/AdminFiltersBar.tsx
import React from "react";
import { Filter, Search } from "lucide-react";

export default function AdminFiltersBar(props: {
  search: string;
  setSearch: (v: string) => void;
  selectedSchool: string;
  setSelectedSchool: (v: string) => void;
  schoolOptions: string[];
}) {
  const { search, setSearch, selectedSchool, setSelectedSchool, schoolOptions } = props;

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-[#0a0a0a] p-2 rounded-2xl border border-white/10 sticky top-4 z-30 shadow-2xl shadow-black/50">
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Buscar candidato, escuela o programa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0f1110] border-none rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:ring-2 focus:ring-emerald-500/20 focus:bg-[#141414] transition-all"
        />
      </div>

      <div className="relative md:w-1/3 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Filter className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
        </div>
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="w-full bg-[#0f1110] border-none rounded-xl pl-12 pr-10 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/20 focus:bg-[#141414] appearance-none cursor-pointer transition-all"
        >
          <option value="TODAS">Todas las Escuelas</option>
          {schoolOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
