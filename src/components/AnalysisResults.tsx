// src/components/AnalysisResults.tsx
import React, { useMemo, useState } from "react";
import {
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  BarChart2,
  PieChart,
  User,
  Calendar,
  Briefcase,
  Sparkles,
  Clock,
} from "lucide-react";
import type { AnalysisResult, InterviewData } from "../types";
import GaugeChart from "./GaugeChart";
import ComparativeBars from "./ComparativeBars";
import { generateAnalysisPdfFromData } from "../services/pdfReport";
import { uploadTeacherReport } from "../services/teachersService";
import { auditAppend } from "../services/auditService";
import { actorFromUser } from "../services/auditActor";
import { useAuth } from "../context/AuthContext";

// =========================================================
// ✅ UTILIDADES VISUALES (SOLO UI)
// =========================================================

type RiskLevel = "Bajo" | "Medio" | "Alto";

const normalize = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/**
 * Nivel de riesgo robusto:
 * - result.overallRiskLevel
 * - result.aiRawJson.overallRiskLevel
 * - fallback por texto del veredicto
 */
const getEffectiveRiskLevel = (result: any): RiskLevel => {
  const direct = result?.overallRiskLevel;
  if (direct === "Bajo" || direct === "Medio" || direct === "Alto") return direct;

  const fromRaw = result?.aiRawJson?.overallRiskLevel;
  if (fromRaw === "Bajo" || fromRaw === "Medio" || fromRaw === "Alto") return fromRaw;

  const v = normalize(result?.finalVerdict ?? "");

  if (
    v.includes("rechazar") ||
    v.includes("no recomendar") ||
    v.includes("no recomend") ||
    v.includes("alto")
  )
    return "Alto";

  if (v.includes("precaucion") || v.includes("con precaucion") || v.includes("medio"))
    return "Medio";

  return "Bajo";
};

// Estilos del badge de riesgo (solo apariencia)
const getRiskBadgeStyles = (level: "Bajo" | "Medio" | "Alto") => {
  switch (level) {
    case "Bajo":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    case "Medio":
      return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    case "Alto":
      return "bg-rose-500/10 text-rose-300 border-rose-500/20";
    default:
      return "bg-white/5 text-white/60 border-white/10";
  }
};

// =========================================================
// ✅ RECOMENDACIÓN OBJETIVA POR SCORE
// =========================================================

type HireRecommendationKey =
  | "NO_RECOMENDAR_CONTRATACION"
  | "RECOMENDACION_CON_PRECAUCION"
  | "RECOMENDAR_CONTRATACION"
  | "CONTRATACION_INMEDIATA";

const getRecommendationFromScore = (
  score: number
): { key: HireRecommendationKey; label: string } => {
  if (score >= 0 && score <= 49)
    return { key: "NO_RECOMENDAR_CONTRATACION", label: "NO RECOMENDAR CONTRATACIÓN" };

  if (score >= 50 && score <= 79)
    return { key: "RECOMENDACION_CON_PRECAUCION", label: "RECOMENDACIÓN CON PRECAUCIÓN" };

  if (score >= 80 && score <= 89)
    return { key: "RECOMENDAR_CONTRATACION", label: "RECOMENDAR CONTRATACIÓN" };

  return { key: "CONTRATACION_INMEDIATA", label: "CONTRATACIÓN INMEDIATA" };
};

const getVerdictStylesFromRecommendation = (recKey: HireRecommendationKey) => {
  switch (recKey) {
    case "CONTRATACION_INMEDIATA":
      return {
        bg: "from-emerald-500/70 to-green-600/70",
        ring: "ring-emerald-500/25",
        iconWrap: "bg-black/25 border-white/15",
        icon: <CheckCircle className="w-6 h-6" />,
      };
    case "RECOMENDAR_CONTRATACION":
      return {
        bg: "from-sky-500/70 to-blue-600/70",
        ring: "ring-sky-400/25",
        iconWrap: "bg-black/25 border-white/15",
        icon: <CheckCircle className="w-6 h-6" />,
      };
    case "RECOMENDACION_CON_PRECAUCION":
      return {
        bg: "from-amber-500/70 to-yellow-500/60",
        ring: "ring-amber-400/25",
        iconWrap: "bg-black/25 border-white/15",
        icon: <AlertTriangle className="w-6 h-6" />,
      };
    case "NO_RECOMENDAR_CONTRATACION":
    default:
      return {
        bg: "from-rose-500/70 to-red-600/70",
        ring: "ring-rose-500/25",
        iconWrap: "bg-black/25 border-white/15",
        icon: <XCircle className="w-6 h-6" />,
      };
  }
};

