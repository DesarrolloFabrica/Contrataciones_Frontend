import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Database, FileStack, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { apiErrorMessage, formatDate, intelligenceUnavailableMessage } from "../vacancies/formatters";
import { getProductHome } from "./productApi";
import { ProductState } from "./ProductState";

export function AdminOperationsPage() {
  const home = useQuery({ queryKey: ["charlas-product-home"], queryFn: getProductHome });
  if (home.isLoading) return <ProductState kind="loading" title="Cargando administración…" />;
  if (!home.data || home.isError) return <ProductState kind="error" title="Administración no disponible" description={apiErrorMessage(home.error)} />;
  if (!home.data.admin) return <ProductState kind="unauthorized" title="Acceso restringido" description="Esta sección requiere el rol Administrador de CHARLAS." />;
  const admin = home.data.admin;

  return <div className="space-y-6">
    <section><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Administración</p><h1 className="mt-2 text-3xl font-semibold">Operación de CHARLAS</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Supervisa sincronización, procesos, plantillas y fallos operativos sin modificar Orbit.</p></section>
    <section className="grid gap-4 lg:grid-cols-3">
      <Link to="/charlas/vacancies" className="rounded-2xl border app-card-surface p-5 focus-visible:ring-2 focus-visible:ring-emerald-500"><Database className="h-5 w-5 text-emerald-600" /><h2 className="mt-3 font-semibold">Vacantes y procesos</h2><p className="mt-1 text-sm text-slate-500">{admin.vacancyCount} referencias locales · {admin.activeProcesses} procesos abiertos</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Gestionar <ArrowRight className="h-4 w-4" /></span></Link>
      <Link to="/charlas/templates" className="rounded-2xl border app-card-surface p-5 focus-visible:ring-2 focus-visible:ring-emerald-500"><FileStack className="h-5 w-5 text-violet-600" /><h2 className="mt-3 font-semibold">Plantillas</h2><p className="mt-1 text-sm text-slate-500">{admin.templateCount} plantillas registradas</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Administrar <ArrowRight className="h-4 w-4" /></span></Link>
      <div className="rounded-2xl border app-card-surface p-5"><RefreshCw className="h-5 w-5 text-sky-600" /><h2 className="mt-3 font-semibold">Snapshot de Orbit</h2><p className="mt-1 text-sm text-slate-500">{admin.coreSnapshot.message}</p><p className="mt-4 text-xs text-slate-400">{admin.coreSnapshot.lastSyncedAt ? `Última sincronización ${formatDate(admin.coreSnapshot.lastSyncedAt)}` : "Sin sincronizaciones locales"}</p></div>
    </section>
    <section className="rounded-2xl border app-card-surface"><div className="border-b border-slate-200 px-5 py-4 dark:border-white/5"><h2 className="font-semibold">Fallos recientes de inteligencia</h2><p className="mt-1 text-xs text-slate-500">El fallo del proveedor no bloquea el trabajo humano.</p></div>{admin.failedJobs.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No hay jobs fallidos recientes.</div> : <div className="divide-y divide-slate-100 dark:divide-white/5">{admin.failedJobs.map((job) => <div key={job.id} className="flex gap-3 px-5 py-4"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" /><div><p className="text-sm font-semibold">{job.jobType} · {job.errorCode || "ERROR_PROVEEDOR"}</p><p className="mt-1 text-xs text-slate-500">{intelligenceUnavailableMessage()}</p><p className="mt-1 text-[11px] text-slate-400">{formatDate(job.updatedAt)}</p></div></div>)}</div>}</section>
  </div>;
}
