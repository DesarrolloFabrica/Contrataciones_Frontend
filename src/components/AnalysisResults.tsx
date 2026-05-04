// src/components/AnalysisResults.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ShieldAlert,
  GraduationCap,
  Building2,
  Hash,
  Sparkles,
  Activity,
  BrainCircuit,
} from "lucide-react";

import { AnalysisResult, InterviewData } from "../types";
import GaugeChart from "./GaugeChart";
import ComparativeBars from "./ComparativeBars";
import { generateAnalysisPdfFromData } from "../services/pdfReport";
import { uploadTeacherReport } from "../services/teachersService";
import { auditAppend } from "../services/auditService";
import { actorFromUser } from "../services/auditActor";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import { StatCard } from "../features/leader/analysis-results/components/StatCard";
import { DimensionCard } from "../features/leader/analysis-results/components/DimensionCard";
import { getScoreDetails, getRiskBadgeStyles } from "../features/leader/analysis-results/utils/analysisResultStyles";
import { detectVerdictKind } from "../features/leader/analysis-results/utils/verdict";

// =========================================================
// ✅ PROPS
// =========================================================
type DetailTab = "ai" | "interviews" | "notes" | "decision";

interface AnalysisResultsProps {
  result: AnalysisResult;
  interviewData: InterviewData;
  onReset: () => void;
  evaluationId?: string;
  resetLabel?: string;
  showReset?: boolean;

  // ✅ NUEVO
  initialTab?: DetailTab;
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
  resetLabel = "Nuevo Análisis",
  showReset = true,
  initialTab,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [decisionExpanded, setDecisionExpanded] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [verdictExpanded, setVerdictExpanded] = useState(false);

  const brandFrom = "#91DC00";
  const brandTo = "#31AB2E";

  const roleRaw = (user as any)?.role;
  const roleNormalized = String(roleRaw ?? "").toLowerCase();
  const isLeader = roleNormalized === "leader" || roleNormalized === "lider";
  const scoreStyles = getScoreDetails(result.overallScore);

  const verdictKind = useMemo(
    () => detectVerdictKind(result.finalVerdict, result.overallScore),
    [result.finalVerdict, result.overallScore],
  );

