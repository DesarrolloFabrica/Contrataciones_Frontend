// src/components/EvaluationsHistory.tsx
import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  Filter,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Briefcase,
  Download,
} from "lucide-react";
import { TeacherEvaluationSummary } from "../types";
import { listTeacherEvaluations } from "../services/teachersService";

interface EvaluationsHistoryProps {
  onBackToAnalyze: () => void;                 // sigue disponible si lo usas en el Header
  onOpenEvaluation: (evaluationId: string) => void;
}

const badgeForRecommendation = (verdict: string) => {
  const v = (verdict || "").toLowerCase().trim();

  // ✅ Detecta "no recomendada" solo si aparece como frase real (no por "no ..." suelto)
  const isNotRecommended =
    v.includes("no recomend") || // "no recomendada", "no recomendar", etc.
    v.includes("rechaz") ||       // por si el texto viene como "rechazado"
    v.includes("no apto") ||      // variantes comunes
    v.includes("no es apto");

  if (isNotRecommended) {
    return {
      text: "No recomendada",
      className: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
      icon: <XCircle className="w-4 h-4" />,
    };
  }

  // ✅ (opcional) detectar "precaución" para un tercer estado
  const isCaution = v.includes("precauc") || v.includes("condicion") || v.includes("reserv");

  if (isCaution) {
    return {
      text: "Con precaución",
      className: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
      icon: <AlertCircle className="w-4 h-4" />,
    };
  }

  return {
    text: "Recomendada",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    icon: <CheckCircle2 className="w-4 h-4" />,
  };
};



