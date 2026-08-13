import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { getTemplates } from "../templates/templatesApi";
import { templateStatusLabel } from "../templates/types";
import { apiErrorMessage, formatDate } from "../vacancies/formatters";
import { assignProcessTemplate } from "./selectionProcessesApi";
import type { SelectionProcess } from "./types";

export function ProcessTemplatePanel({ process, canManage, onChanged }: { process: SelectionProcess; canManage: boolean; onChanged: () => void }) {
  const queryClient = useQueryClient();
  const [versionId, setVersionId] = useState(process.activeTemplateVersionId ?? "");
  useEffect(() => setVersionId(process.activeTemplateVersionId ?? ""), [process.id, process.activeTemplateVersionId]);
  const templates = useQuery({ queryKey: ["charlas-templates", "published"], queryFn: () => getTemplates() });
  const published = (templates.data ?? []).flatMap((template) => template.versions.filter((version) => version.status === "PUBLISHED").map((version) => ({ ...version, templateName: template.name })));
  const assign = useMutation({ mutationFn: () => assignProcessTemplate(process.id, versionId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["charlas-vacancy"] }); onChanged(); } });
  const current = process.activeTemplateVersion;
  return <section className="rounded-2xl border app-card-surface"><header className="border-b border-slate-200 p-5 dark:border-white/5"><h2 className="font-semibold">Plantilla activa para charlas futuras</h2><p className="mt-1 text-xs text-slate-500">Las entrevistas ya asignadas conservan su versión y snapshot originales.</p></header><div className="p-5">{current ? <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-400/10"><ClipboardList className="mt-0.5 h-5 w-5 text-emerald-600" /><div><p className="font-semibold">{current.template.name}</p><p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Versión {current.versionNumber} · {templateStatusLabel[current.status]}</p></div></div> : <p className="mb-5 text-sm text-slate-500">El proceso aún no tiene plantilla. No se podrán asignar charlas hasta seleccionar una versión publicada.</p>}{canManage && <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><Select label="Versión publicada" value={versionId} onChange={(event) => setVersionId(event.target.value)} options={[{ value: "", label: "Selecciona una plantilla" }, ...published.map((version) => ({ value: version.id, label: `${version.templateName} · versión ${version.versionNumber}` }))]} /><Button loading={assign.isPending} disabled={!versionId || versionId === process.activeTemplateVersionId} onClick={() => assign.mutate()}>Asignar para futuras charlas</Button></div>}{assign.isError && <p className="mt-3 text-sm text-rose-600">{apiErrorMessage(assign.error)}</p>}{current && <p className="mt-4 text-xs text-slate-400">Versión creada {formatDate(current.createdAt)}</p>}</div></section>;
}
