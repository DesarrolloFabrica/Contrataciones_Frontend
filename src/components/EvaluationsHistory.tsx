// src/components/EvaluationsHistory.tsx
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
  Database,
  IdCard,
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
  score: number
): { key: HireRecommendationKey; label: string } => {
  if (score >= 0 && score <= 49)
    return { key: "NO_RECOMENDAR_CONTRATACION", label: "No viable" };
  if (score >= 50 && score <= 79)
    return { key: "RECOMENDACION_CON_PRECAUCION", label: "Revisar" };
  if (score >= 80 && score <= 89)
    return { key: "RECOMENDAR_CONTRATACION", label: "Recomendado" };
  return { key: "CONTRATACION_INMEDIATA", label: "Top Perfil" };
};

const getBadgeStyles = (key: HireRecommendationKey, isDark: boolean) => {
  switch (key) {
    case "CONTRATACION_INMEDIATA":
      return isDark
        ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/25"
        : "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "RECOMENDAR_CONTRATACION":
      return isDark
        ? "bg-cyan-500/8 text-cyan-400 border-cyan-500/20"
        : "bg-cyan-50 text-cyan-600 border-cyan-200";
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
      return isDark ? "text-cyan-400" : "text-cyan-600";
    case "RECOMENDACION_CON_PRECAUCION":
      return isDark ? "text-amber-400" : "text-amber-600";
    case "NO_RECOMENDAR_CONTRATACION":
      return isDark ? "text-rose-400" : "text-rose-600";
  }
};

