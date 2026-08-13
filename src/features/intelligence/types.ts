import type { Application } from "../candidates/types";
import type { SelectionInterview } from "../interviews/types";
import type { SelectionProcess } from "../selection-processes/types";

export type IntelligenceJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type IntelligenceResultStatus = IntelligenceJobStatus | "STALE";
export type ScoringStatus = "AVAILABLE" | "INSUFFICIENT_SCORING_CONFIGURATION";
export type CoverageStatus = "PARTIAL" | "COMPLETE";
export type CandidateRecommendation = "STRONGLY_RECOMMENDED" | "RECOMMENDED" | "RECOMMENDED_WITH_RESERVATIONS" | "NOT_RECOMMENDED" | "INSUFFICIENT_INFORMATION";
export type SelectionDecisionType = "SELECTED" | "NOT_SELECTED" | "ON_HOLD";

export type IntelligenceJob = {
  id: string;
  type: "INTERVIEW_ANALYSIS" | "CANDIDATE_ASSESSMENT" | "PROCESS_COMPARISON";
  targetId: string;
  resultId: string | null;
  status: IntelligenceJobStatus;
  attempts: number;
  maxAttempts: number;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type IntelligenceEvidence = {
  sourceRef: string;
  statement: string;
  classification: "EVIDENCE" | "INFERENCE" | "INTERVIEWER_OPINION";
  relevance: string;
};

export type CompetencyAssessment = {
  criterionRef: string | null;
  competency: string;
  score: number | null;
  confidence: number;
  rationale: string;
  evidenceRefs: string[];
};

export type ExplainableScore = {
  status: ScoringStatus;
  overallScore: number | null;
  confidence: number;
  reason: string | null;
  criteria: Array<{
    criterionRef: string;
    criterion: string;
    competency: string | null;
    weight: number;
    normalizedWeight: number;
    criterionScore: number;
    weightedScore: number;
    scoreSource: "SCALE" | "STRUCTURED_AI";
    evidenceRefs: string[];
    explanation: string;
  }>;
};

export type InterviewAnalysisOutput = {
  summary: string;
  strengths: string[];
  risks: string[];
  competencies: CompetencyAssessment[];
  evidence: IntelligenceEvidence[];
  concerns: string[];
  unansweredOrWeakAreas: string[];
  interviewerConsistencyNotes: string[];
  overallAssessment: string;
  confidence: number;
};

export type InterviewAnalysis = {
  id: string;
  interviewId: string;
  version: number;
  status: IntelligenceResultStatus;
  provider: string | null;
  model: string | null;
  promptVersion: string;
  inputHash: string;
  output: InterviewAnalysisOutput | null;
  scoring: ExplainableScore | null;
  errorCode: string | null;
  errorMessage: string | null;
  generatedAt: string | null;
  staleAt: string | null;
  job?: IntelligenceJob | null;
};

export type InterviewCoverage = {
  requiredInterviews: number;
  completedInterviews: number;
  cancelledInterviews: number;
  pendingInterviews: number;
  completionPercentage: number;
  status: CoverageStatus;
};

export type CandidateAssessmentOutput = {
  consolidatedSummary: string;
  strengths: string[];
  risks: string[];
  competencies: CompetencyAssessment[];
  evidence: IntelligenceEvidence[];
  disagreementsBetweenInterviewers: string[];
  informationGaps: string[];
  facts: string[];
  inferences: string[];
  interviewerOpinions: string[];
  confidence: number;
  recommendation: CandidateRecommendation;
  recommendationExplanation: string;
};

export type CandidateAssessment = {
  id: string;
  applicationId: string;
  version: number;
  status: IntelligenceResultStatus;
  coverage: InterviewCoverage;
  output: CandidateAssessmentOutput | null;
  aggregateScoring: ExplainableScore | null;
  overallScore: string | null;
  scoringStatus: ScoringStatus;
  recommendation: CandidateRecommendation;
  confidence: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  provider: string | null;
  model: string | null;
  promptVersion: string;
  generatedAt: string | null;
  staleAt: string | null;
};

export type SelectionDecision = {
  id: string;
  applicationId: string;
  decision: SelectionDecisionType;
  decidedAt: string;
  reason: string;
  notes: string | null;
  assessmentId: string | null;
  active: boolean;
  decidedBy?: { id: string; fullName: string; email: string } | null;
};

export type ProcessComparison = {
  id: string;
  selectionProcessId: string;
  version: number;
  status: IntelligenceResultStatus;
  output: {
    summary: string;
    candidates: Array<{
      candidateRef: string;
      strengths: string[];
      risks: string[];
      competencies: string[];
      gaps: string[];
      differentiators: string[];
      tradeOffs: string[];
      recommendationSummary: string;
    }>;
    crossCandidateTradeOffs: string[];
    informationGaps: string[];
    recommendationSummary: string;
    confidence: number;
  } | null;
  inputSnapshot: { references: Record<string, string> };
  ranking: Array<{ applicationId: string; rank: number; score: number }> | null;
  isScoreComparable: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  generatedAt: string | null;
};

export type Capacity = {
  requestedPositions: number;
  hiredInCore: number;
  pendingInCore: number;
  locallySelected: number;
  locallyAvailable: number;
  coreCapacityWarning: boolean;
};

export type CandidateIntelligenceRow = {
  application: Application;
  coverage: InterviewCoverage;
  interviews: Array<{
    interview: SelectionInterview;
    analysis: InterviewAnalysis | null;
    analysisJob: IntelligenceJob | null;
  }>;
  assessment: CandidateAssessment | null;
  assessmentJob: IntelligenceJob | null;
  decision: SelectionDecision | null;
};

export type ProcessReadiness = {
  applications: number;
  requiredInterviews: number;
  completedInterviews: number;
  interviewsComplete: boolean;
  assessmentsGenerated: number;
  decisionsRegistered: number;
  locallySelected: number;
  requestedPositions: number;
  hiredInCore: number;
  localPositionsCovered: boolean;
  readyForHumanCompletion: boolean;
  processStatus: string;
  note: string;
};

export type IntelligenceOverview = {
  process: SelectionProcess & { vacancyReference: { positionName: string; areaName: string | null; quantity: number; hiredQuantity: number } };
  capacity: Capacity;
  candidates: CandidateIntelligenceRow[];
  comparison: ProcessComparison | null;
  comparisonJob: IntelligenceJob | null;
  canManageDecisions: boolean;
  readiness: ProcessReadiness;
};

export type CandidateIntelligenceDetail = CandidateIntelligenceRow & {
  process: IntelligenceOverview["process"];
  capacity: Capacity;
  canManageDecision: boolean;
  assessmentHistory: CandidateAssessment[];
  decisionHistory: SelectionDecision[];
};

export const recommendationLabel: Record<CandidateRecommendation, string> = {
  STRONGLY_RECOMMENDED: "Altamente recomendado",
  RECOMMENDED: "Recomendado",
  RECOMMENDED_WITH_RESERVATIONS: "Recomendado con reservas",
  NOT_RECOMMENDED: "No recomendado",
  INSUFFICIENT_INFORMATION: "Información insuficiente",
};

export const decisionLabel: Record<SelectionDecisionType, string> = {
  SELECTED: "Seleccionado",
  NOT_SELECTED: "No seleccionado",
  ON_HOLD: "En espera",
};
