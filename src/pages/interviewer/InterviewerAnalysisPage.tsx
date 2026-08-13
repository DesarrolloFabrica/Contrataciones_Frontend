import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Download,
  Loader2,
  MessageSquareQuote,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LeaderAmbientDecor } from "../../features/leader/components/LeaderAmbientDecor";
import { LeaderModeHeader } from "../../features/leader/components/LeaderModeHeader";
import { LeaderWorkspaceSidebar } from "../../features/leader/components/LeaderWorkspaceSidebar";
import {
  IA_DISCLAIMER,
  analysisStatusLabel,
  attentionPoints,
  evidenceClassificationLabel,
  formatConfidence,
  isAnalysisBusy,
} from "../../features/interviews/analysisLabels";
import { generateCharlaInterviewAnalysisPdf } from "../../features/interviews/charlasAnalysisPdf";
import { getInterview } from "../../features/interviews/interviewsApi";
import { interviewStatusLabel } from "../../features/interviews/types";
import {
  getInterviewAnalysis,
  requestInterviewAnalysis,
  retryIntelligenceJob,
} from "../../features/intelligence/intelligenceApi";
import type {
  CompetencyAssessment,
  IntelligenceEvidence,
  InterviewAnalysisOutput,
} from "../../features/intelligence/types";
import { getProcessAccess } from "../../features/product/productApi";
import {
  apiErrorMessage,
  formatDate,
  intelligenceUnavailableMessage,
} from "../../features/vacancies/formatters";
import { cn } from "../../utils/cn";

/**
 * Página de análisis IA — jerarquía tipo dashboard (referencia legacy),
 * con superficies claras CHARLAS. Sin decisión automática de contratación.
 */
