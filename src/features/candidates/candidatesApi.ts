import api from "../../services/apiClient";
import type { Application, ApplicationStatus, Candidate, CandidateInput } from "./types";

export async function getApplications(selectionProcessId: string) {
  const response = await api.get<Application[]>("/selection/applications", {
    params: { selectionProcessId },
  });
  return response.data;
}

export async function searchCandidates(q: string, selectionProcessId?: string) {
  const response = await api.get<Candidate[]>("/selection/candidates", {
    params: { ...(q.trim() ? { q: q.trim() } : {}), selectionProcessId },
  });
  return response.data;
}

export async function createCandidate(input: CandidateInput, selectionProcessId: string) {
  const response = await api.post<Candidate>("/selection/candidates", { ...input, selectionProcessId });
  return response.data;
}

export async function addApplication(selectionProcessId: string, candidateId: string) {
  const response = await api.post<Application>("/selection/applications", {
    selectionProcessId,
    candidateId,
  });
  return response.data;
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const response = await api.patch<Application>(`/selection/applications/${id}/status`, {
    status,
  });
  return response.data;
}
