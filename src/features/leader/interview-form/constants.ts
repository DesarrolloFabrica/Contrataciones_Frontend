import type { InterviewData } from "../../../types";
import type { InterviewDraft, CandidateDocumentsDraft } from "./types";

export const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

export const DRAFT_VERSION = 1;

export const MIN_CC_LENGTH = 6;
export const MAX_CC_LENGTH = 11;

export const initialFormData: InterviewData = {
  documentNumber: "",
  candidateName: "",
  age: "",
  school: "",
  program: "",
  careerSummary: "",
  previousExperience: "",
  availabilityDetails: "",
  acceptsCommittees: "Sí",
  otherJobs: "",
  evaluationMethodology: "",
  failureRatePlan: "",
  apatheticStudentPlan: "",
  aiToolsUsage: "",
  ethicalAiMeasures: "",
  aiPlagiarismPrevention: "",
  scenario29: "",
  scenarioCoverage: "",
  scenarioFeedback: "",
};

export const draftKey = (orgId: string, userId?: string) =>
  `leader:interviewDraft:v${DRAFT_VERSION}:${orgId}:${userId ?? "anon"}`;

export function safeParseDraft(raw: string | null): InterviewDraft | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    if (!d || typeof d !== "object") return null;
    if (d.v !== DRAFT_VERSION) return null;
    if (!d.formData) return null;
    return d as InterviewDraft;
  } catch {
    return null;
  }
}

export const darkInputStyles =
  "w-full bg-[#07090B] border border-white/[0.10] text-gray-200 text-sm rounded-xl px-4 py-3.5 outline-none transition-all duration-300 placeholder:text-gray-500 focus:bg-[#0F1216] focus:border-emerald-500/25 focus:ring-1 focus:ring-emerald-500/20 focus:shadow-[0_0_18px_-10px_rgba(16,185,129,0.14)] hover:border-white/[0.14] hover:bg-[#0C0F12]";

export const lightInputStyles =
  "w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3.5 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.20)] hover:border-slate-300";

export const candidateDocumentDefaults: CandidateDocumentsDraft = {
  items: [
    { id: "resume", label: "Hoja de vida", status: "Pendiente", note: "", tempUrl: "" },
    { id: "academic-certificates", label: "Certificados académicos", status: "Pendiente", note: "", tempUrl: "" },
    { id: "work-certificates", label: "Certificados laborales", status: "Pendiente", note: "", tempUrl: "" },
    { id: "portfolio", label: "Portafolio / evidencias", status: "Pendiente", note: "", tempUrl: "" },
    { id: "identity-document", label: "Documento de identidad", status: "Pendiente", note: "", tempUrl: "" },
    { id: "other-supports", label: "Otros soportes", status: "Pendiente", note: "", tempUrl: "" },
  ],
};

export function createInitialCandidateDocuments(): CandidateDocumentsDraft {
  return {
    items: candidateDocumentDefaults.items.map((item) => ({ ...item })),
  };
}
