// src/pages/admin/components/evaluations/AdminEvaluationsPanel.tsx
import React, { useMemo, useState } from "react";
import {
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  ChevronDown,
  Users,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../../types";
import type { AdminMetrics } from "../../adminTypes";
import { useTheme } from "../../../../context/ThemeContext";
import { filterEvaluations } from "../../utils/adminSelectors";

type EvalStatus = "recommended" | "caution" | "not_recommended" | "pending";

function getEvalStatus(ev: TeacherEvaluationSummary): EvalStatus {
  const v = (ev.aiFinalRecommendation ?? "").toLowerCase();
  if (v.includes("no recomend") || v.includes("no se recomienda") || v.includes("rechaz") || v.includes("no apto") || v.includes("no es apto")) return "not_recommended";
  if (v.includes("precauc") || v.includes("condicion") || v.includes("reserv") || v.includes("duda") || v.includes("riesgo medio")) return "caution";
  if (v.includes("recomend") || v.includes("apto") || v.includes("idóneo")) return "recommended";
  return "pending";
}

function getScore(ev: TeacherEvaluationSummary) {
  const n = Number(ev.aiTeachingSuitabilityScore ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function getCandidateName(ev: TeacherEvaluationSummary) {
  return ev.candidate?.fullName ?? "Sin nombre";
}

function getSchoolName(ev: TeacherEvaluationSummary) {
  return (ev as any).candidate?.schoolNameSnapshot ?? (ev as any).candidate?.schoolName ?? (ev as any).schoolName ?? "";
}

function getProgramName(ev: TeacherEvaluationSummary) {
  return (ev as any).candidate?.programNameSnapshot ?? (ev as any).candidate?.programName ?? (ev as any).programName ?? "";
}

function getDateLabel(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" });
}

type StatusFilter = "all" | "recommended" | "caution" | "not_recommended" | "pending";
type ScoreRange = "all" | "high" | "medium" | "low";
type SortKey = "RECENT" | "SCORE_DESC" | "SCORE_ASC";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "recommended", label: "Recomendados" },
  { value: "caution", label: "En cautela" },
  { value: "not_recommended", label: "No recomendados" },
  { value: "pending", label: "Sin evaluar" },
];

const scoreOptions: { value: ScoreRange; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "high", label: "70+" },
  { value: "medium", label: "50-69" },
  { value: "low", label: "0-49" },
];

const statusConfig: Record<EvalStatus, { side: string; badge: string; text: string; bar: string; label: string }> = {
  recommended: {
    side: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    label: "Recomendado",
  },
  caution: {
    side: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    label: "En cautela",
  },
  not_recommended: {
    side: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
    text: "text-red-600 dark:text-red-400",
    bar: "bg-red-500",
    label: "No recomendado",
  },
  pending: {
    side: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    text: "text-slate-500 dark:text-slate-400",
    bar: "bg-slate-400",
    label: "Sin evaluar",
  },
};

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "RECENT", label: "Más recientes" },
  { value: "SCORE_DESC", label: "Score (mayor a menor)" },
  { value: "SCORE_ASC", label: "Score (menor a mayor)" },
];

const PAGE_SIZE = 10;

// ── Derive unique values from evaluations ──────────────────────────────

