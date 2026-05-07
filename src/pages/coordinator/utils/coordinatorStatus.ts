import type { LocalDecision } from "../types";

export type BackendDecisionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type VisualProcessStatus =
  | LocalDecision
  | "EN_REVISION"
  | "PRESELECCIONADO";

export function normalizeCoordinatorDecision(
  raw: unknown,
): BackendDecisionStatus {
  const s = String(raw ?? "").trim().toUpperCase();
  if (s === "APPROVED") return "APPROVED";
  if (s === "REJECTED") return "REJECTED";
  return "PENDING";
}

export function mapApiDecisionToLocal(
  v: BackendDecisionStatus | null | undefined,
): LocalDecision {
  const s = String(v ?? "").toUpperCase();
  if (s === "APPROVED") return "APROBADO";
  if (s === "REJECTED") return "RECHAZADO";
  return "PENDIENTE";
}

export function mapLocalDecisionToApi(
  d: LocalDecision,
): BackendDecisionStatus {
  if (d === "APROBADO") return "APPROVED";
  if (d === "RECHAZADO") return "REJECTED";
  return "PENDING";
}

export function getVisualProcessStatus(
  coordinatorStatus: BackendDecisionStatus | null | undefined,
  adminStatus: BackendDecisionStatus | null | undefined,
): VisualProcessStatus {
  void adminStatus;
  if (coordinatorStatus === "APPROVED") return "PRESELECCIONADO";
  if (coordinatorStatus === "REJECTED") return "RECHAZADO";
  return "EN_REVISION";
}

export interface StatusTone {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

export function getStatusTone(
  status: VisualProcessStatus,
  isDark: boolean,
): StatusTone {
  switch (status) {
    case "APROBADO":
    case "PRESELECCIONADO":
      return isDark
        ? {
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            text: "text-emerald-300",
            dot: "bg-emerald-400",
          }
        : {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            text: "text-emerald-700",
            dot: "bg-emerald-500",
          };
    case "RECHAZADO":
      return isDark
        ? {
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            text: "text-rose-300",
            dot: "bg-rose-400",
          }
        : {
            bg: "bg-rose-50",
            border: "border-rose-200",
            text: "text-rose-700",
            dot: "bg-rose-500",
          };
    case "EN_REVISION":
      return isDark
        ? {
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
            text: "text-cyan-300",
            dot: "bg-cyan-400",
          }
        : {
            bg: "bg-cyan-50",
            border: "border-cyan-200",
            text: "text-cyan-700",
            dot: "bg-cyan-500",
          };
    default:
      return isDark
        ? {
            bg: "bg-white/5",
            border: "border-white/10",
            text: "text-slate-400",
            dot: "bg-slate-500",
          }
        : {
            bg: "bg-slate-100",
            border: "border-slate-200",
            text: "text-slate-600",
            dot: "bg-slate-400",
          };
  }
}