// =========================================================
// ✅ COMPONENTES UI (SOLO VISUAL)
// =========================================================

const MetricCard: React.FC<{
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  trend?: string;
}> = ({ label, value, icon, trend }) => (
  <div
    className="
      rounded-2xl border border-emerald-500/15 bg-white/[0.03] p-5
      shadow-[0_18px_70px_-55px_rgba(0,0,0,0.95)]
      ring-1 ring-white/10 backdrop-blur-sm
      transition
      hover:border-emerald-400/25 hover:bg-white/[0.04]
      hover:shadow-[0_22px_90px_-60px_rgba(0,0,0,0.95)]
    "
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
        {label}
      </span>

      {icon && <div className="text-white/35">{icon}</div>}
    </div>

    <div className="text-2xl font-bold text-white tracking-tight">{value}</div>

    {trend && <div className="text-[11px] text-white/40 mt-2">{trend}</div>}
  </div>
);

const DetailSection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <section
    className={`
      rounded-3xl
      border border-emerald-500/15
      bg-white/[0.02]
      overflow-hidden
      shadow-[0_26px_95px_-70px_rgba(0,0,0,0.95)]
      ring-1 ring-white/10
      backdrop-blur-sm
      ${className ?? ""}
    `}
  >
    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-200/80">
        {title}
      </h3>
    </div>

    <div className="p-6 md:p-8">{children}</div>
  </section>
);

// =========================================================
// ✅ PROPS
// =========================================================

interface AnalysisResultsProps {
  result: AnalysisResult;
  interviewData: InterviewData;
  onReset: () => void;

  // id de evaluación (para subir PDF al backend)
  evaluationId?: string;

  // texto del botón reset (solo UI)
  resetLabel?: string;

  // permite ocultar reset desde el padre
  showReset?: boolean;
}

const REPORT_ELEMENT_ID = "report-to-download";

