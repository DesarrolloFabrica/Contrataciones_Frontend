import type { InterviewStatus, SelectionInterview } from "./types";

export type InterviewerWorkTab = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export function groupInterviewsByWorkTab(interviews: SelectionInterview[] | undefined) {
  const list = interviews ?? [];
  return {
    PENDING: list.filter((item) => item.status === "ASSIGNED"),
    IN_PROGRESS: list.filter((item) => item.status === "IN_PROGRESS"),
    COMPLETED: list.filter((item) => item.status === "COMPLETED" || item.status === "CANCELLED"),
  };
}

export function interviewActionLabel(status: InterviewStatus): string {
  if (status === "ASSIGNED") return "Iniciar charla";
  if (status === "IN_PROGRESS") return "Continuar";
  if (status === "COMPLETED") return "Ver charla";
  return "Ver charla";
}

export function interviewProgress(interview: SelectionInterview): { answered: number; total: number; percent: number } | null {
  const questions = interview.templateSnapshot?.sections?.flatMap((section) => section.questions) ?? [];
  if (!questions.length) return null;
  const answered =
    interview.answers?.filter((answer) => answer.value !== null && answer.value !== "" && !(Array.isArray(answer.value) && answer.value.length === 0)).length ?? 0;
  return {
    answered,
    total: questions.length,
    percent: Math.round((answered / questions.length) * 100),
  };
}

export function relevantInterviewDate(interview: SelectionInterview): { label: string; value: string } {
  if (interview.status === "COMPLETED" && interview.completedAt) {
    return { label: "Finalizada", value: interview.completedAt };
  }
  if (interview.status === "CANCELLED" && interview.cancelledAt) {
    return { label: "Cancelada", value: interview.cancelledAt };
  }
  if (interview.status === "IN_PROGRESS" && interview.startedAt) {
    return { label: "Iniciada", value: interview.startedAt };
  }
  return { label: "Asignada", value: interview.assignedAt };
}
