// src/pages/coordinator/CoordinatorConsole.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { actorFromUser } from "../../services/auditActor";
import { useCoordinatorEvaluations } from "./hooks/useCoordinatorEvaluations";

import EvaluationsListPanel from "./components/EvaluationsListPanel";
import CoordinatorUsersPanel from "./components/users/CoordinatorUsersPanel";
import { CoordinatorKpiStrip } from "./components/CoordinatorKpiStrip";
import AnimatedBackground from "../../components/AnimatedBackground";
import { CoordinatorModeHeader } from "../../features/coordinator/components/CoordinatorModeHeader";

import type { CandidateGroup } from "./types";
import { getCandidateKey } from "./utils/candidateKey";
import api from "../../services/apiClient";

// -------------------- API BASE --------------------
const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ??
  "";

const apiUrl = (path: string) => {
  if (!API_BASE) return path;
  const base = API_BASE.replace(/\/+$/, "");
  return `${base}${path}`;
};

// -------------------- helpers --------------------
function normalizeDoc(raw: any): string {
  const s = (raw ?? "").toString().trim();
  return s.replace(/\D/g, "");
}
function normalizeText(raw: any): string {
  return (raw ?? "").toString().trim();
}

function getCandidateProgram(ev: any): string {
  return (
    normalizeText(ev?.candidate?.programNameSnapshot) ||
    normalizeText(ev?.programNameSnapshot) ||
    normalizeText(ev?.candidate?.programName) ||
    normalizeText(ev?.program?.name) ||
    ""
  );
}
function getCandidateSchool(ev: any): string {
  return (
    normalizeText(ev?.candidate?.schoolNameSnapshot) ||
    normalizeText(ev?.schoolNameSnapshot) ||
    normalizeText(ev?.candidate?.schoolName) ||
    normalizeText(ev?.school?.name) ||
    ""
  );
}
function getCandidateDoc(candidate: unknown): string {
  const c = candidate as any;
  return (
    normalizeDoc(c?.documentNumber) || normalizeDoc(c?.document_number) || ""
  );
}
function getCandidateProgramId(ev: any): string {
  return String(
    ev?.candidate?.programId ??
      ev?.candidate?.program_id ??
      ev?.programId ??
      ev?.program_id ??
      "",
  ).trim();
}
function getCandidateSchoolId(ev: any): string {
  return String(
    ev?.candidate?.schoolId ??
      ev?.candidate?.school_id ??
      ev?.schoolId ??
      ev?.school_id ??
      "",
  ).trim();
}

