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

type DetailTab = "ai" | "interviews" | "notes" | "decision";

interface AnalysisResultsProps {
  result: AnalysisResult;
  interviewData: InterviewData;
  onReset: () => void;
  evaluationId?: string;
  resetLabel?: string;
  showReset?: boolean;
  initialTab?: DetailTab;
}

const REPORT_ELEMENT_ID = "report-to-download";

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  interviewData,
  onReset,
  evaluationId,
  resetLabel = "Nuevo Analisis",
  showReset = true,
  initialTab,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [verdictExpanded, setVerdictExpanded] = useState(false);

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
      border: isDark ? "border-white/[0.08]" : "border-slate-200",
      chip: isDark
        ? "border-white/10 bg-white/[0.03] text-slate-300"
        : "border-slate-200 bg-slate-50 text-slate-600",
      iconWrap: isDark
        ? "bg-white/[0.04] border-white/10 text-slate-300"
        : "bg-slate-100 border-slate-200 text-slate-600",
      glow: isDark ? "bg-white/5" : "bg-slate-50",
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: result.finalVerdict || "Resultado",
    };

    if (verdictKind === "APPROVED") {
      return {
        ...base,
        chip: isDark
          ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-200"
          : "border-cyan-200 bg-cyan-50 text-cyan-700",
        iconWrap: isDark
          ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300"
          : "bg-cyan-50 border-cyan-200 text-cyan-600",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    }

    if (verdictKind === "REJECTED") {
      return {
        ...base,
        chip: isDark
          ? "border-rose-500/25 bg-rose-500/10 text-rose-200"
          : "border-rose-200 bg-rose-50 text-rose-700",
        iconWrap: isDark
          ? "bg-rose-500/10 border-rose-500/25 text-rose-300"
          : "bg-rose-50 border-rose-200 text-rose-600",
        icon: <XCircle className="w-4 h-4" />,
      };
    }

    return base;
  }, [verdictKind, result.finalVerdict, isDark]);

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
        "relative w-full font-sans pb-20",
        isDark
          ? "text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200"
          : "text-slate-900 selection:bg-cyan-200/60 selection:text-slate-900",
      ].join(" ")}
    >
      {isDark && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-28 -left-28 w-[480px] h-[480px] rounded-full bg-cyan-500/8 blur-[120px]" />
          <div className="absolute top-[28%] -right-28 w-[420px] h-[420px] rounded-full bg-blue-500/8 blur-[120px]" />
          <div className="absolute bottom-[-160px] left-1/3 w-[520px] h-[520px] rounded-full bg-cyan-500/6 blur-[140px]" />
        </div>
      )}

      {/* 1. TOP BAR */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div
          className={[
            "relative rounded-3xl border backdrop-blur-sm overflow-hidden",
            isDark
              ? "bg-[#0B1220]/55 border-white/[0.08] shadow-[0_14px_50px_-24px_rgba(6,182,212,0.35)]"
              : "bg-white/90 border-slate-200 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.18)]",
          ].join(" ")}
        >
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          <div className="px-5 md:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center w-3 h-3">
                <div
                  className={`absolute w-full h-full rounded-full ${scoreStyles.bg.replace("/10", "")} animate-ping opacity-40`}
                />
                <div
                  className={`relative w-2.5 h-2.5 rounded-full ${scoreStyles.bg.replace("/10", "")}`}
                />
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={[
                    "hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest border",
                    isDark
                      ? "border-white/[0.08] bg-white/[0.03] text-slate-300"
                      : "border-cyan-100 bg-cyan-50 text-cyan-700",
                  ].join(" ")}
                >
                  AI Analisis Completo
                </span>

                <span
                  className={`text-[11px] font-bold uppercase tracking-widest ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  <span className={isDark ? "text-slate-600" : "text-slate-300"}>·</span>{" "}
                  {new Date().getFullYear()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showReset && isLeader && (
                <button
                  onClick={onReset}
                  className={[
                    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest border transition-all duration-200",
                    isDark
                      ? "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:bg-white/[0.06] hover:text-white hover:border-white/[0.15]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300",
                  ].join(" ")}
                >
                  {resetLabel}
                </button>
              )}

              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className={[
                  "group relative inline-flex items-center gap-2 rounded-xl px-5 py-2 text-[11px] font-extrabold uppercase tracking-widest border transition-all duration-300 overflow-hidden",
                  isDark
                    ? "border-cyan-500/25 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 hover:from-cyan-500/25 hover:to-blue-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_24px_-6px_rgba(6,182,212,0.3)]"
                    : "border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-300",
                  isDownloading ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute -inset-x-24 -top-10 h-20 rotate-12 bg-cyan-500/10 blur-xl" />
                </div>

                {isDownloading ? (
                  <span className={isDark ? "text-cyan-400/70" : "text-cyan-600/70"}>Procesando...</span>
                ) : (
                  <>
                    <Download className={`w-4 h-4 ${isDark ? "text-cyan-400/90" : "text-cyan-600"}`} />
                    <span>Exportar reporte</span>
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
        className="max-w-7xl mx-auto px-6 pt-6 pb-10 space-y-8"
      >
        {/* 2. HEADER HERO */}
        <div
          className={[
            "relative rounded-3xl border p-5 md:p-7 backdrop-blur-sm",
            isDark
              ? "bg-[#0B1220]/55 border-white/[0.08] shadow-[0_14px_50px_-24px_rgba(6,182,212,0.35)]"
              : "bg-white/90 border-slate-200 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.18)]",
          ].join(" ")}
        >
          <div
            className={[
              "grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start",
            ].join(" ")}
          >
            {/* Left */}
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    isDark
                      ? "bg-white/[0.04] text-slate-400 border-white/[0.08]"
                      : "bg-cyan-50 text-cyan-700 border-cyan-200"
                  }`}
                >
                  Candidato
                </span>
                {evaluationId && (
                  <span className={`flex items-center gap-1 text-[10px] font-mono ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    <Hash className="w-3 h-3" /> {evaluationId.slice(0, 8)}
                  </span>
                )}
              </div>

              <h1
                className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.02] break-words drop-shadow-[0_2px_10px_rgba(2,6,23,0.4)] ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {interviewData.candidateName}
              </h1>

              <div
                className={`flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {interviewData.program && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-500" />
                    <span>{interviewData.program}</span>
                  </div>
                )}
                {interviewData.school && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-500" />
                    <span>{interviewData.school}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Decision card */}
            <div className="relative w-full">
              <div
                className={[
                  "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                  isDark
                    ? "border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent hover:border-white/[0.12] shadow-[0_0_40px_-12px_rgba(6,182,212,0.06)]"
                    : "border-slate-200 bg-white hover:border-cyan-200 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.08)]",
                ].join(" ")}
              >
                {/* accent line */}
                <div
                  className={`h-[2px] w-full opacity-50 group-hover:opacity-100 transition-opacity ${
                    verdictKind === "APPROVED"
                      ? "bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                      : verdictKind === "REJECTED"
                        ? "bg-gradient-to-r from-transparent via-rose-500 to-transparent"
                        : "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  }`}
                />

                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Decision IA
                    </p>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold border ${verdictUI.chip}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            verdictKind === "APPROVED"
                              ? "bg-cyan-400"
                              : verdictKind === "REJECTED"
                                ? "bg-rose-400"
                                : "bg-slate-400"
                          }`}
                        />
                        {verdictKind === "APPROVED"
                          ? "Recomendado"
                          : verdictKind === "REJECTED"
                            ? "No recomendado"
                            : "En revision"}
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

                  <div className="mt-4 flex items-start gap-4">
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

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-bold leading-6 ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        } ${verdictExpanded ? "" : "line-clamp-3"}`}
                      >
                        {result.finalVerdict}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p
                          className={`text-xs leading-relaxed ${
                            isDark ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          {verdictKind === "REJECTED"
                            ? "Recomendacion: no continuar el proceso. Requiere mejoras antes de una nueva evaluacion."
                            : verdictKind === "APPROVED"
                              ? "Recomendacion: continuar el proceso. Validar evidencias y referencias en la siguiente fase."
                              : "Recomendacion: revisar el reporte y validar evidencia antes de decidir."}
                        </p>

                        <button
                          type="button"
                          onClick={() => setVerdictExpanded((v) => !v)}
                          className={`shrink-0 rounded-xl px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest border transition-all duration-200 ${
                            isDark
                              ? "border-white/[0.1] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white hover:border-white/[0.2]"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                          }`}
                          aria-expanded={verdictExpanded}
                        >
                          {verdictExpanded ? "Ver menos" : "Ver mas"}
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
        <div
          className={[
            "rounded-3xl border p-4 md:p-5 backdrop-blur-sm",
            isDark
              ? "bg-[#0B1220]/50 border-white/[0.08] shadow-[0_16px_50px_-30px_rgba(6,182,212,0.35)]"
              : "bg-white/90 border-slate-200 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.18)]",
          ].join(" ")}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Global Score"
              icon={<Activity className="w-4 h-4" />}
              value={
                <span className={`${scoreStyles.color}`}>
                  {result.overallScore}
                  <span className={`text-sm ml-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>/100</span>
                </span>
              }
              sub="Promedio Ponderado"
            />

            <StatCard
              label="Nivel de Riesgo"
              icon={<ShieldAlert className="w-4 h-4" />}
              value={
                <span
                  className={`inline-flex px-2.5 py-0.5 text-sm font-bold rounded-lg border ${getRiskBadgeStyles(result.overallRiskLevel)}`}
                >
                  {result.overallRiskLevel}
                </span>
              }
            />

            <StatCard
              label="Retencion Est."
              icon={<Clock className="w-4 h-4" />}
              value={result.resignationRiskWindow || "N/A"}
              sub="Ventana Critica"
            />

            <StatCard
              label="Coherencia"
              icon={<BrainCircuit className="w-4 h-4" />}
              value="Alta"
              sub="Analisis Semantico"
            />
          </div>
        </div>

        {/* 4. MAIN ANALYTICS LAYOUT */}
        <div
          className={[
            "rounded-3xl border p-4 md:p-6 backdrop-blur-sm",
            isDark
              ? "bg-[#0B1220]/45 border-white/[0.08] shadow-[0_20px_60px_-36px_rgba(6,182,212,0.4)]"
              : "bg-white/90 border-slate-200 shadow-[0_18px_44px_-22px_rgba(15,23,42,0.2)]",
          ].join(" ")}
        >
          <div className="grid lg:grid-cols-12 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-4 space-y-6">
            <div
              className={[
                "rounded-2xl p-8 flex flex-col items-center relative overflow-hidden border transition-all duration-300",
                isDark
                  ? "bg-gradient-to-b from-white/[0.02] to-transparent border-white/[0.06] hover:border-white/[0.1]"
                  : "bg-white border-slate-200 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.08)]",
              ].join(" ")}
            >
              {isDark && (
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
              )}
              <h3
                className={`text-[11px] font-bold uppercase tracking-[0.18em] mb-6 relative z-10 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Ajuste al Perfil
              </h3>
              <div className="relative z-10 scale-110">
                <GaugeChart value={result.overallScore} label="" size={200} />
              </div>
              <div
                data-anchor="interviews"
                className={`w-full mt-8 pt-6 border-t relative z-10 ${
                  isDark ? "border-white/[0.06]" : "border-slate-100"
                }`}
              >
                <ComparativeBars categoryAnalyses={result.categoryAnalyses} />
              </div>
            </div>

            <div
              className={[
                "rounded-2xl p-6 border transition-all duration-300",
                isDark
                  ? "bg-gradient-to-b from-white/[0.02] to-transparent border-white/[0.06] hover:border-white/[0.1]"
                  : "bg-white border-slate-200 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.08)]",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "bg-amber-500/10 text-amber-400"
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
                  Alertas & Mitigacion
                </h3>
              </div>

              {result.mitigationRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {result.mitigationRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 items-start p-3 rounded-xl border transition-colors ${
                        isDark
                          ? "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center mt-0.5 ${
                        isDark
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          : "bg-amber-100 text-amber-600 border border-amber-200"
                      }`}>
                        {i + 1}
                      </span>
                      <p
                        className={`text-xs leading-relaxed ${
                          isDark ? "text-slate-400" : "text-slate-600"
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
                      isDark ? "text-cyan-500/40" : "text-cyan-400"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    Sin criticos detectados.
                  </p>
                </div>
              )}
            </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-8 space-y-8">
            <div
              className={[
                "rounded-2xl p-8 relative overflow-hidden border transition-all duration-300",
                isDark
                  ? "bg-gradient-to-br from-white/[0.02] to-transparent border-white/[0.06] hover:border-white/[0.1]"
                  : "bg-white border-slate-200 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.08)]",
              ].join(" ")}
            >
              {isDark && (
                <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
              )}

              <div className={`flex items-center gap-2 mb-6 relative z-10 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                <Sparkles className="w-4 h-4" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]">
                  Resumen Ejecutivo de IA
                </h3>
              </div>

              <div className="prose prose-sm max-w-none relative z-10">
                <p
                  className={`text-sm leading-7 text-justify ${
                    isDark ? "text-slate-300" : "text-slate-600"
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
                  <Target className={`w-4 h-4 ${isDark ? "text-cyan-500" : "text-cyan-600"}`} />
                  Analisis Dimensional
                </h3>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isDark ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  5 dimensiones analizadas
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
      </div>

      {/* Bottom accent line */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 h-px opacity-30"
        style={{
          background: "linear-gradient(90deg, transparent, #06b6d4, #3b82f6, transparent)",
        }}
      />
    </div>
  );
};

export default AnalysisResults;