export default function InterviewerAnalysisPage() {
  const { interviewId = "" } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [showEvidence, setShowEvidence] = useState(false);
  const [openCompetency, setOpenCompetency] = useState<number | null>(0);
  const [openEvidence, setOpenEvidence] = useState<string | null>(null);
  const [coherenceOpen, setCoherenceOpen] = useState(false);
  const [conclusionOpen, setConclusionOpen] = useState(false);

  const interviewQuery = useQuery({
    queryKey: ["charlas-interview", interviewId],
    queryFn: () => getInterview(interviewId),
    enabled: Boolean(interviewId),
  });
  const interview = interviewQuery.data;
  const processId = interview?.application.selectionProcess.id;

  const access = useQuery({
    queryKey: ["charlas-process-access", processId],
    queryFn: () => getProcessAccess(processId!),
    enabled: Boolean(processId),
  });

  const canRead = access.data?.effectiveCapabilities.includes("intelligence.read") ?? false;
  const canGenerate = access.data?.effectiveCapabilities.includes("intelligence.generate") ?? false;
  const canRegenerate =
    access.data?.effectiveCapabilities.includes("intelligence.regenerate") ?? false;

  const analysisQuery = useQuery({
    queryKey: ["charlas-interview-analysis", interviewId],
    queryFn: () => getInterviewAnalysis(interviewId),
    enabled: Boolean(interviewId) && canRead,
    refetchInterval: (query) =>
      ["PENDING", "PROCESSING"].includes(query.state.data?.status ?? "") ||
      ["PENDING", "PROCESSING"].includes(query.state.data?.job?.status ?? "")
        ? 2500
        : false,
  });

  const analysis = analysisQuery.data;
  const busy = isAnalysisBusy(analysis);
  const output = analysis?.output ?? null;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["charlas-interview-analysis", interviewId] });

  const requestAnalysis = useMutation({
    mutationFn: (force: boolean) => requestInterviewAnalysis(interviewId, force),
    onSuccess: () => {
      setActionError(null);
      invalidate();
    },
    onError: (error) => setActionError(intelligenceUnavailableMessage() || apiErrorMessage(error)),
  });
  const retryAnalysis = useMutation({
    mutationFn: retryIntelligenceJob,
    onSuccess: () => {
      setActionError(null);
      invalidate();
    },
    onError: () => setActionError(intelligenceUnavailableMessage()),
  });

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/login";
  }, [logout]);

  const goLeader = useCallback(
    (mode: "analyze" | "history") => {
      navigate(mode === "history" ? "/leader?view=history" : "/leader");
    },
    [navigate],
  );

  const handlePdf = async () => {
    if (!interview || !analysis?.output) return;
    setPdfBusy(true);
    try {
      await generateCharlaInterviewAnalysisPdf({ interview, analysis });
    } catch {
      setActionError("No se pudo generar el PDF del análisis.");
    } finally {
      setPdfBusy(false);
    }
  };

  const vacancy = interview?.application.selectionProcess.vacancyReference;
  const score = analysis?.scoring?.overallScore;
  const scoringUnavailable =
    analysis != null &&
    (analysis.scoring?.status === "INSUFFICIENT_SCORING_CONFIGURATION" ||
      analysis.scoring?.overallScore == null);
  const confidence = formatConfidence(output?.confidence ?? analysis?.scoring?.confidence);
  const attention = attentionPoints(output);
  const strengths = output?.strengths ?? [];
  const evidenceCounts = useMemo(() => countEvidence(output), [output]);

  return (
    <div
      className={cn(
        "relative flex h-[100dvh] w-full flex-col overflow-hidden font-sans",
        isDark ? "bg-[#071214] text-white" : "bg-[#f7faf9] text-slate-900",
      )}
    >
      <div className="relative z-20 flex min-h-0 flex-1 flex-col overflow-hidden">
        <LeaderModeHeader
          mode="analyze"
          onChangeMode={goLeader}
          onLogout={handleLogout}
          statusLabel={interview ? interviewStatusLabel[interview.status] : undefined}
        />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <LeaderWorkspaceSidebar
            mode="analyze"
            currentStep={1}
            onChangeMode={goLeader}
            onSelectStep={() => undefined}
            onOpenHelp={() => undefined}
            counts={null}
          />

          <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <LeaderAmbientDecor />
            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <div className="mx-auto w-full min-w-0 max-w-[1280px] space-y-4 px-3 py-4 sm:px-5 md:py-5">
                {/* Toolbar */}
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                  <Link
                    to={`/interviews/${interviewId}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                      isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-white",
                    )}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Volver a la charla
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <ActionBtn
                      isDark={isDark}
                      variant="secondary"
                      disabled={!analysis?.output || pdfBusy || busy}
                      loading={pdfBusy}
                      onClick={() => void handlePdf()}
                    >
                      <Download className="h-3.5 w-3.5" /> Exportar reporte
                    </ActionBtn>
                    {busy && (
                      <ActionBtn isDark={isDark} variant="secondary" disabled loading onClick={() => undefined}>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando…
                      </ActionBtn>
                    )}
                    {!analysis && !busy && canGenerate && (
                      <ActionBtn
                        isDark={isDark}
                        loading={requestAnalysis.isPending}
                        disabled={requestAnalysis.isPending}
                        onClick={() => requestAnalysis.mutate(false)}
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Generar análisis
                      </ActionBtn>
                    )}
                    {analysis?.status === "FAILED" && !busy && canGenerate && (
                      <ActionBtn
                        isDark={isDark}
                        loading={retryAnalysis.isPending || requestAnalysis.isPending}
                        disabled={retryAnalysis.isPending || requestAnalysis.isPending}
                        onClick={() => {
                          if (analysis.job?.id) retryAnalysis.mutate(analysis.job.id);
                          else requestAnalysis.mutate(true);
                        }}
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Reintentar
                      </ActionBtn>
                    )}
                    {analysis?.status === "COMPLETED" && !busy && canRegenerate && (
                      <ActionBtn
                        isDark={isDark}
                        variant="secondary"
                        loading={requestAnalysis.isPending}
                        disabled={requestAnalysis.isPending}
                        onClick={() =>
                          window.confirm("¿Crear una nueva versión del análisis?") &&
                          requestAnalysis.mutate(true)
                        }
                      >
                        Regenerar
                      </ActionBtn>
                    )}
                  </div>
                </div>

                {(interviewQuery.isLoading || analysisQuery.isLoading || access.isLoading) && (
                  <StateBox isDark={isDark}>
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                    <p className="mt-3 text-sm">Cargando análisis…</p>
                  </StateBox>
                )}

                {interviewQuery.isError && (
                  <StateBox isDark={isDark} error>
                    <p className="text-sm font-semibold">No pudimos cargar la charla</p>
                    <p className="mt-1 text-xs">{apiErrorMessage(interviewQuery.error)}</p>
                  </StateBox>
                )}

                {interview && !canRead && !access.isLoading && (
                  <StateBox isDark={isDark} error>
                    <p className="text-sm font-semibold">Sin permiso para consultar inteligencia</p>
                  </StateBox>
                )}

                {(actionError || analysis?.errorMessage) && (
                  <p className="text-sm text-rose-500">{actionError || intelligenceUnavailableMessage()}</p>
                )}

                {interview && canRead && (
                  <>
                    {/* TOP: Candidate + Score panel */}
                    <section className="grid min-w-0 gap-4 lg:grid-cols-[1.35fr_1fr]">
                      <Surface isDark={isDark} className="p-4 md:p-5">
                        <div className="flex min-w-0 items-start gap-3.5">
                          <div
                            className={cn(
                              "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-lg font-bold",
                              isDark
                                ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-200"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700",
                            )}
                          >
                            <UserRound className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                  isDark ? "bg-violet-500/15 text-violet-200" : "bg-violet-50 text-violet-800",
                                )}
                              >
                                <BrainCircuit className="h-3 w-3" /> Análisis IA
                              </span>
                              {analysis && (
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                    isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600",
                                  )}
                                >
                                  {analysisStatusLabel[analysis.status]}
                                </span>
                              )}
                            </div>
                            <h1 className="mt-1.5 break-words text-xl font-bold tracking-tight md:text-2xl">
                              {interview.application.candidate.fullName}
                            </h1>
                            <div
                              className={cn(
                                "mt-3 grid gap-2 text-xs sm:grid-cols-2",
                                isDark ? "text-slate-400" : "text-slate-500",
                              )}
                            >
                              <MetaLine label="Cargo" value={vacancy?.positionName} />
                              <MetaLine label="Área" value={vacancy?.areaName || "No informada"} />
                              <MetaLine
                                label="Plantilla"
                                value={`${interview.templateSnapshot.templateName} · v${interview.templateSnapshot.versionNumber}`}
                              />
                              <MetaLine
                                label="Análisis"
                                value={
                                  analysis?.generatedAt
                                    ? formatDate(analysis.generatedAt)
                                    : formatDate(interview.assignedAt)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </Surface>

                      <Surface isDark={isDark} className="p-4 md:p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                          Indicador de ajuste generado por IA
                        </p>
                        {score != null ? (
                          <div className="mt-3 flex items-center gap-4">
                            <ScoreRing value={score} isDark={isDark} size={96} />
                            <div className="min-w-0 space-y-2">
                              <p className="text-3xl font-bold tabular-nums tracking-tight">
                                {score}
                                <span className="text-base font-semibold text-slate-400"> / 100</span>
                              </p>
                              <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                                Confidence {confidence ?? "N/D"}
                              </p>
                              <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                                No constituye una decisión de selección.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "mt-3 rounded-xl border px-3.5 py-3",
                              isDark ? "border-amber-400/25 bg-amber-500/10" : "border-amber-200 bg-amber-50",
                            )}
                          >
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                              Evaluación cuantitativa no disponible
                            </p>
                            <p className="mt-1 text-xs leading-5 text-amber-800/90 dark:text-amber-100/80">
                              {scoringUnavailable || analysis
                                ? "La plantilla utilizada no define ponderaciones."
                                : "Genera el análisis para consultar indicadores."}
                              {analysis?.scoring?.reason ? ` ${analysis.scoring.reason}` : ""}
                            </p>
                            {confidence && (
                              <p className="mt-2 text-xs font-semibold text-amber-900 dark:text-amber-100">
                                Confidence del análisis cualitativo: {confidence}
                              </p>
                            )}
                          </div>
                        )}
                      </Surface>
                    </section>

                    {!analysis && !analysisQuery.isLoading && (
                      <StateBox isDark={isDark}>
                        <p className="text-sm font-semibold">Aún no hay análisis para esta charla</p>
                        <p className="mt-1 max-w-md text-xs opacity-80">
                          Genera el análisis para ver el dashboard de inteligencia.
                        </p>
                      </StateBox>
                    )}

                    {analysis && output && !busy && (
                      <>
                        {/* Resumen ejecutivo accordion */}
                        <Surface isDark={isDark}>
                          <button
                            type="button"
                            onClick={() => setSummaryOpen((v) => !v)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/40"
                          >
                            <span className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                                Resumen ejecutivo de IA
                              </span>
                            </span>
                            <ChevronDown className={cn("h-4 w-4 text-slate-400 transition", summaryOpen && "rotate-180")} />
                          </button>
                          {summaryOpen && (
                            <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-white/5">
                              <p className={cn("text-sm leading-7", isDark ? "text-slate-200" : "text-slate-700")}>
                                {output.summary}
                              </p>
                            </div>
                          )}
                        </Surface>

                        {/* Main + Sidebar */}
                        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                          <div className="min-w-0 space-y-4">
                            {/* Dimensional / competencies */}
                            <Surface isDark={isDark}>
                              <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/5">
                                <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                  Análisis por competencias
                                </h2>
                                <span className="text-[11px] text-slate-400">
                                  {output.competencies?.length ?? 0} dimensiones
                                </span>
                              </header>
                              {!output.competencies?.length ? (
                                <p className="px-4 py-6 text-sm text-slate-500">Sin competencias evaluadas.</p>
                              ) : (
                                <div>
                                  {output.competencies.map((item, index) => (
                                    <CompetencyDimension
                                      key={`${item.competency}-${index}`}
                                      item={item}
                                      open={openCompetency === index}
                                      onToggle={() =>
                                        setOpenCompetency((cur) => (cur === index ? null : index))
                                      }
                                      isFirst={index === 0}
                                      isLast={index === output.competencies.length - 1}
                                      isDark={isDark}
                                    />
                                  ))}
                                  <p className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400 dark:border-white/5">
                                    Los scores por competencia son cualitativos del modelo y no reemplazan una
                                    decisión humana.
                                  </p>
                                </div>
                              )}
                            </Surface>

                            {/* Fortalezas / Atención split like reference insights */}
                            <div className="grid min-w-0 gap-3 md:grid-cols-2">
                              <InsightCard
                                title="Fortalezas"
                                items={strengths.slice(0, 5)}
                                tone="green"
                                isDark={isDark}
                              />
                              <InsightCard
                                title="A profundizar"
                                items={attention.slice(0, 5)}
                                tone="amber"
                                isDark={isDark}
                              />
                            </div>

                            {/* Evidencias accordion */}
                            <Surface isDark={isDark}>
                              <button
                                type="button"
                                onClick={() => setShowEvidence((v) => !v)}
                                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/40"
                              >
                                <span>
                                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                    Evidencias del análisis
                                  </span>
                                  <span className="mt-0.5 block text-xs text-slate-400">
                                    {evidenceCounts.evidence} entrevista · {evidenceCounts.opinion}{" "}
                                    entrevistador · {evidenceCounts.inference} inferencias
                                  </span>
                                </span>
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                  {showEvidence ? "Ocultar" : "Ver todas"}
                                </span>
                              </button>
                              {showEvidence && (
                                <div className="border-t border-slate-100 dark:border-white/5">
                                  {(output.evidence ?? []).map((item, index) => {
                                    const key = `${item.sourceRef}-${index}`;
                                    const open = openEvidence === key;
                                    return (
                                      <EvidenceRow
                                        key={key}
                                        item={item}
                                        open={open}
                                        onToggle={() => onOpenEvidence(setOpenEvidence, key, open)}
                                        isDark={isDark}
                                      />
                                    );
                                  })}
                                  {!output.evidence?.length && (
                                    <p className="px-4 py-4 text-sm text-slate-500">Sin evidencias.</p>
                                  )}
                                </div>
                              )}
                            </Surface>

                            <Disclosure
                              title="Coherencia de la entrevista"
                              subtitle={
                                output.interviewerConsistencyNotes?.length
                                  ? `${output.interviewerConsistencyNotes.length} nota(s)`
                                  : "Sin contradicciones listadas"
                              }
                              open={coherenceOpen}
                              onToggle={() => setCoherenceOpen((v) => !v)}
                              isDark={isDark}
                            >
                              {output.interviewerConsistencyNotes?.length ? (
                                <ul className="space-y-2 text-sm leading-6">
                                  {output.interviewerConsistencyNotes.map((note, i) => (
                                    <li key={i}>• {note}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                  No se detectaron contradicciones relevantes entre las respuestas estructuradas y
                                  las observaciones del entrevistador. La evidencia disponible no permite afirmar
                                  coherencia absoluta.
                                </p>
                              )}
                            </Disclosure>

                            <Disclosure
                              title="Conclusión"
                              subtitle="Interpretación global y próximos pasos"
                              open={conclusionOpen}
                              onToggle={() => setConclusionOpen((v) => !v)}
                              isDark={isDark}
                            >
                              <p className="whitespace-pre-wrap text-sm leading-7">{output.overallAssessment}</p>
                              <p
                                className={cn(
                                  "mt-4 rounded-xl border px-3 py-2 text-xs",
                                  isDark
                                    ? "border-violet-400/20 bg-violet-500/10 text-violet-100"
                                    : "border-violet-200 bg-violet-50 text-violet-900",
                                )}
                              >
                                {IA_DISCLAIMER}
                              </p>
                            </Disclosure>
                          </div>

                          {/* Sidebar */}
                          <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
                            <Surface isDark={isDark} className="p-4">
                              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                Resumen de evaluación
                              </h2>
                              <dl className="mt-3 space-y-3 text-sm">
                                <SideRow
                                  label="Indicador IA"
                                  value={score != null ? `${score}/100` : "No disponible"}
                                  isDark={isDark}
                                />
                                <SideRow label="Confidence" value={confidence ?? "N/D"} isDark={isDark} />
                                <SideRow
                                  label="Evidencias"
                                  value={String(output.evidence?.length ?? 0)}
                                  isDark={isDark}
                                />
                                <div className="flex items-start justify-between gap-3">
                                  <dt className="text-slate-500">Coherencia</dt>
                                  <dd>
                                    <span
                                      className={cn(
                                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                                        output.interviewerConsistencyNotes?.length
                                          ? isDark
                                            ? "bg-amber-500/15 text-amber-200"
                                            : "bg-amber-50 text-amber-800"
                                          : isDark
                                            ? "bg-emerald-500/15 text-emerald-300"
                                            : "bg-emerald-50 text-emerald-700",
                                      )}
                                    >
                                      {output.interviewerConsistencyNotes?.length
                                        ? "Revisar notas"
                                        : "Sin alertas"}
                                    </span>
                                  </dd>
                                </div>
                              </dl>
                            </Surface>

                            <Surface isDark={isDark} className="p-4">
                              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                Aspectos por validar
                              </h2>
                              {!output.unansweredOrWeakAreas?.length ? (
                                <p className="mt-3 text-xs leading-5 text-slate-500">
                                  No se identificaron vacíos adicionales.
                                </p>
                              ) : (
                                <ol className="mt-3 space-y-3">
                                  {output.unansweredOrWeakAreas.map((item, index) => (
                                    <li key={index} className="flex gap-2.5 text-xs leading-5">
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-600/15 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                        {index + 1}
                                      </span>
                                      <span className="min-w-0 break-words text-slate-700 dark:text-slate-200">
                                        {item}
                                      </span>
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </Surface>

                            <Surface isDark={isDark} className="px-4 py-3">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                Última actualización
                              </p>
                              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                {analysis.generatedAt
                                  ? formatDate(analysis.generatedAt)
                                  : "Pendiente de generación"}
                              </p>
                              <p className="mt-1 break-all text-[10px] text-slate-400">
                                {analysis.model ?? "modelo"} · {analysis.promptVersion} · v{analysis.version}
                              </p>
                            </Surface>
                          </aside>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function onOpenEvidence(
  setKey: (key: string | null) => void,
  key: string,
  open: boolean,
) {
  setKey(open ? null : key);
}

function countEvidence(output: InterviewAnalysisOutput | null) {
  const evidence = output?.evidence ?? [];
  return {
    evidence: evidence.filter((item) => item.classification === "EVIDENCE").length,
    opinion: evidence.filter((item) => item.classification === "INTERVIEWER_OPINION").length,
    inference: evidence.filter((item) => item.classification === "INFERENCE").length,
  };
}

function competencyIcon(name: string) {
  const c = name.toLowerCase();
  if (c.includes("lider") || c.includes("experiencia") || c.includes("trayector")) return Briefcase;
  if (c.includes("técnic") || c.includes("tecnic") || c.includes("sql") || c.includes("dato")) return Brain;
  if (c.includes("comunic") || c.includes("idioma") || c.includes("inglés") || c.includes("ingles"))
    return MessageSquareQuote;
  if (c.includes("autonom") || c.includes("ética") || c.includes("etica")) return Shield;
  return Target;
}

function CompetencyDimension({
  item,
  open,
  onToggle,
  isFirst,
  isLast,
  isDark,
}: {
  item: CompetencyAssessment;
  open: boolean;
  onToggle: () => void;
  isFirst: boolean;
  isLast: boolean;
  isDark: boolean;
}) {
  const Icon = competencyIcon(item.competency);
  const score = item.score;
  const confPct =
    item.confidence != null && Number.isFinite(item.confidence)
      ? Math.round(item.confidence * 100)
      : null;

  return (
    <article
      className={cn(
        "border-b last:border-b-0",
        isDark ? "border-white/[0.06]" : "border-slate-100",
        open && (isDark ? "bg-emerald-500/[0.04]" : "bg-emerald-50/40"),
        isFirst && "rounded-t-xl",
        isLast && "rounded-b-xl",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-3.5 py-3 text-left md:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:px-4",
          isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            isDark
              ? "border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
        </span>

        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className={cn("text-[13px] font-semibold leading-5", isDark ? "text-white" : "text-slate-900")}>
              {item.competency}
            </span>
            {score != null ? (
              <span className="text-[13px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {score}
                <span className="font-medium text-slate-400"> / 100</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400">Sin score</span>
            )}
          </span>
          {!open && (
            <span className="mt-0.5 block truncate text-[11px] leading-4 text-slate-500">
              {item.rationale || "Sin explicación"}
            </span>
          )}
          {score != null && (
            <span className="mt-2 block">
              <span className="mb-1 flex justify-between text-[10px] text-slate-400">
                <span>Candidato</span>
                {confPct != null && <span>Conf. {confPct}%</span>}
              </span>
              <span className={cn("block h-1.5 overflow-hidden rounded-full", isDark ? "bg-white/10" : "bg-slate-100")}>
                <span
                  className="block h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, score)}%` }}
                />
              </span>
            </span>
          )}
        </span>

        <span className="hidden min-w-0 md:block">
          {!open && (
            <span className="line-clamp-2 text-[11px] leading-4 text-slate-500">
              {item.evidenceRefs?.length
                ? `Evidencias: ${item.evidenceRefs.join(", ")}`
                : "Sin referencias de evidencia"}
            </span>
          )}
        </span>

        <ChevronDown
          className={cn("mt-1 h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="grid gap-3 border-t border-slate-100 px-4 py-3 dark:border-white/5 md:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
              Análisis
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-[12px] leading-5 text-slate-700 dark:text-slate-200">
              {item.rationale}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
              Evidencias y límites
            </p>
            <p className="mt-1.5 text-[12px] leading-5 text-slate-600 dark:text-slate-300">
              {item.evidenceRefs?.length
                ? `Referencias: ${item.evidenceRefs.join(", ")}. Interpreta estas señales como información de la entrevista, no como hechos verificados externamente.`
                : "Sin referencias de evidencia asociadas. La confianza debería interpretarse con cautela."}
            </p>
            {confPct != null && (
              <p className="mt-2 text-[11px] font-semibold text-slate-500">Confidence {confPct}%</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function EvidenceRow({
  item,
  open,
  onToggle,
  isDark,
}: {
  item: IntelligenceEvidence;
  open: boolean;
  onToggle: () => void;
  isDark: boolean;
}) {
  return (
    <div className="min-w-0 border-b border-slate-100 last:border-b-0 dark:border-white/5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/40 dark:hover:bg-white/[0.03]"
      >
        <span className="min-w-0 truncate font-medium">
          {item.sourceRef} · {evidenceClassificationLabel[item.classification]}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-2 px-4 pb-3">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              item.classification === "EVIDENCE"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : item.classification === "INTERVIEWER_OPINION"
                  ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                  : "bg-violet-500/15 text-violet-700 dark:text-violet-300",
            )}
          >
            {evidenceClassificationLabel[item.classification]}
          </span>
          <p className="text-sm leading-6">{item.statement}</p>
          {item.relevance && (
            <p className="text-xs leading-5 text-slate-500">Interpretación: {item.relevance}</p>
          )}
        </div>
      )}
    </div>
  );
}

