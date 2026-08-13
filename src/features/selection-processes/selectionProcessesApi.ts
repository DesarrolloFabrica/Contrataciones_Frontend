import api from "../../services/apiClient";
import type { SelectionProcess, SelectionProcessStatus } from "./types";

export async function createSelectionProcess(vacancyReferenceId: string) {
  const response = await api.post<SelectionProcess>("/selection/processes", {
    vacancyReferenceId,
  });
  return response.data;
}

export async function updateSelectionProcessStatus(
  id: string,
  status: SelectionProcessStatus,
) {
  const response = await api.patch<SelectionProcess>(
    `/selection/processes/${id}/status`,
    { status },
  );
  return response.data;
}

export async function assignProcessTemplate(id: string, templateVersionId: string) {
  const response = await api.patch<SelectionProcess>(`/selection/processes/${id}/template`, { templateVersionId });
  return response.data;
}
