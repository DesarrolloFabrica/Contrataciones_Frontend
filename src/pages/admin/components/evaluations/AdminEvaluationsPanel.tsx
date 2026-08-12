// src/pages/admin/components/evaluations/AdminEvaluationsPanel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  GraduationCap,
  Building2,
  CalendarDays,
  IdCard,
  Filter as FilterIcon,
  TrendingUp,
  Clock,
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../../types";
import type { AdminMetrics } from "../../adminTypes";
import type { SchoolOption } from "../../../../services/adminScopeService";
import { useTheme } from "../../../../context/ThemeContext";
import { filterEvaluations, getAiRecommendationStatus, aiRecommendationLabel, type AiRecommendationStatus } from "../../utils/adminSelectors";

type EvalStatus = AiRecommendationStatus;

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

function getDocNumber(ev: TeacherEvaluationSummary) {
  return (ev as any)?.candidate?.documentNumber ?? (ev as any)?.candidate?.document_number ?? "";
}

function getDateLabel(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" });
}

function getTimeLabel(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function getCoordinatorDecisionStatus(ev: TeacherEvaluationSummary): string | null {
  return (ev as any)?.coordinatorDecisionStatus ?? null;
}

function coordinatorDecisionLabel(status: string | null): string | null {
  if (!status) return null;
  const s = status.toUpperCase();
  if (s === "APPROVED") return "Aprobado";
  if (s === "REJECTED") return "Rechazado";
  return null;
}

type StatusFilter = "all" | "RECOMMENDED" | "RESERVED" | "NOT_RECOMMENDED" | "NO_ANALYSIS";
type ScoreRange = "all" | "high" | "medium" | "low";
type SortKey = "RECENT" | "SCORE_DESC" | "SCORE_ASC";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos los estados" },
  { value: "RECOMMENDED", label: "Recomendados" },
  { value: "RESERVED", label: "Con reservas" },
  { value: "NOT_RECOMMENDED", label: "No recomendados" },
  { value: "NO_ANALYSIS", label: "Pendientes" },
];

const scoreOptions: { value: ScoreRange; label: string }[] = [
  { value: "all", label: "Todos los scores" },
  { value: "high", label: "70 — 100" },
  { value: "medium", label: "50 — 69" },
  { value: "low", label: "0 — 49" },
];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "RECENT", label: "Más recientes" },
  { value: "SCORE_DESC", label: "Score (mayor a menor)" },
  { value: "SCORE_ASC", label: "Score (menor a mayor)" },
];

const statusConfig: Record<EvalStatus, {
  side: string;
  badge: string;
  text: string;
  bar: string;
  pill: string;
  dot: string;
  label: string;
  shortLabel: string;
}> = {
  RECOMMENDED: {
    side: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25",
    dot: "bg-emerald-500",
    label: "Recomendado",
    shortLabel: "Recomendado",
  },
  RESERVED: {
    side: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25",
    dot: "bg-amber-500",
    label: "Recomendado con reservas",
    shortLabel: "Con reservas",
  },
  NOT_RECOMMENDED: {
    side: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
    pill: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25",
    dot: "bg-rose-500",
    label: "No recomendado",
    shortLabel: "No recomendado",
  },
  NO_ANALYSIS: {
    side: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    text: "text-slate-500 dark:text-slate-400",
    bar: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    dot: "bg-slate-400",
    label: "Pendiente de decisión",
    shortLabel: "Pendiente",
  },
};

const PAGE_SIZE = 10;

// ── Derive unique values from evaluations ──────────────────────────────

