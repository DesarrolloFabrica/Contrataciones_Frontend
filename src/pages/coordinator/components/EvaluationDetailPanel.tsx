// src/pages/coordinator/components/EvaluationDetailPanel.tsx
import { FileText, Loader2, Search } from "lucide-react";
import type { AnalysisResult, InterviewData } from "../../../types";
import DetailTabs from "./DetailTabs";
import DecisionTab from "./DecisionTab";
import AiSummaryTab from "./AiSummaryTab";
import AuditTab from "./AuditTab";
import TechTab from "./TechTab";
import type { DetailTabKey, LocalDecision, TimelineTab } from "../types";

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
  onApplyDecision: (d: LocalDecision) => void;

  timelineTab: TimelineTab;
  setTimelineTab: (v: TimelineTab) => void;
  activityByEval: any[];
  activityGlobal: any[];
};

export default function EvaluationDetailPanel({
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
  timelineTab,
  setTimelineTab,
  activityByEval,
  activityGlobal,
}: Props) {
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

        {selectedDetail && (
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
              decision={decision}
              decisionComment={decisionComment}
              setDecisionComment={setDecisionComment}
              onDecisionCommentBlur={onDecisionCommentBlur}
              onApplyDecision={onApplyDecision}
            />
          )}

          {detailTab === "AI" && <AiSummaryTab analysis={selectedDetail.analysis} />}

          {detailTab === "AUDIT" && (
            <AuditTab
              timelineTab={timelineTab}
              setTimelineTab={setTimelineTab}
              activityByEval={activityByEval}
              activityGlobal={activityGlobal}
            />
          )}

          {detailTab === "TECH" && <TechTab analysis={selectedDetail.analysis} />}
        </div>
      )}
    </div>
  );
}
