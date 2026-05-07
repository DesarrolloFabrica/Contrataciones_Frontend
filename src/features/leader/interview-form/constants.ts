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
  "w-full bg-[#080D14] border border-white/[0.08] text-slate-200 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-300 placeholder:text-slate-500 focus:bg-[#0C1218] focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:shadow-[0_0_20px_-8px_rgba(6,182,212,0.18)] hover:border-white/[0.15] hover:bg-[#0A1018]";

export const lightInputStyles =
  "w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] hover:border-slate-300";

export const candidateDocumentDefaults: CandidateDocumentsDraft = {
  items: [
    { id: "resume", label: "Hoja de vida", status: "Pendiente", note: "", tempUrl: "", file: null, fileName: "" },
    { id: "academic-certificates", label: "Certificados académicos", status: "Pendiente", note: "", tempUrl: "", file: null, fileName: "" },
    { id: "work-certificates", label: "Certificados laborales", status: "Pendiente", note: "", tempUrl: "", file: null, fileName: "" },
    { id: "portfolio", label: "Portafolio / evidencias", status: "Pendiente", note: "", tempUrl: "", file: null, fileName: "" },
    { id: "identity-document", label: "Documento de identidad", status: "Pendiente", note: "", tempUrl: "", file: null, fileName: "" },
    { id: "other-supports", label: "Otros soportes", status: "Pendiente", note: "", tempUrl: "", file: null, fileName: "" },
  ],
};

export function createInitialCandidateDocuments(): CandidateDocumentsDraft {
  return {
    items: candidateDocumentDefaults.items.map((item) => ({ ...item })),
  };
}
