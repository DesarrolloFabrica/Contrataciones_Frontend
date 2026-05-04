import type { TeacherEvaluationSummary } from "../../../types";
import { normalizeCoordinatorDecision, type BackendDecisionStatus } from "./coordinatorStatus";

export interface TimelineEvent {
  id: string;
  label: string;
  date: string | null;
  actor: string | null;
  status: "completed" | "pending" | "unavailable";
}

export function buildTimelineEvents(
  summary: TeacherEvaluationSummary,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // 1. Evaluación creada
  events.push({
    id: "created",
    label: "Evaluación creada",
    date: summary.createdAt ?? null,
    actor: null,
    status: summary.createdAt ? "completed" : "unavailable",
  });

  // 2. Entrevista realizada
  const hasInterview = !!summary.candidate?.fullName || !!summary.interviewerUserId;
  events.push({
    id: "interview",
    label: "Entrevista realizada",
    date: hasInterview ? (summary.createdAt ?? null) : null,
    actor: null,
    status: hasInterview ? "completed" : "pending",
  });

  // 3. Análisis IA generado
  const hasAiAnalysis =
    summary.aiTeachingSuitabilityScore != null ||
    !!summary.aiFinalRecommendation ||
    !!summary.aiOverallComment;
  events.push({
    id: "ai-analysis",
    label: "Análisis IA generado",
    date: hasAiAnalysis ? (summary.createdAt ?? null) : null,
    actor: null,
    status: hasAiAnalysis ? "completed" : "pending",
  });

  // 4. Decisión coordinador
  const coordStatus: BackendDecisionStatus = normalizeCoordinatorDecision(
    summary.coordinatorDecisionStatus,
  );
  const hasCoordDecision = coordStatus !== "PENDING";
  events.push({
    id: "coordinator-decision",
    label: `Decisión coordinador${
      hasCoordDecision
        ? coordStatus === "APPROVED"
          ? " (Aprobado)"
          : " (Rechazado)"
        : ""
    }`,
    date: summary.coordinatorDecisionAt ?? null,
    actor: summary.coordinatorDecisionAt ? "Coordinador" : null,
    status: hasCoordDecision ? "completed" : "pending",
  });

  // 5. Decisión admin
  const adminStatus: BackendDecisionStatus = normalizeCoordinatorDecision(
    summary.adminDecisionStatus,
  );
  const hasAdminDecision = adminStatus !== "PENDING";
  events.push({
    id: "admin-decision",
    label: `Decisión administración${
      hasAdminDecision
        ? adminStatus === "APPROVED"
          ? " (Aprobado)"
          : " (Rechazado)"
        : ""
    }`,
    date: summary.adminDecisionAt ?? null,
    actor: summary.adminDecisionAt ? "Administrador" : null,
    status: hasAdminDecision ? "completed" : "pending",
  });

  // 6. Reporte PDF
  const hasPdf = !!summary.aiReportDriveFileId;
  events.push({
    id: "pdf-report",
    label: "Reporte PDF",
    date: null,
    actor: null,
    status: hasPdf ? "completed" : "unavailable",
  });

  return events;
}
