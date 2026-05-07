import apiClient from "./apiClient";

export type CandidateDocumentType =
  | "RESUME"
  | "ACADEMIC_CERTIFICATE"
  | "WORK_CERTIFICATE"
  | "PORTFOLIO"
  | "IDENTITY_DOCUMENT"
  | "OTHER";

export type CandidateDocumentSourceType = "FILE" | "URL";

export type CreateCandidateDocumentPayload = {
  candidateId: string;
  evaluationId?: string | null;
  hiringRequestId?: string | null;
  documentType: CandidateDocumentType;
  sourceType: CandidateDocumentSourceType;
  url?: string | null;
  storageUrl?: string | null;
  storageKey?: string | null;
  notes?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: string | null;
  isPrimaryResume?: boolean;
};

export async function createCandidateDocument(payload: CreateCandidateDocumentPayload) {
  const { data } = await apiClient.post("/candidate-documents", payload);
  return data;
}

export type UploadCandidateResumePayload = {
  file: File;
  candidateId: string;
  evaluationId?: string | null;
  hiringRequestId?: string | null;
  notes?: string | null;
};

export async function uploadCandidateResume(payload: UploadCandidateResumePayload) {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("candidateId", payload.candidateId);
  formData.append("documentType", "RESUME");
  formData.append("isPrimaryResume", "true");
  if (payload.evaluationId) formData.append("evaluationId", payload.evaluationId);
  if (payload.hiringRequestId) formData.append("hiringRequestId", payload.hiringRequestId);
  if (payload.notes && payload.notes.trim()) formData.append("notes", payload.notes.trim());

  const { data } = await apiClient.post("/candidate-documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export type CandidateDocumentItem = {
  id: string;
  candidateId: string;
  evaluationId: string | null;
  hiringRequestId: string | null;
  documentType: CandidateDocumentType;
  sourceType: CandidateDocumentSourceType;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: string | null;
  storageUrl: string | null;
  url: string | null;
  storageKey: string | null;
  notes: string | null;
  isPrimaryResume: boolean;
  uploadedByUserId: string | null;
  uploadedAt: string;
};

export async function getCandidateDocuments(candidateId: string): Promise<CandidateDocumentItem[]> {
  const { data } = await apiClient.get(`/candidate-documents/candidate/${candidateId}`);
  return Array.isArray(data) ? data : [];
}

export async function getEvaluationDocuments(evaluationId: string): Promise<CandidateDocumentItem[]> {
  const { data } = await apiClient.get(`/candidate-documents/evaluation/${evaluationId}`);
  return Array.isArray(data) ? data : [];
}

export async function downloadCandidateDocument(
  documentId: string,
  fallbackFileName?: string | null
): Promise<void> {
  const response = await apiClient.get(`/candidate-documents/${documentId}/download`, {
    responseType: "blob",
  });

  let fileName = "documento";

  // 1. Try parsing Content-Disposition header (RFC 5987)
  const contentDisposition = response.headers["content-disposition"];
  if (contentDisposition) {
    // Try filename* first (UTF-8 encoded)
    const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
    if (filenameStarMatch && filenameStarMatch[1]) {
      fileName = decodeURIComponent(filenameStarMatch[1]);
    } else {
      // Try filename (ASCII)
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch && filenameMatch[1]) {
        fileName = decodeURIComponent(filenameMatch[1]);
      }
    }
  }

  // 2. Fallback to metadata fileName if header parsing failed
  if (fileName === "documento" && fallbackFileName) {
    fileName = fallbackFileName;
  }

  // 3. Final fallback
  if (!fileName || fileName === "documento") {
    fileName = "documento";
  }

  const blob = new Blob([response.data], { type: response.headers["content-type"] || "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function openDocumentLink(documentId: string): void {
  window.open(`/api/candidate-documents/${documentId}/download`, "_blank");
}