  const verdictUI = useMemo(() => {
    const base = {
      border: "border-white/10",
      chip: "border-white/10 bg-white/[0.03] text-white/70",
      iconWrap: "bg-white/[0.04] border-white/10 text-white/70",
      accentLine: `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))`,
      glow: "bg-white/5",
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Decisión IA",
      label: result.finalVerdict || "Resultado",
    };

    if (verdictKind === "APPROVED") {
      return {
        ...base,
        chip: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
        iconWrap: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200",
        accentLine: `linear-gradient(90deg, rgba(145,220,0,0), ${brandFrom}, ${brandTo}, rgba(49,171,46,0))`,
        glow: "bg-emerald-500/10",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    }

    if (verdictKind === "REJECTED") {
      return {
        ...base,
        chip: "border-rose-500/20 bg-rose-500/10 text-rose-200",
        iconWrap: "bg-rose-500/10 border-rose-500/20 text-rose-200",
        accentLine: `linear-gradient(90deg, rgba(244,63,94,0), rgba(244,63,94,0.75), rgba(244,63,94,0))`,
        glow: "bg-rose-500/10",
        icon: <XCircle className="w-4 h-4" />,
      };
    }

    return base;
  }, [verdictKind, result.finalVerdict, brandFrom, brandTo]);

  useEffect(() => {
    if (!initialTab) return;

    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-anchor="${initialTab}"]`);
      if (el && "scrollIntoView" in el) {
        (el as any).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, [initialTab]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const actor = actorFromUser(user);
      const pdfBlob = await generateAnalysisPdfFromData(result, interviewData);

      // ✅ sin evaluationId en root (evita el TS error), lo mandamos por metadata
      auditAppend({
        type: "REPORT_PDF_DOWNLOADED",
        actor,
        metadata: { download: true, evaluationId: evaluationId ?? null },
      });

      if (evaluationId) {
        await uploadTeacherReport(evaluationId, pdfBlob);
        auditAppend({
          type: "REPORT_PDF_UPLOADED",
          actor,
          metadata: { upload: true, evaluationId },
        });
      }
    } catch (error) {
      console.error("Error PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={[
        "w-full min-h-screen font-sans pb-20",
        isDark
          ? "bg-[#020202] text-neutral-200 selection:bg-emerald-500/30 selection:text-emerald-200"
          : "bg-slate-50 text-slate-900 selection:bg-emerald-200/60 selection:text-slate-900",
      ].join(" ")}
    >
      {/* 1. TOP BAR (Sticky & Premium) */}
      <div className="sticky top-0 z-50">
        <div
          className={[
            "backdrop-blur-2xl border-b",
            isDark
              ? "bg-[#020202]/70 border-white/10"
              : "bg-white/80 border-slate-200",
          ].join(" ")}
        >
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center w-3 h-3">
                <div
                  className={`absolute w-full h-full rounded-full ${scoreStyles.bg.replace(
                    "/10",
                    "",
                  )} animate-ping opacity-40`}
                />
                <div
                  className={`relative w-2.5 h-2.5 rounded-full ${scoreStyles.bg.replace(
                    "/10",
                    "",
                  )}`}
                />
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={[
                    "hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest border",
                    isDark
                      ? "border-white/10 bg-white/[0.03] text-neutral-300"
                      : "border-emerald-100 bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  AI Análisis Completo
                </span>

                <span
                  className={`text-[11px] font-bold uppercase tracking-widest ${
                    isDark ? "text-neutral-500" : "text-slate-500"
                  }`}
                >
                  <span className="text-neutral-400">•</span>{" "}
                  {new Date().getFullYear()}
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {showReset && isLeader && (
                <button
                  onClick={onReset}
                  className={[
                    "inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest border transition",
                    isDark
                      ? "border-white/10 bg-white/[0.02] text-neutral-300 hover:bg-white/[0.05] hover:text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {resetLabel}
                </button>
              )}

              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="group relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-extrabold uppercase tracking-widest
                           border border-emerald-500/25 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-emerald-200
                           hover:from-emerald-500/25 hover:to-cyan-500/25 hover:border-emerald-400/40 transition
                           disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute -inset-x-24 -top-10 h-20 rotate-12 bg-white/10 blur-xl" />
                </div>

                {isDownloading ? (
                  <span className="text-emerald-400/90">Procesando…</span>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-400/90" />
                    <span className="text-emerald-400/90">Exportar reporte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        id={REPORT_ELEMENT_ID}
        data-anchor="ai"
        className="max-w-7xl mx-auto px-6 py-10 space-y-12"
      >
        {/* 2. HEADER HERO */}
        <div className="relative">
          {/* ✅ Menos gap y mejor balance */}
          <div
            className={[
              "grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start pb-8 border-b",
              isDark ? "border-white/5" : "border-slate-200",
            ].join(" ")}
          >
            {/* Left */}
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    isDark
                      ? "bg-white/5 text-neutral-400 border-white/10"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}
                >
                  Candidato
                </span>
                {evaluationId && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-600">
                    <Hash className="w-3 h-3" /> {evaluationId.slice(0, 8)}
                  </span>
                )}
              </div>

              {/* ✅ Nombre controlado (no gigante) */}
              <h1
                className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.02] break-words ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {interviewData.candidateName}
              </h1>

              <div
                className={`flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium ${
                  isDark ? "text-neutral-400" : "text-slate-600"
                }`}
              >
                {interviewData.program && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                    <span>{interviewData.program}</span>
                  </div>
                )}
                {interviewData.school && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>{interviewData.school}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Decision card (neutral, con acento) */}
            <div className="relative w-full">
              <div
                className={[
                  "group relative overflow-hidden rounded-[22px] backdrop-blur-xl shadow-[0_20px_60px_-35px_rgba(0,0,0,0.5)] border transition",
                  isDark
                    ? "border-white/10 bg-white/[0.02] hover:border-white/15"
                    : "border-slate-200 bg-white hover:border-emerald-200",
                ].join(" ")}
              >
                {/* accent line */}
                <div
                  className="h-[2px] w-full opacity-60 group-hover:opacity-95 transition-opacity"
                  style={{ background: verdictUI.accentLine }}
                />

                <div className="px-6 py-5">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${
                        isDark ? "text-white/55" : "text-slate-500"
                      }`}
                    >
                      Decisión IA
                    </p>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold border ${verdictUI.chip}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            verdictKind === "APPROVED"
                              ? "bg-emerald-400/80"
                              : verdictKind === "REJECTED"
                                ? "bg-rose-400/80"
                                : "bg-white/50"
                          }`}
                        />
                        {verdictKind === "APPROVED"
                          ? "Recomendado"
                          : verdictKind === "REJECTED"
                            ? "No recomendado"
                            : "En revisión"}
                      </span>

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold border ${getRiskBadgeStyles(
                          result.overallRiskLevel,
                        )}`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5 opacity-80" />
                        {result.overallRiskLevel || "Riesgo N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Content row */}
                  <div className="mt-4 flex items-start gap-4">
                    {/* icon */}
                    <div className="shrink-0">
                      <div
                        className={`h-9 w-9 rounded-xl border flex items-center justify-center ${verdictUI.iconWrap}`}
                      >
                        {verdictKind === "REJECTED" ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                      </div>
                    </div>

                    {/* text */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-extrabold leading-6 ${
                          isDark ? "text-white/90" : "text-slate-900"
                        } ${
                          verdictExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        {result.finalVerdict}
                      </p>

                      {/* footer row aligned */}
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p
                          className={`text-xs leading-relaxed ${
                            isDark ? "text-white/45" : "text-slate-500"
                          }`}
                        >
                          {verdictKind === "REJECTED"
                            ? "Recomendación: no continuar el proceso. Requiere mejoras antes de una nueva evaluación."
                            : verdictKind === "APPROVED"
                              ? "Recomendación: continuar el proceso. Validar evidencias y referencias en la siguiente fase."
                              : "Recomendación: revisar el reporte y validar evidencia antes de decidir."}
                        </p>

                        <button
                          type="button"
                          onClick={() => setVerdictExpanded((v) => !v)}
                          className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest border transition
                                      ${
                                        isDark
                                          ? "border-white/15 bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:text-white"
                                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                      }`}
                          aria-expanded={verdictExpanded}
                        >
                          {verdictExpanded ? "Ver menos" : "Ver más"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. KPI GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Global Score"
            icon={<Activity className="w-4 h-4" />}
            value={
              <span className={`${scoreStyles.color}`}>
                {result.overallScore}
                <span className="text-sm text-neutral-600 ml-1">/100</span>
              </span>
            }
            sub="Promedio Ponderado"
          />

          <StatCard
            label="Nivel de Riesgo"
            icon={<ShieldAlert className="w-4 h-4" />}
            value={
              <span
                className={`inline-flex px-2 py-0.5 text-sm rounded border ${getRiskBadgeStyles(result.overallRiskLevel)}`}
              >
                {result.overallRiskLevel}
              </span>
            }
          />

          <StatCard
            label="Retención Est."
            icon={<Clock className="w-4 h-4" />}
            value={result.resignationRiskWindow || "N/A"}
            sub="Ventana Crítica"
          />

          <StatCard
            label="Coherencia"
            icon={<BrainCircuit className="w-4 h-4" />}
            value="Alta"
            sub="Análisis Semántico"
          />
        </div>

        {/* 4. MAIN ANALYTICS LAYOUT */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-4 space-y-6">
            <div
              className={[
                "rounded-3xl p-8 flex flex-col items-center relative overflow-hidden border",
                isDark
                  ? "bg-[#0A0A0A] border-white/5"
                  : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
              ].join(" ")}
            >
              {isDark && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              )}
              <h3
                className={`text-xs font-bold uppercase tracking-widest mb-6 relative z-10 ${
                  isDark ? "text-neutral-400" : "text-slate-600"
                }`}
              >
                Ajuste al Perfil
              </h3>
              <div className="relative z-10 scale-110">
                <GaugeChart value={result.overallScore} label="" size={200} />
              </div>
              <div
                data-anchor="interviews"
                className="w-full mt-8 pt-6 border-t border-white/5 relative z-10"
              >
                <ComparativeBars categoryAnalyses={result.categoryAnalyses} />
              </div>
            </div>

            <div
              className={[
                "rounded-3xl p-6 border",
                isDark
                  ? "bg-[#0A0A0A] border-white/5"
                  : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3
                  className={`text-sm font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Alertas & Mitigación
                </h3>
              </div>

              {result.mitigationRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {result.mitigationRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 items-start p-3 rounded-xl border ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p
                        className={`text-xs leading-relaxed ${
                          isDark ? "text-neutral-400" : "text-slate-600"
                        }`}
                      >
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2
                    className={`w-8 h-8 mx-auto mb-2 ${
                      isDark ? "text-neutral-700" : "text-emerald-500"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      isDark ? "text-neutral-500" : "text-slate-600"
                    }`}
                  >
                    Sin riesgos críticos detectados.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8 space-y-8">
            <div
              className={[
                "rounded-3xl p-8 relative overflow-hidden border",
                isDark
                  ? "bg-gradient-to-br from-[#0F0F0F] to-[#050505] border-white/5"
                  : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
              ].join(" ")}
            >
              {isDark && (
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
              )}

              <div className="flex items-center gap-2 mb-6 text-emerald-400 relative z-10">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  Resumen Ejecutivo de IA
                </h3>
              </div>

              <div className="prose prose-sm max-w-none relative z-10">
                <p
                  className={`text-sm leading-7 font-light text-justify ${
                    isDark ? "text-neutral-300" : "text-slate-700"
                  }`}
                >
                  {result.executiveSummary}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-sm font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  <Target className="w-4 h-4 text-neutral-500" />
                  Análisis Dimensional
                </h3>
                <span
                  className={`text-[10px] font-mono ${
                    isDark ? "text-neutral-600" : "text-slate-500"
                  }`}
                >
                  5 DIMENSIONES ANALIZADAS
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {result.categoryAnalyses.map((cat) => (
                  <DimensionCard key={cat.category} cat={cat} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand tiny note (optional visual cohesion) */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 h-[1px] opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent, ${brandFrom}, ${brandTo}, transparent)`,
        }}
      />
    </div>
  );
};

export default AnalysisResults;
