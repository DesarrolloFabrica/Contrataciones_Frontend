// src/pages/coordinator/components/EvaluationsListPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Lock,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { DecisionFilter, LocalDecision, CandidateGroup } from "../types";
import { useTheme } from "../../../context/ThemeContext";

type ProgramOption = { id: string; name: string };

const normalizeDecision = (value: unknown): LocalDecision => {
  const v = String(value ?? "").trim().toUpperCase();

  if (v === "PENDING") return "PENDIENTE";
  if (v === "APPROVED") return "APROBADO";
  if (v === "REJECTED") return "RECHAZADO";
  if (v === "PENDIENTE") return "PENDIENTE";
  if (v === "APROBADO") return "APROBADO";
  if (v === "RECHAZADO") return "RECHAZADO";
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

function buildPageItems(totalPages: number, current: number, maxNumbers = 5) {
  const clamp = (n: number) => Math.max(1, Math.min(totalPages, n));
  const cur = clamp(current);

  if (totalPages <= maxNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const centerCount = maxNumbers - 2;
  let start = cur - Math.floor(centerCount / 2);
  let end = cur + Math.ceil(centerCount / 2) - 1;

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

function getIaShort(verdict: string) {
  const v = (verdict ?? "").toLowerCase();
  if (
    v.includes("no recomend") ||
    v.includes("no se recomienda") ||
    v.includes("rechaz") ||
    v.includes("no apto") ||
    v.includes("no es apto")
  ) {
    return { short: "No recomendado", tone: "rose" as const };
  }
  if (
    v.includes("precauc") ||
    v.includes("condicion") ||
    v.includes("reserv") ||
    v.includes("duda") ||
    v.includes("riesgo medio")
  ) {
    return { short: "Con reservas", tone: "amber" as const };
  }
  if (v.includes("recomend") || v.includes("apto") || v.includes("idóneo")) {
    const strong =
      v.includes("fuerte") || v.includes("altamente") || v.includes("excepcional");
    return {
      short: strong ? "Fuerte" : "Recomendado",
      tone: "brand" as const,
    };
  }
  return { short: "Sin veredicto", tone: "slate" as const };
}

function pickScore(ev: any): number {
  const n =
    ev?.aiTeachingSuitabilityScore ??
    ev?.aiGlobalScore ??
    ev?.aiScore ??
    ev?.analysis?.globalScore ??
    ev?.score ??
    0;
  const num = Number(n);
  return Number.isFinite(num) ? Math.max(0, Math.min(100, Math.round(num))) : 0;
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

  const getCandidateDecision = (g: CandidateGroup): LocalDecision => {
    const interviews = Array.isArray(g.interviews) ? g.interviews : [];

    const localWithTime = interviews
      .map((ev: any) => ({
        id: ev?.id,
        t: Math.max(toTime(ev?.updatedAt), toTime(ev?.createdAt)),
        local: ev?.id ? localDecisions?.[ev.id] : undefined,
      }))
      .filter((x) => !!x.local)
      .sort((a, b) => b.t - a.t);

    if (localWithTime.length > 0) return localWithTime[0].local as LocalDecision;

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
      if (decisionFilter !== "ALL" && getCandidateDecision(g) !== decisionFilter) {
        return false;
      }

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

  const PAGE_SIZE = 8;
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

  const fieldClass = (disabled: boolean) =>
    [
      "w-full appearance-none rounded-xl border px-3.5 py-3 text-sm font-medium outline-none transition-all duration-200",
      disabled
        ? isDark
          ? "border-white/[0.05] bg-[#07171c] text-slate-600 cursor-not-allowed"
          : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
        : isDark
          ? "border-white/[0.1] bg-[#07171c] text-slate-200 hover:border-white/[0.16] focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/25"
          : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100/80 focus:border-emerald-400/50 focus:bg-white focus:ring-1 focus:ring-emerald-500/30",
    ].join(" ");

  const decisionBadge = (d: LocalDecision) => {
    if (d === "APROBADO") {
      return isDark
        ? "bg-emerald-500/15 text-emerald-300"
        : "bg-emerald-50 text-emerald-700";
    }
    if (d === "RECHAZADO") {
      return isDark ? "bg-rose-500/15 text-rose-300" : "bg-rose-50 text-rose-700";
    }
    return isDark ? "bg-amber-500/12 text-amber-300" : "bg-amber-50 text-amber-700";
  };

  const iaToneClass = (tone: "rose" | "amber" | "brand" | "slate") => {
    if (tone === "rose") {
      return isDark ? "text-rose-300" : "text-rose-600";
    }
    if (tone === "amber") {
      return isDark ? "text-amber-300" : "text-amber-700";
    }
    if (tone === "brand") {
      return isDark ? "text-emerald-300" : "text-emerald-700";
    }
    return isDark ? "text-slate-400" : "text-slate-500";
  };

  const content = (
    <div
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl ${
        isDark
          ? "border border-white/[0.08] bg-[#0d252b]"
          : "border border-slate-200/80 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.22)]"
      }`}
    >
      {isDark && (
        <div className="pointer-events-none absolute top-0 right-0 h-56 w-56 rounded-full bg-brand-500/5 blur-[90px]" />
      )}

      <div className="relative flex min-h-0 flex-1 flex-col p-5 md:p-6">
        {/* Header */}
        <div className="mb-5 flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                isDark
                  ? "bg-gradient-to-br from-emerald-400/18 via-teal-400/10 to-transparent text-emerald-300 shadow-[0_0_12px_-6px_rgba(52,211,153,0.35)] ring-1 ring-emerald-400/20"
                  : "bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 ring-1 ring-emerald-200/80"
              }`}
            >
              {isDark && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_25%,rgba(52,211,153,0.14),transparent_70%)]"
                />
              )}
              <FileText className="relative h-[18px] w-[18px]" strokeWidth={2} />
            </div>
            <div>
              <h3
                className={`text-lg font-bold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Bandeja de candidatos
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Gestión y consulta de evaluaciones docentes
                {!mustChooseScope && total > 0 ? ` · ${total} resultado${total === 1 ? "" : "s"}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
              isDark
                ? "border-white/[0.1] bg-white/[0.04] text-slate-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
                : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filtros avanzados</span>
          </button>
        </div>

        {/* Scope filters */}
        <div className="mb-4 grid shrink-0 grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
                isDark ? "text-slate-500" : "text-slate-500"
              }`}
            >
              Escuela / Coordinación
              {lockedSchool && <Lock className="h-3 w-3 text-emerald-500" />}
            </label>
            <div className="relative">
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                disabled={!!lockedSchool}
                className={fieldClass(!!lockedSchool)}
              >
                <option value="">Selecciona una escuela…</option>
                {schoolOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div
                className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 1L5 5L9 1" />
                </svg>
              </div>
            </div>
            {schoolHint && (
              <p className={`pl-0.5 text-[11px] ${isDark ? "text-emerald-400/80" : "text-emerald-700"}`}>
                {schoolHint}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              className={`text-[10px] font-bold uppercase tracking-widest ${
                isDark ? "text-slate-500" : "text-slate-500"
              }`}
            >
              Programa académico
            </label>
            <div className="relative">
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                disabled={!schoolFilter}
                className={fieldClass(!schoolFilter)}
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
                className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 1L5 5L9 1" />
                </svg>
              </div>
            </div>
          </div>

          {mustChooseScope && (
            <div
              className={`md:col-span-2 flex items-center gap-3 rounded-xl border px-4 py-3 ${
                isDark
                  ? "border-amber-400/20 bg-amber-500/[0.08]"
                  : "border-amber-200/80 bg-amber-50"
              }`}
            >
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <p className={`text-xs ${isDark ? "text-amber-200/80" : "text-amber-800/90"}`}>
                Para ver el historial, selecciona{" "}
                <span className={isDark ? "font-semibold text-amber-100" : "font-semibold text-amber-900"}>
                  Escuela
                </span>{" "}
                y{" "}
                <span className={isDark ? "font-semibold text-amber-100" : "font-semibold text-amber-900"}>
                  Programa
                </span>
                .
              </p>
            </div>
          )}
        </div>

        {/* Search + status */}
        <div className="mb-5 flex shrink-0 flex-col gap-3.5">
          <div className="relative">
            <Search
              className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, escuela o programa…"
              disabled={mustChooseScope}
              className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200 ${
                mustChooseScope
                  ? isDark
                    ? "cursor-not-allowed border-white/[0.05] bg-[#07171c] text-slate-600"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : isDark
                    ? "border-white/[0.1] bg-[#07171c] text-white placeholder-slate-500 hover:border-white/[0.16] focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/25"
                    : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 hover:bg-slate-100/80 focus:border-emerald-400/50 focus:bg-white focus:ring-1 focus:ring-emerald-500/30"
              }`}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            <span
              className={`shrink-0 text-[10px] font-bold uppercase tracking-widest ${
                isDark ? "text-slate-600" : "text-slate-400"
              }`}
            >
              Estado
            </span>
            {(["ALL", "PENDIENTE", "APROBADO", "RECHAZADO"] as DecisionFilter[]).map((opt) => {
              const active = decisionFilter === opt;
              const disabled = mustChooseScope;

              let activeCls = isDark
                ? "bg-white text-slate-900"
                : "bg-slate-900 text-white";
              if (opt === "PENDIENTE") {
                activeCls = isDark
                  ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30"
                  : "bg-amber-100 text-amber-800";
              } else if (opt === "APROBADO") {
                activeCls = isDark
                  ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30"
                  : "bg-emerald-100 text-emerald-800";
              } else if (opt === "RECHAZADO") {
                activeCls = isDark
                  ? "bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/30"
                  : "bg-rose-100 text-rose-800";
              }

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !disabled && setDecisionFilter(opt)}
                  disabled={disabled}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                    disabled
                      ? "cursor-not-allowed opacity-40 text-slate-500"
                      : active
                        ? activeCls
                        : isDark
                          ? "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {opt === "ALL" ? "Todos" : opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div
          className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border ${
            isDark
              ? "border-white/[0.07] bg-[#07171c]/70"
              : "border-slate-200/70 bg-slate-50/70"
          }`}
        >
          {mustChooseScope && (
            <div className="flex min-h-[11rem] flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
              <div
                className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                  isDark
                    ? "bg-emerald-400/[0.08] text-emerald-400/60 ring-1 ring-emerald-400/15"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Filter className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <p className={`text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                Configura los filtros arriba
              </p>
            </div>
          )}

          {!mustChooseScope && visibleGroups.length === 0 && (
            <div className="flex min-h-[11rem] flex-1 flex-col items-center justify-center px-4 text-center">
              <p className={`text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                No se encontraron resultados
              </p>
            </div>
          )}

          {!mustChooseScope && pageItems.length > 0 && (
            <div className="min-h-0 flex-1 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr
                    className={`border-b text-[10px] font-bold uppercase tracking-[0.12em] ${
                      isDark
                        ? "border-white/[0.06] text-slate-500"
                        : "border-slate-200/80 text-slate-400"
                    }`}
                  >
                    <th className="px-4 py-3 font-bold">Candidato</th>
                    <th className="px-4 py-3 font-bold">Programa</th>
                    <th className="px-4 py-3 font-bold">Score</th>
                    <th className="px-4 py-3 font-bold">IA</th>
                    <th className="px-4 py-3 font-bold">Estado</th>
                    <th className="px-4 py-3 font-bold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((g) => {
                    const ev = g.latest as any;
                    const decision = getCandidateDecision(g);
                    const score = pickScore(ev);
                    const ia = getIaShort(String(ev?.aiFinalRecommendation ?? ""));
                    const scoreColor =
                      score >= 70
                        ? isDark
                          ? "text-emerald-300"
                          : "text-emerald-600"
                        : score >= 50
                          ? isDark
                            ? "text-amber-300"
                            : "text-amber-600"
                          : isDark
                            ? "text-rose-300"
                            : "text-rose-600";
                    const barColor =
                      score >= 70
                        ? "bg-emerald-500"
                        : score >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500";

                    return (
                      <tr
                        key={g.key}
                        className={`group border-b transition-colors last:border-b-0 ${
                          isDark
                            ? "border-white/[0.04] hover:bg-white/[0.03]"
                            : "border-slate-200/60 hover:bg-white"
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="min-w-0">
                            <p
                              className={`truncate font-semibold tracking-tight ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {g.candidateName || "Sin nombre"}
                            </p>
                            <p className={`mt-0.5 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                              {g.documentNumber
                                ? `CC ${g.documentNumber}`
                                : `${g.interviews.length} entrevista${g.interviews.length === 1 ? "" : "s"}`}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className={`max-w-[200px] truncate text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {g.program || "—"}
                          </p>
                          <p className={`mt-0.5 max-w-[200px] truncate text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {g.school || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="w-[88px]">
                            <div className="mb-1 flex items-baseline gap-1">
                              <span className={`text-sm font-bold ${scoreColor}`}>{score}</span>
                              <span className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                                /100
                              </span>
                            </div>
                            <div
                              className={`h-1 overflow-hidden rounded-full ${
                                isDark ? "bg-white/10" : "bg-slate-200"
                              }`}
                            >
                              <div
                                className={`h-full rounded-full ${barColor}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-medium ${iaToneClass(ia.tone)}`}>
                            {ia.short}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${decisionBadge(decision)}`}
                          >
                            {decision}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/coordinator/evaluations/${encodeURIComponent(ev.id)}?tab=decision`
                              )
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                              isDark
                                ? "text-emerald-300 hover:bg-emerald-400/10"
                                : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            Ver detalle
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!mustChooseScope && total > 0 && (
          <div className="mt-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Mostrando{" "}
              <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {start + 1}–{end}
              </span>{" "}
              de{" "}
              <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {total}
              </span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"}> · {PAGE_SIZE} por página</span>
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  aria-label="Anterior"
                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                    safePage <= 1
                      ? isDark
                        ? "cursor-not-allowed text-slate-700"
                        : "cursor-not-allowed text-slate-300"
                      : isDark
                        ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {pagerItems.map((it, idx) => {
                  if (it === "…") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className={`px-1 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}
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
                      aria-current={isActive ? "page" : undefined}
                      className={`grid h-8 min-w-[2rem] place-items-center rounded-lg px-2 text-xs font-semibold transition-colors ${
                        isActive
                          ? isDark
                            ? "bg-emerald-500 text-black"
                            : "bg-emerald-600 text-white"
                          : isDark
                            ? "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  aria-label="Siguiente"
                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                    safePage >= totalPages
                      ? isDark
                        ? "cursor-not-allowed text-slate-700"
                        : "cursor-not-allowed text-slate-300"
                      : isDark
                        ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (variant === "embedded") return content;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${
        isDark
          ? "border border-white/[0.08] bg-[#0d252b]"
          : "border border-slate-200/80 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)]"
      }`}
    >
      {content}
    </div>
  );
};

export default EvaluationsListPanel;
