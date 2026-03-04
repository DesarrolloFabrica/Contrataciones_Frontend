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
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { actorFromUser } from "../../services/auditActor";
import { AUTH_STORAGE_KEY } from "../../services/apiClient";

import { useCoordinatorEvaluations } from "./hooks/useCoordinatorEvaluations";

import EvaluationsListPanel from "./components/EvaluationsListPanel";
import CoordinatorUsersPanel from "./components/users/CoordinatorUsersPanel";

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
      short: strong ? "Recomendación fuerte" : "Recomendado",
      cls: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
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

  // Paginación TOP
  const [topPage, setTopPage] = useState(1);
  const TOP_PAGE_SIZE_OPTIONS = [6, 10, 12] as const;
  const [topPageSize, setTopPageSize] =
    useState<(typeof TOP_PAGE_SIZE_OPTIONS)[number]>(6);

  useEffect(() => {
    setTopPage(1);
  }, [topRecommended.length]);

  const topTotal = topRecommended.length;
  const topTotalPages = Math.max(1, Math.ceil(topTotal / topPageSize));
  const safeTopPage = Math.min(topPage, topTotalPages);

  const topStart = (safeTopPage - 1) * topPageSize;
  const topEnd = Math.min(topStart + topPageSize, topTotal);

  const topPageItems = useMemo(
    () => topRecommended.slice(topStart, topEnd),
    [topRecommended, topStart, topEnd],
  );

  // UI states
  const showLoading = evals.loading;
  const showError = !evals.loading && !!evals.error;
  const metrics = evals.metrics;

  return (
    <div className="min-h-screen w-full bg-[#020202] text-gray-200 font-sans relative overflow-x-hidden">
      {/* blobs fondo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/6 rounded-full blur-[140px] mix-blend-screen animate-pulse"
          style={{ Animation, animationDuration: "9s" } as any}
        />
        <div className="absolute bottom-[5%] right-[0%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 space-y-10">
        {/* HEADER */}
        <header className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
              <ShieldAlert className="w-4 h-4" />
              <span>Consola de Coordinación</span>
            </div>

            {/* Tabs principales */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMainTab("evaluations")}
                className={[
                  "px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest border transition inline-flex items-center gap-2",
                  mainTab === "evaluations"
                    ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                    : "border-white/10 text-gray-400 hover:border-white/20",
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
                  "px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest border transition inline-flex items-center gap-2",
                  mainTab === "users"
                    ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                    : "border-white/10 text-gray-400 hover:border-white/20",
                ].join(" ")}
                title="Gestionar líderes de mi escuela"
              >
                <UserCheck className="w-4 h-4" />
                Usuarios
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest border border-white/10 text-gray-400 hover:border-rose-500/40 hover:text-rose-400 transition inline-flex items-center gap-2"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="space-y-3 max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.05]">
              Panel de Coordinación{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                (Revisión & Aprobación)
              </span>
            </h2>

            <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
              Diseñado para tomar decisiones rápido: <b>Top recomendados</b>{" "}
              arriba y el <b>detalle siempre en una nueva pantalla</b>.
            </p>
          </div>
        </header>

        {/* ESTADO CARGA / ERROR */}
        {showLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Cargando historial de evaluaciones…</p>
          </div>
        )}

        {showError && (
          <div className="flex flex-col items-center justify-center py-16 text-red-400 gap-3">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm text-center max-w-md">{evals.error}</p>
          </div>
        )}

        {!showLoading && !showError && (
          <>
            {mainTab === "evaluations" && (
              <section className="grid grid-cols-12 gap-6">
                {/* COLUMNA PRINCIPAL */}
                <div className="col-span-12 xl:col-span-8 space-y-6">
                  {/* Métricas (premium) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* --- CARD 1: TOTAL EVALUACIONES (Emerald Focus) --- */}
                    <div className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-[#0A0C10] p-6 shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)]">
                      {/* Ambient Background Glows */}
                      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px] transition-all duration-700 group-hover:bg-emerald-500/20" />
                      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-40 w-40 rounded-full bg-teal-500/5 blur-[60px]" />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          {/* Label */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-400/80 transition-colors">
                              Evaluaciones
                            </span>
                          </div>

                          {/* Metric */}
                          <div className="flex items-baseline gap-2">
                            <p className="text-5xl font-black tracking-tighter text-white drop-shadow-lg">
                              {metrics.total}
                            </p>
                            <span className="text-sm font-medium text-slate-500">
                              total
                            </span>
                          </div>
                        </div>

                        {/* Icon Container */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#15191E] border border-white/5 text-emerald-500 shadow-inner group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-[#0A0C10] group-hover:border-transparent transition-all duration-300">
                          <FileText className="h-5 w-5" />
                        </div>
                      </div>

                      {/* Progress Bar Section */}
                      <div className="relative mt-6">
                        <div className="h-1.5 w-full rounded-full bg-[#15191E] overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                            style={{
                              width: `${Math.max(0, Math.min(100, (Number(metrics.total) || 0) * 6.5))}%`,
                              transition:
                                "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                          <span>Bajo Volumen</span>
                          <span className="text-emerald-500/50">
                            Alta Demanda
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* --- CARD 2: PROMEDIO GLOBAL (Teal/Cyan Focus) --- */}
                    <div className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-[#0A0C10] p-6 shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_20px_40px_-15px_rgba(34,211,238,0.2)]">
                      {/* Ambient Background Glows */}
                      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px] transition-all duration-700 group-hover:bg-cyan-500/20" />
                      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-40 w-40 rounded-full bg-emerald-500/5 blur-[60px]" />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          {/* Label */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-cyan-400/80 transition-colors">
                              Promedio Global
                            </span>
                          </div>

                          {/* Metric */}
                          <div className="flex items-baseline gap-2">
                            <p className="text-5xl font-black tracking-tighter text-white drop-shadow-lg">
                              {metrics.avgScore.toFixed(1)}
                            </p>
                            <span className="text-sm font-medium text-slate-500">
                              /100
                            </span>
                          </div>
                        </div>

                        {/* Icon Container */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#15191E] border border-white/5 text-cyan-400 shadow-inner group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-[#0A0C10] group-hover:border-transparent transition-all duration-300">
                          <Activity className="h-5 w-5" />
                        </div>
                      </div>

                      {/* Progress Bar Section */}
                      <div className="relative mt-6">
                        <div className="h-1.5 w-full rounded-full bg-[#15191E] overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                            style={{
                              width: `${Math.max(0, Math.min(100, Number(metrics.avgScore) || 0))}%`,
                              transition:
                                "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                          <span>Crítico</span>
                          <span className="text-cyan-500/50">Óptimo</span>
                        </div>
                      </div>
                    </div>

                    {/* --- CARD 3: FLUJO DE PROCESO (Workflow Focus) --- */}
                    <div className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-[#0A0C10] p-6 shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)]">
                      {/* Ambient Background Glows */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-white/5 blur-[90px] group-hover:bg-white/10 transition-all" />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className="w-full">
                          {/* Label */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              Flujo Activo
                            </span>
                          </div>

                          {/* Steps Visualizer */}
                          <div className="flex items-center w-full gap-2">
                            {/* Step 1 */}
                            <div className="flex-1 flex flex-col items-center gap-2 group/step">
                              <div className="w-full py-1.5 rounded-lg border border-white/10 bg-white/5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover/step:border-white/20 transition-colors">
                                Lista
                              </div>
                            </div>

                            <span className="text-slate-600">→</span>

                            {/* Step 2 */}
                            <div className="flex-1 flex flex-col items-center gap-2 group/step">
                              <div className="w-full py-1.5 rounded-lg border border-white/10 bg-white/5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover/step:border-white/20 transition-colors">
                                Detalle
                              </div>
                            </div>

                            <span className="text-slate-600">→</span>

                            {/* Step 3 (Active/Highlight) */}
                            <div className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center text-[10px] font-bold text-emerald-400 uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                Decisión
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[80%]">
                              Optimizado para revisión rápida y toma de
                              decisiones sin fricción.
                            </p>
                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                              <UserCheck className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TOP RECOMENDADOS (Premium Emerald Layout) */}
                  <div className="relative overflow-hidden rounded-[24px] border border-white/5 bg-[#0A0C10] shadow-2xl">
                    {/* Ambient Background Glows */}
                    <div className="pointer-events-none absolute top-0 right-0 -mt-24 -mr-24 h-96 w-96 rounded-full bg-emerald-500/5 blur-[100px]" />
                    <div className="pointer-events-none absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-cyan-500/5 blur-[80px]" />
                    <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />

                    <div className="relative p-8">
                      {/* --- Header Section --- */}
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-8">
                        <div className="flex gap-5">
                          {/* Icon Box */}
                          <div className="shrink-0 grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            <TrendingUp className="h-6 w-6 text-emerald-400" />
                          </div>

                          <div className="min-w-0 pt-1">
                            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                              Top Recomendados
                            </h3>
                            <p className="mt-1.5 text-sm text-slate-400 font-medium">
                              Ranking automático por probabilidad de éxito.
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${userSchoolId ? "bg-amber-500" : "bg-emerald-500"}`}
                              />
                              <span>
                                {userSchoolId
                                  ? "Filtro activo: Tu escuela"
                                  : "Global: Todas las escuelas"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("evaluaciones-registradas")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              })
                          }
                          className="group flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-400 active:scale-95"
                        >
                          Ver Historial
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>

                      {/* --- Grid de Tarjetas --- */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {topRecommended.length === 0 ? (
                          <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                            <div className="text-slate-600 mb-2">
                              <TrendingUp className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                              Aún no hay suficientes datos para generar el
                              ranking.
                            </p>
                          </div>
                        ) : (
                          topPageItems.map((c, idx) => {
                            const rank = topStart + idx + 1;
                            const score = Number.isFinite(Number(c.score))
                              ? Math.max(0, Math.min(100, Number(c.score)))
                              : 0;

                            // Definición de colores basada en Score (Estilo Neon/Dark)
                            const isHigh = score >= 85;
                            const isMed = score >= 70 && score < 85;

                            let toneColor = "text-slate-400"; // Default
                            let toneBg = "bg-slate-500";
                            let borderHighlight = "group-hover:border-white/10";

                            if (isHigh) {
                              toneColor = "text-emerald-400";
                              toneBg = "bg-emerald-500";
                              borderHighlight =
                                "group-hover:border-emerald-500/30 group-hover:shadow-[0_4px_20px_-10px_rgba(16,185,129,0.3)]";
                            } else if (isMed) {
                              toneColor = "text-cyan-400";
                              toneBg = "bg-cyan-500";
                              borderHighlight =
                                "group-hover:border-cyan-500/30 group-hover:shadow-[0_4px_20px_-10px_rgba(34,211,238,0.3)]";
                            } else if (score >= 55) {
                              toneColor = "text-indigo-400";
                              toneBg = "bg-indigo-500";
                              borderHighlight =
                                "group-hover:border-indigo-500/30";
                            }

                            return (
                              <button
                                key={c.id}
                                onClick={() =>
                                  navigate(
                                    `/coordinator/evaluations/${encodeURIComponent(c.id)}/report`,
                                  )
                                }
                                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#15191E] p-5 text-left transition-all duration-300 hover:-translate-y-1 ${borderHighlight}`}
                              >
                                <div className="flex w-full items-start justify-between gap-4">
                                  {/* Left Info */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className={`flex h-5 min-w-[1.25rem] items-center justify-center rounded bg-white/5 px-1.5 text-[10px] font-bold font-mono ${toneColor}`}
                                      >
                                        #{rank}
                                      </span>
                                      {c.program && (
                                        <span className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                          {c.program}
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="truncate text-base font-bold text-white group-hover:text-white/90">
                                      {c.name}
                                    </h4>

                                    <div className="mt-1 text-xs text-slate-500 truncate">
                                      {c.school || "Sin escuela registrada"}
                                    </div>
                                  </div>

                                  {/* Right / Verdict Pill */}
                                  <div className="shrink-0 text-right">
                                    <div
                                      title={c.verdictFull || "Sin veredicto"}
                                      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                        isHigh
                                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                          : isMed
                                            ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                                            : "border-white/10 bg-white/5 text-slate-400"
                                      }`}
                                    >
                                      {c.verdictShort === "Sin veredicto"
                                        ? "Pendiente"
                                        : c.verdictShort}
                                    </div>
                                  </div>
                                </div>

                                {/* Score Bar Section */}
                                <div className="mt-5">
                                  <div className="flex items-end justify-between text-[11px] font-medium mb-1.5">
                                    <span className="text-slate-500">
                                      Score de ajuste
                                    </span>
                                    <div className="flex items-baseline gap-0.5">
                                      <span
                                        className={`text-sm font-bold ${toneColor}`}
                                      >
                                        {Math.round(score)}
                                      </span>
                                      <span className="text-slate-600">
                                        /100
                                      </span>
                                    </div>
                                  </div>

                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ease-out ${toneBg} ${isHigh ? "shadow-[0_0_10px_rgba(16,185,129,0.4)]" : ""}`}
                                      style={{ width: `${score}%` }}
                                    />
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* --- Footer / Pagination --- */}
                      {topTotal > 0 && (
                        <div className="mt-8 border-t border-white/5 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-xs font-medium text-slate-500">
                            Mostrando{" "}
                            <span className="text-white">{topStart + 1}</span> –{" "}
                            <span className="text-white">{topEnd}</span> de{" "}
                            <span className="text-white">{topTotal}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Page Size Selector */}
                            <div className="relative group/select">
                              <select
                                value={topPageSize}
                                onChange={(e) => {
                                  setTopPageSize(Number(e.target.value) as any);
                                  setTopPage(1);
                                }}
                                className="appearance-none cursor-pointer rounded-xl border border-white/10 bg-[#15191E] pl-3 pr-8 py-2 text-xs font-medium text-slate-300 outline-none transition hover:border-white/20 focus:border-emerald-500/50"
                              >
                                {TOP_PAGE_SIZE_OPTIONS.map((n) => (
                                  <option key={n} value={n}>
                                    {n} / pág
                                  </option>
                                ))}
                              </select>
                              {/* Custom Arrow */}
                              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
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

                            <div className="h-4 w-px bg-white/10 mx-1" />

                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setTopPage((p) => Math.max(1, p - 1))
                                }
                                disabled={safeTopPage <= 1}
                                className={`grid h-8 w-8 place-items-center rounded-xl border transition ${
                                  safeTopPage <= 1
                                    ? "border-transparent text-slate-700 cursor-not-allowed"
                                    : "border-white/10 bg-[#15191E] text-slate-300 hover:bg-white/5 hover:text-white"
                                }`}
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

                              <span className="min-w-[3rem] text-center text-xs font-medium text-slate-400">
                                {safeTopPage} / {topTotalPages}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  setTopPage((p) =>
                                    Math.min(topTotalPages, p + 1),
                                  )
                                }
                                disabled={safeTopPage >= topTotalPages}
                                className={`grid h-8 w-8 place-items-center rounded-xl border transition ${
                                  safeTopPage >= topTotalPages
                                    ? "border-transparent text-slate-700 cursor-not-allowed"
                                    : "border-white/10 bg-[#15191E] text-slate-300 hover:bg-white/5 hover:text-white"
                                }`}
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
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HISTORIAL + FILTROS (Premium wrapper) */}
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

                {/* COLUMNA DERECHA (premium) */}
                <aside className="col-span-12 xl:col-span-4 space-y-6">
                  <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0B0F14]/70 backdrop-blur-xl p-6 shadow-[0_24px_90px_-70px_rgba(34,211,238,0.20)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(34,211,238,0.08),transparent_55%)]" />
                    <div className="relative">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                        Guía rápida
                      </div>

                      <div className="mt-3 text-sm font-semibold text-white/90">
                        Flujo recomendado
                      </div>

                      <ul className="mt-3 space-y-2 text-xs text-white/60 leading-relaxed">
                        <li className="flex gap-2">
                          <span className="text-cyan-200">1)</span>
                          <span>
                            Revisa{" "}
                            <b className="text-white/80">Top recomendados</b>{" "}
                            para decisiones rápidas.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-cyan-200">2)</span>
                          <span>
                            En <b className="text-white/80">Historial</b>,
                            filtra por programa y usa búsqueda.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-cyan-200">3)</span>
                          <span>
                            Abre detalle: apruebas/rechazas y exportas PDF.
                          </span>
                        </li>
                      </ul>

                      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[11px] text-white/55">
                        Tip: en desktop, usa{" "}
                        <b className="text-white/75">Comparativa</b> solo cuando
                        haya 2+ entrevistas.
                      </div>
                    </div>
                  </div>
                </aside>
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
