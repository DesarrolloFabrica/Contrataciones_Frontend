import type { SelectionProcess } from "../selection-processes/types";

export type Candidate = {
  id: string;
  identificationType: string | null;
  identificationValue: string | null;
  identificationCountryCode: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStatus =
  | "REGISTERED"
  | "IN_REVIEW"
  | "IN_PROCESS"
  | "WITHDRAWN"
  | "CLOSED";

export type Application = {
  id: string;
  selectionProcessId: string;
  candidateId: string;
  status: ApplicationStatus;
  statusUpdatedAt: string;
  withdrawnAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  candidate: Candidate;
  selectionProcess?: SelectionProcess;
};

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  REGISTERED: "Registrada",
  IN_REVIEW: "En revisión",
  IN_PROCESS: "En proceso",
  WITHDRAWN: "Retirada",
  CLOSED: "Cerrada",
};

export const applicationTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  REGISTERED: ["IN_REVIEW", "IN_PROCESS", "WITHDRAWN", "CLOSED"],
  IN_REVIEW: ["IN_PROCESS", "WITHDRAWN", "CLOSED"],
  IN_PROCESS: ["IN_REVIEW", "WITHDRAWN", "CLOSED"],
  WITHDRAWN: [],
  CLOSED: [],
};

export type CandidateInput = {
  fullName: string;
  email?: string;
  phone?: string;
  identificationType?: string;
  identificationValue?: string;
  identificationCountryCode?: string;
};
