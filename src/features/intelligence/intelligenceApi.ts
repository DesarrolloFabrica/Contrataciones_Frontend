import api from "../../services/apiClient";
import type {
  CandidateIntelligenceDetail,
  IntelligenceJob,
  IntelligenceOverview,
  InterviewAnalysis,
  ProcessComparison,
  SelectionDecision,
  SelectionDecisionType,
} from "./types";

type RequestResult = { job: IntelligenceJob | null; result: unknown; reused: boolean };

export async function getIntelligenceOverview(processId: string) {
  const { data } = await api.get<IntelligenceOverview>(`/selection/intelligence/processes/${processId}/overview`);
  return data;
}

export async function requestInterviewAnalysis(interviewId: string, force = false) {
  const { data } = await api.post<RequestResult>(`/selection/intelligence/interviews/${interviewId}/analysis`, { force });
  return data;
}

export async function getInterviewAnalysis(interviewId: string) {
  const { data } = await api.get<InterviewAnalysis | null>(`/selection/intelligence/interviews/${interviewId}/analysis`);
  return data;
}

export async function requestCandidateAssessment(applicationId: string, force = false) {
  const { data } = await api.post<RequestResult>(`/selection/intelligence/applications/${applicationId}/assessment`, { force });
  return data;
}

export async function requestProcessComparison(processId: string, force = false) {
  const { data } = await api.post<RequestResult>(`/selection/intelligence/processes/${processId}/comparison`, { force });
  return data;
}

export async function retryIntelligenceJob(jobId: string) {
  const { data } = await api.post<IntelligenceJob>(`/selection/intelligence/jobs/${jobId}/retry`);
  return data;
}

export async function getCandidateIntelligence(applicationId: string) {
  const { data } = await api.get<CandidateIntelligenceDetail>(`/selection/intelligence/applications/${applicationId}/assessment`);
  return data;
}

export async function getProcessComparisons(processId: string) {
  const { data } = await api.get<ProcessComparison[]>(`/selection/intelligence/processes/${processId}/comparison`);
  return data;
}

export async function saveSelectionDecision(applicationId: string, input: {
  decision: SelectionDecisionType;
  reason: string;
  notes?: string;
  assessmentId?: string | null;
  acknowledgeCoreCapacityWarning?: boolean;
}) {
  const { data } = await api.post<SelectionDecision>(`/selection/decisions/applications/${applicationId}`, input);
  return data;
}
