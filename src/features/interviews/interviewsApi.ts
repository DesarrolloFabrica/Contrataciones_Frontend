import api from "../../services/apiClient";
import type { InterviewStatus, SelectionInterview } from "./types";

export async function getInterviews(params: { applicationId?: string; selectionProcessId?: string; status?: InterviewStatus } = {}) {
  const { data } = await api.get<SelectionInterview[]>("/selection/interviews", { params });
  return data;
}

export async function getInterview(id: string) {
  const { data } = await api.get<SelectionInterview>(`/selection/interviews/${id}`);
  return data;
}

export async function assignInterview(applicationId: string, interviewerUserId: string) {
  const { data } = await api.post<SelectionInterview>("/selection/interviews", { applicationId, interviewerUserId });
  return data;
}

export async function startInterview(id: string) {
  const { data } = await api.post<SelectionInterview>(`/selection/interviews/${id}/start`);
  return data;
}

export async function saveInterview(id: string, answers: Array<{ questionId: string; value: unknown }>, generalObservations: string) {
  const { data } = await api.patch<SelectionInterview>(`/selection/interviews/${id}/draft`, { answers, generalObservations });
  return data;
}

export async function completeInterview(id: string) {
  const { data } = await api.post<SelectionInterview>(`/selection/interviews/${id}/complete`);
  return data;
}

export async function cancelInterview(id: string) {
  const { data } = await api.post<SelectionInterview>(`/selection/interviews/${id}/cancel`);
  return data;
}
