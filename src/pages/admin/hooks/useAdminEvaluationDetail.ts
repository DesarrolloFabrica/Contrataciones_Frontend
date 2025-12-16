// src/pages/admin/hooks/useAdminEvaluationDetail.ts
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  AnalysisResult,
  InterviewData,
  TeacherEvaluationSummary,
} from "../../../types";
import { getTeacherEvaluationById } from "../../../services/teachersService";
import { generateAnalysisPdfFromData } from "../../../services/pdfReport";
import type { AdminTab } from "../adminTypes";
import { adminMockDb } from "../utils/adminMockDb";

type DetailPayload = {
  analysis: AnalysisResult;
  interview: InterviewData;
  raw: any;
};

const DEFAULT_TAB: AdminTab = "RESUMEN";

export function useAdminEvaluationDetail(params: {
  evaluations: TeacherEvaluationSummary[];
}) {
  const { evaluations } = params;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<DetailPayload | null>(null);
  const [tab, setTab] = useState<AdminTab>(DEFAULT_TAB);

  // ✅ Evita respuestas “tardías” cuando el admin cambia rápido de evaluación
  const requestSeqRef = useRef(0);

  const selectedSummary = useMemo(() => {
    if (!selectedId) return null;
    return evaluations.find((e) => e.id === selectedId) ?? null;
  }, [selectedId, evaluations]);

  const resetDetailState = useCallback((nextTab: AdminTab = DEFAULT_TAB) => {
    setTab(nextTab);
    setLoadingDetail(false);
    setSelectedDetail(null);
  }, []);

  const handleSelectEvaluation = useCallback(async (id: string) => {
    // ✅ Estado base inmediato (UX)
    setSelectedId(id);
    setTab(DEFAULT_TAB);
    setLoadingDetail(true);
    setSelectedDetail(null);

    // ✅ AUDIT: detalle abierto
    adminMockDb.logEvaluationEvent(id, "DETAIL_VIEWED", {
      source: "AdminConsole",
    });

    const mySeq = ++requestSeqRef.current;

    try {
      const detail = await getTeacherEvaluationById(id);

      // ✅ Si ya hubo otra selección después, ignoramos este resultado
      if (mySeq !== requestSeqRef.current) return;

      const analysis: AnalysisResult = detail.aiRawJson;
      const interview: InterviewData =
        (detail.interview as InterviewData) ?? ({} as InterviewData);

      setSelectedDetail({ analysis, interview, raw: detail });
    } catch (e) {
      // ✅ Solo reporta si sigue siendo el request vigente
      if (mySeq !== requestSeqRef.current) return;

      console.error("Admin: error cargando detalle", e);
      setSelectedDetail(null);
    } finally {
      if (mySeq !== requestSeqRef.current) return;
      setLoadingDetail(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    // ✅ Invalida cualquier request en curso
    requestSeqRef.current += 1;

    setSelectedId(null);
    resetDetailState(DEFAULT_TAB);
  }, [resetDetailState]);

  const exportPdf = useCallback(async () => {
    if (!selectedDetail || !selectedId) return;

    try {
      await generateAnalysisPdfFromData(
        selectedDetail.analysis,
        selectedDetail.interview,
        { download: true }
      );

      // ✅ AUDIT: exportó PDF
      adminMockDb.logEvaluationEvent(selectedId, "PDF_EXPORTED", {
        via: "AdminDetailPanel",
      });
    } catch (e) {
      console.error("Admin: error exportando PDF", e);
      alert("No se pudo generar el PDF.");
    }
  }, [selectedDetail, selectedId]);

  return {
    selectedId,
    selectedSummary,
    loadingDetail,
    selectedDetail,
    tab,
    setTab,
    handleSelectEvaluation,
    clearSelection,
    exportPdf,
  };
}
