// src/pages/admin/hooks/useAdminEvaluationDetail.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AnalysisResult,
  InterviewData,
  TeacherEvaluationSummary,
} from "../../../types";
import { getTeacherEvaluationById } from "../../../services/teachersService";
import { generateAnalysisPdfFromData } from "../../../services/pdfReport";
import { adminMockDb } from "../utils/adminMockDb";

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
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<DetailPayload | null>(null);

  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const selectedSummary = useMemo(() => {
    if (!selectedId) return null;
    return evaluations.find((e) => e.id === selectedId) ?? null;
  }, [selectedId, evaluations]);

  const resetDetailState = useCallback(() => {
    setLoadingDetail(false);
    setSelectedDetail(null);
    setErrorDetail(null);
  }, []);

  const handleSelectEvaluation = useCallback(async (id: string) => {
    setSelectedId(id);
    setLoadingDetail(true);
    setSelectedDetail(null);
    setErrorDetail(null);

    try {
      localStorage.setItem(LS_SELECTED_EVAL_KEY, id);
    } catch {}

    adminMockDb.logEvaluationEvent(id, "DETAIL_VIEWED", { source: "AdminConsole" });

    const mySeq = ++requestSeqRef.current;

    try {
      const detail = await getTeacherEvaluationById(id);
      if (mySeq !== requestSeqRef.current) return;

      const analysis: AnalysisResult = detail.aiRawJson;
      const interview: InterviewData =
        (detail.interview as InterviewData) ?? ({} as InterviewData);

      setSelectedDetail({ analysis, interview, raw: detail });
    } catch (e) {
      if (mySeq !== requestSeqRef.current) return;

      console.error("Admin: error cargando detalle", e);
      setSelectedDetail(null);
      setErrorDetail("No se pudo cargar el detalle de esta evaluación.");
    } finally {
      if (mySeq !== requestSeqRef.current) return;
      setLoadingDetail(false);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluations.length, selectedId]);

  // ✅ NUEVO: arma contexto candidato desde summary + raw
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
      // lo más importante:
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

      // opcional: edad/fecha nacimiento si existe
      age:
        cand?.age ??
        raw?.age ??
        "",

      // útil para el PDF
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

          // ✅ CLAVE: pasar metadata de candidato al PDF
          candidate: candidateContext,
        }
      );

      adminMockDb.logEvaluationEvent(selectedId, "PDF_EXPORTED", {
        via: "AdminDetailPanel",
      });
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
