export type ParticipantResponsibility = "INTERVIEWER" | "RESPONSIBLE" | "OBSERVER";

export type ProcessParticipant = {
  id: string;
  selectionProcessId: string;
  userId: string;
  responsibilities: ParticipantResponsibility[];
  user: { id: string; fullName: string; email: string; role: string; isActive: boolean };
  createdAt: string;
};

export type ParticipantUser = ProcessParticipant["user"];

export const responsibilityLabel: Record<ParticipantResponsibility, string> = {
  INTERVIEWER: "Entrevistador",
  RESPONSIBLE: "Responsable",
  OBSERVER: "Observador",
};
