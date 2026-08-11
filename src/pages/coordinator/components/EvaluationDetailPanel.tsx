// src/pages/coordinator/components/EvaluationDetailPanel.tsx
import React, { useMemo } from "react";
import { FileText, Loader2, Search } from "lucide-react";
import type { AnalysisResult, InterviewData } from "../../../types";
import { useTheme } from "../../../context/ThemeContext";

import DetailTabs from "./DetailTabs";
import DecisionTab from "./DecisionTab";
import AiSummaryTab from "./AiSummaryTab";
import InterviewsTab from "./InterviewTab";
import AuditTab from "./AuditTab";
import TechTab from "./TechTab";
import NotesTab from "./NotesTab";



import type {

  CoordinatorCriteria,
  DetailTabKey,
  LocalDecision,
  TimelineTab,
  CandidateGroup,
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

  notes: string;
  setNotes: (v: string) => void;
  criteria: CoordinatorCriteria;
  setCriteria: (next: CoordinatorCriteria) => void;

  canSubmitDecision: boolean;
  missingReasons: string[];
  onSubmitDecision: () => void;

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
    <div className={`rounded-3xl border p-5 md:p-6 shadow-xl flex flex-col ${
      isDark
        ? "bg-[#091d22]/82 border-[#579689]/20 shadow-black/25"
        : "bg-white/90 border-slate-200 shadow-slate-900/5"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Detalle de Evaluación Seleccionada
          </h3>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            Ver informe IA y prototipar la decisión de contratación.
          </p>
        </div>

        {hasDetail && (
          <button
            type="button"
            onClick={onExportPdf}
            className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-gradient-to-r from-[#178b70] to-[#12645f] hover:brightness-110 text-white flex items-center gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
        )}
      </div>

      {/* ✅ Los tabs SIEMPRE se muestran */}
      <DetailTabs value={detailTab} onChange={setDetailTab} />

      {loadingDetail && (
        <div className={`flex flex-1 items-center justify-center gap-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Cargando informe de la evaluación…</span>
        </div>
      )}

      {!loadingDetail && !selectedDetail && (
        <div className={`flex flex-1 flex-col items-center justify-center gap-3 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          <Search className="w-8 h-8" />
          <p className="text-sm text-center max-w-sm">
            Selecciona una evaluación en el panel izquierdo para ver el informe completo
            generado por IA.
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
              notes={notes}
              criteria={criteria}
              canSubmitDecision={canSubmitDecision}
              missingReasons={missingReasons}
              onSubmitDecision={onSubmitDecision}
            />
          )}

          {detailTab === "AI" && (
            <>
              {/* Variabilidad */}
              {variabilityInfo && (
                <div className={`mb-3 text-xs rounded-2xl border p-4 ${
                  isDark ? "text-slate-300 bg-[#0b232a] border-[#579689]/18" : "text-slate-600 bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`uppercase tracking-widest text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
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
                    <ul className={`mt-2 space-y-1 text-[12px] list-disc pl-5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {variabilityInfo.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Estados de promedio */}
              {avgLoading && (
                <div className={`mb-3 text-sm rounded-2xl border p-4 ${isDark ? "text-slate-400 bg-[#0b232a] border-[#579689]/18" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
                  Calculando promedio de entrevistas…
                </div>
              )}

              {avgError && (
                <div className="mb-3 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                  {avgError}
                </div>
              )}

              {/* Resumen */}
              {analysisToShow && <AiSummaryTab analysis={analysisToShow} />}
            </>
          )}

          {detailTab === "INTERVIEWS" && candidateGroup && (
            <InterviewsTab
              candidateGroup={candidateGroup}
              selectedEvaluationId={selectedId}
              onOpenInterview={onOpenInterview}
              onOpenComparison={onOpenComparison}
            />
          )}

          {detailTab === "INTERVIEWS" && !candidateGroup && (
            <div className={`text-sm rounded-2xl border p-4 ${isDark ? "text-slate-400 bg-[#0b232a] border-[#579689]/18" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
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

          {detailTab === "TECH" && <TechTab analysis={selectedDetail.analysis} />}
        </div>
      )}
    </div>
  );
}
