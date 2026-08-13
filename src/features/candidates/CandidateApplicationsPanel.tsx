import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Link2, Plus, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { cn } from "../../utils/cn";
import { apiErrorMessage, formatDate } from "../vacancies/formatters";
import {
  addApplication,
  createCandidate,
  getApplications,
  searchCandidates,
  updateApplicationStatus,
} from "./candidatesApi";
import {
  applicationStatusLabel,
  applicationTransitions,
  type Application,
  type ApplicationStatus,
  type Candidate,
  type CandidateInput,
} from "./types";

type ModalMode = "create" | "link" | null;

export function CandidateApplicationsPanel({
  selectionProcessId,
  canManage,
  processClosed,
}: {
  selectionProcessId: string;
  canManage: boolean;
  processClosed: boolean;
}) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<ModalMode>(null);
  const [search, setSearch] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [detail, setDetail] = useState<Candidate | null>(null);
  const [form, setForm] = useState<CandidateInput>({ fullName: "", email: "", phone: "", identificationType: "", identificationValue: "", identificationCountryCode: "" });

  const applications = useQuery({
    queryKey: ["charlas-applications", selectionProcessId],
    queryFn: () => getApplications(selectionProcessId),
  });
  const candidates = useQuery({
    queryKey: ["charlas-candidates", search],
    queryFn: () => searchCandidates(search, selectionProcessId),
    enabled: mode === "link",
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["charlas-applications", selectionProcessId] });
  const createAndLink = useMutation({
    mutationFn: async () => {
      const candidate = await createCandidate(cleanCandidateInput(form), selectionProcessId);
      return addApplication(selectionProcessId, candidate.id);
    },
    onSuccess: () => { refresh(); closeModal(); },
  });
  const link = useMutation({
    mutationFn: () => addApplication(selectionProcessId, selectedCandidateId),
    onSuccess: () => { refresh(); closeModal(); },
  });
  const status = useMutation({
    mutationFn: ({ id, next }: { id: string; next: ApplicationStatus }) => updateApplicationStatus(id, next),
    onSuccess: refresh,
  });

  const closeModal = () => {
    setMode(null);
    setSelectedCandidateId("");
    setSearch("");
    setForm({ fullName: "", email: "", phone: "", identificationType: "", identificationValue: "", identificationCountryCode: "" });
    createAndLink.reset();
    link.reset();
  };

  return (
    <section className="rounded-2xl border app-card-surface">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">Candidaturas del proceso</h2>
          <p className="mt-1 text-xs text-slate-500">Personas vinculadas localmente a este proceso CHARLAS.</p>
        </div>
        {canManage && !processClosed && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setMode("link")}><Link2 className="h-4 w-4" /> Vincular existente</Button>
            <Button size="sm" onClick={() => setMode("create")}><Plus className="h-4 w-4" /> Registrar candidato</Button>
          </div>
        )}
      </div>

      {applications.isLoading && <div className="p-8 text-center text-sm text-slate-500">Cargando candidaturas…</div>}
      {applications.isError && <ErrorBox error={applications.error} />}
      {applications.data?.length === 0 && <div className="p-10 text-center"><UserRound className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-medium">Aún no hay candidaturas</p><p className="mt-1 text-xs text-slate-500">Registra una persona o reutiliza un candidato existente.</p></div>}
      {applications.data && applications.data.length > 0 && (
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {applications.data.map((application) => (
            <div key={application.id}>
              <ApplicationRow application={application} canManage={canManage} busy={status.isPending} onDetail={setDetail} onStatus={(next) => status.mutate({ id: application.id, next })} />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={mode === "create"}
        onClose={closeModal}
        title="Registrar candidato"
        description="Crea una identidad neutral en CHARLAS y vincúlala a este proceso. No se fusionarán coincidencias automáticamente."
        footer={<><Button variant="ghost" onClick={closeModal}>Cancelar</Button><Button loading={createAndLink.isPending} disabled={!form.fullName.trim() || Boolean(form.identificationType) !== Boolean(form.identificationValue)} onClick={() => createAndLink.mutate()}>Registrar y vincular</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Input label="Nombre completo" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></div>
          <Input label="Correo" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Input label="Teléfono" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <Input label="Tipo de identificación" placeholder="Ej. CC" value={form.identificationType} onChange={(event) => setForm({ ...form, identificationType: event.target.value })} />
          <Input label="Número de identificación" value={form.identificationValue} onChange={(event) => setForm({ ...form, identificationValue: event.target.value })} />
          <Input label="País (ISO)" maxLength={2} value={form.identificationCountryCode} onChange={(event) => setForm({ ...form, identificationCountryCode: event.target.value })} />
        </div>
        {Boolean(form.identificationType) !== Boolean(form.identificationValue) && <p className="mt-3 text-xs text-amber-600">Tipo y número de identificación deben informarse juntos.</p>}
        {createAndLink.isError && <ErrorBox error={createAndLink.error} />}
      </Modal>

      <Modal
        open={mode === "link"}
        onClose={closeModal}
        title="Vincular candidato existente"
        description="Busca y selecciona explícitamente una persona ya registrada en CHARLAS."
        footer={<><Button variant="ghost" onClick={closeModal}>Cancelar</Button><Button loading={link.isPending} disabled={!selectedCandidateId} onClick={() => link.mutate()}>Vincular al proceso</Button></>}
      >
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo o identificación" className="pl-11" />
        </div>
        <div className="modal-scroll mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
          {candidates.isLoading && <p className="py-6 text-center text-sm text-slate-500">Buscando…</p>}
          {candidates.data?.map((candidate) => (
            <button key={candidate.id} type="button" onClick={() => setSelectedCandidateId(candidate.id)} className={cn("w-full rounded-xl border p-3 text-left", selectedCandidateId === candidate.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-400/10" : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5")}>
              <span className="block text-sm font-semibold">{candidate.fullName}</span>
              <span className="mt-1 block text-xs text-slate-500">{candidate.email ?? "Sin correo"} · {candidate.identificationValue ?? "Sin identificación"}</span>
            </button>
          ))}
        </div>
        {link.isError && <ErrorBox error={link.error} />}
      </Modal>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Detalle del candidato">
        {detail && <dl className="grid gap-4 sm:grid-cols-2"><Detail label="Nombre" value={detail.fullName} /><Detail label="Correo" value={detail.email} /><Detail label="Teléfono" value={detail.phone} /><Detail label="Identificación" value={[detail.identificationType, detail.identificationValue].filter(Boolean).join(" ") || null} /><Detail label="País" value={detail.identificationCountryCode} /><Detail label="Registro" value={formatDate(detail.createdAt)} /></dl>}
      </Modal>
    </section>
  );
}

function ApplicationRow({ application, canManage, busy, onDetail, onStatus }: { application: Application; canManage: boolean; busy: boolean; onDetail: (candidate: Candidate) => void; onStatus: (status: ApplicationStatus) => void }) {
  const nextStatuses = applicationTransitions[application.status];
  return (
    <div className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(220px,1fr)_180px_220px] md:items-center">
      <button type="button" onClick={() => onDetail(application.candidate)} className="text-left">
        <span className="block font-semibold hover:text-emerald-600 dark:hover:text-emerald-400">{application.candidate.fullName}</span>
        <span className="mt-1 block text-xs text-slate-500">{application.candidate.email ?? application.candidate.identificationValue ?? "Contacto no informado"}</span>
      </button>
      <div><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">{applicationStatusLabel[application.status]}</span><span className="mt-1.5 block text-[11px] text-slate-400">Desde {formatDate(application.statusUpdatedAt)}</span></div>
      {canManage && nextStatuses.length > 0 ? (
        <Select disabled={busy} value="" onChange={(event) => onStatus(event.target.value as ApplicationStatus)} options={[{ value: "", label: "Cambiar estado…" }, ...nextStatuses.map((value) => ({ value, label: applicationStatusLabel[value] }))]} aria-label={`Cambiar estado de ${application.candidate.fullName}`} />
      ) : <span className="text-xs text-slate-400">Sin acciones disponibles</span>}
    </div>
  );
}

function ErrorBox({ error }: { error: unknown }) {
  return <div className="m-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{apiErrorMessage(error)}</div>;
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div><dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-sm">{value || "No informado"}</dd></div>;
}

function cleanCandidateInput(input: CandidateInput): CandidateInput {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value?.trim())) as CandidateInput;
}
