// src/pages/coordinator/components/EvaluationsListPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FileText, Filter, Search, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TeacherEvaluationItem from "../../../components/TeacherEvaluationItem";
import type { DecisionFilter, LocalDecision, CandidateGroup } from "../types";

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
  const shellClass =
    "relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0B0F14]/70 backdrop-blur-xl shadow-[0_24px_80px_-70px_rgba(16,185,129,0.18)]";

  const shellAmbient = (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(16,185,129,0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_16%,rgba(34,211,238,0.08),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_30%,rgba(255,255,255,0.01))]" />
    </>
  );

  const content = (
    <div className="relative flex flex-col rounded-[24px] border border-white/5 bg-[#0A0C10] shadow-2xl overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />

      <div className="relative p-6 md:p-8 flex flex-col">
        {/* Header (Standalone) */}
        {variant === "standalone" && (
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex gap-4">
              <div className="shrink-0 grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Historial de Evaluaciones
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Gestión y consulta de registros académicos.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros avanzados</span>
            </div>
          </div>
        )}

        {/* Scope Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Escuela */}
          <div className="space-y-2 group">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 group-focus-within:text-emerald-400 transition-colors">
              Escuela / Coordinación
              {lockedSchool && <Lock className="w-3 h-3 text-emerald-500" />}
            </label>

            <div className="relative">
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                disabled={!!lockedSchool}
                className={`w-full appearance-none rounded-xl border bg-[#15191E] px-4 py-3 text-sm font-medium outline-none transition-all
                  ${
                    lockedSchool
                      ? "border-white/5 text-slate-500 cursor-not-allowed bg-black/20"
                      : "border-white/10 text-slate-200 hover:border-white/20 focus:border-emerald-500/50 focus:bg-[#1A1F26]"
                  }`}
              >
                <option value="">Selecciona una escuela…</option>
                {schoolOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
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
              <p className="text-[11px] text-emerald-400/80 pl-1">{schoolHint}</p>
            )}
          </div>

          {/* Programa */}
          <div className="space-y-2 group">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-focus-within:text-emerald-400 transition-colors">
              Programa Académico
            </label>

            <div className="relative">
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                disabled={!schoolFilter}
                className={`w-full appearance-none rounded-xl border bg-[#15191E] px-4 py-3 text-sm font-medium outline-none transition-all
                  ${
                    !schoolFilter
                      ? "border-white/5 text-slate-600 cursor-not-allowed bg-black/20"
                      : "border-white/10 text-slate-200 hover:border-white/20 focus:border-emerald-500/50 focus:bg-[#1A1F26]"
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
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
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
            <div className="md:col-span-2 rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs text-amber-200/80">
                Para ver el historial, es necesario seleccionar <b className="text-amber-100">Escuela</b> y{" "}
                <b className="text-amber-100">Programa</b>.
              </p>
            </div>
          )}
        </div>

        {/* Search & Status */}
        <div className="flex flex-col gap-4 mb-6 border-b border-white/5 pb-6">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar candidato por nombre..."
              disabled={mustChooseScope}
              className={`w-full rounded-xl border bg-[#15191E] pl-11 pr-4 py-2.5 text-sm outline-none transition-all
                ${
                  mustChooseScope
                    ? "border-white/5 text-slate-600 cursor-not-allowed"
                    : "border-white/10 text-white placeholder-slate-600 hover:border-white/20 focus:border-emerald-500/50 focus:bg-[#1A1F26]"
                }`}
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 shrink-0">
              Estado:
            </span>

            <div className="flex items-center gap-2">
              {(["ALL", "PENDIENTE", "APROBADO", "RECHAZADO"] as DecisionFilter[]).map((opt) => {
                const active = decisionFilter === opt;
                const disabled = mustChooseScope;

                let activeClass = "bg-white text-black";
                if (opt === "ALL")
                  activeClass =
                    "bg-slate-200 text-slate-900 shadow-[0_0_10px_rgba(255,255,255,0.3)]";
                if (opt === "PENDIENTE")
                  activeClass =
                    "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]";
                if (opt === "APROBADO")
                  activeClass =
                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]";
                if (opt === "RECHAZADO")
                  activeClass =
                    "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]";

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => !disabled && setDecisionFilter(opt)}
                    disabled={disabled}
                    className={`
                      rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200
                      ${disabled ? "opacity-40 cursor-not-allowed border border-transparent text-slate-600" : ""}
                      ${!disabled && active ? activeClass : ""}
                      ${
                        !disabled && !active
                          ? "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-white"
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
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
              <div className="text-slate-600 mb-2">
                <Filter className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm text-slate-500">Configura los filtros arriba.</p>
            </div>
          )}

          {!mustChooseScope && visibleGroups.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
              <p className="text-sm text-slate-500">No se encontraron resultados.</p>
            </div>
          )}

          {!mustChooseScope &&
            pageItems.map((g) => {
              const ev = g.latest;
              const candidateDecision = getCandidateDecision(g);

              return (
                <div
                  key={g.key}
                  className="group relative rounded-2xl border border-white/5 bg-[#15191E] p-1 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_4px_20px_-12px_rgba(16,185,129,0.2)]"
                >
                  <div className="flex flex-col">
                    <div className="p-1">
                      <TeacherEvaluationItem
                        evaluation={ev}
                        selected={selectedId === ev.id}
                        onClick={() => {}}
                        decisionStatus={candidateDecision}
                      />
                    </div>

                    <div className="mt-1 flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-medium">Entrevistas realizadas:</span>
                        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded bg-white/10 px-1.5 font-mono text-white">
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
                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400 transition-transform group-hover:translate-x-[-4px]"
                      >
                        Ver Detalle
                        <div className="grid h-6 w-6 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 transition-colors group-hover:bg-emerald-500 group-hover:text-black">
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
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Pagination */}
        {!mustChooseScope && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Mostrando <span className="text-white">{start + 1}</span> –{" "}
              <span className="text-white">{end}</span> de{" "}
              <span className="text-white">{total}</span>
              <span className="text-slate-600"> • </span>
              <span className="text-slate-400">5 por página</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className={`grid h-8 w-8 place-items-center rounded-xl border transition ${
                  safePage <= 1
                    ? "border-transparent text-slate-700 cursor-not-allowed"
                    : "border-white/10 bg-[#15191E] text-slate-300 hover:bg-white/5 hover:text-white"
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
                      <span key={`dots-${idx}`} className="px-2 text-xs text-slate-600">
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
                        h-8 min-w-[2rem] rounded-xl text-xs font-bold transition-all
                        ${isActive
                          ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.06]"
                          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}
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
                className={`grid h-8 w-8 place-items-center rounded-xl border transition ${
                  safePage >= totalPages
                    ? "border-transparent text-slate-700 cursor-not-allowed"
                    : "border-white/10 bg-[#15191E] text-slate-300 hover:bg-white/5 hover:text-white"
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