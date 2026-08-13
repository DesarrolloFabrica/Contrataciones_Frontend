import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ClipboardList, FilePlus2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage, formatDate } from "../vacancies/formatters";
import { createTemplate, getTemplates } from "./templatesApi";
import { templateStatusLabel } from "./types";

export function TemplatesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const templates = useQuery({ queryKey: ["charlas-templates", q], queryFn: () => getTemplates(q) });
  const create = useMutation({
    mutationFn: () => createTemplate({ name, description }),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ["charlas-templates"] });
      setOpen(false);
      navigate(`/charlas/templates/${template.id}`);
    },
  });
  const canManage = user?.capabilities.includes("template.manage") ?? false;

  return <div className="space-y-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Administración institucional</p><h1 className="mt-2 text-3xl font-semibold">Plantillas de charla</h1><p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Diseña formularios dinámicos versionados. Las versiones publicadas son inmutables.</p></div>
      {canManage && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nueva plantilla</Button>}
    </section>
    <div className="relative max-w-xl"><Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" /><Input className="pl-11" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar plantilla" /></div>
    {templates.isLoading && <Empty text="Consultando plantillas…" />}
    {templates.isError && <Empty text={apiErrorMessage(templates.error)} error />}
    {templates.data?.length === 0 && <Empty text="Todavía no hay plantillas. Crea la primera para iniciar el catálogo institucional." />}
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.data?.map((template) => {
        const active = template.versions.find((version) => version.status === "PUBLISHED");
        const latest = template.versions[0];
        return <button key={template.id} onClick={() => navigate(`/charlas/templates/${template.id}`)} className="group rounded-2xl border app-card-surface p-5 text-left transition-transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"><ClipboardList className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" /></div>
          <h2 className="mt-4 font-semibold">{template.name}</h2><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{template.description || "Sin descripción"}</p>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-white/5"><span className="text-slate-400">{template.versions.length} versión(es)</span><span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">{active ? `v${active.versionNumber} · ${templateStatusLabel[active.status]}` : latest ? `v${latest.versionNumber} · ${templateStatusLabel[latest.status]}` : "Sin versiones"}</span></div>
          <p className="mt-3 text-[11px] text-slate-400">Actualizada {formatDate(template.updatedAt)}</p>
        </button>;
      })}
    </section>
    <Modal open={open} onClose={() => setOpen(false)} title="Crear plantilla" description="Se creará junto con su primera versión en borrador." footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button loading={create.isPending} disabled={!name.trim()} onClick={() => create.mutate()}><FilePlus2 className="h-4 w-4" /> Crear</Button></>}>
      <div className="space-y-4"><Input label="Nombre" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Analista administrativo" /><Input label="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Propósito y ámbito de uso" />{create.isError && <p className="text-sm text-rose-600">{apiErrorMessage(create.error)}</p>}</div>
    </Modal>
  </div>;
}

function Empty({ text, error = false }: { text: string; error?: boolean }) {
  return <div className={`rounded-2xl border p-10 text-center text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300" : "app-card-surface text-slate-500"}`}>{text}</div>;
}
