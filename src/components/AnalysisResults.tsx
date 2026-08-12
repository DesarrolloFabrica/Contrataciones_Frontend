// src/components/AnalysisResults.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  GraduationCap,
  Building2,
  Sparkles,
  Activity,
  BrainCircuit,
  IdCard,
  Calendar,
  ArrowLeft,
  UserRound,
} from "lucide-react";

import { AnalysisResult, InterviewData } from "../types";
import { generateAnalysisPdfFromData } from "../services/pdfReport";
import { uploadTeacherReport } from "../services/teachersService";
import { auditAppend } from "../services/auditService";
import { actorFromUser } from "../services/auditActor";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import { DimensionCard } from "../features/leader/analysis-results/components/DimensionCard";
import { getRiskBadgeStyles } from "../features/leader/analysis-results/utils/analysisResultStyles";
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

const ROLE_AVERAGES: Record<string, number> = {
  "Experiencia y trayectoria": 70,
  "Pedagogía": 75,
  "Uso de IA": 68,
  "Ética y escenarios": 72,
  "Disponibilidad y Condiciones": 65,
  "Manejo de Aula": 75,
  "Actitud Frente a la IA": 80,
  "Coherencia y Compromiso": 70,
};

function ScoreRing({ value, size = 72 }: { value: number; size?: number }) {
  const score = Math.min(100, Math.max(0, Number(value) || 0));
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-white/10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  interviewData,
  onReset,
  evaluationId,
  resetLabel = "Volver",
  showReset = true,
  initialTab,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [verdictExpanded, setVerdictExpanded] = useState(false);
  const [openDimension, setOpenDimension] = useState<string | null>(
    () => result.categoryAnalyses?.[0]?.category ?? null,
  );
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const roleRaw = (user as any)?.role;
  const roleNormalized = String(roleRaw ?? "").toLowerCase();
  const isLeader = roleNormalized === "leader" || roleNormalized === "lider";

  const verdictKind = useMemo(
    () => detectVerdictKind(result.finalVerdict, result.overallScore),
    [result.finalVerdict, result.overallScore],
  );

  const card = isDark
    ? "border-white/[0.08] bg-[#11181c]"
    : "border-slate-200 bg-white";

  const initials = useMemo(() => {
    const parts = String(interviewData.candidateName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "C";
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }, [interviewData.candidateName]);

  useEffect(() => {
    if (!initialTab) return;
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-anchor="${initialTab}"]`);
      if (el && "scrollIntoView" in el) {
        (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
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
      id={REPORT_ELEMENT_ID}
      data-anchor="ai"
      className={`relative w-full space-y-4 pb-6 font-sans ${isDark ? "text-slate-200" : "text-slate-900"}`}
    >
      {/* Top actions */}
      <div className="flex items-center justify-between gap-3">
        {showReset && isLeader ? (
          <button
            type="button"
            onClick={onReset}
            className={[
              "inline-flex items-center gap-1.5 text-sm font-medium transition",
              isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800",
            ].join(" ")}
          >
            <ArrowLeft className="h-4 w-4" />
            {resetLabel === "Nuevo analisis" ? "Volver" : resetLabel}
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition",
            isDark
              ? "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
              : "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
            isDownloading ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
        >
          <Download className="h-3.5 w-3.5" />
          {isDownloading ? "Procesando..." : "Exportar reporte"}
        </button>
      </div>

      {/* Header: candidate + decision/score */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.9fr)]">
        <section className={`rounded-2xl border p-4 md:p-5 ${card}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Candidato
          </p>

          <div className="mt-3 flex items-start gap-4">
            <div
              className={[
                "relative flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl border",
                isDark
                  ? "border-emerald-400/25 bg-gradient-to-br from-emerald-500/20 to-teal-900/40 text-emerald-100"
                  : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-800",
              ].join(" ")}
            >
              <span className="text-lg font-bold tracking-wide">{initials}</span>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className={`text-xl font-bold leading-tight tracking-tight md:text-[1.35rem] ${isDark ? "text-white" : "text-slate-900"}`}>
                {interviewData.candidateName}
              </h1>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                { key: "doc", label: "Documento", value: interviewData.documentNumber || "—", icon: IdCard },
                { key: "age", label: "Edad", value: interviewData.age ? `${interviewData.age} años` : "—", icon: Calendar },
                { key: "program", label: "Programa", value: interviewData.program || "—", icon: GraduationCap },
                { key: "school", label: "Escuela", value: interviewData.school || "—", icon: Building2 },
              ] as const
            ).map(({ key, label, value, icon: MetaIcon }) => (
              <div
                key={key}
                className={[
                  "min-w-0 rounded-xl border px-3 py-2.5",
                  isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-100 bg-slate-50",
                ].join(" ")}
              >
                <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <MetaIcon className="h-3 w-3 shrink-0 text-emerald-500" />
                  {label}
                </div>
                <p
                  className={`truncate text-[12px] font-semibold leading-4 ${isDark ? "text-slate-200" : "text-slate-800"}`}
                  title={String(value)}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={`rounded-2xl border p-4 md:p-5 ${card}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Decision IA
              </p>
              <div className="mt-3 flex items-start gap-2.5">
                <div
                  className={[
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    verdictKind === "REJECTED"
                      ? isDark
                        ? "bg-rose-500/15 text-rose-300"
                        : "bg-rose-50 text-rose-600"
                      : isDark
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  {verdictKind === "REJECTED" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold leading-6 ${isDark ? "text-white" : "text-slate-900"} ${
                      verdictExpanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {result.finalVerdict || "Sin veredicto"}
                  </p>
                  {String(result.finalVerdict || "").length > 120 && (
                    <button
                      type="button"
                      onClick={() => setVerdictExpanded((v) => !v)}
                      className={`mt-1.5 text-[11px] font-semibold ${
                        isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-700 hover:text-emerald-800"
                      }`}
                    >
                      {verdictExpanded ? "Ver menos" : "Ver mas"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="relative shrink-0">
              <ScoreRing value={result.overallScore} size={78} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg font-bold leading-none ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  {Math.round(result.overallScore)}
                </span>
                <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>/ 100</span>
              </div>
            </div>
          </div>
          <p className={`mt-3 text-[10px] font-medium uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Score global
          </p>
        </section>
      </div>

      {/* Executive summary */}
      <section className={`rounded-2xl border px-4 py-4 md:px-5 ${card}`}>
        <div className={`mb-2 flex items-center gap-1.5 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
          <Sparkles className="h-3.5 w-3.5" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em]">
            Resumen ejecutivo de IA
          </h2>
        </div>
        <p
          className={`text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"} ${
            summaryExpanded ? "" : "line-clamp-3"
          }`}
        >
          {result.executiveSummary}
        </p>
        {String(result.executiveSummary || "").length > 180 && (
          <button
            type="button"
            onClick={() => setSummaryExpanded((v) => !v)}
            className={`mt-2 text-[11px] font-semibold ${
              isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-700 hover:text-emerald-800"
            }`}
          >
            {summaryExpanded ? "Ver menos" : "Leer resumen completo"}
          </button>
        )}
      </section>

      {/* Body: dimensiones + sidebar */}
      <div
        className={[
          "grid items-stretch overflow-hidden rounded-2xl border lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]",
          isDark ? "border-white/[0.08] bg-[#0c1418]/70" : "border-slate-200 bg-white",
        ].join(" ")}
        data-anchor="interviews"
      >
        <section
          className={[
            "flex h-full flex-col gap-3 p-4 md:p-5",
            isDark ? "lg:border-r lg:border-white/[0.08]" : "lg:border-r lg:border-slate-200",
          ].join(" ")}
        >
          <div className="flex items-end justify-between gap-2">
            <h2 className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Analisis dimensional
            </h2>
            <span className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              {result.categoryAnalyses?.length ?? 0} dimensiones · una a la vez
            </span>
          </div>

          <div
            className={[
              "overflow-hidden rounded-xl border",
              isDark ? "border-white/[0.08] bg-[#0f171b]" : "border-slate-200 bg-white",
            ].join(" ")}
          >
            {result.categoryAnalyses.map((cat, idx) => {
              const key = String(cat.category);
              const isOpen = openDimension === key;
              return (
                <DimensionCard
                  key={key}
                  cat={cat}
                  roleAverage={ROLE_AVERAGES[cat.category] ?? 72}
                  open={isOpen}
                  isFirst={idx === 0}
                  isLast={idx === result.categoryAnalyses.length - 1}
                  onToggle={() => setOpenDimension((prev) => (prev === key ? null : key))}
                />
              );
            })}
          </div>
        </section>

        <aside
          className={[
            "flex h-full flex-col gap-3 p-4 md:p-5 lg:min-h-full",
            isDark ? "bg-white/[0.02]" : "bg-slate-50/70",
          ].join(" ")}
        >
          <section className={`rounded-xl border p-4 ${card}`}>
            <h3 className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Resumen de la evaluacion
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  Score global
                </span>
                <span className={`text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  {Math.round(result.overallScore)} / 100
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <ShieldAlert className="h-3.5 w-3.5 text-emerald-500" />
                  Nivel de riesgo
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getRiskBadgeStyles(
                    result.overallRiskLevel,
                    isDark,
                  )}`}
                >
                  {result.overallRiskLevel || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  Retencion est.
                </span>
                <span className={`text-right text-xs font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                  {result.resignationRiskWindow || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <BrainCircuit className="h-3.5 w-3.5 text-emerald-500" />
                  Coherencia
                </span>
                <span className={`text-xs font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Alta</span>
              </div>
            </div>
          </section>

          <section className={`rounded-xl border p-4 ${card}`}>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className={`h-3.5 w-3.5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
              <h3 className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Alertas y mitigacion
              </h3>
            </div>

            {result.mitigationRecommendations?.length > 0 ? (
              <div className="space-y-2.5">
                {result.mitigationRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}
                  >
                    <div className="mb-1 flex items-start gap-2">
                      <span
                        className={[
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          isDark
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-amber-100 text-amber-700",
                        ].join(" ")}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                          Mitigacion {i + 1}
                        </p>
                        <p className={`mt-1 text-[11px] leading-5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {rec}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1">
                <CheckCircle2 className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Sin alertas criticas detectadas.
                </p>
              </div>
            )}
          </section>

          <p className={`flex items-center gap-1.5 px-1 text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            <UserRound className="h-3 w-3" />
            Ultima actualizacion · {new Date().toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </aside>
      </div>
    </div>
  );
};

export default AnalysisResults;
