// src/pages/coordinator/components/EvaluationDetailPanel.tsx
import React, { useMemo } from "react";
import { FileText, Loader2, Search } from "lucide-react";
import type { AnalysisResult, InterviewData } from "../../../types";

import DetailTabs from "./DetailTabs";
import DecisionTab from "./DecisionTab";
import AiSummaryTab from "./AiSummaryTab";
import InterviewsTab from "./InterviewTab"; // ✅ NUEVO
import AuditTab from "./AuditTab";
import TechTab from "./TechTab";
import NotesTab from "./NotesTab"; // ✅ NUEVO


import type {
  CoordinatorCriteria,
  DetailTabKey,
  LocalDecision,
  TimelineTab,
  CandidateGroup, // ✅ NUEVO
} from "../types";

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

  onOpenComparison: () => void;

  // ✅ “Notas” se reemplaza por entrevistas (por ahora)
  notes: string;
  setNotes: (v: string) => void;
  criteria: CoordinatorCriteria;
  setCriteria: (next: CoordinatorCriteria) => void;

  canSubmitDecision: boolean;
  missingReasons: string[];
  onSubmitDecision: () => void;

  // ✅ NUEVO: grupo del candidato + handler para abrir entrevista
  candidateGroup: CandidateGroup | null;
  onOpenInterview: (evaluationId: string) => void;

  timelineTab?: TimelineTab;
  setTimelineTab?: (v: TimelineTab) => void;
  activityByEval?: any[];
  activityGlobal?: any[];

  // ✅ RESUMEN IA PROMEDIO
  avgAnalysis?: AnalysisResult | null;
  avgLoading?: boolean;
  avgError?: string | null;

  variabilityInfo?: {
    level: "Baja" | "Media" | "Alta";
    label: string;
    details?: string[];
  } | null;
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
  onOpenComparison,
  notes,
  setNotes,
  criteria,
  setCriteria,
  canSubmitDecision,
  missingReasons,
  onSubmitDecision,
  candidateGroup,
  onOpenInterview,
  timelineTab,
  setTimelineTab,
  activityByEval,
  activityGlobal,
  avgAnalysis,
  avgLoading,
  avgError,
  variabilityInfo,
  
}: Props) {
  const hasDetail = !!selectedDetail && !loadingDetail;
  
  // ✅ Si existe promedio, lo usamos. Si no, caemos al análisis de la última entrevista.
  const analysisToShow = avgAnalysis ?? selectedDetail?.analysis ?? null;

  const canShowAudit = useMemo(() => {
    return (
      detailTab === "AUDIT" &&
      !!timelineTab &&
      !!setTimelineTab &&
      Array.isArray(activityByEval) &&
      Array.isArray(activityGlobal)
    );
  }, [detailTab, timelineTab, setTimelineTab, activityByEval, activityGlobal]);

  return (
    <div className="bg-[#1F1F1F]/30 border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col">
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
            className="px-3 py-2 rounded-xl text-[px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
        )}
      </div>

      {/* ✅ Los tabs SIEMPRE se muestran */}
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
            Selecciona una evaluación en el panel izquierdo para ver el informe
            completo generado por IA.
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
  <>
        {/* ✅ Variabilidad entre entrevistas (nuevo bloque, no rompe formato del resumen) */}
        {variabilityInfo && (
          <div className="mb-3 text-xs text-gray-300 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="uppercase tracking-widest text-[11px] text-gray-400">
                Variabilidad entre entrevistas
              </span>
              <span
                className={[
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                  variabilityInfo.level === "Alta"
                    ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    : variabilityInfo.level === "Media"
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
                ].join(" ")}
              >
                {variabilityInfo.label}
              </span>
            </div>
              
            {!!variabilityInfo.details?.length && (
              <ul className="mt-2 space-y-1 text-[12px] text-gray-300 list-disc pl-5">
                {variabilityInfo.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}
    
        {/* ✅ Estados de promedio */}
        {avgLoading && (
          <div className="mb-3 text-sm text-gray-400 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            Calculando promedio de entrevistas…
          </div>
        )}
    
        {avgError && (
          <div className="mb-3 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
            {avgError}
          </div>
        )}
    
        {/* ✅ Mismo componente, mismo formato, pero con analysisToShow */}
        {analysisToShow && <AiSummaryTab analysis={analysisToShow} />}
      </>
    )}

          {detailTab === "INTERVIEWS" && candidateGroup && (
            <InterviewsTab
              candidateGroup={candidateGroup}
              selectedEvaluationId={selectedId}
              onOpenInterview={onOpenInterview}
             
            />
          )}

          {detailTab === "INTERVIEWS" && !candidateGroup && (
            <div className="text-sm text-gray-400 bg-black/20 border border-white/10 rounded-2xl p-4">
              No se encontró el grupo del candidato para listar entrevistas.
            </div>
          )}

          {canShowAudit && (
            <AuditTab
              timelineTab={timelineTab!}
              setTimelineTab={setTimelineTab!}
              activityByEval={activityByEval!}
              activityGlobal={activityGlobal!}
            />
          )}

          {detailTab === "NOTES" && (
            <NotesTab
              notes={notes}
              setNotes={setNotes}
              criteria={criteria}
              setCriteria={setCriteria}
            />
          )}

          {detailTab === "TECH" && (
            <TechTab analysis={selectedDetail.analysis} />
          )}
        </div>
      )}
    </div>
  );
}
