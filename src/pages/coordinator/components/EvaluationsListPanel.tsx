// src/pages/coordinator/components/EvaluationsListPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FileText, Filter, Search, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TeacherEvaluationItem from "../../../components/TeacherEvaluationItem";
import type { DecisionFilter, LocalDecision, CandidateGroup } from "../types";
import { useTheme } from "../../../context/ThemeContext";

type ProgramOption = { id: string; name: string };

const normalizeDecision = (value: unknown): LocalDecision => {
  const v = String(value ?? "").trim().toUpperCase();

  // Backend EN
  if (v === "PENDING") return "PENDIENTE";
  if (v === "APPROVED") return "APROBADO";
  if (v === "REJECTED") return "RECHAZADO";

  // ES
  if (v === "PENDIENTE") return "PENDIENTE";
  if (v === "APROBADO") return "APROBADO";
  if (v === "RECHAZADO") return "RECHAZADO";

  // Fallback por contains
  if (v.includes("PEND")) return "PENDIENTE";
  if (v.includes("APROB")) return "APROBADO";
  if (v.includes("RECHAZ")) return "RECHAZADO";

  return "PENDIENTE";
};

const toTime = (d?: unknown) => {
  const t = new Date(String(d ?? "")).getTime();
  return Number.isFinite(t) ? t : 0;
};

const norm = (v: any) => String(v ?? "").toLowerCase().trim();
const normDoc = (v: any) => String(v ?? "").replace(/\D/g, "");

/**
 * ✅ Paginación con máximo 5 números visibles
 * Retorna array de (number | "…") manteniendo <= maxNumbers números.
 */
