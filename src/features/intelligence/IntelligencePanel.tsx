import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, BrainCircuit, CheckCircle2, Clock3, RefreshCw, Scale, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { apiErrorMessage, intelligenceUnavailableMessage } from "../vacancies/formatters";
import {
  getIntelligenceOverview,
  requestCandidateAssessment,
  requestInterviewAnalysis,
  requestProcessComparison,
  retryIntelligenceJob,
} from "./intelligenceApi";
import { recommendationLabel, type CandidateIntelligenceRow, type IntelligenceResultStatus } from "./types";

export function IntelligencePanel({ processId, canGenerate }: { processId: string; canGenerate: boolean }) {
  const queryClient = useQueryClient();
  const overview = useQuery({
    queryKey: ["charlas-intelligence-overview", processId],
    queryFn: () => getIntelligenceOverview(processId),
    refetchInterval: (query) => hasActiveJobs(query.state.data) ? 2500 : false,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["charlas-intelligence-overview", processId] });
  const analyze = useMutation({
    mutationFn: async (candidate: CandidateIntelligenceRow) => {
      const pending = candidate.interviews.filter((item) => item.interview.status === "COMPLETED" && !["COMPLETED", "PENDING", "PROCESSING"].includes(item.analysis?.status ?? ""));
      return Promise.all(pending.map((item) => requestInterviewAnalysis(item.interview.id)));
    },
    onSuccess: refresh,
  });
  const consolidate = useMutation({ mutationFn: (applicationId: string) => requestCandidateAssessment(applicationId), onSuccess: refresh });
  const compare = useMutation({ mutationFn: () => requestProcessComparison(processId), onSuccess: refresh });
  const retry = useMutation({ mutationFn: retryIntelligenceJob, onSuccess: refresh });
  const error = overview.error ?? analyze.error ?? consolidate.error ?? compare.error ?? retry.error;

  if (overview.isLoading) return <Notice text="Cargando inteligencia del proceso…" />;
  if (!overview.data || overview.isError) return <Notice text={apiErrorMessage(overview.error)} error />;
  const data = overview.data;
  const assessmentsReady = data.candidates.filter((item) => item.assessment?.status === "COMPLETED").length;

  return <div className="space-y-5">
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Metric label="Charlas completas" value={`${data.readiness.completedInterviews}/${data.readiness.requiredInterviews}`} detail={data.readiness.interviewsComplete ? "Cobertura completa" : "Cobertura pendiente"} icon={<CheckCircle2 />} />
      <Metric label="Assessments" value={`${data.readiness.assessmentsGenerated}/${data.readiness.applications}`} detail="Consolidaciones vigentes" icon={<BrainCircuit />} />
      <Metric label="Decisiones humanas" value={`${data.readiness.decisionsRegistered}/${data.readiness.applications}`} detail="Registradas localmente" icon={<Scale />} />
      <Metric label="Cupos" value={`${data.capacity.locallySelected}/${data.capacity.requestedPositions}`} detail={`${data.capacity.hiredInCore} contratados reportados por CORE`} icon={<Clock3 />} />
    </section>

    <section className="rounded-2xl border app-card-surface p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Process readiness</p><h2 className="mt-1 font-semibold">Preparación para cierre humano</h2><p className="mt-1 text-xs text-slate-500">{data.readiness.note}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.readiness.readyForHumanCompletion ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{data.readiness.readyForHumanCompletion ? "Listo para revisión de cierre" : "Aún incompleto"}</span></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4"><Step done={data.readiness.interviewsComplete} text="Charlas" /><Step done={data.readiness.assessmentsGenerated === data.readiness.applications && data.readiness.applications > 0} text="Assessments" /><Step done={Boolean(data.comparison?.status === "COMPLETED")} text="Comparativo" /><Step done={data.readiness.decisionsRegistered === data.readiness.applications && data.readiness.applications > 0} text="Decisiones" /></div>
      {data.capacity.coreCapacityWarning && <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" /> La suma de contratados CORE y seleccionados locales supera los cupos solicitados. CORE puede estar desactualizado; CHARLAS no lo modifica.</p>}
    </section>

    {error && <Notice text={intelligenceUnavailableMessage()} error />}

    <section className="space-y-3">
      {data.candidates.length === 0 && <Notice text="No hay candidaturas para analizar." />}
      {data.candidates.map((candidate) => {
        const completed = candidate.interviews.filter((item) => item.interview.status === "COMPLETED");
        const completedAnalyses = completed.filter((item) => item.analysis?.status === "COMPLETED");
        const failed = candidate.interviews.find((item) => item.analysisJob?.status === "FAILED");
        const failedAssessmentJob = candidate.assessmentJob?.status === "FAILED" ? candidate.assessmentJob : null;
        const canAnalyze = completed.some((item) => !["COMPLETED", "PENDING", "PROCESSING"].includes(item.analysis?.status ?? ""));
        const canConsolidate = completed.length > 0 && completedAnalyses.length === completed.length && !["PENDING", "PROCESSING"].includes(candidate.assessment?.status ?? "");
        return <article key={candidate.application.id} className="rounded-2xl border app-card-surface p-5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{candidate.application.candidate.fullName}</h3><StatusBadge status={candidate.assessment?.status ?? null} /><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${candidate.coverage.status === "COMPLETE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{candidate.coverage.status === "COMPLETE" ? "Cobertura completa" : "Evaluación parcial"}</span></div><p className="mt-2 text-sm text-slate-500">Charlas: {candidate.coverage.completedInterviews}/{candidate.coverage.requiredInterviews} completadas · {candidate.coverage.pendingInterviews} pendientes · {candidate.coverage.cancelledInterviews} canceladas</p></div><div className="flex flex-wrap gap-2">{canGenerate && <Button size="sm" variant="secondary" disabled={!canAnalyze} loading={analyze.isPending} onClick={() => analyze.mutate(candidate)}><Sparkles className="h-4 w-4" /> Analizar charlas</Button>}{canGenerate && failed?.analysisJob && <Button size="sm" variant="secondary" loading={retry.isPending} onClick={() => retry.mutate(failed.analysisJob!.id)}><RefreshCw className="h-4 w-4" /> Retry charla</Button>}{canGenerate && <Button size="sm" variant="secondary" disabled={!canConsolidate} loading={consolidate.isPending} onClick={() => consolidate.mutate(candidate.application.id)}>Consolidar candidato</Button>}{canGenerate && failedAssessmentJob && <Button size="sm" variant="secondary" loading={retry.isPending} onClick={() => retry.mutate(failedAssessmentJob.id)}><RefreshCw className="h-4 w-4" /> Retry assessment</Button>}<Link to={`/charlas/applications/${candidate.application.id}/intelligence`} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">Ver detalle <ArrowRight className="h-4 w-4" /></Link></div></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Mini label="Assessment" value={candidate.assessment ? `v${candidate.assessment.version} · ${candidate.assessment.status}` : "Sin generar"} /><Mini label="Score explicable" value={candidate.assessment?.overallScore != null ? `${Number(candidate.assessment.overallScore).toFixed(1)} / 100` : "No disponible"} /><Mini label="Confidence" value={candidate.assessment?.confidence != null ? `${Math.round(Number(candidate.assessment.confidence) * 100)}%` : "No disponible"} /><Mini label="Recomendación IA" value={candidate.assessment ? recommendationLabel[candidate.assessment.recommendation] : "Pendiente"} /></div>
          {candidate.assessment?.output && <div className="mt-4 grid gap-3 lg:grid-cols-2"><SummaryList title="Fortalezas principales" items={candidate.assessment.output.strengths.slice(0, 3)} tone="green" /><SummaryList title="Riesgos principales" items={candidate.assessment.output.risks.slice(0, 3)} tone="amber" /></div>}
          {candidate.assessment?.errorMessage && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{candidate.assessment.errorMessage}</p>}
        </article>;
      })}
    </section>

    <section className="rounded-2xl border app-card-surface p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Comparativo del proceso</p><h2 className="mt-1 font-semibold">{data.comparison ? `Versión ${data.comparison.version} · ${data.comparison.status}` : "Aún no generado"}</h2><p className="mt-1 text-xs text-slate-500">{assessmentsReady} assessments vigentes. El ranking solo aparece si todos los scores son comparables.</p></div><div className="flex gap-2">{canGenerate && <Button variant="secondary" disabled={assessmentsReady < 2 || ["PENDING", "PROCESSING"].includes(data.comparison?.status ?? "")} loading={compare.isPending} onClick={() => compare.mutate()}><BrainCircuit className="h-4 w-4" /> Generar comparativo</Button>}{canGenerate && data.comparisonJob?.status === "FAILED" && <Button variant="secondary" loading={retry.isPending} onClick={() => retry.mutate(data.comparisonJob!.id)}>Retry</Button>}{data.comparison && <Link to={`/charlas/processes/${processId}/comparison`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white">Abrir comparativo <ArrowRight className="h-4 w-4" /></Link>}</div></div></section>
  </div>;
}

