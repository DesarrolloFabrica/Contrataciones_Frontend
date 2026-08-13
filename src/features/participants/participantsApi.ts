import api from "../../services/apiClient";
import type { ParticipantResponsibility, ParticipantUser, ProcessParticipant } from "./types";

export async function getParticipants(processId: string) {
  const { data } = await api.get<ProcessParticipant[]>(`/selection/participants/process/${processId}`);
  return data;
}
export async function getParticipantUsers(q = "") {
  const { data } = await api.get<ParticipantUser[]>("/selection/participants/available-users", { params: q ? { q } : undefined });
  return data;
}
export async function upsertParticipant(processId: string, userId: string, responsibilities: ParticipantResponsibility[]) {
  const { data } = await api.put<ProcessParticipant>(`/selection/participants/process/${processId}`, { userId, responsibilities });
  return data;
}
export async function removeParticipant(processId: string, participantId: string) {
  const { data } = await api.delete<{ success: true }>(`/selection/participants/process/${processId}/${participantId}`);
  return data;
}