function buildSchoolOptions(evaluations: TeacherEvaluationSummary[]) {
  const set = new Set<string>();
  for (const ev of evaluations) {
    const n = getSchoolName(ev).trim();
    if (n) set.add(n);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

function buildProgramOptions(evaluations: TeacherEvaluationSummary[], schoolFilter: string | null) {
  if (!schoolFilter) return [];
  const set = new Set<string>();
  const target = schoolFilter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const ev of evaluations) {
    const s = getSchoolName(ev).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (s !== target) continue;
    const p = getProgramName(ev).trim();
    if (p) set.add(p);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

// ── Component ──────────────────────────────────────────────────────────

interface AdminEvaluationsPanelProps {
  evaluations: TeacherEvaluationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  metrics: AdminMetrics;
}

export default function AdminEvaluationsPanel({
  evaluations,
  selectedId,
  onSelect,
  metrics,
}: AdminEvaluationsPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ── Local filter state ─────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [programFilter, setProgramFilter] = useState<string | null>(null);
  const [scoreRange, setScoreRange] = useState<ScoreRange>("all");
  const [sort, setSort] = useState<SortKey>("RECENT");
  const [page, setPage] = useState(1);

  // ── Derived options ─────────────────────────────────────────────────
  const schoolOptions = useMemo(() => buildSchoolOptions(evaluations), [evaluations]);
  const programOptions = useMemo(() => buildProgramOptions(evaluations, schoolFilter), [evaluations, schoolFilter]);

  // Reset program when school changes
  const handleSchoolChange = (v: string | null) => {
    setSchoolFilter(v);
    setProgramFilter(null);
    setPage(1);
  };

  // ── Filtering ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let base = filterEvaluations(evaluations, search, schoolFilter, programFilter);

    if (statusFilter !== "all") {
      base = base.filter((ev) => getEvalStatus(ev) === statusFilter);
    }

    if (scoreRange !== "all") {
      base = base.filter((ev) => {
        const s = getScore(ev);
        if (scoreRange === "high") return s >= 70;
        if (scoreRange === "medium") return s >= 50 && s < 70;
        return s >= 0 && s < 50;
      });
    }

    if (sort === "SCORE_DESC") base.sort((a, b) => getScore(b) - getScore(a));
    else if (sort === "SCORE_ASC") base.sort((a, b) => getScore(a) - getScore(b));
    else base.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

    return base;
  }, [evaluations, search, schoolFilter, programFilter, statusFilter, scoreRange, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  // ── Active filter chips ─────────────────────────────────────────────
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];

  if (statusFilter !== "all") {
    const lbl = statusOptions.find((o) => o.value === statusFilter)?.label ?? "";
    activeChips.push({ key: "status", label: lbl, onRemove: () => { setStatusFilter("all"); setPage(1); } });
  }
  if (schoolFilter) {
    activeChips.push({ key: "school", label: schoolFilter, onRemove: () => handleSchoolChange(null) });
  }
  if (programFilter) {
    activeChips.push({ key: "program", label: programFilter, onRemove: () => { setProgramFilter(null); setPage(1); } });
  }
  if (scoreRange !== "all") {
    const lbl = scoreOptions.find((o) => o.value === scoreRange)?.label ?? "";
    activeChips.push({ key: "score", label: `Score: ${lbl}`, onRemove: () => { setScoreRange("all"); setPage(1); } });
  }

  // ── Dropdown helpers ────────────────────────────────────────────────
  const [statusOpen, setStatusOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const ddCls = (open: boolean) =>
    [
      "absolute left-0 top-full mt-1.5 z-30 w-56 rounded-xl border p-1.5 backdrop-blur-xl shadow-xl animate-in fade-in zoom-in-95 duration-150",
      isDark
        ? "border-white/10 bg-[#0a0c0b]/95"
        : "border-slate-200 bg-white/95",
    ].join(" ");

  const ddItem = (active: boolean) =>
    [
      "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between",
      active
        ? isDark
          ? "bg-cyan-500/10 text-cyan-300"
          : "bg-cyan-50 text-cyan-700"
        : isDark
          ? "text-neutral-300 hover:bg-white/5"
          : "text-slate-700 hover:bg-slate-50",
    ].join(" ");

  const selectButtonCls = [
    "h-11 px-3.5 rounded-xl text-xs font-medium border outline-none flex items-center gap-2 transition min-w-[120px]",
    isDark
      ? "bg-white/[0.03] border-white/10 text-neutral-200 hover:border-white/20"
      : "bg-white border-slate-300 text-slate-700 hover:border-slate-400",
  ].join(" ");

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ═══ SECTION 1: CONTEXT ═══ */}
      <div>
        <h1 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
          Evaluaciones
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
          Explora y analiza candidatos evaluados
        </p>
      </div>

      <div
        className={[
          "rounded-2xl border p-5 md:p-6 space-y-5",
          isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200",
        ].join(" ")}
      >
        {/* ═══ SECTION 2: COMPACT KPIs ═══ */}
        <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
          <span className="inline-flex items-center gap-1.5">
            <Users className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
            <span className={`${isDark ? "text-neutral-400" : "text-slate-500"}`}>
              <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{metrics.total}</span> evaluaciones
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gauge className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
            <span className={`${isDark ? "text-neutral-400" : "text-slate-500"}`}>
              <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{metrics.avgScore.toFixed(1)}</span> promedio
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span><span className="font-semibold">{metrics.recommended}</span> recomendados</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span><span className="font-semibold">{metrics.caution}</span> en cautela</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span><span className="font-semibold">{metrics.notRecommended}</span> riesgo alto</span>
          </span>
        </div>

        <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />

        {/* ═══ SECTION 3: FILTERS ═══ */}
        <div className="space-y-3">
          {/* Filter row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative group w-full lg:basis-1/2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 ${isDark ? "text-white/30" : "text-slate-400"}`} />
            </div>
            <input
              type="text"
              placeholder="Buscar candidato..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={[
                "w-full h-11 rounded-xl pl-10 pr-10 text-sm outline-none transition-all",
                isDark
                  ? "bg-white/[0.03] border border-white/10 placeholder:text-white/25 text-white focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10"
                  : "bg-white border border-slate-300 placeholder:text-slate-400 text-slate-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/40",
              ].join(" ")}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 text-neutral-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 w-full lg:basis-1/2 gap-3">
            {/* Status filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen((o) => !o)}
                className={`${selectButtonCls} w-full`}
              >
                <span className="truncate flex-1 text-left">{statusOptions.find((o) => o.value === statusFilter)?.label ?? "Estado"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition ${statusOpen ? "rotate-180" : ""} ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
              </button>
              {statusOpen && (
                <div className={ddCls(true)}>
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setStatusFilter(opt.value); setStatusOpen(false); setPage(1); }}
                      className={ddItem(opt.value === statusFilter)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* School filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSchoolOpen((o) => !o)}
                className={`${selectButtonCls} w-full`}
              >
                <span className="truncate flex-1 text-left">{schoolFilter ?? "Escuela"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition ${schoolOpen ? "rotate-180" : ""} ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
              </button>
              {schoolOpen && (
                <div className={ddCls(true)}>
                  <button
                    type="button"
                    onClick={() => { handleSchoolChange(null); setSchoolOpen(false); }}
                    className={ddItem(!schoolFilter)}
                  >
                    Todas las escuelas
                  </button>
                  {schoolOptions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => { handleSchoolChange(name); setSchoolOpen(false); }}
                      className={ddItem(schoolFilter === name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Program filter */}
            <div className="relative">
              <button
                type="button"
                disabled={!schoolFilter}
                onClick={() => schoolFilter && setProgramOpen((o) => !o)}
                className={[
                  `${selectButtonCls} w-full`,
                  !schoolFilter
                    ? isDark
                      ? "bg-white/[0.01] border-white/5 text-neutral-600 cursor-not-allowed hover:border-white/5"
                      : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed hover:border-slate-200"
                    : "",
                ].join(" ")}
                title={!schoolFilter ? "Seleccione una escuela primero" : "Filtrar por programa"}
              >
                <span className="truncate flex-1 text-left">{programFilter ?? "Programa"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition ${programOpen ? "rotate-180" : ""} ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
              </button>
              {programOpen && schoolFilter && (
                <div className={ddCls(true)}>
                  <button
                    type="button"
                    onClick={() => { setProgramFilter(null); setProgramOpen(false); setPage(1); }}
                    className={ddItem(!programFilter)}
                  >
                    Todos los programas
                  </button>
                  {programOptions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => { setProgramFilter(name); setProgramOpen(false); setPage(1); }}
                      className={ddItem(programFilter === name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Score range filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setScoreOpen((o) => !o)}
                className={`${selectButtonCls} w-full`}
              >
                <span className="truncate flex-1 text-left">{scoreOptions.find((o) => o.value === scoreRange)?.label ?? "Score"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition ${scoreOpen ? "rotate-180" : ""} ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
              </button>
              {scoreOpen && (
                <div className={ddCls(true)}>
                  {scoreOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setScoreRange(opt.value); setScoreOpen(false); setPage(1); }}
                      className={ddItem(opt.value === scoreRange)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className={[
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition",
                      isDark
                        ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300"
                        : "bg-cyan-50 border-cyan-200 text-cyan-700",
                    ].join(" ")}
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />

        {/* ═══ SECTION 4: EVALUATION LIST ═══ */}
        <div className="space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className={isDark ? "text-neutral-400" : "text-slate-500"}>
              {total} {total === 1 ? "resultado" : "resultados"}
            </span>
            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setSchoolFilter(null);
                  setProgramFilter(null);
                  setScoreRange("all");
                  setSort("RECENT");
                  setPage(1);
                }}
                className={`underline ${isDark ? "text-neutral-500 hover:text-neutral-300" : "text-slate-400 hover:text-slate-700"}`}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className={[
                  "h-8 px-3 rounded-lg text-[11px] font-medium border outline-none flex items-center gap-1.5 transition",
                  isDark
                    ? "bg-black/30 border-white/10 text-neutral-300 hover:border-white/20"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                ].join(" ")}
              >
                <SlidersHorizontal className="w-3 h-3" />
                {sortOptions.find((o) => o.value === sort)?.label}
              </button>
              {sortOpen && (
                <div className={["absolute right-0 top-full mt-1.5 z-30 w-52 rounded-xl border p-1.5 backdrop-blur-xl shadow-xl", isDark ? "border-white/10 bg-[#0a0c0b]/95" : "border-slate-200 bg-white/95"].join(" ")}>
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={ddItem(opt.value === sort)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className={[
                    "h-8 px-2.5 rounded-lg border text-[11px] font-medium transition flex items-center gap-1",
                    safePage <= 1
                      ? isDark
                        ? "border-white/5 text-neutral-600 cursor-not-allowed"
                        : "border-slate-200 text-slate-300 cursor-not-allowed"
                      : isDark
                        ? "border-white/10 text-neutral-300 hover:bg-white/5"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className={`text-[11px] min-w-[40px] text-center ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                  {safePage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className={[
                    "h-8 px-2.5 rounded-lg border text-[11px] font-medium transition flex items-center gap-1",
                    safePage >= totalPages
                      ? isDark
                        ? "border-white/5 text-neutral-600 cursor-not-allowed"
                        : "border-slate-200 text-slate-300 cursor-not-allowed"
                      : isDark
                        ? "border-white/10 text-neutral-300 hover:bg-white/5"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* List items */}
          {pageItems.length > 0 ? (
            <div className="space-y-4">
            {pageItems.map((ev) => {
              const status = getEvalStatus(ev);
              const cfg = statusConfig[status];
              const score = getScore(ev);
              const isSelected = selectedId === ev.id;

              return (
                <div
                  key={ev.id}
                  className={[
                    "group relative flex rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer",
                    isSelected
                      ? isDark
                        ? "border-cyan-400/50 bg-cyan-500/[0.07]"
                        : "border-cyan-400 bg-cyan-50"
                      : isDark
                        ? "border-white/10 bg-white/[0.04] hover:border-cyan-400/40 hover:bg-white/[0.07]"
                        : "border-slate-200 bg-white hover:border-cyan-300/70 hover:bg-slate-50",
                  ].join(" ")}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(ev.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(ev.id); }
                  }}
                >
                  {/* Left status bar */}
                  <div className={`w-2 shrink-0 self-stretch ${cfg.side}`} />

                  {/* Content */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 px-5 py-4 min-w-0">
                    {/* Left info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base md:text-lg font-semibold tracking-tight truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                          {getCandidateName(ev)}
                        </h3>
                        <span className={["inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge].join(" ")}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                        {getProgramName(ev) && <span>{getProgramName(ev)}</span>}
                        {getProgramName(ev) && getSchoolName(ev) && (
                          <span className={`w-1 h-1 rounded-full ${isDark ? "bg-neutral-600" : "bg-slate-300"}`} />
                        )}
                        {getSchoolName(ev) && <span>{getSchoolName(ev)}</span>}
                        {getSchoolName(ev) && getDateLabel(ev.createdAt) && (
                          <span className={`w-1 h-1 rounded-full ${isDark ? "bg-neutral-600" : "bg-slate-300"}`} />
                        )}
                        {getDateLabel(ev.createdAt) && <span>{getDateLabel(ev.createdAt)}</span>}
                      </div>
                    </div>

                    {/* Score + button */}
                    <div className="flex items-center justify-end gap-3 shrink-0 w-[220px]">
                      <div className="flex flex-col items-end gap-1 min-w-[120px]">
                        <span className={`text-lg font-bold leading-none ${cfg.text}`}>{score}</span>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                          <div className={`h-full rounded-full transition-all duration-500 ease-out ${cfg.bar}`} style={{ width: `${Math.min(100, score)}%` }} />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onSelect(ev.id); }}
                        className={[
                          "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all duration-200",
                          "opacity-0 group-hover:opacity-100",
                          isDark
                            ? "bg-cyan-500/15 border-cyan-400/25 text-cyan-300 hover:bg-cyan-500/25"
                            : "bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-500 shadow-sm",
                        ].join(" ")}
                      >
                        Ver detalle
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-16 ${isDark ? "border-white/10 bg-black/10 text-neutral-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
              <Search className="w-8 h-8 opacity-50" />
              <p className="text-sm font-medium">No se encontraron evaluaciones</p>
              <p className="text-xs opacity-60">Ajusta los filtros o limpia la búsqueda para ver más resultados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
