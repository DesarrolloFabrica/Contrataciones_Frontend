// src/pages/coordinator/CoordinatorConsole.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  FileText,
  Loader2,
  ShieldAlert,
  UserCheck,
  LogOut,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { actorFromUser } from "../../services/auditActor";
import { AUTH_STORAGE_KEY } from "../../services/apiClient";

import { useCoordinatorEvaluations } from "./hooks/useCoordinatorEvaluations";

import EvaluationsListPanel from "./components/EvaluationsListPanel";
import CoordinatorUsersPanel from "./components/users/CoordinatorUsersPanel";
import { CoordinatorKpiStrip } from "./components/CoordinatorKpiStrip";
import AnimatedBackground from "../../components/AnimatedBackground";

import type { CandidateGroup } from "./types";
import { getCandidateKey } from "./utils/candidateKey";
import api from "../../services/apiClient";
import ThemeToggle from "../../components/ThemeToggle";

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
      cls: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100",
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
  const { user } = useAuth();
  actorFromUser(user);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  // 1) Hook lista
  const evals = useCoordinatorEvaluations();

  // 2) Tabs principales
  const [mainTab, setMainTab] = useState<"evaluations" | "users">(
    "evaluations",
  );

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
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

  return (
    <div
      className={[
        "min-h-screen w-full font-sans relative overflow-x-hidden",
        isDark ? "bg-[#060A12] text-slate-200" : "bg-[#F4F7FC] text-slate-900",
      ].join(" ")}
    >
      <AnimatedBackground />

      <div className="relative z-10 max-w-[1380px] mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* HEADER */}
        <header className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div
              className={[
                "inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md",
                isDark
                  ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
                  : "border-cyan-200 bg-cyan-50 text-cyan-700",
              ].join(" ")}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Consola de Coordinacion</span>
            </div>

            {/* Tabs principales */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMainTab("evaluations")}
                className={[
                  "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.16em] border transition-all duration-200 inline-flex items-center gap-2",
                  mainTab === "evaluations"
                    ? isDark
                      ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/10 shadow-[0_0_16px_-4px_rgba(6,182,212,0.2)]"
                      : "border-cyan-400/40 bg-cyan-500 text-white shadow-[0_8px_22px_rgba(6,182,212,0.3)]"
                    : isDark
                      ? "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
                title="Ver evaluaciones"
              >
                <FileText className="w-4 h-4" />
                Evaluaciones
              </button>

              <button
                type="button"
                onClick={() => setMainTab("users")}
                className={[
                  "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.16em] border transition-all duration-200 inline-flex items-center gap-2",
                  mainTab === "users"
                    ? isDark
                      ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/10 shadow-[0_0_16px_-4px_rgba(6,182,212,0.2)]"
                      : "border-cyan-400/40 bg-cyan-500 text-white shadow-[0_8px_22px_rgba(6,182,212,0.3)]"
                    : isDark
                      ? "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
                title="Gestionar lideres de mi escuela"
              >
                <UserCheck className="w-4 h-4" />
                Usuarios
              </button>

              <ThemeToggle />

              <button
                type="button"
                onClick={handleLogout}
                className={[
                  "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.16em] border transition-all duration-200 inline-flex items-center gap-2",
                  isDark
                    ? "border-white/[0.08] text-slate-400 hover:border-rose-500/30 hover:text-rose-400 hover:bg-rose-500/5"
                    : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50",
                ].join(" ")}
                title="Cerrar sesion"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesion
              </button>
            </div>
          </div>

          {/* Hero */}
          <div className="flex items-center gap-4 max-w-2xl">
            <div
              className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                isDark
                  ? "bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500/20"
                  : "bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200"
              }`}
            >
              <ShieldAlert className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
            </div>
            <div className="space-y-0.5">
              <h2
                className={`text-xl md:text-2xl font-black tracking-tight leading-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Bandeja de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Revision
                </span>
              </h2>
              <p
                className={`text-sm max-w-lg leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Evalua candidatos, valida riesgos y toma decisiones con trazabilidad.
              </p>
            </div>
          </div>
        </header>

        {/* ESTADO CARGA / ERROR */}
        {showLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-cyan-400" : "text-cyan-500"}`} />
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cargando historial...</p>
          </div>
        )}

        {showError && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <div className={`p-3 rounded-xl ${isDark ? "bg-rose-500/10" : "bg-rose-50"}`}>
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <p className={`text-sm text-center max-w-md ${isDark ? "text-slate-400" : "text-slate-600"}`}>{evals.error}</p>
          </div>
        )}

        {!showLoading && !showError && (
          <>
            {mainTab === "evaluations" && (
              <section className="space-y-6">
                  {/* KPI Strip - Full Width */}
                  <CoordinatorKpiStrip
                    total={metrics.total}
                    avgScore={metrics.avgScore}
                    isScoped={!!userSchoolId}
                  />

                  {/* 3-Panel Dashboard Grid */}
                  <div className="grid grid-cols-12 gap-5 items-start">
                    {/* PANEL 1: Prioridad de revision (Compact Sidebar) */}
                    <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                      <div
                        className={[
                          "relative overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col",
                          isDark
                            ? "border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent"
                            : "border-slate-200 bg-white shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)]",
                        ].join(" ")}
                      >
                        {isDark && (
                          <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-cyan-500/5 blur-[80px]" />
                        )}

                        <div className="relative p-5 flex flex-col">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={[
                                "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border",
                                isDark
                                  ? "border-cyan-500/25 bg-cyan-500/10"
                                  : "border-cyan-200 bg-cyan-50",
                              ].join(" ")}
                            >
                              <TrendingUp className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                            </div>
                            <div className="min-w-0">
                              <h3 className={`text-xs font-bold tracking-tight truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                                Prioridad
                              </h3>
                              <p className={`text-[10px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                Ranking por score
                              </p>
                            </div>
                          </div>

                          {/* Card list */}
                          <div className="space-y-2.5">
                            {topPageItems.length === 0 ? (
                              <div
                                className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center ${
                                  isDark
                                    ? "border-white/10 bg-white/[0.02]"
                                    : "border-slate-200 bg-slate-50"
                                }`}
                              >
                                <div className="text-slate-500 mb-2">
                                  <TrendingUp className="h-6 w-6 opacity-30" />
                                </div>
                                <p className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                                  Sin datos suficientes.
                                </p>
                              </div>
                            ) : (
                              topPageItems.map((c) => {
                                const rank = topStart + topPageItems.indexOf(c) + 1;
                                const score = Number.isFinite(Number(c.score))
                                  ? Math.max(0, Math.min(100, Number(c.score)))
                                  : 0;

                                const isHigh = score >= 85;
                                const isMed = score >= 70 && score < 85;

                                let toneColor = isDark ? "text-slate-400" : "text-slate-500";
                                let toneBg = "bg-slate-500";

                                if (isHigh) {
                                  toneColor = isDark ? "text-cyan-400" : "text-cyan-600";
                                  toneBg = "bg-cyan-500";
                                } else if (isMed) {
                                  toneColor = isDark ? "text-blue-400" : "text-blue-600";
                                  toneBg = "bg-blue-500";
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
                                    className={`group w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                                      isDark
                                        ? "border-white/5 bg-[#15191E] hover:border-cyan-500/30 hover:shadow-[0_4px_15px_-5px_rgba(6,182,212,0.2)]"
                                        : "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-[0_8px_25px_-8px_rgba(15,23,42,0.1)]"
                                    }`}
                                  >
                                    <span
                                      className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold font-mono ${toneColor} ${
                                        isDark ? "bg-white/5" : "bg-slate-50 border border-slate-200"
                                      }`}
                                    >
                                      #{rank}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <p className={`text-xs font-bold truncate group-hover:text-emerald-400 ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {c.name}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
                                          <div
                                            className={`h-full rounded-full ${toneBg} ${isHigh ? "shadow-[0_0_8px_rgba(16,185,129,0.3)]" : ""}`}
                                            style={{ width: `${score}%` }}
                                          />
                                        </div>
                                        <span className={`text-[10px] font-bold shrink-0 ${toneColor}`}>
                                          {Math.round(score)}
                                        </span>
                                      </div>
                                    </div>

                                    <span
                                      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                        isHigh
                                          ? isDark ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-300" : "border-cyan-200 bg-cyan-50 text-cyan-700"
                                          : isMed
                                            ? isDark ? "border-blue-500/25 bg-blue-500/10 text-blue-300" : "border-blue-200 bg-blue-50 text-blue-700"
                                            : isDark ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"
                                      }`}
                                    >
                                      {c.verdictShort === "Sin veredicto" ? "Pend." : c.verdictShort?.slice(0, 8)}
                                    </span>
                                  </button>
                                );
                              })
                            )}
                          </div>

                          {/* Pagination */}
                          {topTotal > TOP_PAGE_SIZE && (
                            <div
                              className={`mt-4 pt-3 border-t flex items-center justify-between ${
                                isDark ? "border-white/5" : "border-slate-200"
                              }`}
                            >
                              <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                {topStart + 1}–{topEnd} de {topTotal}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setTopPage((p) => Math.max(1, p - 1))}
                                  disabled={safeTopPage <= 1}
                                  className={`grid h-6 w-6 place-items-center rounded-md border text-[10px] transition ${
                                    safeTopPage <= 1
                                      ? isDark ? "border-transparent text-slate-700 cursor-not-allowed" : "border-transparent text-slate-300 cursor-not-allowed"
                                      : isDark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  ‹
                                </button>
                                <span className={`text-[10px] font-medium min-w-[2rem] text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                  {safeTopPage}/{topTotalPages}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setTopPage((p) => Math.min(topTotalPages, p + 1))}
                                  disabled={safeTopPage >= topTotalPages}
                                  className={`grid h-6 w-6 place-items-center rounded-md border text-[10px] transition ${
                                    safeTopPage >= topTotalPages
                                      ? isDark ? "border-transparent text-slate-700 cursor-not-allowed" : "border-transparent text-slate-300 cursor-not-allowed"
                                      : isDark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  ›
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PANEL 2: Bandeja de candidatos (Main Content) */}
                    <div className="col-span-12 lg:col-span-8 xl:col-span-6">
                      <div id="evaluaciones-registradas" className="scroll-mt-28">
                        <EvaluationsListPanel
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
                    </div>

                    {/* PANEL 3: Guia rapida (Compact Sidebar) */}
                    <aside className="col-span-12 xl:col-span-3">
                      <div
                        className={`relative overflow-hidden rounded-2xl border p-5 ${
                          isDark
                            ? "border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent"
                            : "border-slate-200 bg-white shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)]"
                        }`}
                      >
                        {isDark && (
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(6,182,212,0.06),transparent_55%)]" />
                        )}
                        <div className="relative">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                              isDark
                                ? "border-white/[0.08] bg-white/[0.03] text-slate-300"
                                : "border-cyan-100 bg-cyan-50 text-cyan-700"
                            }`}
                          >
                            <Sparkles className={`h-3.5 w-3.5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                            Guia
                          </div>

                          <div className={`mt-3 text-xs font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            Flujo recomendado
                          </div>

                          <ul className={`mt-3 space-y-3 text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            <li className="flex gap-2.5">
                              <span className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold ${isDark ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>1</span>
                              <span>Revisa <b className={isDark ? "text-white" : "text-slate-800"}>Prioridad</b> para decisiones rapidas.</span>
                            </li>
                            <li className="flex gap-2.5">
                              <span className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold ${isDark ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>2</span>
                              <span>En <b className={isDark ? "text-white" : "text-slate-800"}>Bandeja</b>, filtra por programa.</span>
                            </li>
                            <li className="flex gap-2.5">
                              <span className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold ${isDark ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>3</span>
                              <span>Abre detalle: apruebas/rechazas y exportas PDF.</span>
                            </li>
                          </ul>

                          <div
                            className={`mt-4 rounded-xl border p-3 text-[10px] leading-relaxed ${
                              isDark
                                ? "border-white/[0.06] bg-white/[0.02] text-slate-500"
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

            {mainTab === "users" && <CoordinatorUsersPanel />}
          </>
        )}
      </div>
    </div>
  );
};

export default CoordinatorConsole;
