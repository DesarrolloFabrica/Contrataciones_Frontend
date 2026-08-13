export type SelectionProcessStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export type SelectionProcess = {
  id: string;
  vacancyReferenceId: string;
  status: SelectionProcessStatus;
  activatedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  statusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  activeTemplateVersionId: string | null;
  activeTemplateVersion?: {
    id: string;
    versionNumber: number;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    createdAt: string;
    updatedAt: string;
    template: { id: string; name: string; description: string | null };
  } | null;
};

export const processStatusLabel: Record<SelectionProcessStatus, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export const processTransitions: Record<SelectionProcessStatus, SelectionProcessStatus[]> = {
  DRAFT: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["PAUSED", "COMPLETED", "CANCELLED"],
  PAUSED: ["ACTIVE", "COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
