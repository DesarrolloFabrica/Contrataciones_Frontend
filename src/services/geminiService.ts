import api from "./apiClient";
import type { InterviewData, AnalysisResult, TeacherAiResult } from "../types";

export type InterviewComparisonResult = {
  interviewsCompared: number;
  executiveComparison: string;
  similarities: string[];
  differences: string[];
  evolution: {
    overallTrend: "Mejora" | "Empeora" | "Estable" | "Mixto";
    scoreTrend: string;
    riskTrend: string;
    verdictTrend: string;
  };
  categoryChanges: Array<{
    category: string;
    trend: "Mejora" | "Empeora" | "Estable" | "Mixto";
    keyChanges: string[];
  }>;
  redFlags: string[];
  bestInterview: {
    evaluationId: string;
    reason: string;
  } | null;
  weakestInterview: {
    evaluationId: string;
    reason: string;
  } | null;
};

export const analyzeInterviewData = async (
  data: InterviewData,
): Promise<AnalysisResult> => {
  const response = await api.post<AnalysisResult>("/gemini/analyze", data);
  return response.data;
};

type CompareInput = Array<{
  evaluationId: string;
  createdAt: string;
  analysis: AnalysisResult;
  candidateName?: string;
  programName?: string;
  schoolName?: string;
}>;

export const compareTeacherEvaluations = async (
  reports: CompareInput,
): Promise<InterviewComparisonResult> => {
  const response = await api.post<InterviewComparisonResult>("/gemini/compare", { reports });
  return response.data;
};

type CompareInterviewsInput = {
  interviewA: unknown;
  interviewB: unknown;
  meta?: {
    candidateName?: string;
    program?: string | null;
    school?: string | null;
    evaluationIdA?: string;
    evaluationIdB?: string;
    createdAtA?: string;
    createdAtB?: string;
  };
};

const normalizeAnalysisResult = (raw: unknown): AnalysisResult => {
  if (typeof raw === "string") {
    return JSON.parse(raw) as AnalysisResult;
  }
  return raw as AnalysisResult;
};

export const compareInterviewsWithGemini = async (
  input: CompareInterviewsInput,
): Promise<InterviewComparisonResult> => {
  const analysisA = normalizeAnalysisResult(input.interviewA);
  const analysisB = normalizeAnalysisResult(input.interviewB);

  const createdAtA = input.meta?.createdAtA ?? new Date(0).toISOString();
  const createdAtB = input.meta?.createdAtB ?? new Date(1).toISOString();

  const reports: CompareInput = [
    {
      evaluationId: input.meta?.evaluationIdA ?? "A",
      createdAt: createdAtA,
      analysis: analysisA,
      candidateName: input.meta?.candidateName,
      programName: input.meta?.program ?? undefined,
      schoolName: input.meta?.school ?? undefined,
    },
    {
      evaluationId: input.meta?.evaluationIdB ?? "B",
      createdAt: createdAtB,
      analysis: analysisB,
      candidateName: input.meta?.candidateName,
      programName: input.meta?.program ?? undefined,
      schoolName: input.meta?.school ?? undefined,
    },
  ];

  return compareTeacherEvaluations(reports);
};

export const analyzeTeacherInterview = async (
  data: InterviewData,
): Promise<TeacherAiResult> => {
  const result = await analyzeInterviewData(data);

  const strengths = result.categoryAnalyses
    .map((c) => `• [${c.category}] ${c.oportunidades}`)
    .join("\n");

  const improvementAreas = result.categoryAnalyses
    .map((c) => `• [${c.category}] ${c.recomendaciones}`)
    .join("\n");

  const weaknesses =
    result.mitigationRecommendations && result.mitigationRecommendations.length
      ? result.mitigationRecommendations.map((m) => `• ${m}`).join("\n")
      : undefined;

  return {
    strengths,
    weaknesses,
    improvementAreas,
    teachingSuitabilityScore: result.overallScore,
    recommendation: result.finalVerdict,
    overallComment: result.executiveSummary,
    rawOutput: result,
  };
};