function buildSchoolOptions(
  evaluations: TeacherEvaluationSummary[],
  schoolsFromApi: SchoolOption[] = []
) {
  const set = new Set<string>();

  for (const s of schoolsFromApi) {
    const n = String(s?.name ?? "").trim();
    if (n) set.add(n);
  }

  for (const ev of evaluations) {
    const n = getSchoolName(ev).trim();
    if (n) set.add(n);
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

function buildProgramOptions(
  evaluations: TeacherEvaluationSummary[],
  schoolFilter: string | null
) {
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
  schools?: SchoolOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  metrics: AdminMetrics;
}

export default function AdminEvaluationsPanel({
  evaluations,
  schools = [],
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
  const schoolOptions = useMemo(() => buildSchoolOptions(evaluations, schools), [evaluations, schools]);
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
      base = base.filter((ev) => getAiRecommendationStatus(ev) === statusFilter);
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

  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);

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
    activeChips.push({ key: "score", label: `Score ${lbl}`, onRemove: () => { setScoreRange("all"); setPage(1); } });
  }

  // ── Dropdown helpers ────────────────────────────────────────────────
  const [statusOpen, setStatusOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Close dropdowns on outside click
  const ddRootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ddRootRef.current) return;
      if (!ddRootRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
        setSchoolOpen(false);
        setProgramOpen(false);
        setScoreOpen(false);
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const ddCls = [
    "absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl border p-1.5 backdrop-blur-xl shadow-xl animate-in fade-in zoom-in-95 duration-150",
    isDark
      ? "border-[#579689]/20 bg-[#091d22]/95"
      : "border-slate-200 bg-white/95",
  ].join(" ");

  const ddItem = (active: boolean) =>
    [
      "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between gap-2",
      active
        ? isDark
          ? "bg-brand-500/15 text-brand-300"
          : "bg-brand-50 text-brand-700"
        : isDark
          ? "text-neutral-300 hover:bg-white/5"
          : "text-slate-700 hover:bg-slate-50",
    ].join(" ");

  const selectButtonCls = [
    "h-10 px-3.5 rounded-xl text-xs font-medium border outline-none flex items-center gap-2 transition w-full",
    isDark
      ? "bg-white/[0.03] border-white/10 text-neutral-200 hover:border-white/20"
      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300",
  ].join(" ");

  // ── KPI cards data ─────────────────────────────────────────────────
  const kpiCards = [
    {
      label: "Total",
      value: metrics.total,
      icon: Users,
      tone: isDark ? "text-brand-300 bg-brand-500/10 border-brand-500/20" : "text-brand-700 bg-brand-50 border-brand-100",
    },
    {
      label: "Promedio IA",
      value: metrics.avgScore.toFixed(1),
      icon: Gauge,
      tone: isDark ? "text-violet-300 bg-violet-500/10 border-violet-500/20" : "text-violet-700 bg-violet-50 border-violet-100",
    },
    {
      label: "Recomendados",
      value: metrics.recommended,
      icon: TrendingUp,
      tone: isDark ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" : "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Con reservas",
      value: metrics.caution,
      icon: AlertTriangle,
      tone: isDark ? "text-amber-300 bg-amber-500/10 border-amber-500/20" : "text-amber-700 bg-amber-50 border-amber-100",
    },
    {
      label: "No recomendados",
      value: metrics.notRecommended,
      icon: ShieldAlert,
      tone: isDark ? "text-rose-300 bg-rose-500/10 border-rose-500/20" : "text-rose-700 bg-rose-50 border-rose-100",
    },
    {
      label: "Pendientes",
      value: metrics.noAnalysis,
      icon: Clock,
      tone: isDark ? "text-slate-300 bg-slate-500/10 border-slate-500/20" : "text-slate-600 bg-slate-50 border-slate-200",
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ═══ SECTION 1: HEADER ═══ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Evaluaciones
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
            Explora y analiza candidatos evaluados
          </p>
        </div>
      </div>

      {/* ═══ SECTION 2: KPI GRID ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className={[
                "rounded-xl border p-3.5 flex items-center gap-3 transition-all duration-200",
                isDark
                  ? "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.14]"
                  : "bg-white border-slate-200 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.05)] hover:border-slate-300",
              ].join(" ")}
            >
              <div className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${k.tone}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
                    isDark ? "text-neutral-500" : "text-slate-500"
                  }`}
                >
                  {k.label}
                </p>
                <p
                  className={`text-lg font-black tracking-tight leading-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {k.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ SECTION 3: FILTERS ═══ */}
      <div
        className={[
          "overflow-hidden rounded-2xl border",
          isDark
            ? "border-white/[0.08] bg-[#0d252b]"
            : "border-slate-200/80 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.18)]",
        ].join(" ")}
      >
        <div
          className={`h-1 w-full ${
            isDark
              ? "bg-gradient-to-r from-emerald-500/70 via-teal-400/50 to-transparent"
              : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300"
          }`}
        />
        <div className="space-y-4 p-5 md:p-6">
        <div className="flex items-center gap-2">
          <FilterIcon className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Filtros
          </p>
        </div>

        <div ref={ddRootRef} className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative group w-full lg:basis-1/2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search
                className={`h-4 w-4 transition-colors ${
                  isDark
                    ? "text-white/30 group-focus-within:text-brand-400"
                    : "text-slate-400 group-focus-within:text-brand-500"
                }`}
              />
            </div>
            <input
              type="text"
              placeholder="Buscar candidato por nombre o documento..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={[
                "w-full h-10 rounded-xl pl-10 pr-10 text-sm outline-none transition-all",
                isDark
                  ? "bg-white/[0.03] border border-white/10 placeholder:text-white/25 text-white focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10"
                  : "bg-white border border-slate-200 placeholder:text-slate-400 text-slate-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-300/30",
              ].join(" ")}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition ${
                  isDark ? "hover:bg-white/10 text-neutral-400" : "hover:bg-slate-100 text-slate-400"
                }`}
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
                onClick={() => {
                  setStatusOpen((o) => !o);
                  setSchoolOpen(false);
                  setProgramOpen(false);
                  setScoreOpen(false);
                  setSortOpen(false);
                }}
                className={selectButtonCls}
              >
                <span className="truncate flex-1 text-left">
                  {statusOptions.find((o) => o.value === statusFilter)?.label ?? "Estado"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition shrink-0 ${
                    statusOpen ? "rotate-180" : ""
                  } ${isDark ? "text-neutral-500" : "text-slate-400"}`}
                />
              </button>
              {statusOpen && (
                <div className={ddCls}>
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setStatusOpen(false);
                        setPage(1);
                      }}
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
                onClick={() => {
                  setSchoolOpen((o) => !o);
                  setStatusOpen(false);
                  setProgramOpen(false);
                  setScoreOpen(false);
                  setSortOpen(false);
                }}
                className={selectButtonCls}
              >
                <span className="truncate flex-1 text-left">
                  {schoolFilter ?? "Escuela"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition shrink-0 ${
                    schoolOpen ? "rotate-180" : ""
                  } ${isDark ? "text-neutral-500" : "text-slate-400"}`}
                />
              </button>
              {schoolOpen && (
                <div className={ddCls}>
                  <button
                    type="button"
                    onClick={() => {
                      handleSchoolChange(null);
                      setSchoolOpen(false);
                    }}
                    className={ddItem(!schoolFilter)}
                  >
                    Todas las escuelas
                  </button>
                  {schoolOptions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        handleSchoolChange(name);
                        setSchoolOpen(false);
                      }}
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
                onClick={() => {
                  if (!schoolFilter) return;
                  setProgramOpen((o) => !o);
                  setStatusOpen(false);
                  setSchoolOpen(false);
                  setScoreOpen(false);
                  setSortOpen(false);
                }}
                className={[
                  selectButtonCls,
                  !schoolFilter
                    ? isDark
                      ? "bg-white/[0.01] border-white/5 text-neutral-600 cursor-not-allowed hover:border-white/5"
                      : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed hover:border-slate-200"
                    : "",
                ].join(" ")}
                title={!schoolFilter ? "Seleccione una escuela primero" : "Filtrar por programa"}
              >
                <span className="truncate flex-1 text-left">
                  {programFilter ?? "Programa"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition shrink-0 ${
                    programOpen ? "rotate-180" : ""
                  } ${isDark ? "text-neutral-500" : "text-slate-400"}`}
                />
              </button>
              {programOpen && schoolFilter && (
                <div className={ddCls}>
                  <button
                    type="button"
                    onClick={() => {
                      setProgramFilter(null);
                      setProgramOpen(false);
                      setPage(1);
                    }}
                    className={ddItem(!programFilter)}
                  >
                    Todos los programas
                  </button>
                  {programOptions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setProgramFilter(name);
                        setProgramOpen(false);
                        setPage(1);
                      }}
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
                onClick={() => {
                  setScoreOpen((o) => !o);
                  setStatusOpen(false);
                  setSchoolOpen(false);
                  setProgramOpen(false);
                  setSortOpen(false);
                }}
                className={selectButtonCls}
              >
                <span className="truncate flex-1 text-left">
                  {scoreOptions.find((o) => o.value === scoreRange)?.label ?? "Score"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition shrink-0 ${
                    scoreOpen ? "rotate-180" : ""
                  } ${isDark ? "text-neutral-500" : "text-slate-400"}`}
                />
              </button>
              {scoreOpen && (
                <div className={ddCls}>
                  {scoreOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setScoreRange(opt.value);
                        setScoreOpen(false);
                        setPage(1);
                      }}
                      className={ddItem(opt.value === scoreRange)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                isDark ? "text-neutral-500" : "text-slate-500"
              }`}
            >
              Activos:
            </span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className={[
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition",
                  isDark
                    ? "bg-brand-500/10 border-brand-500/25 text-brand-300"
                    : "bg-brand-50 border-brand-200 text-brand-700",
                ].join(" ")}
              >
                {chip.label}
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className={`rounded-full p-0.5 transition ${
                    isDark ? "hover:bg-white/10" : "hover:bg-white/60"
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
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
              className={`ml-auto text-[11px] font-semibold underline transition ${
                isDark
                  ? "text-neutral-500 hover:text-neutral-200"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Limpiar filtros
            </button>
          </div>
        )}
        </div>
      </div>

      {/* ═══ SECTION 4: TABLE ═══ */}
      <div
        className={[
          "overflow-hidden rounded-2xl border",
          isDark
            ? "border-white/[0.08] bg-[#0d252b]"
            : "border-slate-200/80 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.18)]",
        ].join(" ")}
      >
        <div
          className={`h-1 w-full ${
            isDark
              ? "bg-gradient-to-r from-emerald-500/70 via-teal-400/50 to-transparent"
              : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300"
          }`}
        />
        {/* Table toolbar */}
        <div
          className={[
            "flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5",
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-slate-100 bg-slate-50/80",
          ].join(" ")}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                isDark
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                  isDark ? "text-neutral-400" : "text-slate-500"
                }`}
              >
                Listado de evaluaciones
              </p>
              <p
                className={`text-xs font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {total === 0
                  ? "Sin resultados"
                  : total === 1
                    ? "1 candidato"
                    : `${total} candidatos`}
                {filtered.length !== evaluations.length && (
                  <span
                    className={`ml-1 font-normal ${
                      isDark ? "text-neutral-500" : "text-slate-400"
                    }`}
                  >
                    (de {evaluations.length})
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSortOpen((o) => !o);
                  setStatusOpen(false);
                  setSchoolOpen(false);
                  setProgramOpen(false);
                  setScoreOpen(false);
                }}
                className={[
                  "h-9 px-3 rounded-lg text-[11px] font-semibold border outline-none flex items-center gap-1.5 transition",
                  isDark
                    ? "bg-white/[0.03] border-white/10 text-neutral-300 hover:border-white/20"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                ].join(" ")}
              >
                <SlidersHorizontal className="w-3 h-3" />
                {sortOptions.find((o) => o.value === sort)?.label}
                <ChevronDown
                  className={`w-3 h-3 transition ${
                    sortOpen ? "rotate-180" : ""
                  } ${isDark ? "text-neutral-500" : "text-slate-400"}`}
                />
              </button>
              {sortOpen && (
                <div
                  className={[
                    "absolute right-0 top-full mt-1.5 z-30 w-56 rounded-xl border p-1.5 backdrop-blur-xl shadow-xl",
                    isDark
                      ? "border-[#579689]/20 bg-[#091d22]/95"
                      : "border-slate-200 bg-white/95",
                  ].join(" ")}
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSort(opt.value);
                        setSortOpen(false);
                      }}
                      className={ddItem(opt.value === sort)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table header (column titles) */}
        {pageItems.length > 0 && (
          <div
            className={[
              "hidden md:grid grid-cols-[minmax(0,1.7fr)_minmax(0,1.4fr)_140px_160px_120px_44px] gap-3 border-b px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
              isDark
                ? "border-white/10 bg-white/[0.03] text-slate-400"
                : "border-slate-100 bg-slate-50 text-slate-500",
            ].join(" ")}
          >
            <div>Candidato</div>
            <div>Programa · Escuela</div>
            <div className="text-center">Score IA</div>
            <div>Decisión IA</div>
            <div>Fecha</div>
            <div></div>
          </div>
        )}

        {/* Table rows */}
        {pageItems.length > 0 ? (
          <div className={isDark ? "divide-y divide-white/[0.06]" : "divide-y divide-slate-100"}>
            {pageItems.map((ev) => {
              const status = getAiRecommendationStatus(ev);
              const cfg = statusConfig[status];
              const score = getScore(ev);
              const isSelected = selectedId === ev.id;
              const coordStatus = getCoordinatorDecisionStatus(ev);
              const coordLabel = coordinatorDecisionLabel(coordStatus);
              const coordTone =
                coordStatus?.toUpperCase() === "APPROVED"
                  ? isDark
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : coordStatus?.toUpperCase() === "REJECTED"
                    ? isDark
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                    : "";

              return (
                <div
                  key={ev.id}
                  className={[
                    "group relative grid cursor-pointer grid-cols-1 items-center gap-3 px-5 py-3.5 transition md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.4fr)_140px_160px_120px_44px]",
                    isSelected
                      ? isDark
                        ? "bg-emerald-500/[0.08]"
                        : "bg-emerald-50/70"
                      : isDark
                        ? "hover:bg-emerald-500/[0.05]"
                        : "hover:bg-emerald-50/60",
                  ].join(" ")}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(ev.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(ev.id);
                    }
                  }}
                >
                  {/* Candidato */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-slate-400 group-hover:border-emerald-400/25 group-hover:text-emerald-300"
                          : "border-slate-200 bg-slate-50 text-slate-400 group-hover:border-emerald-200 group-hover:bg-white group-hover:text-emerald-700",
                      ].join(" ")}
                    >
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3
                          className={[
                            "truncate text-sm font-semibold tracking-tight transition",
                            isDark
                              ? "text-white group-hover:text-emerald-200"
                              : "text-slate-900 group-hover:text-emerald-800",
                          ].join(" ")}
                        >
                          {getCandidateName(ev)}
                        </h3>
                        {coordLabel && coordTone && (
                          <span
                            className={[
                              "hidden shrink-0 items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider lg:inline-flex",
                              coordTone,
                            ].join(" ")}
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {coordLabel}
                          </span>
                        )}
                      </div>
                      {getDocNumber(ev) && (
                        <div
                          className={[
                            "mt-0.5 flex items-center gap-1 font-mono text-[11px]",
                            isDark ? "text-slate-500" : "text-slate-400",
                          ].join(" ")}
                        >
                          <IdCard className="h-3 w-3 shrink-0" />
                          <span className="truncate">{getDocNumber(ev)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Programa · Escuela */}
                  <div className="hidden min-w-0 md:block">
                    {getProgramName(ev) && (
                      <div
                        className={[
                          "flex items-center gap-1.5 truncate text-xs font-medium",
                          isDark ? "text-slate-300" : "text-slate-600",
                        ].join(" ")}
                      >
                        <GraduationCap
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate">{getProgramName(ev)}</span>
                      </div>
                    )}
                    {getSchoolName(ev) && (
                      <div
                        className={[
                          "mt-0.5 flex items-center gap-1.5 truncate text-[11px]",
                          isDark ? "text-slate-500" : "text-slate-400",
                        ].join(" ")}
                      >
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{getSchoolName(ev)}</span>
                      </div>
                    )}
                  </div>

                  {/* Score IA */}
                  <div className="hidden flex-col items-center justify-center gap-1 md:flex">
                    <div className="flex items-baseline gap-0.5">
                      <span
                        className={[
                          "text-base font-bold leading-none tabular-nums",
                          cfg.text,
                        ].join(" ")}
                      >
                        {Math.round(score)}
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        /100
                      </span>
                    </div>
                    <div
                      className={[
                        "w-full max-w-[110px] h-1 rounded-full overflow-hidden",
                        isDark ? "bg-white/[0.08]" : "bg-slate-200",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "h-full rounded-full transition-all duration-700 ease-out",
                          cfg.bar,
                        ].join(" ")}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>
                  </div>

                  {/* Decisión IA pill */}
                  <div className="hidden justify-start md:flex">
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                        cfg.pill,
                      ].join(" ")}
                    >
                      {status === "RECOMMENDED" && <CheckCircle2 className="h-3 w-3" />}
                      {status === "RESERVED" && <AlertTriangle className="h-3 w-3" />}
                      {status === "NOT_RECOMMENDED" && <ShieldAlert className="h-3 w-3" />}
                      <span className="hidden xl:inline">{cfg.label}</span>
                      <span className="xl:hidden">{cfg.shortLabel}</span>
                    </span>
                  </div>

                  {/* Fecha */}
                  <div
                    className={[
                      "hidden items-center gap-1.5 text-[11px] font-medium tabular-nums md:flex",
                      isDark ? "text-slate-400" : "text-slate-500",
                    ].join(" ")}
                  >
                    <CalendarDays
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isDark ? "text-slate-600" : "text-slate-400"
                      }`}
                    />
                    <div className="flex flex-col leading-tight">
                      <span>{getDateLabel(ev.createdAt)}</span>
                      {getTimeLabel(ev.createdAt) && (
                        <span
                          className={`text-[10px] ${
                            isDark ? "text-slate-600" : "text-slate-400"
                          }`}
                        >
                          {getTimeLabel(ev.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acción */}
                  <div className="flex items-center justify-end">
                    <div
                      className={[
                        "rounded-lg p-2 transition",
                        isDark
                          ? "text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-300"
                          : "text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-700",
                      ].join(" ")}
                      title="Ver detalle"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={[
              "flex flex-col items-center justify-center gap-3 py-20",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            <div
              className={[
                "p-3 rounded-2xl border",
                isDark
                  ? "bg-white/[0.02] border-white/[0.08]"
                  : "bg-slate-50 border-slate-200",
              ].join(" ")}
            >
              <Search className="w-6 h-6 opacity-50" />
            </div>
            <div className="text-center">
              <p
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                No se encontraron evaluaciones
              </p>
              <p className="text-xs opacity-70 mt-0.5 max-w-sm">
                Ajusta los filtros o limpia la búsqueda para ver más resultados.
              </p>
            </div>
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
              className={[
                "mt-1 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold border transition",
                isDark
                  ? "border-brand-500/25 bg-brand-500/10 text-brand-300 hover:bg-brand-500/15"
                  : "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100",
              ].join(" ")}
            >
              <X className="w-3 h-3" />
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Pagination footer */}
        {pageItems.length > 0 && totalPages > 1 && (
          <div
            className={[
              "px-5 py-3 border-t flex flex-wrap items-center justify-between gap-3",
              isDark
                ? "border-white/[0.05] bg-white/[0.015]"
                : "border-slate-100 bg-slate-50/40",
            ].join(" ")}
          >
            <span
              className={`text-[11px] font-medium ${
                isDark ? "text-neutral-400" : "text-slate-500"
              }`}
            >
              Mostrando{" "}
              <span
                className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {startIdx + 1}
              </span>
              –
              <span
                className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {endIdx}
              </span>{" "}
              de{" "}
              <span
                className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {total}
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className={[
                  "h-8 px-2.5 rounded-lg border text-[11px] font-semibold transition flex items-center gap-1",
                  safePage <= 1
                    ? isDark
                      ? "border-white/5 text-neutral-600 cursor-not-allowed"
                      : "border-slate-200 text-slate-300 cursor-not-allowed"
                    : isDark
                      ? "border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:border-white/20"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300",
                ].join(" ")}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const isActive = p === safePage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={[
                        "h-8 min-w-[2rem] rounded-lg text-[11px] font-bold transition",
                        isActive
                          ? isDark
                            ? "bg-brand-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.30)]"
                            : "bg-brand-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.30)]"
                          : isDark
                            ? "border border-white/10 bg-transparent text-neutral-400 hover:bg-white/[0.04] hover:text-white"
                            : "border border-slate-200 bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                      ].join(" ")}
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
                className={[
                  "h-8 px-2.5 rounded-lg border text-[11px] font-semibold transition flex items-center gap-1",
                  safePage >= totalPages
                    ? isDark
                      ? "border-white/5 text-neutral-600 cursor-not-allowed"
                      : "border-slate-200 text-slate-300 cursor-not-allowed"
                    : isDark
                      ? "border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:border-white/20"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300",
                ].join(" ")}
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
