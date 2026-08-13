import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { apiErrorMessage } from "../vacancies/formatters";
import { getParticipants, getParticipantUsers, removeParticipant, upsertParticipant } from "./participantsApi";
import { responsibilityLabel, type ParticipantResponsibility } from "./types";

const responsibilities = Object.keys(responsibilityLabel) as ParticipantResponsibility[];

export function ParticipantsPanel({ processId, canManage }: { processId: string; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [selected, setSelected] = useState<ParticipantResponsibility[]>(["INTERVIEWER"]);
  const [editing, setEditing] = useState(false);
  const list = useQuery({ queryKey: ["charlas-participants", processId], queryFn: () => getParticipants(processId) });
  const users = useQuery({ queryKey: ["charlas-participant-users"], queryFn: () => getParticipantUsers(), enabled: open });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["charlas-participants", processId] });
  const save = useMutation({ mutationFn: () => upsertParticipant(processId, userId, selected), onSuccess: () => { refresh(); setOpen(false); setEditing(false); } });
  const remove = useMutation({ mutationFn: (id: string) => removeParticipant(processId, id), onSuccess: refresh });
  const openNew = () => { setEditing(false); setUserId(""); setSelected(["INTERVIEWER"]); setOpen(true); };
  return <section className="rounded-2xl border app-card-surface"><header className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/5"><div><h2 className="font-semibold">Participantes</h2><p className="mt-1 text-xs text-slate-500">Responsabilidades contextuales, independientes del rol global.</p></div>{canManage && <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /> Agregar</Button>}</header>{list.isLoading && <p className="p-8 text-center text-sm text-slate-500">Cargando participantes…</p>}{list.data?.length === 0 && <div className="p-10 text-center"><UsersRound className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm">No hay participantes configurados.</p></div>}<div className="divide-y divide-slate-100 dark:divide-white/5">{list.data?.map((participant) => <div key={participant.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><p className="font-semibold">{participant.user.fullName}</p><p className="mt-1 text-xs text-slate-500">{participant.user.email}</p><div className="mt-2 flex flex-wrap gap-1">{participant.responsibilities.map((item) => <span key={item} className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">{responsibilityLabel[item]}</span>)}</div></div>{canManage && <div className="flex self-start"><button aria-label={`Editar a ${participant.user.fullName}`} onClick={() => { setEditing(true); setUserId(participant.userId); setSelected(participant.responsibilities); setOpen(true); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"><Pencil className="h-4 w-4" /></button><button aria-label={`Eliminar a ${participant.user.fullName}`} onClick={() => window.confirm("¿Retirar al participante del proceso?") && remove.mutate(participant.id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></div>}</div>)}</div><Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar responsabilidades" : "Agregar participante"} footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button loading={save.isPending} disabled={!userId || selected.length === 0} onClick={() => save.mutate()}>Guardar participante</Button></>}><div className="space-y-4"><Select label="Usuario" disabled={editing} value={userId} onChange={(event) => setUserId(event.target.value)} options={[{ value: "", label: "Selecciona una persona" }, ...(users.data ?? []).map((user) => ({ value: user.id, label: `${user.fullName} · ${user.email}` }))]} /><fieldset><legend className="text-xs font-bold uppercase tracking-wider text-slate-500">Responsabilidades</legend><div className="mt-2 flex flex-wrap gap-2">{responsibilities.map((item) => <label key={item} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" checked={selected.includes(item)} onChange={(event) => setSelected(event.target.checked ? [...selected, item] : selected.filter((value) => value !== item))} /> {responsibilityLabel[item]}</label>)}</div></fieldset>{save.isError && <p className="text-sm text-rose-600">{apiErrorMessage(save.error)}</p>}</div></Modal></section>;
}
