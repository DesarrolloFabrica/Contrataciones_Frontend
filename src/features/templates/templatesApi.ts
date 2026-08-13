import api from "../../services/apiClient";
import type { ExcelPreview, InterviewTemplate, InterviewTemplateVersion, TemplateSectionInput } from "./types";

export async function getTemplates(q = "") {
  const { data } = await api.get<InterviewTemplate[]>("/selection/templates", { params: q ? { q } : undefined });
  return data;
}

export async function getTemplate(id: string) {
  const { data } = await api.get<InterviewTemplate>(`/selection/templates/${id}`);
  return data;
}

export async function createTemplate(input: { name: string; description?: string }) {
  const { data } = await api.post<InterviewTemplate>("/selection/templates", input);
  return data;
}

export async function updateTemplate(id: string, input: { name?: string; description?: string | null }) {
  const { data } = await api.patch<InterviewTemplate>(`/selection/templates/${id}`, input);
  return data;
}

export async function createTemplateVersion(templateId: string, input: { sourceVersionId?: string; changeSummary?: string }) {
  const { data } = await api.post<InterviewTemplateVersion>(`/selection/templates/${templateId}/versions`, input);
  return data;
}

export async function getTemplateVersion(id: string) {
  const { data } = await api.get<InterviewTemplateVersion>(`/selection/templates/versions/${id}`);
  return data;
}

export async function saveTemplateContent(id: string, sections: TemplateSectionInput[]) {
  const { data } = await api.put<InterviewTemplateVersion>(`/selection/templates/versions/${id}/content`, { sections });
  return data;
}

export async function publishTemplateVersion(id: string) {
  const { data } = await api.post<InterviewTemplateVersion>(`/selection/templates/versions/${id}/publish`);
  return data;
}

export async function archiveTemplateVersion(id: string) {
  const { data } = await api.post<InterviewTemplateVersion>(`/selection/templates/versions/${id}/archive`);
  return data;
}

export async function previewTemplateExcel(file: File) {
  const body = new FormData();
  body.append("file", file);
  const { data } = await api.post<ExcelPreview>("/selection/templates/import/preview", body, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function confirmTemplateExcel(templateId: string, preview: ExcelPreview) {
  const { data } = await api.post<InterviewTemplateVersion>(`/selection/templates/${templateId}/import`, { sections: preview.sections, changeSummary: "Importación Excel" });
  return data;
}

export async function downloadTemplateExample() {
  const { data } = await api.get<Blob>("/selection/templates/import/example", { responseType: "blob" });
  const url = URL.createObjectURL(data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "plantilla-charlas-ejemplo.xlsx";
  anchor.click();
  URL.revokeObjectURL(url);
}