function buildPageItems(totalPages: number, current: number, maxNumbers = 5) {
  const clamp = (n: number) => Math.max(1, Math.min(totalPages, n));
  const cur = clamp(current);

  if (totalPages <= maxNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Siempre incluimos 1 y totalPages (cuentan como números)
  // Dejamos (maxNumbers - 2) espacios para el "centro"
  const centerCount = maxNumbers - 2;

  let start = cur - Math.floor(centerCount / 2);
  let end = cur + Math.ceil(centerCount / 2) - 1;

  // Ajustes para no salirnos del rango [2 .. totalPages-1]
  if (start < 2) {
    start = 2;
    end = start + centerCount - 1;
  }
  if (end > totalPages - 1) {
    end = totalPages - 1;
    start = end - centerCount + 1;
  }

  const items: Array<number | "…"> = [1];

  if (start > 2) items.push("…");

  for (let p = start; p <= end; p++) items.push(p);

  if (end < totalPages - 1) items.push("…");

  items.push(totalPages);

  return items;
}

type Props = {
  variant?: "standalone" | "embedded";

  schoolFilter: string;
  setSchoolFilter: (v: string) => void;

  programFilter: string;
  setProgramFilter: (v: string) => void;

  schoolOptions: string[];
  programOptions: ProgramOption[];

  mustChooseScope: boolean;

  groupedCandidates: CandidateGroup[];
  selectedId: string | null;

  search: string;
  setSearch: (v: string) => void;

  decisionFilter: DecisionFilter;
  setDecisionFilter: (v: DecisionFilter) => void;

  localDecisions: Record<string, LocalDecision>;

  lockedSchool?: boolean;
  schoolHint?: string;

  onOpenDetail?: (candidateKey: string, evaluationId: string) => void;
  onOpenComparison?: (candidateKey: string, evaluationId: string) => void;
};

const EvaluationsListPanel: React.FC<Props> = ({
  variant = "standalone",

  schoolFilter,
  setSchoolFilter,
  programFilter,
  setProgramFilter,
  schoolOptions,
  programOptions,
  mustChooseScope,

  groupedCandidates,
  selectedId,
  search,
  setSearch,
  decisionFilter,
  setDecisionFilter,
  localDecisions,

  lockedSchool,
  schoolHint,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  /**
   * Estado del candidato:
   * 1) si existe decisión local para alguna entrevista, toma la más reciente
   * 2) si_toggle, toma la más reciente del backend
   */
  const getCandidateDecision = (g: CandidateGroup): LocalDecision => {
    const interviews = Array.isArray(g.interviews) ? g.interviews : [];

    // 1) Local
    const localWithTime = interviews
      .map((ev: any) => ({
        id: ev?.id,
        t: Math.max(toTime(ev?.updatedAt), toTime(ev?.createdAt)),
        local: ev?.id ? localDecisions?.[ev.id] : undefined,
      }))
      .filter((x) => !!x.local)
      .sort((a, b) => b.t - a.t);

    if (localWithTime.length > 0) return localWithTime[0].local as LocalDecision;

    // 2) Backend (más reciente)
    const backendWithTime = interviews
      .map((ev: any) => {
        const raw =
          ev?.coordinatorDecisionStatus ??
          ev?.coordinatorDecision?.verdict ??
          ev?.coordinatorDecision ??
          null;

        return {
          t: Math.max(toTime(ev?.updatedAt), toTime(ev?.createdAt)),
          raw,
        };
      })
      .sort((a, b) => b.t - a.t);

    if (backendWithTime.length > 0) return normalizeDecision(backendWithTime[0].raw);

    return "PENDIENTE";
  };

  const visibleGroups = useMemo(() => {
    if (mustChooseScope) return [];

    const qText = norm(search);
    const qDoc = normDoc(search);

    return groupedCandidates.filter((g) => {
      // 1) filtro por estado
      if (decisionFilter !== "ALL" && getCandidateDecision(g) !== decisionFilter) {
        return false;
      }

      // 2) filtro por buscador
      if (!qText && !qDoc) return true;

      const name = norm(g.candidateName);
      const school = norm(g.school);
      const program = norm(g.program);
      const doc = normDoc(g.documentNumber);

      return (
        (qText && (name.includes(qText) || school.includes(qText) || program.includes(qText))) ||
        (qDoc && doc.includes(qDoc))
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mustChooseScope, groupedCandidates, decisionFilter, localDecisions, search]);

  // -----------------------------
  // ✅ Paginación FIX:
  // - Máximo 5 resultados por página
  // - Máximo 5 botones numéricos
  // -----------------------------
  const PAGE_SIZE = 5; // ✅ fijo: máximo 5 cards visibles
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [
    mustChooseScope,
    search,
    decisionFilter,
    schoolFilter,
    programFilter,
    visibleGroups.length,
  ]);

  const total = mustChooseScope ? 0 : visibleGroups.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);

  const pageItems = useMemo(
    () => (mustChooseScope ? [] : visibleGroups.slice(start, end)),
    [mustChooseScope, visibleGroups, start, end]
  );

  const pagerItems = useMemo(
    () => buildPageItems(totalPages, safePage, 5),
    [totalPages, safePage]
  );

  // -----------------------------
  // ✅ PREMIUM UI TOKENS (local)
  // -----------------------------
  const shellClass = [
    "relative overflow-hidden rounded-[28px] backdrop-blur-xl",
    isDark
      ? "border border-white/10 bg-[#0B0F14]/70 shadow-[0_24px_80px_-70px_rgba(16,185,129,0.18)]"
      : "border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
  ].join(" ");

  const shellAmbient = (
    <>
      {isDark && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(16,185,129,0.10),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_16%,rgba(34,211,238,0.08),transparent_58%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_30%,rgba(255,255,255,0.01))]" />
        </>
      )}
    </>
  );

  const content = (
    <div
      className={`relative flex flex-col rounded-[24px] border overflow-hidden ${
        isDark
          ? "border-white/5 bg-[#0A0C10] shadow-2xl"
          : "border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.04)]"
      }`}
    >
      {/* Ambient */}
      {isDark && (
        <>
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-cyan-500/5 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px]" />
          <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </>
      )}

      <div className="relative p-6 md:p-8 flex flex-col">
        {/* Header (Standalone) */}
        {variant === "standalone" && (
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex gap-4">
              <div
                className={`shrink-0 grid h-14 w-14 place-items-center rounded-2xl border transition-all duration-300 ${
                  isDark
                    ? "border-cyan-500/25 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                    : "border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50 shadow-sm"
                }`}
              >
                <FileText
                  className={`w-6 h-6 ${
                    isDark ? "text-cyan-400" : "text-cyan-600"
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`text-2xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Bandeja de candidatos
                </h3>
                <p
                  className={`mt-1.5 text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Gestion y consulta de evaluaciones docentes.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 cursor-pointer ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-sm"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros avanzados</span>
            </button>
          </div>
        )}

        {/* Scope Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Escuela */}
          <div className="space-y-2 group">
            <label
              className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors group-focus-within:text-cyan-500 ${
                isDark ? "text-slate-500" : "text-slate-600"
              }`}
            >
              Escuela / Coordinación
              {lockedSchool && <Lock className="w-3 h-3 text-cyan-500" />}
            </label>

            <div className="relative">
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                disabled={!!lockedSchool}
                className={`w-full appearance-none rounded-2xl border px-4 py-3.5 text-sm font-medium outline-none transition-all duration-300 ${
                  isDark
                    ? lockedSchool
                      ? "bg-black/20 border-white/5 text-slate-500 cursor-not-allowed"
                      : "bg-[#15191E]/80 border-white/10 text-slate-200 hover:border-white/20 focus:border-cyan-500/50 focus:bg-[#1A1F26] focus:shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                    : lockedSchool
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-white border-slate-200 text-slate-800 hover:border-cyan-300 focus:border-cyan-500/70 focus:shadow-[0_8px_25px_-5px_rgba(6,182,212,0.12)] shadow-sm"
                }`}
              >
                <option value="">Selecciona una escuela…</option>
                {schoolOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div
                className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1L5 5L9 1" />
                </svg>
              </div>
            </div>

            {schoolHint && (
              <p
                className={`text-[11px] pl-1 ${
                  isDark ? "text-cyan-400/80" : "text-cyan-700"
                }`}
              >
                {schoolHint}
              </p>
            )}
          </div>

          {/* Programa */}
          <div className="space-y-2 group">
            <label
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors group-focus-within:text-cyan-500 ${
                isDark ? "text-slate-500" : "text-slate-600"
              }`}
            >
              Programa Académico
            </label>

            <div className="relative">
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                disabled={!schoolFilter}
                className={`w-full appearance-none rounded-2xl border px-4 py-3.5 text-sm font-medium outline-none transition-all duration-300 ${
                  isDark
                    ? !schoolFilter
                      ? "bg-black/20 border-white/5 text-slate-600 cursor-not-allowed"
                      : "bg-[#15191E]/80 border-white/10 text-slate-200 hover:border-white/20 focus:border-cyan-500/50 focus:bg-[#1A1F26] focus:shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                    : !schoolFilter
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-white border-slate-200 text-slate-800 hover:border-cyan-300 focus:border-cyan-500/70 focus:shadow-[0_8px_25px_-5px_rgba(6,182,212,0.12)] shadow-sm"
                }`}
              >
                <option value="">
                  {schoolFilter ? "Selecciona un programa…" : "Primero elige escuela…"}
                </option>
                {programOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div
                className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1L5 5L9 1" />
                </svg>
              </div>
            </div>
          </div>

          {mustChooseScope && (
            <div className="md:col-span-2 rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] px-5 py-4 flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <p className={`text-xs ${isDark ? "text-amber-200/70" : "text-amber-800/80"}`}>
                Para ver el historial, es necesario seleccionar{" "}
                <b className={isDark ? "text-amber-100" : "text-amber-900"}>Escuela</b> y{" "}
                <b className={isDark ? "text-amber-100" : "text-amber-900"}>Programa</b>.
              </p>
            </div>
          )}
        </div>

        {/* Search & Status */}
        <div
          className={`flex flex-col gap-5 mb-8 pb-8 border-b ${
            isDark ? "border-white/10" : "border-slate-200/60"
          }`}
        >
          <div className="relative group">
            <Search
              className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-cyan-400 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar candidato por nombre, escuela o programa..."
              disabled={mustChooseScope}
              className={`w-full rounded-2xl border pl-12 pr-4 py-3.5 text-sm outline-none transition-all duration-300 ${
                isDark
                  ? mustChooseScope
                    ? "bg-black/40 border-white/5 text-slate-600 cursor-not-allowed"
                    : "bg-[#15191E]/80 border-white/10 text-white placeholder-slate-500 hover:border-white/20 focus:border-cyan-500/50 focus:bg-[#1A1F26] focus:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  : mustChooseScope
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-cyan-300 focus:border-cyan-500/70 focus:shadow-[0_8px_25px_-5px_rgba(6,182,212,0.15)] shadow-sm"
              }`}
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${
                isDark ? "text-slate-600" : "text-slate-500"
              }`}
            >
              Estado:
            </span>

            <div className="flex items-center gap-2">
              {(["ALL", "PENDIENTE", "APROBADO", "RECHAZADO"] as DecisionFilter[]).map((opt) => {
                const active = decisionFilter === opt;
                const disabled = mustChooseScope;

                let activeClass = isDark
                  ? "bg-white text-black"
                  : "bg-slate-900 text-white";
                if (opt === "ALL")
                  activeClass = isDark
                    ? "bg-slate-200 text-slate-900 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : "bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.35)]";
                if (opt === "PENDIENTE")
                  activeClass = isDark
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                    : "bg-amber-50 text-amber-700 border border-amber-200 shadow-[0_10px_30px_rgba(251,191,36,0.35)]";
                if (opt === "APROBADO")
                  activeClass = isDark
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                    : "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-[0_10px_30px_rgba(6,182,212,0.35)]";
                if (opt === "RECHAZADO")
                  activeClass = isDark
                    ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                    : "bg-rose-50 text-rose-700 border border-rose-200 shadow-[0_10px_30px_rgba(248,113,113,0.35)]";

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => !disabled && setDecisionFilter(opt)}
                    disabled={disabled}
                    className={`
                      rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300
                      ${
                        disabled
                          ? "opacity-40 cursor-not-allowed border border-transparent text-slate-600"
                          : ""
                      }
                      ${!disabled && active ? activeClass : ""}
                      ${
                        !disabled && !active
                          ? isDark
                            ? "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-white"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900"
                          : ""
                      }
                    `}
                  >
                    {opt === "ALL" ? "Todos" : opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 min-h-[200px]">
          {mustChooseScope && (
            <div
              className={`flex h-48 flex-col items-center justify-center rounded-3xl border border-dashed ${
                isDark
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div
                className={`mb-3 ${
                  isDark ? "text-slate-600" : "text-slate-400"
                }`}
              >
                <Filter className="w-8 h-8 opacity-40" />
              </div>
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-slate-500" : "text-slate-600"
                }`}
              >
                Configura los filtros arriba.
              </p>
            </div>
          )}

          {!mustChooseScope && visibleGroups.length === 0 && (
            <div
              className={`flex h-48 flex-col items-center justify-center rounded-3xl border border-dashed ${
                isDark
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-slate-500" : "text-slate-600"
                }`}
              >
                No se encontraron resultados.
              </p>
            </div>
          )}

          {!mustChooseScope &&
            pageItems.map((g) => {
              const ev = g.latest;
              const candidateDecision = getCandidateDecision(g);

              const cardFooter = (
                <>
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={`font-medium ${
                        isDark ? "text-slate-500" : "text-slate-600"
                      }`}
                    >
                      Entrevistas:
                    </span>
                    <span
                      className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 font-mono text-xs ${
                        isDark
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                      }`}
                    >
                      {g.interviews.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/coordinator/evaluations/${encodeURIComponent(ev.id)}?tab=decision`
                      )
                    }
                    className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 group-hover:gap-3 ${
                      isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-700 hover:text-cyan-600"
                    }`}
                  >
                    Ver Detalle
                    <div
                      className={`grid h-6 w-6 place-items-center rounded-full border transition-all duration-300 ${
                        isDark
                          ? "border-cyan-500/30 bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-black"
                          : "border-cyan-200 bg-cyan-50 group-hover:bg-cyan-500 group-hover:text-white"
                      }`}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </>
              );

              return (
                <TeacherEvaluationItem
                  key={g.key}
                  evaluation={ev}
                  selected={selectedId === ev.id}
                  onClick={() => {}}
                  decisionStatus={candidateDecision}
                  footer={cardFooter}
                />
              );
            })}
        </div>

        {/* Pagination */}
        {!mustChooseScope && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <div
              className={`text-xs ${
                isDark ? "text-slate-500" : "text-slate-600"
              }`}
            >
              Mostrando{" "}
              <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {start + 1}
              </span>{" "}
              –{" "}
              <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {end}
              </span>{" "}
              de{" "}
              <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {total}
              </span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"}>
                {" "}
                •{" "}
              </span>
              <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                5 por página
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className={`grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 ${
                  safePage <= 1
                    ? isDark
                      ? "border-transparent text-slate-700 cursor-not-allowed"
                      : "border-transparent text-slate-300 cursor-not-allowed"
                    : isDark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-cyan-300 hover:text-cyan-700 shadow-sm"
                }`}
                aria-label="Anterior"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="flex items-center gap-1.5">
                {pagerItems.map((it, idx) => {
                  if (it === "…") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className={`px-1 text-xs ${
                          isDark ? "text-slate-600" : "text-slate-500"
                        }`}
                      >
                        …
                      </span>
                    );
                  }
                  const p = it as number;
                  const isActive = p === safePage;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`
                        h-9 min-w-[2.25rem] rounded-full text-xs font-bold transition-all duration-300
                        ${
                          isActive
                            ? isDark
                              ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-110"
                              : "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.45)] scale-110"
                            : isDark
                              ? "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                              : "text-slate-500 bg-white border border-slate-200 hover:text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50 shadow-sm"
                        }
                      `}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className={`grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 ${
                  safePage >= totalPages
                    ? isDark
                      ? "border-transparent text-slate-700 cursor-not-allowed"
                      : "border-transparent text-slate-300 cursor-not-allowed"
                    : isDark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-cyan-300 hover:text-cyan-700 shadow-sm"
                }`}
                aria-label="Siguiente"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (variant === "embedded") return content;

  return (
    <div className={shellClass}>
      {shellAmbient}
      {content}
    </div>
  );
};

export default EvaluationsListPanel;