export type TemplateVersionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type QuestionType = "SHORT_TEXT" | "LONG_TEXT" | "NUMBER" | "BOOLEAN" | "SINGLE_SELECT" | "MULTI_SELECT" | "SCALE";

export type TemplateQuestionInput = {
  prompt: string;
  helpText?: string | null;
  type: QuestionType;
  required: boolean;
  weight?: number | null;
  competency?: string | null;
  evaluationGuidance?: string | null;
  configuration: Record<string, unknown>;
};

export type TemplateQuestion = TemplateQuestionInput & {
  id: string;
  displayOrder: number;
};

export type TemplateSectionInput = {
  title: string;
  description?: string | null;
  questions: TemplateQuestionInput[];
};

export type TemplateSection = Omit<TemplateSectionInput, "questions"> & {
  id: string;
  displayOrder: number;
  questions: TemplateQuestion[];
};

export type InterviewTemplateVersion = {
  id: string;
  templateId: string;
  versionNumber: number;
  status: TemplateVersionStatus;
  changeSummary: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  template?: InterviewTemplate;
  sections?: TemplateSection[];
};

export type InterviewTemplate = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  versions: InterviewTemplateVersion[];
};

export type ExcelPreview = {
  valid: boolean;
  rowsRead: number;
  sections: TemplateSectionInput[];
  errors: Array<{ row: number; field?: string; message: string }>;
};

export const questionTypeLabel: Record<QuestionType, string> = {
  SHORT_TEXT: "Texto corto",
  LONG_TEXT: "Texto largo",
  NUMBER: "Número",
  BOOLEAN: "Sí / No",
  SINGLE_SELECT: "Selección única",
  MULTI_SELECT: "Selección múltiple",
  SCALE: "Escala",
};

export const templateStatusLabel: Record<TemplateVersionStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicada",
  ARCHIVED: "Archivada",
};