// =========================================================
// ✅ COMPONENTE PRINCIPAL
// =========================================================

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  interviewData,
  onReset,
  evaluationId,
  resetLabel = "Analizar otro candidato",
  showReset = true,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();

  // ✅ rol normalizado (solo UI)
  const roleRaw = (user as any)?.role;
  const roleNormalized = String(roleRaw ?? "").toLowerCase();
  const isLeader = roleNormalized === "leader" || roleNormalized === "lider";

  // ✅ Base “normalizada”: soporta result directo o result.aiRawJson
  const normalized = useMemo(() => {
    const raw = (result as any)?.aiRawJson;
    return raw && typeof raw === "object" ? raw : result;
  }, [result]);

  const overallScore = useMemo(() => {
    const raw = Number((normalized as any)?.overallScore ?? (result as any)?.overallScore ?? 0);
    const n = Number.isFinite(raw) ? raw : 0;
    return Math.max(0, Math.min(100, n));
  }, [normalized, result]);

  const categoryAnalyses = useMemo(
    () => (Array.isArray((normalized as any)?.categoryAnalyses) ? (normalized as any).categoryAnalyses : []),
    [normalized]
  );

  const executiveSummary = useMemo(
    () => String((normalized as any)?.executiveSummary ?? ""),
    [normalized]
  );

  const mitigationRecommendations = useMemo(
    () =>
      Array.isArray((normalized as any)?.mitigationRecommendations)
        ? (normalized as any).mitigationRecommendations
        : [],
    [normalized]
  );

  const temporalRiskFactors = useMemo(
    () =>
      Array.isArray((normalized as any)?.temporalRiskFactors)
        ? (normalized as any).temporalRiskFactors
        : [],
    [normalized]
  );

  const resignationRiskWindow = useMemo(
    () => String((normalized as any)?.resignationRiskWindow ?? "N/A"),
    [normalized]
  );

  const recommendation = useMemo(() => getRecommendationFromScore(overallScore), [overallScore]);
  const verdictStyle = useMemo(
    () => getVerdictStylesFromRecommendation(recommendation.key),
    [recommendation.key]
  );

  const effectiveRisk: RiskLevel = useMemo(() => getEffectiveRiskLevel(result as any), [result]);

  // =========================================================
  // 🔒 LÓGICA PDF (NO TOCAR)
  // =========================================================
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const actor = actorFromUser(user);

      const pdfBlob = await generateAnalysisPdfFromData(result, interviewData);

      auditAppend({
        type: "REPORT_PDF_DOWNLOADED",
        actor,
        metadata: {
          download: true,
          evaluationId: evaluationId ?? null,
        },
      });

      if (evaluationId) {
        await uploadTeacherReport(evaluationId, pdfBlob);

        auditAppend({
          type: "REPORT_PDF_UPLOADED",
          actor,
          metadata: {
            upload: true,
            evaluationId,
          },
        });
      }
    } catch (error) {
      console.error("Error al generar o subir el PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 md:space-y-12 animate-in fade-in duration-700 pb-20 font-sans">
      {/* ACCIONES SUPERIORES */}
      <div className="flex justify-end sticky top-24 md:top-28 z-50 pointer-events-none mt-4">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_18px_70px_-55px_rgba(0,0,0,0.95)] p-2 flex gap-3 items-center">
          {showReset && isLeader && (
            <button
              onClick={onReset}
              className="
                px-4 py-2
                rounded-xl
                text-[11px] font-extrabold uppercase tracking-[0.22em]
                bg-white/[0.04] text-white/70
                border border-white/10
                hover:bg-white/[0.07] hover:text-white
                transition-all
              "
            >
              {resetLabel}
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              text-[11px] font-extrabold uppercase tracking-[0.22em]
              text-black
              border border-emerald-500/20
              shadow-[0_14px_50px_-35px_rgba(49,171,46,0.45)]
              transition-all
              disabled:opacity-60 disabled:cursor-wait
              hover:brightness-110
            "
            style={{
              background: "linear-gradient(90deg, #91DC00, #31AB2E)",
            }}
          >
            {isDownloading ? (
              <span className="animate-pulse">
                Generando{evaluationId ? " y subiendo..." : "..."}
              </span>
            ) : (
              <>
                <Download className="w-4 h-4" /> Exportar PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* CONTENIDO REPORTE */}
      <div id={REPORT_ELEMENT_ID} className="space-y-10 p-4 md:p-8 bg-[#020202]">
        {/* HERO */}
        <div className="flex flex-col items-start gap-6 border-b border-white/10 pb-8">
          <div>
            <div
              className="
                inline-flex items-center gap-2
                rounded-full px-3 py-1
                text-[10px] md:text-[11px]
                font-extrabold uppercase tracking-[0.22em]
                text-emerald-200/80
                border border-emerald-500/15
                bg-emerald-500/10
                shadow-[0_0_18px_-10px_rgba(16,185,129,0.25)]
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
              Reporte generado por IA
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-black text-white tracking-tight">
              {interviewData.candidateName}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-white/55 text-sm">
              {interviewData.program && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> {interviewData.program}
                </span>
              )}

              {interviewData.school && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {interviewData.school}
                  </span>
                </>
              )}

              {interviewData.age && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> {interviewData.age} años
                  </span>
                </>
              )}
            </div>
          </div>

          {/* VEREDICTO (objetivo por score + veredicto textual como apoyo) */}
          <div
            className={`
              relative
              px-6 py-4
              rounded-2xl
              bg-gradient-to-br ${verdictStyle.bg}
              ring-1 ${verdictStyle.ring}
              shadow-[0_26px_85px_-65px_rgba(0,0,0,0.95)]
              flex flex-col items-start gap-3
              overflow-hidden
            `}
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.55)_0%,rgba(0,0,0,0)_55%)]" />

            <div
              className={`
                relative z-10
                p-2 rounded-full
                ${verdictStyle.iconWrap}
                border
                backdrop-blur-sm
              `}
            >
              {verdictStyle.icon}
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-extrabold text-white/80 uppercase tracking-[0.22em] mb-1">
                Recomendación (por score)
              </p>

              <p className="text-lg md:text-xl font-normal text-white/90 leading-relaxed">
                {recommendation.label}
              </p>

              <p className="mt-2 text-[11px] text-white/70">
                Score base: <span className="font-semibold">{Math.round(overallScore)}</span>/100
                {result.finalVerdict ? (
                  <>
                    {" "}
                    • Veredicto IA: <span className="font-semibold">{result.finalVerdict}</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>

        {/* RESUMEN CUANTITATIVO */}
        <DetailSection title="Resumen cuantitativo">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Score global"
              value={`${Math.round(overallScore)}/100`}
              icon={<PieChart className="w-5 h-5" />}
              trend="Puntaje ponderado de ajuste al rol"
            />

            <MetricCard
              label="Nivel de riesgo"
              value={
                <span
                  className={`inline-flex px-2.5 py-1 rounded-lg text-sm border ${getRiskBadgeStyles(
                    effectiveRisk
                  )}`}
                >
                  {effectiveRisk}
                </span>
              }
              icon={<AlertTriangle className="w-5 h-5" />}
            />

            <MetricCard
              label="Ventana de retención"
              value={resignationRiskWindow || "N/A"}
              icon={<Calendar className="w-5 h-5" />}
              trend="Estimación temporal de rotación"
            />

            <MetricCard
              label="Consistencia"
              value="Alta"
              icon={<BarChart2 className="w-5 h-5" />}
              trend="Coherencia entre respuestas y casos"
            />
          </div>
        </DetailSection>

        {/* MAPA DE AJUSTE */}
        <DetailSection title="Mapa de ajuste y cohesión">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div className="flex justify-center py-4">
                <GaugeChart value={overallScore} label="Ajuste al perfil" size={220} />
              </div>

              <div className="mt-2 p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/45 mb-3">
                  Distribución por categoría
                </h4>
                <ComparativeBars categoryAnalyses={categoryAnalyses} />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-md p-6 shadow-[0_18px_70px_-55px_rgba(0,0,0,0.95)]">
              <h4 className="text-sm font-extrabold text-white/85 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-300/90" />
                Resumen ejecutivo IA
              </h4>

              <p className="text-sm text-white/60 leading-relaxed text-justify font-light">
                {executiveSummary}
              </p>
            </div>
          </div>
        </DetailSection>

        {/* ANÁLISIS DIMENSIONAL */}
        <DetailSection title="Análisis dimensional profundo">
          <div className="space-y-4">
            {categoryAnalyses.map((analysis: any) => (
              <div
                key={analysis.category}
                className="
                  group
                  rounded-2xl overflow-hidden
                  border border-white/10
                  bg-white/[0.03] backdrop-blur-md
                  hover:border-emerald-500/20
                  transition-all duration-300
                  shadow-[0_14px_55px_-45px_rgba(0,0,0,0.95)]
                "
              >
                <div className="p-5 flex items-center justify-between bg-black/20 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-10 h-10 rounded-xl
                        flex items-center justify-center
                        font-black text-sm
                        border border-white/10
                        ${
                          analysis.score >= 80
                            ? "bg-emerald-500/10 text-emerald-300"
                            : analysis.score >= 60
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-rose-500/10 text-rose-300"
                        }
                      `}
                    >
                      {Math.round(analysis.score)}
                    </div>

                    <div>
                      <h4 className="font-black text-white/90 text-lg">{analysis.category}</h4>
                      <p className="text-[11px] text-white/45 uppercase tracking-[0.22em]">
                        Análisis de profundidad por competencia
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-white/35 font-mono hidden sm:block">
                    ID: {String(analysis.category).substring(0, 3).toUpperCase()}
                  </div>
                </div>

                <div className="p-5 grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/40 mb-1">
                        Hallazgos clave
                      </p>
                      <p className="text-sm text-white/75 leading-relaxed">
                        {analysis.reporteAnalitico}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-200/80 mb-1">
                        Fortalezas detectadas
                      </p>
                      <p className="text-xs text-white/55">{analysis.oportunidades}</p>
                    </div>
                  </div>

                  <div className="space-y-4 md:border-l md:border-white/10 md:pl-6">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/40 mb-1">
                        Observación IA
                      </p>
                      <p className="text-sm text-white/55 italic">
                        "{analysis.observacionesCorregidas}"
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-200/80 mb-1">
                        Acción recomendada
                      </p>
                      <p className="text-xs text-white/55">{analysis.recomendaciones}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>

        {/* RECOMENDACIONES */}
        <div className="grid md:grid-cols-2 gap-8 pt-2">
          <DetailSection title="Plan de mitigación de riesgos">
            {mitigationRecommendations.length > 0 ? (
              <ul className="space-y-3">
                {mitigationRecommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-200/80 border border-rose-500/15 flex items-center justify-center text-xs font-black shrink-0">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/45 py-6">
                <CheckCircle className="w-8 h-8 mb-2 opacity-60" />
                <p className="text-sm">Perfil de bajo riesgo. No se requieren acciones urgentes.</p>
              </div>
            )}
          </DetailSection>

          <DetailSection title="Factores de retención (riesgo temporal)">
            <div className="flex items-start gap-4 mb-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <Clock className="w-5 h-5 text-amber-200/80 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-200/80">
                  Ventana crítica
                </p>
                <p className="text-sm text-white/80">{resignationRiskWindow}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/40 mb-2">
                Indicadores detectados
              </p>

              {temporalRiskFactors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {temporalRiskFactors.map((factor: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-[11px]
                                 bg-white/[0.04] border border-white/10
                                 text-white/55"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/45 italic">No se detectaron factores de corto plazo.</p>
              )}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
