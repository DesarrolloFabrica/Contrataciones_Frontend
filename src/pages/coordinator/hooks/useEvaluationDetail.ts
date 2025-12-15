// src/pages/coordinator/hooks/useEvaluationDetail.ts
import { useCallback, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type {
  AnalysisResult,
  InterviewData,
  TeacherEvaluationSummary,
} from "../../../types";

import { getTeacherEvaluationById } from "../../../services/teachersService";
import { generateAnalysisPdfFromData } from "../../../services/pdfReport";
import { auditAppend, auditList } from "../../../services/auditService";
import { actorFromUser } from "../../../services/auditActor";

import type { LocalDecision, TimelineTab } from "../types";
import { mapFormToInterviewData } from "../utils/mapFormToInterviewData";

type Params = {
  user: any;
  actor: ReturnType<typeof actorFromUser>;
  evaluations: TeacherEvaluationSummary[];
  localDecisions: Record<string, LocalDecision>;
  setLocalDecisions: Dispatch<SetStateAction<Record<string, LocalDecision>>>;
};

export const useEvaluationDetail = ({
  user,
  actor,
  evaluations,
  localDecisions,
  setLocalDecisions,
}: Params) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{
    analysis: AnalysisResult;
    interview: InterviewData;
  } | null>(null);

  const [loadingDetail, setLoadingDetail] = useState(false);

  const [decision, setDecision] = useState<LocalDecision>("PENDIENTE");
  const [decisionComment, setDecisionComment] = useState("");

  const [timelineTab, setTimelineTab] = useState<TimelineTab>("EVAL");
  const [auditTick, setAuditTick] = useState(0);
  const bumpAudit = () => setAuditTick((t) => t + 1);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedDetail(null);
    setLoadingDetail(false);
    setDecision("PENDIENTE");
    setDecisionComment("");
    setTimelineTab("EVAL");
  }, []);

  const handleSelectEvaluation = useCallback(
    async (id: string) => {
      setSelectedId(id);

      auditAppend({
        type: "EVALUATION_OPENED",
        actor,
        evaluationId: id,
        metadata: { source: "coordinator-list" },
      });
      bumpAudit();

      setSelectedDetail(null);
      setLoadingDetail(true);

      const current =
        localDecisions[id] ??
        ((evaluations.find((e) => e.id === id)?.coordinatorDecisionStatus as
          | LocalDecision
          | undefined) ?? "PENDIENTE");

      setDecision(current);
      setDecisionComment("");

      try {
        const detail = await getTeacherEvaluationById(id);
        const analysis: AnalysisResult = detail.aiRawJson;
        const interview = mapFormToInterviewData(detail);
        setSelectedDetail({ analysis, interview });
      } catch (err) {
        console.error("Error al cargar detalle:", err);
      } finally {
        setLoadingDetail(false);
      }
    },
    [actor, evaluations, localDecisions]
  );

  const exportPdf = useCallback(async () => {
    if (!selectedDetail || !selectedId) return;
    try {
      await generateAnalysisPdfFromData(
        selectedDetail.analysis,
        selectedDetail.interview,
        { download: true }
      );

      auditAppend({
        type: "REPORT_PDF_DOWNLOADED",
        actor,
        evaluationId: selectedId,
        metadata: { source: "coordinator", download: true },
      });
      bumpAudit();
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("No se pudo generar el PDF del reporte.");
    }
  }, [actor, selectedDetail, selectedId]);

  const applyDecision = useCallback(
    (newDecision: LocalDecision) => {
      if (!selectedId) return;

      const decidedAt = new Date().toISOString();
      const decidedById = user?.id ?? null;
      const decidedByName = user?.name ?? null;

      setDecision(newDecision);
      setLocalDecisions((prev) => ({ ...prev, [selectedId]: newDecision }));

      auditAppend({
        type: "COORDINATOR_DECISION_SET",
        actor,
        evaluationId: selectedId,
        metadata: { status: newDecision, decidedAt, decidedById, decidedByName },
      });

      bumpAudit();
    },
    [actor, selectedId, setLocalDecisions, user]
  );

  const onDecisionCommentBlur = useCallback(() => {
    if (!selectedId) return;
    const text = decisionComment.trim();
    if (!text) return;

    auditAppend({
      type: "COORDINATOR_COMMENT_SET",
      actor,
      evaluationId: selectedId,
      metadata: { hasComment: true, length: text.length },
    });

    bumpAudit();
  }, [actor, decisionComment, selectedId]);

  const activityByEval = useMemo(() => {
    if (!selectedId) return [];
    return auditList({ evaluationId: selectedId, limit: 120 });
  }, [selectedId, auditTick]);

  const activityGlobal = useMemo(() => {
    return auditList({ limit: 120 });
  }, [auditTick]);

  return {
    selectedId,
    selectedDetail,
    loadingDetail,
    decision,
    decisionComment,
    timelineTab,

    setDecisionComment,
    setTimelineTab,

    clearSelection, // ✅ EXISTE y TS lo ve
    handleSelectEvaluation,
    exportPdf,
    applyDecision,
    onDecisionCommentBlur,

    activityByEval,
    activityGlobal,
  };
};
