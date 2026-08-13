import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDot,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiErrorMessage, formatDate } from "../vacancies/formatters";
import { getProductHome } from "./productApi";
import { ProductState } from "./ProductState";
import type { ProductProcessSummary } from "./types";

export function CharlasHomePage() {
  const home = useQuery({ queryKey: ["charlas-product-home"], queryFn: getProductHome });

  if (home.isLoading) {
    return <ProductState kind="loading" title="Preparando tu espacio de trabajo…" />;
  }
  if (!home.data || home.isError) {
    return (
      <ProductState
        kind="error"
        title="No pudimos cargar tu trabajo"
        description={apiErrorMessage(home.error)}
      />
    );
  }

  const data = home.data;
  const actionable = [...data.work.inProgress, ...data.work.pending];

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Inicio</p>
          <h1 className="mt-2 text-3xl font-semibold">Tu trabajo en CHARLAS</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Continúa entrevistas asignadas y atiende los procesos donde tienes una responsabilidad explícita.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          {data.profile.productRole === "ADMIN" ? <ShieldCheck className="h-4 w-4" /> : <MessageSquareText className="h-4 w-4" />}
          {data.profile.productRole === "ADMIN" ? "Administrador CHARLAS" : "Entrevistador"}
        </span>
      </section>

      <section aria-labelledby="next-work-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Prioridad</p>
            <h2 id="next-work-title" className="mt-1 text-xl font-semibold">Qué debes hacer ahora</h2>
          </div>
          <Link className="text-sm font-semibold text-emerald-700 hover:underline" to="/leader">
            Ver mis charlas
          </Link>
        </div>
        {actionable.length === 0 ? (
          <div className="mt-4">
            <ProductState kind="empty" title="No tienes charlas pendientes" description="Cuando te asignen una, aparecerá aquí con acceso directo al formulario." />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {actionable.slice(0, 6).map((interview) => {
              const active = interview.status === "IN_PROGRESS";
              return (
                <Link key={interview.id} to={`/interviews/${interview.id}`} className="group rounded-2xl border app-card-surface p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"}`}>
                      {active ? <CircleDot className="h-3.5 w-3.5" /> : <MessageSquareText className="h-3.5 w-3.5" />}
                      {active ? "Continuar" : "Iniciar"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-4 font-semibold">{interview.application.candidate.fullName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{interview.application.selectionProcess.vacancyReference.positionName}</p>
                  <p className="mt-3 text-xs text-slate-400">Asignada {formatDate(interview.assignedAt)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {data.responsibleProcesses.length > 0 && (
        <section aria-labelledby="responsible-title">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Responsabilidad contextual</p>
          <h2 id="responsible-title" className="mt-1 text-xl font-semibold">Procesos bajo tu responsabilidad</h2>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {data.responsibleProcesses.map((item) => <ResponsibleCard key={item.process.id} summary={item} />)}
          </div>
        </section>
      )}

      {data.processes.length > 0 && (
        <section aria-labelledby="participation-title" className="rounded-2xl border app-card-surface">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-white/5">
            <h2 id="participation-title" className="font-semibold">Procesos en los que participas</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {data.processes.map((process) => (
              <Link key={process.id} to={`/charlas/vacancies/${process.vacancyReferenceId}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 dark:hover:bg-white/[0.03]">
                <BriefcaseBusiness className="h-5 w-5 shrink-0 text-emerald-600" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">{process.positionName}</strong>
                  <span className="mt-1 block truncate text-xs text-slate-500">{process.areaName || "Área no informada"} · {process.responsibilities.join(" · ")}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.admin && <AdminSnapshot admin={data.admin} />}
    </div>
  );
}

function ResponsibleCard({ summary }: { summary: ProductProcessSummary }) {
  const attention = summary.checklist.filter((item) => item.state === "WARNING" || item.state === "BLOCKED");
  return (
    <article className="rounded-2xl border app-card-surface p-5">
      <div className="flex justify-between gap-4">
        <div>
          <h3 className="font-semibold">{summary.vacancy.positionName}</h3>
          <p className="mt-1 text-xs text-slate-500">{summary.vacancy.areaName || "Área no informada"}</p>
        </div>
        <span className="h-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold dark:bg-white/5">{summary.process.status}</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Mini value={summary.indicators.candidates} label="Candidatos" />
        <Mini value={`${summary.indicators.completedInterviews}/${summary.indicators.assignedInterviews}`} label="Charlas" />
        <Mini value={`${summary.indicators.decisions}/${summary.indicators.candidates}`} label="Decisiones" />
      </div>
      {attention.length > 0 && (
        <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {attention[0].reason}
        </p>
      )}
      <Link to={`/charlas/vacancies/${summary.process.vacancyReferenceId}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
        Abrir proceso <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function AdminSnapshot({ admin }: { admin: NonNullable<Awaited<ReturnType<typeof getProductHome>>["admin"]> }) {
  return (
    <section aria-labelledby="admin-snapshot-title" className="rounded-2xl border app-card-surface p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Administración</p>
          <h2 id="admin-snapshot-title" className="mt-1 font-semibold">Estado operativo</h2>
        </div>
        <Link to="/charlas/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">Abrir administración <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Mini value={admin.vacancyCount} label="Vacantes locales" />
        <Mini value={admin.activeProcesses} label="Procesos abiertos" />
        <Mini value={admin.templateCount} label="Plantillas" />
        <Mini value={admin.failedJobs.length} label="Jobs IA fallidos" />
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        {admin.coreSnapshot.available ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
        {admin.coreSnapshot.message} {admin.coreSnapshot.lastSyncedAt ? `Última sincronización ${formatDate(admin.coreSnapshot.lastSyncedAt)}.` : ""}
      </p>
    </section>
  );
}

function Mini({ value, label }: { value: string | number; label: string }) {
  return <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]"><strong className="block text-lg">{value}</strong><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span></div>;
}
