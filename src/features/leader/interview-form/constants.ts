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
  "w-full bg-[#132328] border border-white/10 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 outline-none transition placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/15 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/15 focus:bg-[#162a30]";

export const lightInputStyles =
  "w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none transition placeholder:text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15";

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