function toNumberMaybe(v: any): number | null {
  if (v == null) return null;

  if (typeof v === "number") return Number.isFinite(v) ? v : null;

  if (typeof v === "string") {
    const m = v.match(/-?\d+(\.\d+)?/);
    if (!m) return null;
    const n = Number(m[0]);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

function tryParseJson(v: any): any | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s || (!s.startsWith("{") && !s.startsWith("["))) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function parseAiRawJson(raw: any): any | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function pickScore(ev: any): number {
  const aiRaw = parseAiRawJson(ev?.aiRawJson);

  const n =
    ev?.aiGlobalScore ??
    ev?.aiScore ??
    ev?.analysis?.globalScore ??
    ev?.analysis?.score ??
    ev?.score ??
    ev?.globalScore ??
    ev?.overallScore ??
    ev?.aiOverallScore ??
    ev?.aiTeachingSuitabilityScore ??
    aiRaw?.overallScore ??
    aiRaw?.aiTeachingSuitabilityScore ??
    aiRaw?.globalScore ??
    aiRaw?.score ??
    0;

  const num = Number(n);
  return Number.isFinite(num) ? num : 0;
}

function pickVerdict(ev: any): string {
  return (
    normalizeText(ev?.aiFinalRecommendation) ||
    normalizeText(ev?.aiVerdict) ||
    normalizeText(ev?.analysis?.verdict) ||
    normalizeText(ev?.analysis?.veredicto) ||
    normalizeText(ev?.verdict) ||
    "Sin veredicto"
  );
}
function getIaVerdictShort(verdict: string) {
  const full = (verdict ?? "").trim();
  const v = full.toLowerCase();

  const notRecommended =
    v.includes("no recomend") ||
    v.includes("no se recomienda") ||
    v.includes("rechaz") ||
    v.includes("no apto") ||
    v.includes("no es apto");

  if (notRecommended) {
    return {
      short: "No recomendado",
      cls: "border-rose-400/25 bg-rose-400/10 text-rose-100",
      full: full || "No recomendado",
    };
  }

  const caution =
    v.includes("precauc") ||
    v.includes("condicion") ||
    v.includes("reserv") ||
    v.includes("duda") ||
    v.includes("riesgo medio");

  if (caution) {
    return {
      short: "Con reservas",
      cls: "border-amber-400/25 bg-amber-400/10 text-amber-100",
      full: full || "Con reservas",
    };
  }

  const recommended =
    v.includes("recomend") || v.includes("apto") || v.includes("idóneo");
  if (recommended) {
    const strong =
      v.includes("fuerte") ||
      v.includes("altamente") ||
      v.includes("excepcional");
    return {
      short: strong ? "Recomendacion fuerte" : "Recomendado",
      cls: "border-brand-400/25 bg-brand-400/10 text-brand-100",
      full: full || "Recomendado",
    };
  }

  return {
    short: "Sin veredicto",
    cls: "border-white/10 bg-white/[0.04] text-white/70",
    full: full || "Sin veredicto",
  };
}

function verdictIsRecommended(v: string) {
  const s = (v || "").toLowerCase();
  return s.includes("recomend") || s.includes("contrat");
}

function groupByCandidate(
  evaluations: import("../../types").TeacherEvaluationSummary[],
): CandidateGroup[] {
  const map = new Map<
    string,
    import("../../types").TeacherEvaluationSummary[]
  >();

  for (const ev of evaluations) {
    const key = getCandidateKey(ev);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }

  const groups: CandidateGroup[] = [];

  for (const [key, interviews] of map.entries()) {
    const sorted = [...interviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const latest = sorted[0];

    groups.push({
      key,
      documentNumber: getCandidateDoc(latest.candidate),
      candidateName: latest.candidate?.fullName ?? "Sin nombre",
      school: getCandidateSchool(latest as any),
      program: getCandidateProgram(latest as any),
      interviews: sorted,
      latest,
    });
  }

  groups.sort(
    (a, b) =>
      new Date(b.latest.createdAt).getTime() -
      new Date(a.latest.createdAt).getTime(),
  );

  return groups;
}

// ---------- SCOPE TYPES ----------
type RemoteSchool = {
  id: string;
  name: string;
  programs?: Array<{ id: string; name: string }>;
};
type ScopedSchool = {
  id: string;
  name: string;
  programs: Array<{ id: string; name: string }>;
};
type ProgramOption = { id: string; name: string };

const CoordinatorConsole: React.FC = () => {
  const { user, logout } = useAuth();
  actorFromUser(user);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  // 1) Hook lista
  const evals = useCoordinatorEvaluations();

  // 2) Tabs principales
  const initialTab =
    (location.state as { tab?: "evaluations" | "users" } | null)?.tab === "users"
      ? "users"
      : "evaluations";
  const [mainTab, setMainTab] = useState<"evaluations" | "users">(initialTab);

  useEffect(() => {
    const tab = (location.state as { tab?: "evaluations" | "users" } | null)?.tab;
    if (tab === "evaluations" || tab === "users") {
      setMainTab(tab);
    }
  }, [location.state]);

  // Scope por schoolId del usuario
  const userSchoolId: string | null =
    (user as any)?.schoolId ?? (user as any)?.school_id ?? null;

  const [scopedSchool, setScopedSchool] = useState<ScopedSchool | null>(null);
  const [scopeLoading, setScopeLoading] = useState(false);

  // Filtros obligatorios (Escuela + Programa)
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");

  const mustChooseScope = !schoolFilter || !programFilter;

  // cargar escuela+programas por schoolId
  useEffect(() => {
    let alive = true;

    const loadScope = async () => {
      if (!userSchoolId) {
        if (!alive) return;
        setScopedSchool(null);
        return;
      }

      setScopeLoading(true);
      try {
        const res = await api.get<RemoteSchool[]>("/schools", {
          params: { includePrograms: true },
        });

        const data = res.data;
        const list = Array.isArray(data) ? data : [];
        const found = list.find((s) => String(s?.id) === String(userSchoolId));

        if (!found) {
          if (!alive) return;
          setScopedSchool(null);
          return;
        }

        const scope: ScopedSchool = {
          id: found.id,
          name: found.name,
          programs: (found.programs ?? []).filter(Boolean),
        };

        if (!alive) return;

        setScopedSchool(scope);
        setSchoolFilter(scope.name);

        setProgramFilter((prev) =>
          prev && scope.programs.some((p) => p.id === prev) ? prev : "",
        );
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setScopedSchool(null);
      } finally {
        if (!alive) return;
        setScopeLoading(false);
      }
    };

    loadScope();
    return () => {
      alive = false;
    };
  }, [user, userSchoolId]);

  // schoolOptions
  const schoolOptions = useMemo(() => {
    if (scopedSchool?.name) return [scopedSchool.name];

    const set = new Set<string>();
    for (const ev of evals.evaluations) {
      const s = getCandidateSchool(ev);
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [scopedSchool, evals.evaluations]);

  // programOptions
  const programOptions: ProgramOption[] = useMemo(() => {
    if (scopedSchool?.programs?.length) {
      return [...scopedSchool.programs].sort((a, b) =>
        a.name.localeCompare(b.name, "es"),
      );
    }

    const set = new Set<string>();
    for (const ev of evals.evaluations) {
      const s = getCandidateSchool(ev);
      const pName = getCandidateProgram(ev);
      if (!pName) continue;
      if (schoolFilter && s !== schoolFilter) continue;
      set.add(pName);
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((name) => ({ id: name, name }));
  }, [scopedSchool, evals.evaluations, schoolFilter]);

  // Auto-pick programa
  const programAutoPickedRef = useRef(false);
  const programStorageKey = (schoolName: string) =>
    `coord:lastProgram:${schoolName}`;

  useEffect(() => {
    if (!schoolFilter) return;
    if (programFilter) return;
    if (!programOptions || programOptions.length === 0) return;

    const saved = localStorage.getItem(programStorageKey(schoolFilter));
    if (saved && programOptions.some((p) => p.id === saved)) {
      programAutoPickedRef.current = true;
      setProgramFilter(saved);
      return;
    }

    if (programOptions.length === 1) {
      programAutoPickedRef.current = true;
      setProgramFilter(programOptions[0].id);
      return;
    }
  }, [schoolFilter, programFilter, programOptions]);

  useEffect(() => {
    if (!schoolFilter || !programFilter) return;
    localStorage.setItem(programStorageKey(schoolFilter), programFilter);
  }, [schoolFilter, programFilter]);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Filtrado final (schoolId + programId)
  const filteredEvaluations = useMemo(() => {
    if (!schoolFilter || !programFilter) return [];

    let base = evals.evaluations;

    if (userSchoolId) {
      base = base.filter((ev: any) => {
        const sid = getCandidateSchoolId(ev);
        if (sid) return sid === String(userSchoolId);
        return getCandidateSchool(ev) === schoolFilter;
      });
    } else {
      base = base.filter((ev) => getCandidateSchool(ev) === schoolFilter);
    }

    if (scopedSchool) {
      base = base.filter(
        (ev: any) => getCandidateProgramId(ev) === String(programFilter),
      );
    } else {
      base = base.filter(
        (ev) => getCandidateProgram(ev) === String(programFilter),
      );
    }

    const q = evals.search.trim().toLowerCase();
    if (q) {
      const programNameById = new Map(
        (scopedSchool?.programs ?? []).map((p) => [
          String(p.id),
          String(p.name),
        ]),
      );

      base = base.filter((ev: any) => {
        const name = String(ev.candidate?.fullName ?? "").toLowerCase();
        const school = String(getCandidateSchool(ev) ?? "").toLowerCase();

        const pid = getCandidateProgramId(ev);
        const programName =
          pid && programNameById.get(String(pid))
            ? programNameById.get(String(pid))
            : getCandidateProgram(ev);

        const program = String(programName ?? "").toLowerCase();

        const doc =
          normalizeDoc(ev.candidate?.documentNumber) ||
          normalizeDoc((ev.candidate as any)?.document_number) ||
          "";

        return (
          name.includes(q) ||
          school.includes(q) ||
          program.includes(q) ||
          (doc && doc.includes(normalizeDoc(q)))
        );
      });
    }

    return base;
  }, [
    evals.evaluations,
    evals.search,
    schoolFilter,
    programFilter,
    userSchoolId,
    scopedSchool,
  ]);

  const groupedCandidates = useMemo(
    () => groupByCandidate(filteredEvaluations),
    [filteredEvaluations],
  );

  // TOP RECOMENDADOS (sin filtros)
  const topRecommended = useMemo(() => {
    let base = evals.evaluations ?? [];

    if (userSchoolId) {
      base = base.filter((ev: any) => {
        const sid = getCandidateSchoolId(ev);
        if (sid) return sid === String(userSchoolId);
        return true;
      });
    }

    const ranked = [...base]
      .map((ev: any) => {
        const verdictFull = pickVerdict(ev);
        const badge = getIaVerdictShort(verdictFull);

        return {
          id: String(ev?.id ?? ""),
          name: String(ev?.candidate?.fullName ?? "Candidato"),
          school: getCandidateSchool(ev),
          program: getCandidateProgram(ev),
          score: pickScore(ev),

          verdictFull,
          verdictShort: badge.short,
          verdictCls: badge.cls,

          createdAt: String(ev?.createdAt ?? ""),
          isRecommended: verdictIsRecommended(verdictFull),
        };
      })
      .filter((x) => !!x.id)
      .sort((a, b) => {
        if (a.isRecommended !== b.isRecommended)
          return a.isRecommended ? -1 : 1;
        if ((b.score ?? -1) !== (a.score ?? -1))
          return (b.score ?? -1) - (a.score ?? -1);
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

    const seen = new Set<string>();
    const unique: typeof ranked = [];
    for (const r of ranked) {
      const k = `${r.name}__${r.program}`.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      unique.push(r);
    }

    return unique;
  }, [evals.evaluations, userSchoolId]);

  // Prioridad - pagination
  const TOP_PAGE_SIZE = 6;
  const [topPage, setTopPage] = useState(1);
  const topTotal = topRecommended.length;
  const topTotalPages = Math.max(1, Math.ceil(topTotal / TOP_PAGE_SIZE));
  const safeTopPage = Math.min(topPage, topTotalPages);
  const topStart = (safeTopPage - 1) * TOP_PAGE_SIZE;
  const topEnd = Math.min(topStart + TOP_PAGE_SIZE, topTotal);
  const topPageItems = useMemo(
    () => topRecommended.slice(topStart, topEnd),
    [topRecommended, topStart, topEnd],
  );

  useEffect(() => {
    setTopPage(1);
  }, [topRecommended.length]);


  // UI states
  const showLoading = evals.loading;
  const showError = !evals.loading && !!evals.error;
  const metrics = evals.metrics;

  const statusLabel = useMemo(() => {
    if (evals.loading) return "Cargando...";
    if (evals.error) return "Error";
    return "Listo";
  }, [evals.loading, evals.error]);

  return (
    <div
      className={[
        "min-h-screen w-full font-sans overflow-x-hidden flex flex-col",
        isDark ? "bg-[#061419] text-slate-100" : "bg-[#F4F7FB] text-slate-900",
      ].join(" ")}
    >
      <CoordinatorModeHeader
        mode={mainTab}
        onChangeMode={setMainTab}
        onLogout={handleLogout}
        statusLabel={statusLabel}
      />

      <main className="flex-1 relative z-10 w-full">
        <AnimatedBackground />

        <div className="relative z-10 mx-auto max-w-[1560px] space-y-5 px-4 py-5 md:px-7 md:py-6">
          {mainTab === "users" && (
            <div className="animate-[fadeInUp_400ms_ease-out]">
              <CoordinatorUsersPanel />
            </div>
          )}

          {/* HERO (solo pestaña Evaluaciones) */}
          {mainTab === "evaluations" && (
          <section
            className={`relative overflow-hidden rounded-2xl ${
              isDark
                ? "border border-white/[0.08] bg-gradient-to-br from-[#0d252b] via-[#0a1f24] to-[#08191e]"
                : "border border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/40 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.2)]"
            }`}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 right-0 w-[46%] ${
                isDark
                  ? "bg-[radial-gradient(ellipse_at_right,rgba(16,185,129,0.09),transparent_68%)]"
                  : "bg-[radial-gradient(ellipse_at_right,rgba(16,185,129,0.1),transparent_70%)]"
              }`}
            />

            <div className="relative grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)] lg:items-center lg:px-8">
              <div className="flex min-w-0 items-center gap-5 md:gap-7">
                <div
                  className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                    isDark
                      ? "bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent text-emerald-300 shadow-[0_0_20px_-8px_rgba(52,211,153,0.4)] ring-1 ring-emerald-400/25"
                      : "bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 ring-1 ring-emerald-200"
                  }`}
                  aria-hidden="true"
                >
                  {isDark && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_25%,rgba(52,211,153,0.18),transparent_70%)]"
                    />
                  )}
                  <ShieldCheck
                    className={`relative h-8 w-8 ${isDark ? "drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" : ""}`}
                    strokeWidth={1.9}
                  />
                </div>

                <div className="min-w-0">
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Bienvenido, coordinador
                  </p>
                  <h1
                    className={`mt-1 text-2xl font-bold tracking-[-0.025em] md:text-[30px] ${
                      isDark ? "text-white" : "text-slate-950"
                    }`}
                  >
                    Panel de{" "}
                    <span className={isDark ? "text-emerald-400" : "text-emerald-500"}>
                      evaluaciones
                    </span>
                  </h1>
                  <p className={`mt-1.5 max-w-2xl text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Gestiona y da seguimiento a las evaluaciones docentes con trazabilidad y eficiencia.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${
                        isDark
                          ? "bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/20"
                          : "bg-emerald-100/80 text-emerald-800"
                      }`}
                    >
                      <Activity className="h-3.5 w-3.5" strokeWidth={2} />
                      Coordinación activa
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                        isDark
                          ? "bg-white/[0.04] text-slate-300"
                          : "bg-slate-100/80 text-slate-600"
                      }`}
                    >
                      Trazabilidad total
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`relative isolate overflow-hidden rounded-2xl border px-5 py-5 pr-32 sm:pr-40 ${
                  isDark
                    ? "border-white/[0.07] bg-black/20"
                    : "border-emerald-100/80 bg-emerald-50/50"
                }`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isDark ? "text-emerald-300/90" : "text-emerald-700"}`}>
                  Recomendado para iniciar
                </p>
                <div className="mt-3 space-y-2.5">
                  {[
                    "Selecciona escuela y programa para acotar la bandeja.",
                    "Abre el detalle de cada candidato para validar el análisis.",
                    "Aprueba o rechaza con un comentario trazable.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isDark ? "text-emerald-400" : "text-emerald-600"
                        }`}
                        strokeWidth={2}
                      />
                      <p className={`text-[11px] leading-5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
                <img
                  aria-hidden="true"
                  alt=""
                  src="/coordinator-recommendation-clipboard.png"
                  className={`pointer-events-none absolute -bottom-[30%] -right-2 -z-10 h-[165%] w-auto max-w-none select-none object-contain object-right ${
                    isDark ? "opacity-90" : "opacity-70"
                  }`}
                />
              </div>
            </div>
          </section>
          )}

          {/* ESTADO CARGA / ERROR (solo Evaluaciones) */}
          {mainTab === "evaluations" && showLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-brand-400" : "text-brand-500"}`} />
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cargando historial...</p>
            </div>
          )}

          {mainTab === "evaluations" && showError && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className={`p-3 rounded-xl ${isDark ? "bg-rose-500/10" : "bg-rose-50"}`}>
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <p className={`text-sm text-center max-w-md ${isDark ? "text-slate-400" : "text-slate-600"}`}>{evals.error}</p>
            </div>
          )}

          {mainTab === "evaluations" && !showLoading && !showError && (
                <section className="space-y-6 animate-[fadeInUp_400ms_ease-out]">
                    {/* KPI Strip - Full Width */}
                    <CoordinatorKpiStrip
                      total={metrics.total}
                      avgScore={metrics.avgScore}
                      isScoped={!!userSchoolId}
                    />

                    {/* Bandeja principal + columna de apoyo */}
                    <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,2.25fr)_minmax(300px,1fr)]">
                      {/* PANEL 1: Bandeja de candidatos */}
                      <div id="evaluaciones-registradas" className="flex min-h-0 min-w-0 scroll-mt-28 flex-col xl:h-full [&_>_*]:h-full [&_>_*]:min-h-0">
                        <EvaluationsListPanel
                          variant="embedded"
                          schoolFilter={schoolFilter}
                          setSchoolFilter={setSchoolFilter}
                          programFilter={programFilter}
                          setProgramFilter={setProgramFilter}
                          schoolOptions={schoolOptions}
                          programOptions={programOptions}
                          mustChooseScope={mustChooseScope}
                          groupedCandidates={groupedCandidates}
                          selectedId={null}
                          search={String(evals.search ?? "")}
                          setSearch={(v) => evals.setSearch(String(v ?? ""))}
                          decisionFilter={evals.decisionFilter}
                          setDecisionFilter={evals.setDecisionFilter}
                          localDecisions={evals.localDecisions}
                          lockedSchool={!!userSchoolId}
                          schoolHint={
                            scopeLoading
                              ? "Cargando programas de tu escuela…"
                              : userSchoolId
                                ? "Escuela asignada por tu usuario."
                                : undefined
                          }
                        />
                      </div>

                      {/* PANEL 2: Contexto de apoyo */}
                      <aside className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
                        {/* Prioridad de revisión */}
                        <div
                          className={[
                            "relative flex flex-col overflow-hidden rounded-2xl",
                            isDark
                              ? "border border-white/[0.08] bg-[#0d252b]"
                              : "border border-slate-200/80 bg-white shadow-[0_14px_36px_-28px_rgba(15,23,42,0.25)]",
                          ].join(" ")}
                        >
                          <div className="relative flex flex-col p-5">
                            <div className="mb-4 flex items-center gap-3">
                              <div
                                className={[
                                  "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                  isDark
                                    ? "bg-gradient-to-br from-emerald-400/18 to-transparent text-emerald-300 shadow-[0_0_12px_-6px_rgba(52,211,153,0.35)] ring-1 ring-emerald-400/20"
                                    : "bg-emerald-50 text-emerald-600",
                                ].join(" ")}
                              >
                                <TrendingUp className="h-4 w-4" strokeWidth={2} />
                              </div>
                              <div className="min-w-0">
                                <h3 className={`truncate text-xs font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                  Prioridad
                                </h3>
                                <p className={`truncate text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                  Ranking por score
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {topPageItems.length === 0 ? (
                                <div
                                  className={`flex min-h-[108px] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center ${
                                    isDark
                                      ? "border-white/[0.1] bg-[#07171c]/60"
                                      : "border-slate-200 bg-slate-50"
                                  }`}
                                >
                                  <div
                                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                                      isDark
                                        ? "bg-emerald-400/[0.08] text-emerald-400/55 ring-1 ring-emerald-400/15"
                                        : "bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    <TrendingUp className="h-6 w-6" strokeWidth={1.8} />
                                  </div>
                                  <p className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                                    Sin datos suficientes
                                  </p>
                                </div>
                              ) : (
                                topPageItems.map((c, idx) => {
                                  const rank = topStart + idx + 1;
                                  const score = Number.isFinite(Number(c.score))
                                    ? Math.max(0, Math.min(100, Number(c.score)))
                                    : 0;

                                  const isHigh = score >= 85;
                                  const isMed = score >= 70 && score < 85;

                                  let toneColor = isDark ? "text-slate-400" : "text-slate-500";
                                  let toneBg = "bg-slate-500";

                                  if (isHigh || isMed) {
                                    toneColor = isDark ? "text-emerald-300" : "text-emerald-600";
                                    toneBg = "bg-emerald-500";
                                  }

                                  return (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() =>
                                        navigate(
                                          `/coordinator/evaluations/${encodeURIComponent(c.id)}/report`,
                                        )
                                      }
                                      className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                                        isDark
                                          ? "border-white/[0.06] bg-[#07171c]/55 hover:border-white/[0.12] hover:bg-[#0a1f24]"
                                          : "border-slate-200/70 bg-slate-50 hover:bg-slate-100/80"
                                      }`}
                                    >
                                      <span
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-bold ${toneColor} ${
                                          isDark ? "bg-white/[0.05]" : "bg-white"
                                        }`}
                                      >
                                        #{rank}
                                      </span>

                                      <div className="min-w-0 flex-1">
                                        <p className={`truncate text-xs font-bold group-hover:text-emerald-400 ${isDark ? "text-white" : "text-slate-900"}`}>
                                          {c.name}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                          <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                                            <div
                                              className={`h-full rounded-full ${toneBg}`}
                                              style={{ width: `${score}%` }}
                                            />
                                          </div>
                                          <span className={`shrink-0 text-[10px] font-bold ${toneColor}`}>
                                            {Math.round(score)}
                                          </span>
                                        </div>
                                      </div>

                                      <span
                                        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                          isHigh || isMed
                                            ? isDark
                                              ? "bg-emerald-500/10 text-emerald-300"
                                              : "bg-emerald-50 text-emerald-700"
                                            : isDark
                                              ? "bg-white/5 text-slate-400"
                                              : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        {c.verdictShort === "Sin veredicto" ? "Pend." : c.verdictShort?.slice(0, 8)}
                                      </span>
                                    </button>
                                  );
                                })
                              )}
                            </div>

                            {topTotal > TOP_PAGE_SIZE && (
                              <div className="mt-4 flex items-center justify-between pt-1">
                                <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                  {topStart + 1}–{topEnd} de {topTotal}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setTopPage((p) => Math.max(1, p - 1))}
                                    disabled={safeTopPage <= 1}
                                    className={`grid h-7 w-7 place-items-center rounded-md text-[11px] transition ${
                                      safeTopPage <= 1
                                        ? isDark
                                          ? "cursor-not-allowed text-slate-700"
                                          : "cursor-not-allowed text-slate-300"
                                        : isDark
                                          ? "text-slate-300 hover:bg-white/[0.06]"
                                          : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                  >
                                    ‹
                                  </button>
                                  <span className={`min-w-[2rem] text-center text-[10px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {safeTopPage}/{topTotalPages}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setTopPage((p) => Math.min(topTotalPages, p + 1))}
                                    disabled={safeTopPage >= topTotalPages}
                                    className={`grid h-7 w-7 place-items-center rounded-md text-[11px] transition ${
                                      safeTopPage >= topTotalPages
                                        ? isDark
                                          ? "cursor-not-allowed text-slate-700"
                                          : "cursor-not-allowed text-slate-300"
                                        : isDark
                                          ? "text-slate-300 hover:bg-white/[0.06]"
                                          : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                  >
                                    ›
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Guía rápida */}
                        <div
                          className={`relative overflow-hidden rounded-2xl p-5 ${
                            isDark
                              ? "border border-white/[0.08] bg-[#0d252b]"
                              : "border border-slate-200/80 bg-white shadow-[0_14px_36px_-28px_rgba(15,23,42,0.25)]"
                          }`}
                        >
                          <div className="relative">
                            <div className="flex items-center gap-3">
                              <span
                                className={`relative flex h-8 w-8 items-center justify-center rounded-lg ${
                                  isDark
                                    ? "bg-gradient-to-br from-emerald-400/18 to-transparent text-emerald-300 shadow-[0_0_12px_-6px_rgba(52,211,153,0.35)] ring-1 ring-emerald-400/20"
                                    : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                <Sparkles className="h-4 w-4" strokeWidth={2} />
                              </span>
                              <div>
                                <div className={`text-xs font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                  Guía rápida
                                </div>
                                <p className={`mt-0.5 text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                  Flujo recomendado
                                </p>
                              </div>
                            </div>

                            <ul className={`mt-4 space-y-3 text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              <li className="flex gap-2.5">
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${isDark ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>1</span>
                                <span>Revisa <b className={isDark ? "text-white" : "text-slate-800"}>Prioridad</b> para decisiones rápidas.</span>
                              </li>
                              <li className="flex gap-2.5">
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${isDark ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>2</span>
                                <span>En <b className={isDark ? "text-white" : "text-slate-800"}>Bandeja</b>, filtra por programa.</span>
                              </li>
                              <li className="flex gap-2.5">
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${isDark ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>3</span>
                                <span>Abre detalle: apruebas/rechazas y exportas PDF.</span>
                              </li>
                            </ul>

                            <div
                              className={`mt-4 rounded-xl border p-3 text-[10px] leading-relaxed ${
                                isDark
                                  ? "border-white/[0.07] bg-[#07171c]/50 text-slate-500"
                                  : "border-slate-200 bg-slate-50 text-slate-500"
                              }`}
                            >
                              Tip: usa <b className={isDark ? "text-slate-300" : "text-slate-700"}>Comparativa</b> solo cuando haya 2+ entrevistas.
                            </div>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </section>
          )}
        </div>
      </main>

      <footer className="py-6 text-center border-t border-white/5 mt-auto">
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          Sistema de Evaluación Docente · CUN © {new Date().getFullYear()}
        </p>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CoordinatorConsole;
