import type { Application } from "../candidates/types";
import type { InterviewTemplateVersion, TemplateSection } from "../templates/types";

export type InterviewStatus = "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type InterviewAnswer = {
  id: string;
  interviewId: string;
  questionId: string;
  value: unknown;
  questionSnapshot: Record<string, unknown>;
  updatedAt: string;
};

export type SelectionInterview = {
  id: string;
  applicationId: string;
  interviewerUserId: string;
  templateVersionId: string;
  templateSnapshot: {
    templateName: string;
    versionNumber: number;
    sections: TemplateSection[];
  };
  status: InterviewStatus;
  generalObservations: string | null;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  application: Application & { selectionProcess: { id: string; vacancyReference: { id: string; positionName: string; areaName: string | null; publicId: string | null } } };
  interviewer: { id: string; fullName: string; email: string };
  templateVersion: InterviewTemplateVersion;
  answers?: InterviewAnswer[];
};

export const interviewStatusLabel: Record<InterviewStatus, string> = {
  ASSIGNED: "Pendiente",
  IN_PROGRESS: "Charla en curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};
