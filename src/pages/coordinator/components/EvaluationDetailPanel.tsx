import React, { useMemo } from "react";
import { FileText, Loader2, Search } from "lucide-react";
import type { AnalysisResult, InterviewData } from "../../../types";

import DetailTabs from "./DetailTabs";
import DecisionTab from "./DecisionTab";
import AiSummaryTab from "./AiSummaryTab";
import NotesTab from "./NotesTab";

import type { CoordinatorCriteria, DetailTabKey, LocalDecision } from "../types";

type Props = {
  selectedId: string | null;
  selectedDetail: { analysis: AnalysisResult; interview: InterviewData } | null;
  loadingDetail: boolean;

  onExportPdf: () => void;

  detailTab: DetailTabKey;
  setDetailTab: (v: DetailTabKey) => void;

  decision: LocalDecision;
  decisionComment: string;
  setDecisionComment: (v: string) => void;
  onDecisionCommentBlur: () => void;

  // ✅ Decisión (local)
  onApplyDecision: (d: LocalDecision) => void;

  // ✅ NUEVO (Notas)
  notes: string;
  setNotes: (v: string) => void;
  criteria: CoordinatorCriteria;
  setCriteria: (next: CoordinatorCriteria) => void;

  // ✅ NUEVO (Validación + envío)
  canSubmitDecision: boolean;
  missingReasons: string[];
  onSubmitDecision: () => void;
};

export default function EvaluationDetailPanel({
  selectedId,
  selectedDetail,
  loadingDetail,
  onExportPdf,
  detailTab,
  setDetailTab,
  decision,
  decisionComment,
  setDecisionComment,
  onDecisionCommentBlur,
  onApplyDecision,
  notes,
  setNotes,
  criteria,
  setCriteria,
  canSubmitDecision,
  missingReasons,
  onSubmitDecision,
}: Props) {
  const hasDetail = !!selectedDetail && !loadingDetail;

  return (
    <div className="bg-[#050505]/90 border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Detalle de Evaluación Seleccionada
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Ver informe IA y prototipar la decisión de contratación.
          </p>
        </div>

        {hasDetail && (
          <button
            type="button"
            onClick={onExportPdf}
            className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
        )}
      </div>

      <DetailTabs value={detailTab} onChange={setDetailTab} />

      {loadingDetail && (
        <div className="flex flex-1 items-center justify-center text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Cargando informe de la evaluación…</span>
        </div>
      )}

      {!loadingDetail && !selectedDetail && (
        <div className="flex flex-1 flex-col items-center justify-center text-gray-500 gap-3">
          <Search className="w-8 h-8" />
          <p className="text-sm text-center max-w-sm">
            Selecciona una evaluación en el panel izquierdo para ver el informe completo generado por IA.
          </p>
        </div>
      )}

      {!loadingDetail && selectedDetail && (
        <div className="mt-2">
          {detailTab === "DECISION" && (
            <DecisionTab
              selectedId={selectedId}
              decision={decision}
              decisionComment={decisionComment}
              setDecisionComment={setDecisionComment}
              onDecisionCommentBlur={onDecisionCommentBlur}
              onApplyDecision={onApplyDecision}
              canSubmitDecision={canSubmitDecision}
              missingReasons={missingReasons}
              onSubmitDecision={onSubmitDecision}
            />
          )}

          {detailTab === "AI" && (
            <AiSummaryTab analysis={selectedDetail.analysis} />
          )}

          {detailTab === "NOTES" && (
            <NotesTab
              notes={notes}
              setNotes={setNotes}
              criteria={criteria}
              setCriteria={setCriteria}
            />
          )}
        </div>
      )}
    </div>
  );
}