function InsightCard({
  title,
  items,
  tone,
  isDark,
}: {
  title: string;
  items: string[];
  tone: "green" | "amber";
  isDark: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border p-4",
        tone === "green"
          ? isDark
            ? "border-emerald-400/20 bg-emerald-500/10"
            : "border-emerald-200 bg-emerald-50"
          : isDark
            ? "border-amber-400/20 bg-amber-500/10"
            : "border-amber-200 bg-amber-50",
      )}
    >
      <div className="flex items-center gap-2">
        {tone === "green" ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        )}
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em]">{title}</h3>
      </div>
      {items.length ? (
        <ul className="mt-2.5 space-y-1.5 text-[12px] leading-5 text-slate-700 dark:text-slate-200">
          {items.map((item, i) => (
            <li key={i}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-slate-500">Sin hallazgos.</p>
      )}
    </div>
  );
}

function ScoreRing({ value, isDark, size = 88 }: { value: number; isDark: boolean; size?: number }) {
  const score = Math.min(100, Math.max(0, Number(value) || 0));
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#10b981"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function Surface({
  children,
  isDark,
  className,
}: {
  children: ReactNode;
  isDark: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border",
        isDark
          ? "border-white/10 bg-[#0e1c20]/85"
          : "border-slate-200/90 bg-white shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function MetaLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <p className="min-w-0 break-words">
      <span className="font-semibold text-slate-500">{label}: </span>
      {value && value.trim() ? value : "—"}
    </p>
  );
}

