import api from "../../services/apiClient";
import type { VacancyEligibilityStatus, VacancyReference, VacancySyncResult } from "./types";

export type VacancyFilters = {
  q?: string;
  operationStatus?: string;
  eligibility?: VacancyEligibilityStatus | "";
};

export async function getVacancies(filters: VacancyFilters) {
  const params: Record<string, string> = {};
  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.operationStatus?.trim()) params.operationStatus = filters.operationStatus.trim();
  if (filters.eligibility) params.eligibility = filters.eligibility;

  const response = await api.get<VacancyReference[]>("/selection/vacancy-references", {
    params,
  });
  return response.data;
}

export async function getVacancy(id: string) {
  const response = await api.get<VacancyReference>(`/selection/vacancy-references/${id}`);
  return response.data;
}

export async function syncVacancies() {
  const response = await api.post<VacancySyncResult>("/selection/vacancy-references/sync");
  return response.data;
}
