import type { SelectionProcess } from "../selection-processes/types";

export type VacancyEligibilityStatus = "ELIGIBLE" | "INELIGIBLE" | "REVIEW_REQUIRED";

export type VacancyReference = {
  id: string;
  source: "CORE";
  externalVacancyId: string;
  publicId: string | null;
  positionName: string;
  quantity: number;
  hiredQuantity: number;
  pendingPositions: number;
  operationStatus: string;
  areaExternalId: string;
  areaName: string | null;
  schoolExternalId: string | null;
  schoolName: string | null;
  programExternalId: string | null;
  programName: string | null;
  directManagerRawValue: string | null;
  directManagerIdentifierType: string;
  directManagerResolutionStatus: string;
  resolvedManagerPersonExternalId: string | null;
  resolvedManagerDisplayName: string | null;
  coreCreatedAt: string;
  coreUpdatedAt: string;
  coreClosedAt: string | null;
  syncedAt: string;
  dataQualityFlags: string[];
  eligibility: { status: VacancyEligibilityStatus; reason: string };
  selectionProcesses: SelectionProcess[];
  activeProcess: SelectionProcess | null;
};

export type VacancySyncResult = {
  scanned: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  durationMs: number;
  completedAt: string;
};
