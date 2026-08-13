import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  CircleUserRound,
  Database,
  Flag,
  ListChecks,
  Plus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import type { SelectionCapability } from "../../services/authService";
import { cn } from "../../utils/cn";
import { CandidateApplicationsPanel } from "../candidates/CandidateApplicationsPanel";
import { IntelligencePanel } from "../intelligence/IntelligencePanel";
import { ParticipantsPanel } from "../participants/ParticipantsPanel";
import { getProductProcessSummary } from "../product/productApi";
import type { ProductProcessSummary } from "../product/types";
import { ProcessInterviewsPanel } from "../selection-processes/ProcessInterviewsPanel";
import { ProcessTemplatePanel } from "../selection-processes/ProcessTemplatePanel";
import { createSelectionProcess, updateSelectionProcessStatus } from "../selection-processes/selectionProcessesApi";
import { processStatusLabel, processTransitions, type SelectionProcessStatus } from "../selection-processes/types";
import { apiErrorMessage, formatDate, humanize } from "./formatters";
import { getVacancy } from "./vacanciesApi";

type WorkspaceTab = "SUMMARY" | "CANDIDATES" | "PARTICIPANTS" | "TEMPLATE" | "INTERVIEWS" | "INTELLIGENCE";
const tabs: Array<{ value: WorkspaceTab; label: string; capability?: SelectionCapability }> = [
  { value: "SUMMARY", label: "Resumen" },
  { value: "CANDIDATES", label: "Candidatos", capability: "candidate.read" },
  { value: "PARTICIPANTS", label: "Participantes", capability: "participant.read" },
  { value: "TEMPLATE", label: "Plantilla", capability: "template.read" },
  { value: "INTERVIEWS", label: "Charlas", capability: "interview.read" },
  { value: "INTELLIGENCE", label: "Comparativo y decisiones", capability: "intelligence.read" },
];