function SideRow({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn("text-right font-semibold", isDark ? "text-slate-100" : "text-slate-800")}>{value}</dd>
    </div>
  );
}

function Disclosure({
  title,
  subtitle,
  open,
  onToggle,
  isDark,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  isDark: boolean;
  children: ReactNode;
}) {
  return (
    <Surface isDark={isDark}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/40"
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</span>
          {subtitle && <span className="mt-0.5 block text-xs text-slate-400">{subtitle}</span>}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-3 dark:border-white/5">{children}</div>}
    </Surface>
  );
}

function ActionBtn({
  children,
  onClick,
  loading,
  disabled,
  isDark,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  isDark: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        variant === "primary"
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
          : isDark
            ? "border border-white/10 bg-white/[0.04] text-slate-200"
            : "border border-slate-200 bg-white text-slate-700",
        (disabled || loading) && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

function StateBox({
  children,
  isDark,
  error = false,
}: {
  children: ReactNode;
  isDark: boolean;
  error?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border px-6 py-12 text-center",
        error
          ? isDark
            ? "border-rose-400/20 bg-rose-500/10"
            : "border-rose-200 bg-rose-50"
          : isDark
            ? "border-white/10 bg-[#0e1c20]/80 text-slate-300"
            : "border-slate-200 bg-white text-slate-600",
      )}
    >
      {children}
    </div>
  );
}
