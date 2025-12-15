// src/pages/admin/hooks/useAdminEvaluationDetail.ts
import { useCallback, useMemo, useState } from "react";
import type { AnalysisResult, InterviewData, TeacherEvaluationSummary } from "../../../types";
import { getTeacherEvaluationById } from "../../../services/teachersService";
import { generateAnalysisPdfFromData } from "../../../services/pdfReport";
import type { AdminTab } from "../utils/adminTypes";

export function useAdminEvaluationDetail(params: {
  evaluations: TeacherEvaluationSummary[];
}) {
  const { evaluations } = params;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{
    analysis: AnalysisResult;
    interview: InterviewData;
    raw: any;
  } | null>(null);

  const [tab, setTab] = useState<AdminTab>("RESUMEN");

  const selectedSummary = useMemo(() => {
    if (!selectedId) return null;
    return evaluations.find((e) => e.id === selectedId) ?? null;
  }, [selectedId, evaluations]);

  const handleSelectEvaluation = useCallback(async (id: string) => {
    setSelectedId(id);
    setTab("RESUMEN");
    setLoadingDetail(true);
    setSelectedDetail(null);

    try {
      const detail = await getTeacherEvaluationById(id);
      const analysis: AnalysisResult = detail.aiRawJson;
      const interview: InterviewData = (detail.interview as InterviewData) ?? ({} as InterviewData);
      setSelectedDetail({ analysis, interview, raw: detail });
    } catch (e) {
      console.error("Admin: error cargando detalle", e);
      setSelectedDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedDetail(null);
    setLoadingDetail(false);
    setTab("RESUMEN");
  }, []);

  const exportPdf = useCallback(async () => {
    if (!selectedDetail) return;
    try {
      await generateAnalysisPdfFromData(selectedDetail.analysis, selectedDetail.interview, { download: true });
    } catch (e) {
      console.error("Admin: error exportando PDF", e);
      alert("No se pudo generar el PDF.");
    }
  }, [selectedDetail]);

  return {
    // selection
    selectedId,
    selectedSummary,

    // detail
    loadingDetail,
    selectedDetail,

    // tabs
    tab,
    setTab,

    // actions
    handleSelectEvaluation,
    clearSelection,
    exportPdf,
  };
}
