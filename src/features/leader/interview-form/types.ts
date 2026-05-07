import type { InterviewData } from "../../../types";
import type { TeacherCandidateSearchItemDto } from "../../../services/teachersService";

export interface InterviewFormProps {
  onSubmit: (data: InterviewData) => void;
  onStepChange?: (step: number) => void;
  examplePreset?: "approved" | "medium" | "rejected" | null;
  onExampleApplied?: () => void;
}

export interface HiringContextDraft {
  hiringRequestId?: string | null;
  contextMode?: "SELECTED" | "MANUAL";
  selectedVacancyLabel?: string;
  coordination?: string;
  targetRole: string;
  processType: string;
  requestingArea: string;
  needDescription: string;
  priority: "Alta" | "Media" | "Baja" | "";
}

export type CandidateDocumentStatus =
  | "Pendiente"
  | "Disponible"
  | "No aplica";

export interface CandidateDocumentDraft {
  id: string;
  label: string;
  status: CandidateDocumentStatus;
  note: string;
  tempUrl: string;
  file?: File | null;
  fileName?: string;
}

export interface CandidateDocumentsDraft {
  items: CandidateDocumentDraft[];
}

export interface InterviewDraft {
  v: number;
  savedAt: number;
  formData: InterviewData;
  _extract?: never;
  selectedCandidateId: string | null;
  hiringContext?: HiringContextDraft;
  candidateDocuments?: CandidateDocumentsDraft;
}

export interface RemoteSchool {
  id: string;
  name: string;
  programs?: Array<{ id: string; name: string }>;
}

export interface NormalizedSchool {
  id: string;
  name: string;
  programs: Array<{ id: string; name: string }>;
}

export type InterviewFormChangeHandler = (
  e:
    | React.ChangeEvent<HTMLInputElement>
    | React.ChangeEvent<HTMLTextAreaElement>
    | React.ChangeEvent<HTMLSelectElement>
) => void;

export type {
  TeacherCandidateSearchItemDto,
};
