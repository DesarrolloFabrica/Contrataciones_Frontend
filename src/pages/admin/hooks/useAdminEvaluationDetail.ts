import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  AnalysisResult,
  InterviewData,
  TeacherEvaluationSummary,
} from "../../../types";
import { getTeacherEvaluationById } from "../../../services/teachersService";
import { generateAnalysisPdfFromData } from "../../../services/pdfReport";
import { queryKeys } from "../../../services/queryKeys";

type DetailPayload = {
  analysis: AnalysisResult;
  interview: InterviewData;
  raw: any;
};

const LS_SELECTED_EVAL_KEY = "ADMIN_SELECTED_EVAL_ID";

export function useAdminEvaluationDetail(params: {
  evaluations: TeacherEvaluationSummary[];
}) {
  const { evaluations } = params;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<DetailPayload | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const { data: detailData, isLoading: loadingDetail } = useQuery({
    queryKey: selectedId ? queryKeys.evaluations.detail(selectedId) : ["evaluations", "detail", null],
    queryFn: selectedId ? () => getTeacherEvaluationById(selectedId) : async () => null,
    enabled: !!selectedId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!detailData || !selectedId) return;

    const mySeq = ++requestSeqRef.current;

    const analysis: AnalysisResult = detailData.aiRawJson;
    const interview: InterviewData =
      (detailData.interview as InterviewData) ?? ({} as InterviewData);

    setSelectedDetail({ analysis, interview, raw: detailData });
    setErrorDetail(null);

    return () => {
      if (mySeq !== requestSeqRef.current) return;
    };
  }, [detailData, selectedId]);

  const selectedSummary = useMemo(() => {
    if (!selectedId) return null;
    return evaluations.find((e) => e.id === selectedId) ?? null;
  }, [selectedId, evaluations]);

  const resetDetailState = useCallback(() => {
    setSelectedDetail(null);
    setErrorDetail(null);
  }, []);

  const handleSelectEvaluation = useCallback(async (id: string) => {
    setSelectedId(id);
    setSelectedDetail(null);
    setErrorDetail(null);

    try {
      localStorage.setItem(LS_SELECTED_EVAL_KEY, id);
    } catch {}
  }, []);

  const clearSelection = useCallback(() => {
    requestSeqRef.current += 1;
    setSelectedId(null);
    resetDetailState();

    try {
      localStorage.removeItem(LS_SELECTED_EVAL_KEY);
    } catch {}
  }, [resetDetailState]);

  useEffect(() => {
    if (selectedId) return;
    if (!evaluations || evaluations.length === 0) return;

    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LS_SELECTED_EVAL_KEY);
    } catch {
      saved = null;
    }
    if (!saved) return;

    const exists = evaluations.some((e) => e.id === saved);
    if (!exists) {
      try {
        localStorage.removeItem(LS_SELECTED_EVAL_KEY);
      } catch {}
      return;
    }

    handleSelectEvaluation(saved);
  }, [evaluations.length, selectedId, handleSelectEvaluation]);

  const candidateContext = useMemo(() => {
    const sum: any = selectedSummary ?? {};
    const raw: any = selectedDetail?.raw ?? {};

    const cand =
      sum?.candidate ??
      raw?.candidate ??
      raw?.teacher ??
      raw?.person ??
      raw?.profile ??
      {};

    return {
      fullName:
        cand?.fullName ??
        cand?.name ??
        sum?.candidate?.fullName ??
        raw?.candidateFullName ??
        raw?.fullName ??
        "",

      schoolName:
        cand?.schoolNameSnapshot ??
        cand?.schoolName ??
        sum?.candidate?.schoolNameSnapshot ??
        raw?.schoolNameSnapshot ??
        raw?.schoolName ??
        "",

      programName:
        cand?.programNameSnapshot ??
        cand?.programName ??
        sum?.candidate?.programNameSnapshot ??
        raw?.programNameSnapshot ??
        raw?.programName ??
        "",

      age:
        cand?.age ??
        raw?.age ??
        "",

      evaluationId: selectedId ?? "",
    };
  }, [selectedSummary, selectedDetail?.raw, selectedId]);

  const exportPdf = useCallback(async () => {
    if (!selectedDetail || !selectedId) return;

    try {
      await generateAnalysisPdfFromData(
        selectedDetail.analysis,
        selectedDetail.interview,
        {
          download: true,
          candidate: candidateContext,
        }
      );
    } catch (e) {
      console.error("Admin: error exportando PDF", e);
      alert("No se pudo generar el PDF.");
    }
  }, [selectedDetail, selectedId, candidateContext]);

  return {
    selectedId,
    selectedSummary,
    loadingDetail,
    selectedDetail,
    handleSelectEvaluation,
    clearSelection,
    exportPdf,
    errorDetail,
  };
}
