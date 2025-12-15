// src/components/AnalysisResults.tsx
import React, { useState } from "react";
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
import { AnalysisResult, InterviewData } from "../types";
import GaugeChart from "./GaugeChart";
import ComparativeBars from "./ComparativeBars";
import { generateAnalysisPdfFromData } from "../services/pdfReport";
import { uploadTeacherReport } from "../services/teachersService";
import { auditAppend } from "../services/auditService";
import { actorFromUser } from "../services/auditActor";
import { useAuth } from "../context/AuthContext";


// --- UTILIDADES VISUALES ---

const getRiskBadgeStyles = (level: "Bajo" | "Medio" | "Alto") => {
  switch (level) {
    case "Bajo":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "Medio":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Alto":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
};

const getVerdictStyles = (verdict: string) => {
  if (verdict.includes("Recomendada"))
    return {
      bg: "from-emerald-600 to-teal-600",
      icon: <CheckCircle className="w-6 h-6" />,
    };
  if (verdict.includes("Precaución"))
    return {
      bg: "from-amber-600 to-orange-600",
      icon: <AlertTriangle className="w-6 h-6" />,
    };
  if (verdict.includes("No Recomendar"))
    return {
      bg: "from-rose-600 to-red-600",
      icon: <XCircle className="w-6 h-6" />,
    };
  return {
    bg: "from-slate-600 to-gray-600",
    icon: <FileText className="w-6 h-6" />,
  };
};

// --- COMPONENTES UI ---

const MetricCard: React.FC<{
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  trend?: string;
}> = ({ label, value, icon, trend }) => (
  <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-all group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-emerald-400 transition-colors">
        {label}
      </span>
      {icon && (
        <div className="text-gray-600 group-hover:text-emerald-500 transition-colors">
          {icon}
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
    {trend && <div className="text-xs text-gray-400 mt-1">{trend}</div>}
  </div>
);

const DetailSection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <div
    className={`bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden ${className}`}
  >
    <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
      <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
        {title}
      </h3>
    </div>
    <div className="p-6 md:p-8">{children}</div>
  </div>
);

interface AnalysisResultsProps {
  result: AnalysisResult;
  interviewData: InterviewData;
  onReset: () => void;
  // nuevo: id de la evaluación guardada en el backend
  evaluationId?: string;
}

const REPORT_ELEMENT_ID = "report-to-download";

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  interviewData,
  onReset,
  evaluationId,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const actor = actorFromUser(user);

      // genera el PDF, lo descarga en el navegador y devuelve el Blob
      const pdfBlob = await generateAnalysisPdfFromData(result, interviewData);
      auditAppend({
        type: "REPORT_PDF_DOWNLOADED",
        actor,
        evaluationId: evaluationId ?? null,
        metadata: { download: true },
      });


      // si ya tenemos el id de la evaluación, lo subimos al backend
      if (evaluationId) {
        await uploadTeacherReport(evaluationId, pdfBlob);

        auditAppend({
          type: "REPORT_PDF_UPLOADED",
          actor,
          evaluationId,
          metadata: { upload: true },
        });
      }
    } catch (error) {
      console.error("Error al generar o subir el PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const verdictStyle = getVerdictStyles(result.finalVerdict);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 font-sans">
      {/* --- HEADER ACTIONS (Floating Top) --- */}
      <div
        className="
          flex justify-end gap-3 
          sticky 
          top-24 md:top-28
          z-50 
          pointer-events-none 
          mt-6
        "
      >
        <div className="pointer-events-auto bg-[#0A0A0A]/90 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-xl flex gap-3 items-center">
          {/* Botón: Analizar otro candidato */}
          <button
            onClick={onReset}
            className="
              px-4 py-2 
              rounded-lg 
              text-xs font-bold uppercase tracking-wider 
              bg-white/5 text-gray-300 
              hover:bg-white/10 hover:text-white 
              transition-all
            "
          >
            Analizar otro candidato
          </button>

          {/* Botón: Exportar PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="
              flex items-center gap-2 
              px-4 py-2 
              bg-emerald-600 text-white 
              text-xs font-bold uppercase tracking-wider 
              rounded-lg 
              hover:bg-emerald-500 
              transition-colors 
              shadow-lg shadow-emerald-900/20 
              disabled:opacity-50 disabled:cursor-wait
            "
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

      <div
        id={REPORT_ELEMENT_ID}
        className="space-y-10 p-4 md:p-8 bg-[#020202]"
      >
        {/* --- HERO REPORT HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                Reporte Generado por IA
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              {interviewData.candidateName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
              {interviewData.program && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> {interviewData.program}
                </span>
              )}
              {interviewData.school && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {interviewData.school}
                  </span>
                </>
              )}
              {interviewData.age && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> {interviewData.age} años
                  </span>
                </>
              )}
            </div>
          </div>

          {/* VERDICT BADGE */}
          <div
            className={`px-6 py-4 rounded-2xl bg-gradient-to-br ${verdictStyle.bg} shadow-2xl flex items-center gap-4 min-w-[260px]`}
          >
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
              {verdictStyle.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-0.5">
                Veredicto Final
              </p>
              <p className="text-xl font-bold text-white leading-none">
                {result.finalVerdict}
              </p>
            </div>
          </div>
        </div>

        {/* --- KPI DASHBOARD (VISIÓN GENERAL) --- */}
        <DetailSection title="Resumen Cuantitativo">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Score Global"
              value={`${result.overallScore}/100`}
              icon={<PieChart className="w-5 h-5" />}
              trend="Puntaje ponderado de ajuste al rol"
            />
            <MetricCard
              label="Nivel de Riesgo"
              value={
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-sm border ${getRiskBadgeStyles(
                    result.overallRiskLevel
                  )}`}
                >
                  {result.overallRiskLevel}
                </span>
              }
              icon={<AlertTriangle className="w-5 h-5" />}
            />
            <MetricCard
              label="Ventana de Retención"
              value={result.resignationRiskWindow || "N/A"}
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

        {/* --- MAPA DE AJUSTE Y RESUMEN EJECUTIVO --- */}
        <DetailSection title="Mapa de Ajuste y Cohesión">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Gauge + barras */}
            <div className="space-y-6">
              <div className="flex justify-center py-4">
                <GaugeChart
                  value={result.overallScore}
                  label="Ajuste al Perfil"
                  size={220}
                />
              </div>
              <div className="mt-2 p-4 bg-[#121212] rounded-xl border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Distribución por Categoría
                </h4>
                <ComparativeBars categoryAnalyses={result.categoryAnalyses} />
              </div>
            </div>

            {/* Resumen ejecutivo IA */}
            <div className="bg-gradient-to-br from-[#121212] to-[#0A0A0A] border border-white/5 p-6 rounded-3xl h-full flex flex-col">
              <h4 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Resumen
                Ejecutivo IA
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed text-justify font-light">
                {result.executiveSummary}
              </p>
            </div>
          </div>
        </DetailSection>

        {/* --- ANÁLISIS DIMENSIONAL --- */}
        <DetailSection title="Análisis Dimensional Profundo">
          <div className="space-y-4">
            {result.categoryAnalyses.map((analysis) => (
              <div
                key={analysis.category}
                className="group bg-[#0A0A0A] border border-white/5 hover:border-emerald-500/30 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Cabecera de la dimensión */}
                <div className="p-5 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        analysis.score >= 80
                          ? "bg-emerald-500/10 text-emerald-400"
                          : analysis.score >= 60
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {Math.round(analysis.score)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200 text-lg">
                        {analysis.category}
                      </h4>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                        Análisis de profundidad por competencia
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono hidden sm:block">
                    ID: {analysis.category.substring(0, 3).toUpperCase()}
                  </div>
                </div>

                {/* Contenido de la dimensión */}
                <div className="p-5 grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600 mb-1">
                        Hallazgos Clave
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {analysis.reporteAnalitico}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-950/10 border border-emerald-500/10 rounded-lg">
                      <p className="text-xs font-bold uppercase text-emerald-600 mb-1">
                        Fortalezas Detectadas
                      </p>
                      <p className="text-xs text-gray-400">
                        {analysis.oportunidades}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 md:border-l md:border-white/5 md:pl-6">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600 mb-1">
                        Observación IA
                      </p>
                      <p className="text-sm text-gray-400 italic">
                        "{analysis.observacionesCorregidas}"
                      </p>
                    </div>
                    <div className="p-3 bg-amber-950/10 border border-amber-500/10 rounded-lg">
                      <p className="text-xs font-bold uppercase text-amber-600 mb-1">
                        Acción Recomendada
                      </p>
                      <p className="text-xs text-gray-400">
                        {analysis.recomendaciones}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>

        {/* --- STRATEGIC RECOMMENDATIONS --- */}
        <div className="grid md:grid-cols-2 gap-8 pt-2">
          <DetailSection title="Plan de Mitigación de Riesgos">
            {result.mitigationRecommendations.length > 0 ? (
              <ul className="space-y-3">
                {result.mitigationRecommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-gray-300 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-6">
                <CheckCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">
                  Perfil de bajo riesgo. No se requieren acciones urgentes.
                </p>
              </div>
            )}
          </DetailSection>

          <DetailSection title="Factores de Retención (Riesgo Temporal)">
            <div className="flex items-start gap-4 mb-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase">
                  Ventana Crítica
                </p>
                <p className="text-sm text-gray-200">
                  {result.resignationRiskWindow}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-gray-600 mb-2">
                Indicadores Detectados
              </p>
              {result.temporalRiskFactors &&
              result.temporalRiskFactors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.temporalRiskFactors.map((factor, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#1A1A1A] border border-white/10 rounded-full text-xs text-gray-400"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No se detectaron factores de corto plazo.
                </p>
              )}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
