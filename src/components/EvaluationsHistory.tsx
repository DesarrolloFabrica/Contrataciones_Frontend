import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Filter,
  ChevronRight,
  User,
  Building2,
  GraduationCap,
  Download,
  History,
  IdCard,
  MessageSquarePlus,
  X,
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../types";
import { listTeacherEvaluations } from "../services/teachersService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface EvaluationsHistoryProps {
  onBackToAnalyze: () => void;
  onOpenEvaluation: (evaluationId: string) => void;
}

type HireRecommendationKey =
  | "NO_RECOMENDAR_CONTRATACION"
  | "RECOMENDACION_CON_PRECAUCION"
  | "RECOMENDAR_CONTRATACION"
  | "CONTRATACION_INMEDIATA";

const clampScore = (n: number) => Math.max(0, Math.min(100, n));

const pickScore = (ev: any) => {
  const raw = Number(ev?.aiRawJson?.overallScore);
  if (Number.isFinite(raw)) return clampScore(raw);
  const fallback1 = Number(ev?.overallScore);
  if (Number.isFinite(fallback1)) return clampScore(fallback1);
  const fallback2 = Number(ev?.aiTeachingSuitabilityScore);
  if (Number.isFinite(fallback2)) return clampScore(fallback2);
  return 0;
};

const getRecommendationFromScore = (
  score: number,
): { key: HireRecommendationKey; label: string } => {
  if (score >= 0 && score <= 49)
    return { key: "NO_RECOMENDAR_CONTRATACION", label: "No viable" };
  if (score >= 50 && score <= 79)
    return { key: "RECOMENDACION_CON_PRECAUCION", label: "Revisar" };
  if (score >= 80 && score <= 89)
    return { key: "RECOMENDAR_CONTRATACION", label: "Recomendado" };
  return { key: "CONTRATACION_INMEDIATA", label: "Top perfil" };
};

const getBadgeStyles = (key: HireRecommendationKey, isDark: boolean) => {
  switch (key) {
    case "CONTRATACION_INMEDIATA":
      return isDark
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "RECOMENDAR_CONTRATACION":
      return isDark
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-emerald-50 text-emerald-600 border-emerald-200";
    case "RECOMENDACION_CON_PRECAUCION":
      return isDark
        ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
        : "bg-amber-50 text-amber-700 border-amber-200";
    case "NO_RECOMENDAR_CONTRATACION":
      return isDark
        ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
        : "bg-rose-50 text-rose-600 border-rose-200";
  }
};

const getScoreColor = (key: HireRecommendationKey, isDark: boolean) => {
  switch (key) {
    case "CONTRATACION_INMEDIATA":
    case "RECOMENDAR_CONTRATACION":
      return isDark ? "text-emerald-400" : "text-emerald-600";
    case "RECOMENDACION_CON_PRECAUCION":
      return isDark ? "text-amber-400" : "text-amber-600";
    case "NO_RECOMENDAR_CONTRATACION":
      return isDark ? "text-rose-400" : "text-rose-600";
  }
};

const getSchoolIdFromSummary = (ev: any): string | null => {
  const c = ev?.candidate ?? null;
  const v =
    c?.schoolId ??
    c?.school_id ??
    ev?.schoolId ??
    ev?.school_id ??
    ev?.schoolIdSnapshot ??
    ev?.school_id_snapshot ??
    null;
  if (!v) return null;
  return String(v);
};

