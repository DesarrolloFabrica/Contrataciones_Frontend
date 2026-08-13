import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, CheckCircle2, Database, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";
import { processStatusLabel } from "../selection-processes/types";
import { apiErrorMessage, coreUnavailableMessage, formatDate, humanize } from "./formatters";
import type { VacancyEligibilityStatus } from "./types";
import { getVacancies, syncVacancies } from "./vacanciesApi";

const eligibilityLabel: Record<VacancyEligibilityStatus, string> = {
  ELIGIBLE: "Elegible",
  INELIGIBLE: "No elegible",
  REVIEW_REQUIRED: "Requiere revisión",
};

function StatusPill({ label, tone }: { label: string; tone: "green" | "amber" | "slate" | "blue" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-300",
    slate: "bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-white/5 dark:text-slate-300",
    blue: "bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-400/10 dark:text-sky-300",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset", tones[tone])}>{label}</span>;
}

export function VacanciesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [operationStatus, setOperationStatus] = useState("");
  const [eligibility, setEligibility] = useState<VacancyEligibilityStatus | "">("");

  const vacancies = useQuery({
    queryKey: ["charlas-vacancies", q, operationStatus, eligibility],
    queryFn: () =>
      getVacancies({
        q: q || undefined,
        operationStatus: operationStatus || undefined,
        eligibility: eligibility || undefined,
      }),
  });
  const sync = useMutation({
    mutationFn: syncVacancies,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charlas-vacancies"] }),
  });
  const canSync = user?.capabilities.includes("vacancy.sync") ?? false;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Fuente oficial: CORE / Orbit</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Vacantes y procesos</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Consulta la proyección local de las vacantes oficiales y administra su proceso CHARLAS sin modificar CORE.
          </p>
        </div>
        {canSync && (
          <Button loading={sync.isPending} onClick={() => sync.mutate()}>
            <RefreshCw className="h-4 w-4" /> Sincronizar con CORE
          </Button>
        )}
      </section>

      {sync.data && (
        <section className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5" />
          <strong>Sincronización completada</strong>
          <span>Leídas: {sync.data.scanned}</span><span>Nuevas: {sync.data.created}</span>
          <span>Actualizadas: {sync.data.updated}</span><span>Sin cambios: {sync.data.unchanged}</span>
          <span>Fallidas: {sync.data.failed}</span><span>{sync.data.durationMs} ms</span>
        </section>
      )}
      {sync.isError && (
        <section className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" /> {coreUnavailableMessage()}
        </section>
      )}

      <section className="grid gap-3 rounded-2xl border app-card-surface p-4 md:grid-cols-[minmax(240px,1fr)_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar cargo, área, responsable o código" className="pl-11" aria-label="Buscar vacantes" />
        </div>
        <Select
          value={operationStatus}
          onChange={(event) => setOperationStatus(event.target.value)}
          aria-label="Filtrar por estado CORE"
          options={[
            { value: "", label: "Todos los estados CORE" },
            { value: "requisition_sent", label: "Requisition sent" },
            { value: "hired", label: "Hired" },
            { value: "cancelled", label: "Cancelled" },
            { value: "internal_movement", label: "Internal movement" },
            { value: "open", label: "Open" },
            { value: "selected", label: "Selected" },
            { value: "closed", label: "Closed" },
          ]}
        />
        <Select
          value={eligibility}
          onChange={(event) => setEligibility(event.target.value as VacancyEligibilityStatus | "")}
          aria-label="Filtrar por elegibilidad"
          options={[
            { value: "", label: "Toda elegibilidad" },
            { value: "ELIGIBLE", label: "Elegible" },
            { value: "REVIEW_REQUIRED", label: "Requiere revisión" },
            { value: "INELIGIBLE", label: "No elegible" },
          ]}
        />
      </section>

      {vacancies.isLoading && <div className="rounded-2xl border app-card-surface p-12 text-center text-sm text-slate-500">Consultando referencias locales…</div>}
      {vacancies.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          {apiErrorMessage(vacancies.error)}
        </div>
      )}
      {vacancies.data && vacancies.data.length === 0 && (
        <div className="rounded-2xl border app-card-surface p-12 text-center">
          <Database className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-medium">No hay vacantes que coincidan</p>
          <p className="mt-1 text-sm text-slate-500">Ajusta los filtros o solicita una sincronización con CORE.</p>
        </div>
      )}

      {vacancies.data && vacancies.data.length > 0 && (
        <section className="overflow-hidden rounded-2xl border app-card-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.025] dark:text-slate-400">
                <tr><th className="px-5 py-3">Vacante oficial</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Cupos</th><th className="px-4 py-3">Responsable</th><th className="px-4 py-3">Estado CORE</th><th className="px-4 py-3">Estado CHARLAS</th><th className="px-5 py-3">Actualizada</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {vacancies.data.map((vacancy) => (
                  <tr key={vacancy.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.025]">
                    <td className="px-5 py-4"><button className="text-left" onClick={() => navigate(`/charlas/vacancies/${vacancy.id}`)}><span className="block font-semibold text-slate-900 dark:text-white">{vacancy.positionName}</span><span className="mt-1 block text-xs text-slate-400">CORE #{vacancy.publicId ?? vacancy.externalVacancyId}</span></button></td>
                    <td className="max-w-[220px] px-4 py-4"><span className="block truncate">{vacancy.areaName ?? `Área ${vacancy.areaExternalId}`}</span><span className="mt-1 block truncate text-xs text-slate-400">{[vacancy.schoolName, vacancy.programName].filter(Boolean).join(" · ") || "Sin escuela/programa"}</span></td>
                    <td className="px-4 py-4"><span className="font-semibold">{vacancy.pendingPositions}</span> pendientes<span className="mt-1 block text-xs text-slate-400">{vacancy.hiredQuantity} de {vacancy.quantity} cubiertos</span></td>
                    <td className="max-w-[200px] px-4 py-4"><span className="block truncate">{vacancy.resolvedManagerDisplayName ?? vacancy.directManagerRawValue ?? "No informado"}</span><span className="mt-1 block text-xs text-slate-400">{humanize(vacancy.directManagerResolutionStatus)}</span></td>
                    <td className="px-4 py-4"><StatusPill label={humanize(vacancy.operationStatus)} tone="slate" /><span className="mt-2 block"><StatusPill label={eligibilityLabel[vacancy.eligibility.status]} tone={vacancy.eligibility.status === "ELIGIBLE" ? "green" : vacancy.eligibility.status === "REVIEW_REQUIRED" ? "amber" : "slate"} /></span></td>
                    <td className="px-4 py-4">{vacancy.activeProcess ? <StatusPill label={processStatusLabel[vacancy.activeProcess.status]} tone="blue" /> : <span className="text-xs text-slate-400">Sin proceso operativo</span>}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatDate(vacancy.coreUpdatedAt)}</td>
                    <td className="px-4 py-4"><button onClick={() => navigate(`/charlas/vacancies/${vacancy.id}`)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-400/10" aria-label={`Abrir ${vacancy.positionName}`}><ArrowRight className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
