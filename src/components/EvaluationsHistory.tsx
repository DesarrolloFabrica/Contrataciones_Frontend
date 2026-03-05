// src/components/EvaluationsHistory.tsx.
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Briefcase,
  Download,
  ArrowLeft,
  Filter,
  AlertTriangle,
  ChevronRight,
  MoreHorizontal,
  User,
  Building2,
  GraduationCap
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../types";
import { listTeacherEvaluations } from "../services/teachersService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface EvaluationsHistoryProps {
  onBackToAnalyze: () => void;
  onOpenEvaluation: (evaluationId: string) => void;
}

// --- LÓGICA DE SCORES Y RECOMENDACIÓN (INTACTA) ---

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
): { key: HireRecommendationKey; label: string; color: string } => {
  if (score >= 0 && score <= 49)
    return { key: "NO_RECOMENDAR_CONTRATACION", label: "No viable", color: "text-rose-500" };

  if (score >= 50 && score <= 79)
    return { key: "RECOMENDACION_CON_PRECAUCION", label: "Revisar", color: "text-amber-500" };

  if (score >= 80 && score <= 89)
    return { key: "RECOMENDAR_CONTRATACION", label: "Recomendado", color: "text-emerald-400" };

  return { key: "CONTRATACION_INMEDIATA", label: "Top Perfil", color: "text-emerald-400" };
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

// --- COMPONENTE PRINCIPAL ---

const EvaluationsHistory: React.FC<EvaluationsHistoryProps> = ({
  onBackToAnalyze,
  onOpenEvaluation,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Lógica de roles
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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* HEADER MINIMALISTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <button
            onClick={onBackToAnalyze}
            className={`flex items-center gap-2 text-xs font-medium mb-2 transition-colors uppercase tracking-wider ${
              isDark
                ? "text-neutral-500 hover:text-emerald-400"
                : "text-slate-500 hover:text-emerald-500"
            }`}
          >
            <ArrowLeft className="w-3 h-3" />
            Volver al análisis
          </button>
          <h1
            className={`text-3xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Base de Talento
          </h1>
          <p
            className={`mt-1 text-sm ${
              isDark ? "text-neutral-400" : "text-slate-600"
            }`}
          >
            Gestión y seguimiento de evaluaciones docentes.
          </p>
        </div>

        {/* BARRA DE HERRAMIENTAS */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                className={`h-4 w-4 transition-colors ${
                  isDark
                    ? "text-neutral-600 group-focus-within:text-emerald-500"
                    : "text-slate-400 group-focus-within:text-emerald-500"
                }`}
              />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={[
                "block w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all",
                isDark
                  ? "bg-neutral-900/50 border border-white/5 text-neutral-200 placeholder-neutral-600 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-neutral-900"
                  : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/60",
              ].join(" ")}
              placeholder="Buscar por nombre, ID, programa..."
            />
          </div>
          <button
            className={[
              "hidden sm:flex items-center justify-center w-10 h-10 rounded-lg border transition-all",
              isDark
                ? "border-white/5 bg-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-800"
                : "border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50",
            ].join(" ")}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL - ESTILO LISTA */}
      <div
        className={[
          "rounded-xl overflow-hidden backdrop-blur-sm border",
          isDark
            ? "bg-neutral-900/30 border-white/5"
            : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
        ].join(" ")}
      >
        
        {/* ENCABEZADO DE TABLA (Solo desktop) */}
        <div
          className={[
            "hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-[11px] font-semibold uppercase tracking-wider",
            isDark
              ? "border-white/5 bg-neutral-900/80 text-neutral-500"
              : "border-slate-200 bg-slate-50 text-slate-500",
          ].join(" ")}
        >
          <div className="col-span-4">Candidato</div>
          <div className="col-span-3">Programa / Escuela</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-2 text-right">Score & Estado</div>
          <div className="col-span-1 text-right">Acción</div>
        </div>

        {loading && (
          <div
            className={`flex flex-col items-center justify-center py-20 gap-3 ${
              isDark ? "text-neutral-500" : "text-slate-500"
            }`}
          >
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-sm">Sincronizando registros...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 text-rose-500 gap-2">
            <AlertCircle className="w-8 h-8 opacity-70" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center py-24 ${
              isDark ? "text-neutral-600" : "text-slate-500"
            }`}
          >
            <div
              className={`p-4 rounded-full mb-4 ${
                isDark ? "bg-white/5" : "bg-slate-100"
              }`}
            >
              <Search className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-sm">
              No se encontraron resultados para tu búsqueda.
            </p>
            {search && (
              <button
                onClick={handleClearSearch}
                className="mt-2 text-xs text-emerald-500 hover:text-emerald-400"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* LISTA DE FILAS */}
        {!loading && !error && filtered.length > 0 && (
          <div
            className={`divide-y ${
              isDark ? "divide-white/5" : "divide-slate-100"
            }`}
          >
            {filtered.map((ev: any) => {
              const score = pickScore(ev);
              const rec = getRecommendationFromScore(score);
              const createdAt = ev.createdAt ? new Date(ev.createdAt) : null;
              const dateStr = createdAt
                ? createdAt.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
                : "---";
              
              // Determinar color del borde/badge
              let badgeClass = isDark
                ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                : "bg-slate-100 text-slate-600 border-slate-200";
              if (rec.key === "CONTRATACION_INMEDIATA")
                badgeClass = isDark
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200";
              else if (rec.key === "RECOMENDAR_CONTRATACION")
                badgeClass = isDark
                  ? "bg-emerald-900/20 text-emerald-300 border-emerald-500/20"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200";
              else if (rec.key === "RECOMENDACION_CON_PRECAUCION")
                badgeClass = isDark
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                  : "bg-amber-50 text-amber-700 border-amber-200";
              else if (rec.key === "NO_RECOMENDAR_CONTRATACION")
                badgeClass = isDark
                  ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  : "bg-rose-50 text-rose-600 border-rose-200";

              return (
                <div
                  key={ev.id}
                  className={`group relative md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center transition-colors duration-200 ${
                    isDark
                      ? "hover:bg-white/[0.02]"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* 1. Candidato */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                        isDark
                          ? "bg-neutral-800 border-white/5"
                          : "bg-slate-100 border-slate-200"
                      }`}
                    >
                      <User
                        className={`w-5 h-5 ${
                          isDark ? "text-neutral-500" : "text-slate-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate transition-colors ${
                          isDark
                            ? "text-white group-hover:text-emerald-400"
                            : "text-slate-900 group-hover:text-emerald-600"
                        }`}
                      >
                        {ev.candidate?.fullName || "Sin Nombre"}
                      </p>
                      <p
                        className={`text-[11px] font-mono mt-0.5 truncate ${
                          isDark ? "text-neutral-500" : "text-slate-500"
                        }`}
                      >
                        ID: {String(ev.id).slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  {/* 2. Programa / Escuela */}
                  <div className="col-span-3 min-w-0 md:block hidden">
                    <div className="flex flex-col gap-1">
                      {ev.candidate?.programNameSnapshot && (
                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            isDark ? "text-neutral-300" : "text-slate-700"
                          }`}
                        >
                          <GraduationCap
                            className={`w-3.5 h-3.5 ${
                              isDark ? "text-neutral-600" : "text-slate-400"
                            }`}
                          />
                          <span className="truncate">{ev.candidate.programNameSnapshot}</span>
                        </div>
                      )}
                      {ev.candidate?.schoolNameSnapshot && (
                        <div
                          className={`flex items-center gap-1.5 text-[11px] ${
                            isDark ? "text-neutral-500" : "text-slate-500"
                          }`}
                        >
                          <Building2
                            className={`w-3 h-3 ${
                              isDark ? "text-neutral-700" : "text-slate-400"
                            }`}
                          />
                          <span className="truncate">
                            {ev.candidate.schoolNameSnapshot}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Fecha (Mobile & Desktop mixed logic) */}
                  <div
                    className={`col-span-2 text-xs font-mono md:block hidden ${
                      isDark ? "text-neutral-500" : "text-slate-500"
                    }`}
                  >
                    {dateStr}
                  </div>

                  {/* 4. Score y Estado */}
                  <div className="col-span-2 flex items-center justify-end gap-3">
                    <div className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>
                      {rec.label}
                    </div>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${rec.color} ${
                        isDark ? "bg-white/5" : "bg-slate-100"
                      }`}
                    >
                      {Math.round(score)}
                    </div>
                  </div>

                  {/* 5. Acciones */}
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    {ev.aiReportDriveFileId && (
                      <a
                        href={`https://drive.google.com/file/d/${ev.aiReportDriveFileId}/view`}
                        target="_blank"
                        rel="noreferrer"
                        title="Descargar PDF"
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? "text-neutral-500 hover:text-white hover:bg-white/10"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onOpenEvaluation(ev.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? "text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                          : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title="Ver Detalles"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Versión Mobile de la info oculta */}
                  <div
                    className={`md:hidden mt-3 pt-3 w-full flex justify-between items-center text-xs ${
                      isDark
                        ? "border-t border-white/5 text-neutral-500"
                        : "border-t border-slate-200 text-slate-500"
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

        {/* FOOTER DE TABLA */}
        <div
          className={`px-6 py-3 border-t flex justify-between items-center ${
            isDark
              ? "border-white/5 bg-neutral-900/50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <span
            className={`text-[11px] ${
              isDark ? "text-neutral-600" : "text-slate-500"
            }`}
          >
            Mostrando {filtered.length} registro(s)
          </span>
          {/* Paginación simple placeholder */}
          <div className="flex gap-1">
            <button
              className={`p-1 rounded disabled:opacity-50 ${
                isDark
                  ? "text-neutral-600 hover:bg-white/5"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              disabled
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              className={`p-1 rounded disabled:opacity-50 ${
                isDark
                  ? "text-neutral-600 hover:bg-white/5"
                  : "text-slate-500 hover:bg-slate-100"
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