function hasActiveJobs(data: Awaited<ReturnType<typeof getIntelligenceOverview>> | undefined) { return Boolean(data?.comparisonJob && ["PENDING", "PROCESSING"].includes(data.comparisonJob.status)) || Boolean(data?.candidates.some((candidate) => [candidate.assessmentJob, ...candidate.interviews.map((item) => item.analysisJob)].some((job) => job && ["PENDING", "PROCESSING"].includes(job.status)))); }
function Metric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) { return <div className="rounded-2xl border app-card-surface p-4"><div className="flex items-center justify-between text-slate-400"><span className="text-[10px] font-bold uppercase tracking-wider">{label}</span><span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span></div><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>; }
function Step({ done, text }: { done: boolean; text: string }) { return <div className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${done ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500 dark:bg-white/5"}`}>{done ? "✓" : "·"} {text}</div>; }
function Mini({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>; }
function StatusBadge({ status }: { status: IntelligenceResultStatus | null }) { const styles = status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : status === "FAILED" ? "bg-rose-50 text-rose-700" : status === "STALE" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"; return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${styles}`}>{status ?? "SIN ASSESSMENT"}</span>; }
function SummaryList({ title, items, tone }: { title: string; items: string[]; tone: "green" | "amber" }) { return <div className={`rounded-xl p-3 ${tone === "green" ? "bg-emerald-50/70" : "bg-amber-50/70"}`}><p className="text-xs font-bold">{title}</p>{items.length ? <ul className="mt-2 space-y-1 text-xs text-slate-600">{items.map((item, index) => <li key={index}>• {item}</li>)}</ul> : <p className="mt-2 text-xs text-slate-500">Sin hallazgos reportados.</p>}</div>; }
function Notice({ text, error = false }: { text: string; error?: boolean }) { return <div className={`rounded-2xl border p-8 text-center text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "app-card-surface text-slate-500"}`}>{text}</div>; }