export function VacancyWorkspacePage() {
  const { vacancyId = "" } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [tab, setTab] = useState<WorkspaceTab>("SUMMARY");
  const vacancy = useQuery({ queryKey: ["charlas-vacancy", vacancyId], queryFn: () => getVacancy(vacancyId), enabled: Boolean(vacancyId) });
  const selectedProcess = useMemo(() => {
    const processes = vacancy.data?.selectionProcesses ?? [];
    return processes.find((process) => process.id === selectedProcessId) ?? vacancy.data?.activeProcess ?? processes[0] ?? null;
  }, [selectedProcessId, vacancy.data]);
  const summary = useQuery({
    queryKey: ["charlas-product-process-summary", selectedProcess?.id],
    queryFn: () => getProductProcessSummary(selectedProcess!.id),
    enabled: Boolean(selectedProcess?.id),
  });
  const effectiveCapabilities = summary.data?.access?.effectiveCapabilities ?? user?.capabilities ?? [];
  const has = (capability: SelectionCapability) => effectiveCapabilities.includes(capability);
  const visibleTabs = tabs.filter((item) => !item.capability || has(item.capability));
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["charlas-vacancy", vacancyId] });
    queryClient.invalidateQueries({ queryKey: ["charlas-vacancies"] });
    queryClient.invalidateQueries({ queryKey: ["charlas-product-process-summary"] });
    queryClient.invalidateQueries({ queryKey: ["charlas-product-home"] });
  };
  const createProcess = useMutation({ mutationFn: () => createSelectionProcess(vacancyId), onSuccess: (created) => { setSelectedProcessId(created.id); refresh(); } });
  const updateProcess = useMutation({ mutationFn: ({ id, status }: { id: string; status: SelectionProcessStatus }) => updateSelectionProcessStatus(id, status), onSuccess: refresh });

  if (vacancy.isLoading) return <Notice text="Cargando workspace…" />;
  if (vacancy.isError || !vacancy.data) return <Notice text={apiErrorMessage(vacancy.error)} error />;

  const item = vacancy.data;
  const mayCreate = item.eligibility.status === "ELIGIBLE" && !item.activeProcess;
  const nextStatuses = selectedProcess ? processTransitions[selectedProcess.status] : [];
  const canManageProcess = has("process.manage");
  const canManageApplications = has("candidate.manage") && has("application.manage");
  const canManageParticipants = has("participant.manage");
  const canAssignInterviews = has("interview.assign");

  return (
    <div className="space-y-6">
      <section>
        <Link to="/charlas/vacancies" className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-500 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          <ArrowLeft className="h-4 w-4" /> Volver a procesos
        </Link>
        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Workspace del proceso</p>
            <h1 className="mt-2 text-3xl font-semibold">{item.positionName}</h1>
            <p className="mt-2 text-sm text-slate-500">{item.areaName ?? item.areaExternalId} · {item.pendingPositions} cupos pendientes · Orbit #{item.publicId ?? item.externalVacancyId}</p>
            {summary.data?.responsibles.length ? <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Users className="h-3.5 w-3.5" /> Responsable: {summary.data.responsibles.map((responsible) => responsible.name).join(", ")}</p> : null}
          </div>
          {canManageProcess && mayCreate && <Button loading={createProcess.isPending} onClick={() => createProcess.mutate()}><Plus className="h-4 w-4" /> Crear proceso CHARLAS</Button>}
        </div>
        {(createProcess.isError || updateProcess.isError) && <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4" />{apiErrorMessage(createProcess.error ?? updateProcess.error)}</div>}
      </section>

      {summary.data && <ProcessIndicators summary={summary.data} />}

      <section className="rounded-2xl border app-card-surface">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/5 sm:flex-row sm:items-center">
          <div><h2 className="font-semibold">Proceso CHARLAS seleccionado</h2><p className="mt-1 text-xs text-slate-500">Su lifecycle es independiente del estado informado por Orbit.</p></div>
          {selectedProcess && canManageProcess && nextStatuses.length > 0 && <Select disabled={updateProcess.isPending} value="" onChange={(event) => updateProcess.mutate({ id: selectedProcess.id, status: event.target.value as SelectionProcessStatus })} options={[{ value: "", label: "Cambiar estado del proceso…" }, ...nextStatuses.map((status) => ({ value: status, label: processStatusLabel[status] }))]} />}
        </div>
        {item.selectionProcesses.length === 0 ? (
          <div className="p-10 text-center"><CalendarClock className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-medium">No hay procesos todavía</p><p className="mt-1 text-xs text-slate-500">{mayCreate ? "La vacante es elegible para iniciar un proceso local." : item.eligibility.reason}</p></div>
        ) : (
          <div className="flex gap-2 overflow-x-auto p-3">{item.selectionProcesses.map((process) => <button key={process.id} onClick={() => setSelectedProcessId(process.id)} className={cn("min-w-[220px] rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500", selectedProcess?.id === process.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-400/10" : "border-slate-200 dark:border-white/10")}><span className="block text-sm font-semibold">Proceso {process.id.slice(0, 8)}</span><span className="mt-1 block text-xs text-slate-500">{processStatusLabel[process.status]} · {formatDate(process.createdAt)}</span></button>)}</div>
        )}
      </section>

      {selectedProcess && <nav className="flex gap-1 overflow-x-auto rounded-xl border app-card-surface p-1" aria-label="Secciones del proceso">{visibleTabs.map((item) => <button key={item.value} onClick={() => setTab(item.value)} className={cn("whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500", tab === item.value ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5")}>{item.label}{summary.data ? tabCount(item.value, summary.data) : ""}</button>)}</nav>}

      {tab === "SUMMARY" && <Summary item={item} summary={summary.data} loading={summary.isLoading} />}
      {selectedProcess && tab === "CANDIDATES" && has("candidate.read") && <CandidateApplicationsPanel selectionProcessId={selectedProcess.id} canManage={canManageApplications} processClosed={["COMPLETED", "CANCELLED"].includes(selectedProcess.status)} />}
      {selectedProcess && tab === "PARTICIPANTS" && has("participant.read") && <ParticipantsPanel processId={selectedProcess.id} canManage={canManageParticipants} />}
      {selectedProcess && tab === "TEMPLATE" && has("template.read") && <ProcessTemplatePanel process={selectedProcess} canManage={canManageProcess && !["COMPLETED", "CANCELLED"].includes(selectedProcess.status)} onChanged={refresh} />}
      {selectedProcess && tab === "INTERVIEWS" && has("interview.read") && <ProcessInterviewsPanel processId={selectedProcess.id} activeTemplateVersionId={selectedProcess.activeTemplateVersionId} canAssign={canAssignInterviews && Boolean(selectedProcess.activeTemplateVersionId) && !["COMPLETED", "CANCELLED"].includes(selectedProcess.status)} />}
      {selectedProcess && tab === "INTELLIGENCE" && has("intelligence.read") && <IntelligencePanel processId={selectedProcess.id} canGenerate={has("intelligence.generate")} />}
    </div>
  );
}

function Summary({ item, summary, loading }: { item: Awaited<ReturnType<typeof getVacancy>>; summary?: ProductProcessSummary; loading: boolean }) {
  return <div className="space-y-4">{loading && <Notice text="Calculando preparación del proceso…" />}{summary && <Checklist summary={summary} />}<section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]"><div className="rounded-2xl border app-card-surface"><SectionHeader icon={<Database className="h-4 w-4" />} eyebrow="Solo lectura" title="Información proveniente de Orbit" /><dl className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-3"><Detail label="Cargo" value={item.positionName} /><Detail label="Área" value={item.areaName ?? item.areaExternalId} /><Detail label="Escuela" value={item.schoolName} /><Detail label="Programa" value={item.programName} /><Detail label="Cantidad" value={String(item.quantity)} /><Detail label="Contratados" value={String(item.hiredQuantity)} /><Detail label="Cupos pendientes" value={String(item.pendingPositions)} /><Detail label="Creación Orbit" value={formatDate(item.coreCreatedAt)} /><Detail label="Actualización Orbit" value={formatDate(item.coreUpdatedAt)} /></dl>{item.dataQualityFlags.length > 0 && <div className="mx-5 mb-5 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">Alertas externas: {item.dataQualityFlags.join(", ")}</div>}</div><div className="space-y-4"><div className="rounded-2xl border app-card-surface"><SectionHeader icon={<Flag className="h-4 w-4" />} eyebrow="Lifecycles separados" title="Estados" /><div className="grid gap-4 p-5"><StateCard label="Estado Orbit" value={humanize(item.operationStatus)} detail="Informativo; CHARLAS nunca lo modifica." tone="slate" /><StateCard label="Elegibilidad CHARLAS" value={humanize(item.eligibility.status)} detail={item.eligibility.reason} tone={item.eligibility.status === "ELIGIBLE" ? "green" : item.eligibility.status === "REVIEW_REQUIRED" ? "amber" : "slate"} /></div></div><div className="rounded-2xl border app-card-surface"><SectionHeader icon={<CircleUserRound className="h-4 w-4" />} eyebrow="Resolución conservadora" title="Jefatura informada por Orbit" /><dl className="grid gap-4 p-5 sm:grid-cols-2"><Detail label="Valor original" value={item.directManagerRawValue} /><Detail label="Persona resuelta" value={item.resolvedManagerDisplayName} /><Detail label="Tipo detectado" value={humanize(item.directManagerIdentifierType)} /><Detail label="Resolución" value={humanize(item.directManagerResolutionStatus)} /></dl></div></div></section></div>;
}

function ProcessIndicators({ summary }: { summary: ProductProcessSummary }) { const progress = summary.indicators.assignedInterviews ? Math.round((summary.indicators.completedInterviews / summary.indicators.assignedInterviews) * 100) : 0; return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Indicator label="Estado CHARLAS" value={processStatusLabel[summary.process.status]} /><Indicator label="Candidatos" value={String(summary.indicators.candidates)} /><Indicator label="Charlas completadas" value={`${summary.indicators.completedInterviews}/${summary.indicators.assignedInterviews}`} /><div className="rounded-2xl border app-card-surface p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progreso de charlas</p><p className="mt-2 text-lg font-semibold">{progress}%</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5"><div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} /></div></div></section>; }
function Indicator({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border app-card-surface p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>; }
function Checklist({ summary }: { summary: ProductProcessSummary }) { return <section className="rounded-2xl border app-card-surface"><SectionHeader icon={<ListChecks className="h-4 w-4" />} eyebrow="Guía no bloqueante" title="Checklist del proceso" /><div className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-3">{summary.checklist.map((item) => <div key={item.key} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]">{item.state === "READY" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : item.state === "WARNING" ? <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" /> : <CircleDashed className="h-5 w-5 shrink-0 text-slate-400" />}<div><p className="text-sm font-semibold">{item.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.reason}</p></div></div>)}</div></section>; }
function tabCount(tab: WorkspaceTab, summary: ProductProcessSummary) { if (tab === "CANDIDATES") return ` (${summary.indicators.candidates})`; if (tab === "PARTICIPANTS") return ` (${summary.indicators.interviewers})`; if (tab === "INTERVIEWS") return ` (${summary.indicators.assignedInterviews})`; return ""; }
function SectionHeader({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) { return <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">{icon}</span><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{eyebrow}</p><h2 className="text-sm font-semibold">{title}</h2></div></div>; }
function Detail({ label, value }: { label: string; value: string | null }) { return <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1.5 break-words text-sm">{value || "No informado"}</dd></div>; }
function StateCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "green" | "amber" | "slate" }) { const styles = { green: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200", amber: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200", slate: "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200" }; return <div className={cn("rounded-xl border p-4", styles[tone])}><p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p><p className="mt-2 text-xs leading-5 opacity-75">{detail}</p></div>; }
function Notice({ text, error = false }: { text: string; error?: boolean }) { return <div className={`rounded-2xl border p-10 text-center text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "app-card-surface text-slate-500"}`}>{text}</div>; }
