import type { SelectionCapability } from "../../services/authService";
import type { SelectionInterview } from "../interviews/types";
import type { SelectionProcessStatus } from "../selection-processes/types";

export type CharlasProductRole = "ADMIN" | "INTERVIEWER";
export type ParticipantResponsibility = "INTERVIEWER" | "RESPONSIBLE" | "OBSERVER";
export type ChecklistState = "READY" | "PENDING" | "BLOCKED" | "WARNING";

export type ProcessAccessContext = {
  selectionProcessId: string;
  productRole: CharlasProductRole;
  legacyRole: string | null;
  compatibilityMapping: string | null;
  participantId: string | null;
  responsibilities: ParticipantResponsibility[];
  globalProcessAccess: boolean;
  canRead: boolean;
  effectiveCapabilities: SelectionCapability[];
};

export type ProductProcessSummary = {
  process: {
    id: string;
    vacancyReferenceId: string;
    status: SelectionProcessStatus;
    activeTemplateVersionId: string | null;
    updatedAt: string;
  };
  vacancy: {
    positionName: string;
    areaName: string | null;
    quantity: number;
    hiredQuantity: number;
    operationStatus: string;
    resolvedManagerDisplayName: string | null;
  };
  responsibilities: ParticipantResponsibility[];
  responsibles: Array<{ id: string; name: string }>;
  indicators: {
    candidates: number;
    interviewers: number;
    assignedInterviews: number;
    completedInterviews: number;
    assessmentsReady: number;
    staleOrFailedAssessments: number;
    decisions: number;
    selected: number;
    requestedPositions: number;
    comparisonStatus: string | null;
  };
  checklist: Array<{
    key: string;
    label: string;
    state: ChecklistState;
    reason: string;
  }>;
  access?: ProcessAccessContext;
};

export type ProductHome = {
  profile: {
    productRole: CharlasProductRole;
    legacyRole: string | null;
    compatibilityMapping: string | null;
  };
  work: {
    pending: SelectionInterview[];
    inProgress: SelectionInterview[];
    recentCompleted: SelectionInterview[];
  };
  processes: Array<{
    id: string;
    vacancyReferenceId: string;
    status: SelectionProcessStatus;
    positionName: string;
    areaName: string | null;
    quantity: number;
    responsibilities: ParticipantResponsibility[];
    updatedAt: string;
  }>;
  responsibleProcesses: ProductProcessSummary[];
  admin: null | {
    coreSnapshot: {
      available: boolean;
      lastSyncedAt: string | null;
      message: string;
    };
    vacancyCount: number;
    activeProcesses: number;
    templateCount: number;
    failedJobs: Array<{
      id: string;
      jobType: string;
      errorCode: string | null;
      errorMessage: string | null;
      updatedAt: string;
    }>;
  };
};