const getSchoolIdFromSummary = (ev: any): string | null => {
  const c = ev?.candidate ?? null;
  const v =
    c?.schoolId ?? c?.school_id ?? ev?.schoolId ?? ev?.school_id ??
    ev?.schoolIdSnapshot ?? ev?.school_id_snapshot ?? null;
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
    (user as any)?.role ?? (user as any)?.user?.role ??
    (user as any)?.profile?.role ?? (user as any)?.payload?.role ?? "";
  const role = String(roleRaw ?? "").trim().toUpperCase();

  const leaderSchoolIdRaw =
    (user as any)?.schoolId ?? (user as any)?.user?.schoolId ??
    (user as any)?.profile?.schoolId ?? (user as any)?.payload?.schoolId ?? null;

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
        setError("Error de conexion al cargar el historial.");
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
        (e.candidate as any)?.document_number?.toLowerCase?.() ?? "";
      return name.includes(s) || program.includes(s) || school.includes(s) || doc.includes(s);
    });
  }, [search, scopedEvaluations]);

  const handleClearSearch = () => setSearch("");

  return (
    <div className="relative w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div
        className={[
          "rounded-3xl border p-5 md:p-6 mb-8 backdrop-blur-xl",
          isDark
            ? "bg-[#0B1220]/30 border-white/[0.06] shadow-[0_16px_50px_-24px_rgba(6,182,212,0.15)]"
            : "bg-white/80 border-slate-200/80 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.10)]",
        ].join(" ")}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button
              onClick={onBackToAnalyze}
              className={`flex items-center gap-2 text-[11px] font-bold mb-3 transition-all uppercase tracking-[0.16em] ${
                isDark
                  ? "text-slate-500 hover:text-cyan-400"
                  : "text-slate-400 hover:text-cyan-600"
              }`}
            >
              <ArrowLeft className="w-3 h-3" />
              Volver al analisis
            </button>
            <h1
              className={`text-3xl font-black tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Base de Talento
            </h1>
            <p
              className={`mt-1 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Gestion y seguimiento de evaluaciones docentes.
            </p>
          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  className={`h-4 w-4 transition-colors ${
                    isDark
                      ? "text-slate-600 group-focus-within:text-cyan-400"
                      : "text-slate-400 group-focus-within:text-cyan-500"
                  }`}
                />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={[
                  "block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300",
                  isDark
                    ? "bg-[#080D14] border border-white/[0.08] text-slate-200 placeholder-slate-500 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:shadow-[0_0_20px_-8px_rgba(6,182,212,0.18)] hover:border-white/[0.15] hover:bg-[#0A1018]"
                    : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] hover:border-slate-300",
                ].join(" ")}
                placeholder="Buscar por nombre, ID, programa..."
              />
            </div>
            <button
              className={[
                "hidden sm:flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200",
                isDark
                  ? "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15]"
                  : "border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300",
              ].join(" ")}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div
        className={[
          "rounded-3xl overflow-hidden border transition-all duration-300 backdrop-blur-xl",
          isDark
            ? "bg-[#0B1220]/25 border-white/[0.06] shadow-[0_18px_55px_-28px_rgba(6,182,212,0.15)]"
            : "bg-white/80 border-slate-200/80 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.06)]",
        ].join(" ")}
      >
        {/* TABLE HEADER */}
        <div
          className={[
            "hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-[10px] font-bold uppercase tracking-[0.16em]",
            isDark
              ? "border-white/[0.06] bg-white/[0.03] text-slate-400"
              : "border-slate-100/80 bg-slate-50/30 text-slate-400",
          ].join(" ")}
        >
          <div className="col-span-4">Candidato</div>
          <div className="col-span-3">Programa / Escuela</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-2 text-right">Score & Estado</div>
          <div className="col-span-1 text-right">Accion</div>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            className={`flex flex-col items-center justify-center py-20 gap-3 ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
            <span className="text-sm">Sincronizando registros...</span>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className={`p-3 rounded-xl ${isDark ? "bg-rose-500/10" : "bg-rose-50"}`}>
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{error}</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filtered.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center py-24 ${
              isDark ? "text-slate-600" : "text-slate-400"
            }`}
          >
            <div
              className={`p-4 rounded-2xl mb-4 ${
                isDark ? "bg-white/[0.03] border border-white/[0.06]" : "bg-slate-100 border border-slate-200"
              }`}
            >
              <Database className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-sm font-medium">No se encontraron resultados.</p>
            {search && (
              <button
                onClick={handleClearSearch}
                className="mt-2 text-xs text-cyan-500 hover:text-cyan-400 font-bold uppercase tracking-wider"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* ROWS */}
        {!loading && !error && filtered.length > 0 && (
          <div className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
            {filtered.map((ev: any) => {
              const score = pickScore(ev);
              const rec = getRecommendationFromScore(score);
              const createdAt = ev.createdAt ? new Date(ev.createdAt) : null;
              const dateStr = createdAt
                ? createdAt.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
                : "---";

              const badgeClass = getBadgeStyles(rec.key, isDark);
              const scoreColor = getScoreColor(rec.key, isDark);

              return (
                <div
                  key={ev.id}
                  className={`group relative md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-200 cursor-pointer ${
                    isDark
                      ? "hover:bg-cyan-500/[0.03]"
                      : "hover:bg-cyan-50/50"
                  }`}
                  onClick={() => onOpenEvaluation(ev.id)}
                >
                  {/* Candidate */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors duration-200 ${
                        isDark
                          ? "bg-white/[0.03] border-white/[0.06] group-hover:border-cyan-500/25 group-hover:bg-cyan-500/5"
                          : "bg-slate-50 border-slate-200 group-hover:border-cyan-200 group-hover:bg-cyan-50"
                      }`}
                    >
                      <User
                        className={`w-4.5 h-4.5 transition-colors duration-200 ${
                          isDark ? "text-slate-500 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-cyan-600"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-bold truncate transition-colors duration-200 ${
                          isDark
                            ? "text-white group-hover:text-cyan-300"
                            : "text-slate-900 group-hover:text-cyan-700"
                        }`}
                      >
                        {ev.candidate?.fullName || "Sin Nombre"}
                      </p>
                      <p
                        className={`text-[11px] font-mono mt-0.5 truncate flex items-center gap-1 ${
                          isDark ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        <IdCard className="w-3 h-3 shrink-0" />
                        {ev.candidate?.documentNumber || ev.candidate?.document_number || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Program / School */}
                  <div className="col-span-3 min-w-0 md:block hidden">
                    <div className="flex flex-col gap-1">
                      {ev.candidate?.programNameSnapshot && (
                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          <GraduationCap className={`w-3.5 h-3.5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                          <span className="truncate">{ev.candidate.programNameSnapshot}</span>
                        </div>
                      )}
                      {ev.candidate?.schoolNameSnapshot && (
                        <div
                          className={`flex items-center gap-1.5 text-[11px] ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          <Building2 className={`w-3 h-3 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                          <span className="truncate">{ev.candidate.schoolNameSnapshot}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div
                    className={`col-span-2 text-xs font-mono md:block hidden ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {dateStr}
                  </div>

                  {/* Score & Status */}
                  <div className="col-span-2 flex items-center justify-end gap-2.5">
                    <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                      {rec.label}
                    </div>
                    <div
                      className={`flex items-center justify-center w-9 h-9 rounded-xl font-black text-sm border transition-colors duration-200 ${scoreColor} ${
                        isDark
                          ? "bg-white/[0.03] border-white/[0.06] group-hover:border-white/[0.12]"
                          : "bg-slate-50 border-slate-200 group-hover:border-slate-300"
                      }`}
                    >
                      {Math.round(score)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {ev.aiReportDriveFileId && (
                      <a
                        href={`https://drive.google.com/file/d/${ev.aiReportDriveFileId}/view`}
                        target="_blank"
                        rel="noreferrer"
                        title="Descargar PDF"
                        onClick={(e) => e.stopPropagation()}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDark
                            ? "text-slate-500 hover:text-white hover:bg-white/[0.06]"
                            : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <div
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isDark
                          ? "text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10"
                          : "text-slate-400 group-hover:text-cyan-600 group-hover:bg-cyan-50"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Mobile extra info */}
                  <div
                    className={`md:hidden mt-3 pt-3 w-full flex justify-between items-center text-xs ${
                      isDark
                        ? "border-t border-white/[0.06] text-slate-500"
                        : "border-t border-slate-100 text-slate-400"
                    }`}
                  >
                    <span>{dateStr}</span>
                    <span>{ev.candidate?.programNameSnapshot}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOTER */}
        <div
          className={`px-6 py-3 border-t flex justify-between items-center ${
            isDark
              ? "border-white/[0.06] bg-white/[0.02]"
              : "border-slate-100/80 bg-slate-50/30"
          }`}
        >
          <span
            className={`text-[11px] font-medium ${
              isDark ? "text-slate-600" : "text-slate-400"
            }`}
          >
            Mostrando {filtered.length} registro(s)
          </span>
          <div className="flex gap-1">
            <button
              className={`p-1 rounded-lg disabled:opacity-50 transition-colors ${
                isDark
                  ? "text-slate-600 hover:bg-white/[0.04]"
                  : "text-slate-400 hover:bg-slate-100"
              }`}
              disabled
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              className={`p-1 rounded-lg disabled:opacity-50 transition-colors ${
                isDark
                  ? "text-slate-600 hover:bg-white/[0.04]"
                  : "text-slate-400 hover:bg-slate-100"
              }`}
              disabled
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationsHistory;
