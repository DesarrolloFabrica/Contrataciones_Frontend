import { useCallback, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type {
  AnalysisResult,
  InterviewData,
  TeacherEvaluationSummary,
} from "../../../types";

import { getTeacherEvaluationById } from "../../../services/teachersService";
import { generateAnalysisPdfFromData } from "../../../services/pdfReport";
import { auditAppend } from "../../../services/auditService";
import { actorFromUser } from "../../../services/auditActor";

import type {
  LocalDecision,
  CoordinatorCriteria,
  CoordinatorNotesByEval,
  CoordinatorNotes,
} from "../types";

import { DEFAULT_CRITERIA } from "../types";
import { mapFormToInterviewData } from "../utils/mapFormToInterviewData";

type Params = {
  user: any;
  actor: ReturnType<typeof actorFromUser>;
  evaluations: TeacherEvaluationSummary[];
  localDecisions: Record<string, LocalDecision>;
  setLocalDecisions: Dispatch<SetStateAction<Record<string, LocalDecision>>>;
};

const emptyCriteria = (): CoordinatorCriteria => ({ ...DEFAULT_CRITERIA });

const emptyNotes = (): CoordinatorNotes => ({
  notes: "",
  criteria: emptyCriteria(),
});

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

  // ✅ NOTAS por evaluación (persisten por id)
  const [notesByEval, setNotesByEval] = useState<CoordinatorNotesByEval>({});

  const bumpAudit = useCallback(() => {
    // placeholder por si luego quieres forzar refresh de auditoría
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedDetail(null);
    setLoadingDetail(false);
    setDecision("PENDIENTE");
    setDecisionComment("");
    // ojo: no borramos notesByEval para que queden guardadas mientras navegas
  }, []);

  // ✅ notas actuales según selectedId
  const currentNotes = useMemo(() => {
    if (!selectedId) return emptyNotes();
    return notesByEval[selectedId] ?? emptyNotes();
  }, [notesByEval, selectedId]);

  // ✅ setters que escriben sobre notesByEval (SIN redeclarar variables)
  const setNotes = useCallback(
    (v: string) => {
      if (!selectedId) return;
      setNotesByEval((prev) => ({
        ...prev,
        [selectedId]: { ...(prev[selectedId] ?? emptyNotes()), notes: v },
      }));
    },
    [selectedId]
  );

  const setCriteria = useCallback(
    (next: CoordinatorCriteria) => {
      if (!selectedId) return;
      setNotesByEval((prev) => ({
        ...prev,
        [selectedId]: { ...(prev[selectedId] ?? emptyNotes()), criteria: next },
      }));
    },
    [selectedId]
  );

  const handleSelectEvaluation = useCallback(
    async (id: string) => {
      setSelectedId(id);

      // ✅ log simple (mock)
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

      // ✅ asegura notas base para esa evaluación
      setNotesByEval((prev) => (prev[id] ? prev : { ...prev, [id]: emptyNotes() }));

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
    [actor, bumpAudit, evaluations, localDecisions, evaluations, localDecisions]
  );

  const exportPdf = useCallback(async () => {
    if (!selectedDetail || !selectedId) return;
    try {
      await generateAnalysisPdfFromData(selectedDetail.analysis, selectedDetail.interview, {
        download: true,
      });

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
  }, [actor, bumpAudit, selectedDetail, selectedId]);

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
    [actor, bumpAudit, selectedId, setLocalDecisions, user]
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
  }, [actor, bumpAudit, decisionComment, selectedId]);

  // -----------------------------
  // ✅ VALIDACIÓN OBLIGATORIA (antes de enviar)
  // -----------------------------
  const checkedCount = useMemo(() => {
    return Object.values(currentNotes.criteria).filter(Boolean).length;
  }, [currentNotes.criteria]);

  const missingReasons = useMemo(() => {
    const out: string[] = [];
    if (!selectedId) out.push("Selecciona una evaluación.");
    if (decision === "PENDIENTE") out.push("Selecciona una decisión (Aprobar o Rechazar).");
    if ((currentNotes.notes ?? "").trim().length < 30) {
      out.push("Escribe una nota breve (mínimo 30 caracteres).");
    }
    if (checkedCount < 2) out.push("Marca al menos 2 criterios en Notas.");
    return out;
  }, [checkedCount, currentNotes.notes, decision, selectedId]);

  const canSubmitDecision = missingReasons.length === 0;

  const submitDecisionToAdmin = useCallback(async () => {
    if (!selectedId) return;
    if (!canSubmitDecision) return;

    // 🔥 luego conecta backend real (POST)
    auditAppend({
      type: "COORDINATOR_DECISION_SET",
      actor,
      evaluationId: selectedId,
      metadata: {
        status: decision,
        criteria: currentNotes.criteria,
        noteLen: (currentNotes.notes ?? "").trim().length,
        source: "coordinator-submit",
      },
    });

    bumpAudit();
    alert("✅ Decisión enviada al admin (mock).");
  }, [actor, bumpAudit, canSubmitDecision, currentNotes.criteria, currentNotes.notes, decision, selectedId]);

  return {
    selectedId,
    selectedDetail,
    loadingDetail,

    decision,
    decisionComment,

    // ✅ notas + criterios (para NotesTab)
    notes: currentNotes.notes,
    criteria: currentNotes.criteria,
    setNotes,
    setCriteria,

    // ✅ validación + submit
    canSubmitDecision,
    missingReasons,
    submitDecisionToAdmin,

    setDecisionComment,

    clearSelection,
    handleSelectEvaluation,
    exportPdf,
    applyDecision,
    onDecisionCommentBlur,
  };
};