const EvaluationsHistory: React.FC<EvaluationsHistoryProps> = ({
  onOpenEvaluation,
}) => {
  const [evaluations, setEvaluations] = useState<TeacherEvaluationSummary[]>([]);
  const [filtered, setFiltered] = useState<TeacherEvaluationSummary[]>([]);
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
        setFiltered(data);
      } catch (err) {
        console.error("Error al cargar historial de evaluaciones:", err);
        setError(
          "No se pudo cargar el historial de evaluaciones. Revisa el backend."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const s = search.trim().toLowerCase();
    if (!s) {
      setFiltered(evaluations);
      return;
    }
    setFiltered(
      evaluations.filter((e) => {
        const name = e.candidate?.fullName?.toLowerCase() ?? "";
        const program = e.candidate?.programNameSnapshot?.toLowerCase() ?? "";
        const school = e.candidate?.schoolNameSnapshot?.toLowerCase() ?? "";
        return (
          name.includes(s) || program.includes(s) || school.includes(s)
        );
      })
    );
  }, [search, evaluations]);

  const handleClearSearch = () => {
    setSearch("");
    // el useEffect de arriba ya se encarga de restaurar `filtered`
  };

  return (
    <div className="min-h-screen w-full bg-[#020202] text-gray-200 font-sans relative overflow-hidden">
      {/* blobs fondo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-10">
        {/* HERO */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
            <History className="w-4 h-4" />
            <span>Historial de Evaluaciones</span>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.1]">
              Panel de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Evaluaciones Docentes
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-400 font-light leading-relaxed">
              Consulta las evaluaciones generadas por la IA, filtra por
              programa o candidato y revisa el estado de cada perfil.
            </p>
          </div>
        </header>

        {/* TOOLBAR */}
        <div className="sticky top-4 z-40 flex justify-center">
          <div className="bg-[#0A0A0A]/90 backdrop-blur-xl px-3 py-2 rounded-2xl border border-white/10 shadow-2xl flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#050505] border border-white/10 flex-1 md:flex-none min-w-[220px]">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-xs md:text-sm text-gray-200 placeholder:text-gray-600 w-full"
                placeholder="Buscar por nombre, programa o escuela..."
              />
            </div>

            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros rápidos</span>
            </button>

            {/* BOTÓN PARA VOLVER AL SEARCH GENERAL (SIN FILTROS) */}
            <button
              type="button"
              onClick={handleClearSearch}
              disabled={!search.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all
                ${
                  search.trim()
                    ? "text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10"
                    : "text-gray-600 cursor-not-allowed"
                }`}
            >
              Limpiar búsqueda
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="relative mt-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Cargando historial de evaluaciones...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-red-400 gap-3">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm text-center max-w-md">{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
              <FileText className="w-8 h-8 opacity-60" />
              <p className="text-sm text-center max-w-md">
                Aún no se han registrado evaluaciones, o no hay resultados para
                el criterio de búsqueda actual.
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filtered.map((ev) => {
                const badge = badgeForRecommendation(
                  ev.aiFinalRecommendation || ""
                );
                const createdAt = ev.createdAt
                  ? new Date(ev.createdAt)
                  : null;
                const dateLabel = createdAt
                  ? createdAt.toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Fecha no disponible";

                return (
                  <div
                    key={ev.id}
                    className="
                      rounded-3xl
                      bg-[#0A0A0A]/70
                      border border-white/10
                      shadow-[0_22px_70px_-55px_rgba(0,0,0,0.95)]
                      overflow-hidden
                    "
                  >
                    {/* glow suave como el “antes” */}
                    <div className="relative p-6">
                      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
                                
                      {/* HEADER: nombre a la izquierda, badge a la derecha */}
                      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-semibold text-white leading-tight">
                            {ev.candidate?.fullName ?? "Candidato sin nombre"}
                          </h3>
                                
                          {/* subtítulo (programa • escuela) */}
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/45">
                            {ev.candidate?.programNameSnapshot && (
                              <span className="inline-flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" />
                                {ev.candidate.programNameSnapshot}
                              </span>
                            )}
                
                            {ev.candidate?.schoolNameSnapshot && (
                              <>
                                <span className="mx-1 text-white/25">•</span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {ev.candidate.schoolNameSnapshot}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                          
                        <div
                          className={`
                            shrink-0
                            inline-flex items-center gap-2
                            px-4 py-2
                            rounded-full
                            text-[11px]
                            font-semibold
                            uppercase tracking-wider
                            ${badge.className}
                          `}
                        >
                          {badge.icon}
                          <span>{badge.text}</span>
                        </div>
                      </div>
                          
                      {/* KPIs: dos tarjetas como “antes” */}
                      <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45 mb-2">
                            Score global
                          </p>
                          <p className="text-3xl font-semibold text-emerald-400">
                            {Math.round(ev.aiTeachingSuitabilityScore) || 0}
                            <span className="text-sm text-white/35 ml-1">/100</span>
                          </p>
                        </div>
                          
                        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45 mb-2">
                            Fecha evaluación
                          </p>
                          <p className="text-sm text-white/70">{dateLabel}</p>
                        </div>
                      </div>
                          
                      {/* Resumen */}
                      <p className="relative mt-5 text-sm text-white/55 leading-relaxed line-clamp-3">
                        {ev.aiOverallComment}
                      </p>
                          
                      {/* Footer */}
                      <div className="relative mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                        <p className="text-[11px] text-white/35 font-mono">
                          ID: {ev.id.slice(0, 8)}…
                        </p>
                          
                        <div className="flex items-center gap-3">
                          {ev.aiReportDriveFileId && (
                            <a
                              href={`https://drive.google.com/file/d/${ev.aiReportDriveFileId}/view`}
                              target="_blank"
                              rel="noreferrer"
                              className="
                                inline-flex items-center gap-2
                                px-3 py-2
                                rounded-xl
                                text-[11px]
                                font-semibold
                                uppercase tracking-widest
                                bg-white/[0.04]
                                border border-white/10
                                text-white/75
                                hover:bg-white/[0.07]
                              "
                            >
                              <Download className="w-3.5 h-3.5" />
                              PDF en Drive
                            </a>
                          )}
                
                          <button
                            type="button"
                            onClick={() => onOpenEvaluation(ev.id)}
                            className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400 hover:text-emerald-300"
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                console.log("VERDICT:", ev.aiFinalRecommendation);

              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationsHistory;
