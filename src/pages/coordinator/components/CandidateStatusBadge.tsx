import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  getVisualProcessStatus,
  getStatusTone,
  type VisualProcessStatus,
  type BackendDecisionStatus,
} from "../utils/coordinatorStatus";

const statusLabel: Record<VisualProcessStatus, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  EN_REVISION: "En revisión",
  PRESELECCIONADO: "Preseleccionado",
};

interface CandidateStatusBadgeProps {
  coordinatorStatus?: BackendDecisionStatus | null;
  adminStatus?: BackendDecisionStatus | null;
  size?: "sm" | "md";
}

export const CandidateStatusBadge: React.FC<CandidateStatusBadgeProps> = ({
  coordinatorStatus,
  adminStatus,
  size = "sm",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const status = getVisualProcessStatus(coordinatorStatus, adminStatus);
  const tone = getStatusTone(status, isDark);
  const label = statusLabel[status];

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-1 text-[10px]"
      : "px-4 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider ${sizeClasses} ${tone.bg} ${tone.border} ${tone.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
      {label}
    </span>
  );
};

export default CandidateStatusBadge;