const EvaluationsHistory: React.FC<EvaluationsHistoryProps> = ({
  onBackToAnalyze,
  onOpenEvaluation,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const roleRaw =
    (user as any)?.role ??
    (user as any)?.user?.role ??
    (user as any)?.profile?.role ??
    (user as any)?.payload?.role ??
    "";
  const role = String(roleRaw ?? "").trim().toUpperCase();

  const leaderSchoolIdRaw =
    (user as any)?.schoolId ??
    (user as any)?.user?.schoolId ??
    (user as any)?.profile?.schoolId ??
    (user as any)?.payload?.schoolId ??
    null;

  const leaderSchoolId = leaderSchoolIdRaw ? String(leaderSchoolIdRaw) : null;
  const isLeader = role === "LIDER" || role === "LEADER";

  const [evaluations, setEvaluations] = useState<TeacherEvaluationSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listTeacherEvaluations();
        setEvaluations(data);
      } catch (err) {
        console.error("Error cargando historial:", err);
        setError("Error de conexión al cargar el historial.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const scopedEvaluations = useMemo(() => {
    if (!isLeader || !leaderSchoolId) return evaluations;
    return evaluations.filter((ev: any) => {
      const sid = getSchoolIdFromSummary(ev);
      return sid ? sid === leaderSchoolId : false;
    });
  }, [evaluations, isLeader, leaderSchoolId]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return scopedEvaluations;
    return scopedEvaluations.filter((e: any) => {
      const name = e.candidate?.fullName?.toLowerCase?.() ?? "";
      const program = e.candidate?.programNameSnapshot?.toLowerCase?.() ?? "";
      const school = e.candidate?.schoolNameSnapshot?.toLowerCase?.() ?? "";
      const doc =
        (e.candidate as any)?.documentNumber?.toLowerCase?.() ??
        (e.candidate as any)?.document_number?.toLowerCase?.() ??
        "";
      return name.includes(s) || program.includes(s) || school.includes(s) || doc.includes(s);
    });
  }, [search, scopedEvaluations]);

  const handleClearSearch = () => setSearch("");

  return (
    <div className="relative w-full space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <section
        className={[
          "relative overflow-hidden rounded-2xl border px-4 py-4 md:px-5",
          isDark
            ? "border-white/10 bg-gradient-to-r from-[#0f1f23] via-[#0d1a1e] to-[#102226] shadow-[0_16px_40px_-28px_rgba(0,0,0,0.7)]"
            : "border-slate-200 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.2)]",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl",
            isDark ? "bg-emerald-500/12" : "bg-emerald-400/15",
          ].join(" ")}
        />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onBackToAnalyze}
              className={[
                "mb-2 inline-flex items-center gap-1.5 text-xs font-semibold transition",
                isDark
                  ? "text-slate-400 hover:text-emerald-300"
                  : "text-slate-500 hover:text-emerald-700",
              ].join(" ")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a entrevista
            </button>

            <div className="flex items-center gap-3">
              <div
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                  isDark
                    ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
                ].join(" ")}
              >
                <History className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className={`text-xl font-bold tracking-tight md:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                  Historial de entrevistas
                </h1>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Consulta y seguimiento de candidatos registrados
                  {!loading && !error ? ` · ${filtered.length} registro${filtered.length === 1 ? "" : "s"}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 lg:w-auto">
            <div className="relative w-full lg:w-80">
              <Search
                className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={[
                  "w-full rounded-xl border py-2.5 pl-10 pr-9 text-sm outline-none transition",
                  isDark
                    ? "border-white/10 bg-[#132328] text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/45 focus:ring-2 focus:ring-emerald-500/15"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/15",
                ].join(" ")}
                placeholder="Buscar por nombre, documento o programa..."
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 ${
                    isDark ? "text-slate-400 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              className={[
                "hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition sm:flex",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
              ].join(" ")}
              title="Filtros"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Table */}
      <section
        className={[
          "overflow-hidden rounded-2xl border",
          isDark
            ? "border-white/10 bg-[#0d1a1e] shadow-[0_20px_50px_-30px_rgba(0,0,0,0.75)]"
            : "border-slate-200 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.18)]",
        ].join(" ")}
      >
        <div className={`h-1 w-full ${isDark ? "bg-gradient-to-r from-emerald-500/70 via-teal-400/50 to-transparent" : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300"}`} />

        <div
          className={[
            "hidden grid-cols-12 gap-3 border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] md:grid md:px-5",
            isDark
              ? "border-white/10 bg-white/[0.03] text-slate-400"
              : "border-slate-100 bg-slate-50 text-slate-500",
          ].join(" ")}
        >
          <div className="col-span-4">Candidato</div>
          <div className="col-span-3">Programa / Escuela</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-2 text-right">Score y estado</div>
          <div className="col-span-1 text-right">Acción</div>
        </div>

        {loading && (
          <div className={`flex flex-col items-center justify-center gap-3 py-16 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <span className="text-sm">Cargando entrevistas...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center">
            <div className={`rounded-xl p-3 ${isDark ? "bg-rose-500/10" : "bg-rose-50"}`}>
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <div
              className={[
                "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-400",
              ].join(" ")}
            >
              <History className="h-6 w-6" />
            </div>
            <p className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {search ? "Sin coincidencias" : "Aún no hay entrevistas"}
            </p>
            <p className={`mt-1 max-w-sm text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {search
                ? "Prueba con otro nombre, documento o programa."
                : "Cuando registres una entrevista, aparecerá aquí para su seguimiento."}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {search ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={[
                    "rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
                    isDark
                      ? "border-white/10 text-slate-200 hover:bg-white/[0.06]"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Limpiar búsqueda
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBackToAnalyze}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.8)] transition hover:bg-emerald-500"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  Nueva entrevista
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className={`divide-y ${isDark ? "divide-white/[0.06]" : "divide-slate-100"}`}>
            {filtered.map((ev: any) => {
              const score = pickScore(ev);
              const rec = getRecommendationFromScore(score);
              const createdAt = ev.createdAt ? new Date(ev.createdAt) : null;
              const dateStr = createdAt
                ? createdAt.toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "---";

              const badgeClass = getBadgeStyles(rec.key, isDark);
              const scoreColor = getScoreColor(rec.key, isDark);

              return (
                <div
                  key={ev.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenEvaluation(ev.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpenEvaluation(ev.id);
                    }
                  }}
                  className={[
                    "group relative cursor-pointer items-center gap-3 px-4 py-3.5 transition md:grid md:grid-cols-12 md:px-5",
                    isDark ? "hover:bg-emerald-500/[0.05]" : "hover:bg-emerald-50/60",
                  ].join(" ")}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-slate-400 group-hover:border-emerald-400/25 group-hover:text-emerald-300"
                          : "border-slate-200 bg-slate-50 text-slate-400 group-hover:border-emerald-200 group-hover:bg-white group-hover:text-emerald-700",
                      ].join(" ")}
                    >
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={[
                          "truncate text-sm font-semibold transition",
                          isDark
                            ? "text-white group-hover:text-emerald-200"
                            : "text-slate-900 group-hover:text-emerald-800",
                        ].join(" ")}
                      >
                        {ev.candidate?.fullName || "Sin nombre"}
                      </p>
                      <p
                        className={`mt-0.5 flex items-center gap-1 truncate font-mono text-[11px] ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        <IdCard className="h-3 w-3 shrink-0" />
                        {ev.candidate?.documentNumber ||
                          ev.candidate?.document_number ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 hidden min-w-0 md:block">
                    <div className="flex flex-col gap-1">
                      {(ev.candidate?.programNameSnapshot ||
                        (ev.candidate as any)?.program?.name) && (
                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          <GraduationCap className={`h-3.5 w-3.5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                          <span className="truncate">
                            {ev.candidate?.programNameSnapshot ||
                              (ev.candidate as any)?.program?.name}
                          </span>
                        </div>
                      )}
                      {(ev.candidate?.schoolNameSnapshot ||
                        (ev.candidate as any)?.school?.name) && (
                        <div
                          className={`flex items-center gap-1.5 text-[11px] ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">
                            {ev.candidate?.schoolNameSnapshot ||
                              (ev.candidate as any)?.school?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`col-span-2 hidden font-mono text-xs md:block ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {dateStr}
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <div className={`rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>
                      {rec.label}
                    </div>
                    <div
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-bold transition",
                        scoreColor,
                        isDark
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-slate-200 bg-slate-50",
                      ].join(" ")}
                    >
                      {Math.round(score)}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {ev.aiReportDriveFileId && (
                      <a
                        href={`https://drive.google.com/file/d/${ev.aiReportDriveFileId}/view`}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver PDF"
                        onClick={(e) => e.stopPropagation()}
                        className={[
                          "rounded-lg p-2 transition",
                          isDark
                            ? "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-800",
                        ].join(" ")}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    <div
                      className={[
                        "rounded-lg p-2 transition",
                        isDark
                          ? "text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-300"
                          : "text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-700",
                      ].join(" ")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>

                  <div
                    className={[
                      "mt-3 flex w-full items-center justify-between border-t pt-3 text-xs md:hidden",
                      isDark
                        ? "border-white/[0.06] text-slate-500"
                        : "border-slate-100 text-slate-400",
                    ].join(" ")}
                  >
                    <span>{dateStr}</span>
                    <span className="truncate pl-3">{ev.candidate?.programNameSnapshot}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div
          className={[
            "flex items-center justify-between border-t px-4 py-2.5 md:px-5",
            isDark ? "border-white/10 bg-black/20" : "border-slate-100 bg-slate-50/80",
          ].join(" ")}
        >
          <span className={`text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            Mostrando {filtered.length} registro{filtered.length === 1 ? "" : "s"}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              className={`rounded-lg p-1.5 disabled:opacity-40 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
              disabled
              aria-label="Anterior"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className={`rounded-lg p-1.5 disabled:opacity-40 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
              disabled
              aria-label="Siguiente"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EvaluationsHistory;
