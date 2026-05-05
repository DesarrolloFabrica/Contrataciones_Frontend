// src/pages/coordinator/hooks/useEvaluationDetail.ts
import { useCallback, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type {
  AnalysisResult,
  InterviewData,
  TeacherEvaluationSummary,
  DecisionStatusApi,
} from "../../../types";

import {
  getTeacherEvaluationById,
  updateCoordinatorDecision,
} from "../../../services/teachersService";
import { generateAnalysisPdfFromData } from "../../../services/pdfReport";
import { auditAppend } from "../../../services/auditService";
import { actorFromUser } from "../../../services/auditActor";

import type {
  LocalDecision,
  CoordinatorCriteria,
  CoordinatorNotesByEval,
  CoordinatorNotes,
  CandidateGroup,
} from "../types";

import { DEFAULT_CRITERIA } from "../types";
import { mapFormToInterviewData } from "../utils/mapFormToInterviewData";
import { getCandidateKey } from "../utils/candidateKey";

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

function apiDecisionToLocal(v: DecisionStatusApi | null | undefined): LocalDecision {
  const s = String(v ?? "").toUpperCase();
  if (s === "APPROVED") return "APROBADO";
  if (s === "REJECTED") return "RECHAZADO";
  return "PENDIENTE";
}

export const useEvaluationDetail = ({
  user,
  actor,
  evaluations,
  localDecisions,
  setLocalDecisions,
}: Params) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [selectedDetail, setSelectedDetail] = useState<{
    analysis: AnalysisResult | null;
    interview: InterviewData;
  } | null>(null);

  const [loadingDetail, setLoadingDetail] = useState(false);

  const [decision, setDecision] = useState<LocalDecision>("PENDIENTE");
  const [decisionComment, setDecisionComment] = useState("");
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // ✅ NOTAS por evaluación (persisten por id)
  const [notesByEval, setNotesByEval] = useState<CoordinatorNotesByEval>({});

  const bumpAudit = useCallback(() => {
    // placeholder (por si luego fuerzas refresh de auditoría)
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedDetail(null);
    setLoadingDetail(false);
    setDecision("PENDIENTE");
    setDecisionComment("");
    // no borramos notesByEval para mantener notas al navegar
  }, []);

  // ✅ notas actuales según selectedId
  const currentNotes = useMemo(() => {
    if (!selectedId) return emptyNotes();
    return notesByEval[selectedId] ?? emptyNotes();
  }, [notesByEval, selectedId]);

  // ✅ decisión actual: primero localDecisions, si no existe usa status de backend (summary)
  const decisionStatus = useMemo(() => {
    if (!selectedId) return "PENDIENTE" as LocalDecision;

    const local = localDecisions[selectedId];
    if (local) return local;

    const api = evaluations.find((e) => e.id === selectedId)?.coordinatorDecisionStatus;
    return apiDecisionToLocal(api);
  }, [evaluations, localDecisions, selectedId]);

  // ✅ candidateGroup para entrevistas
  const candidateGroup = useMemo(() => {
    if (!selectedId) return null;
    const base = evaluations.find((e) => e.id === selectedId);
    if (!base) return null;

    const key = getCandidateKey(base);
    const interviews = evaluations
      .filter((ev) => getCandidateKey(ev) === key)
      .slice()
      .sort((a, b) =>
        String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")),
      );

    const latest = interviews[0] ?? base;

    const doc = String(
      latest.candidate?.documentNumber ??
        latest.candidate?.document_number ??
        "",
    ).trim();

    const group: CandidateGroup = {
      key,
      documentNumber: doc,
      candidateName: latest.candidate?.fullName ?? "",
      school: latest.candidate?.schoolNameSnapshot ?? "",
      program: latest.candidate?.programNameSnapshot ?? "",
      interviews,
      latest,
    };

    return group;
  }, [evaluations, selectedId]);

  // ✅ setters que escriben sobre notesByEval
  const setNotes = useCallback(
    (v: string) => {
      if (!selectedId) return;
      setNotesByEval((prev) => ({
        ...prev,
        [selectedId]: { ...(prev[selectedId] ?? emptyNotes()), notes: v },
      }));
    },
    [selectedId],
  );

  const setCriteria = useCallback(
    (next: CoordinatorCriteria) => {
      if (!selectedId) return;
      setNotesByEval((prev) => ({
        ...prev,
        [selectedId]: { ...(prev[selectedId] ?? emptyNotes()), criteria: next },
      }));
    },
    [selectedId],
  );

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

      // ✅ decisión inicial (local o backend)
      const fromLocal = localDecisions[id];
      const fromApi = apiDecisionToLocal(
        evaluations.find((e) => e.id === id)?.coordinatorDecisionStatus,
      );

      setDecision(fromLocal ?? fromApi);
      setDecisionComment("");

      // ✅ asegura notas base para esa evaluación
      setNotesByEval((prev) => (prev[id] ? prev : { ...prev, [id]: emptyNotes() }));

      try {
        const detail = await getTeacherEvaluationById(id);

        // ✅ ojo: tu backend guarda AnalysisResult en aiRawJson.rawOutput
        // pero en tu types, TeacherAiResult.rawOutput?: AnalysisResult
        // aquí asumimos que detail.aiRawJson YA ES AnalysisResult (como venías manejándolo).
        const analysis: AnalysisResult | null = detail.aiRawJson ?? null;
        const interview = mapFormToInterviewData(detail);

        setSelectedDetail({ analysis, interview });
      } catch (err) {
        console.error("Error al cargar detalle:", err);
      } finally {
        setLoadingDetail(false);
      }
    },
    [actor, bumpAudit, evaluations, localDecisions],
  );

  const exportPdf = useCallback(async () => {
    if (!selectedDetail?.analysis || !selectedId) return;
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
      const decidedByName = user?.name ?? user?.fullName ?? null;

      setDecision(newDecision);
      setLocalDecisions((prev) => ({ ...prev, [selectedId]: newDecision }));

      auditAppend({
        type: "COORDINATOR_DECISION_SET",
        actor,
        evaluationId: selectedId,
        metadata: {
          status: newDecision,
          decidedAt,
          decidedById,
          decidedByName,
          source: "coordinator-local",
        },
      });

      bumpAudit();
    },
    [actor, bumpAudit, selectedId, setLocalDecisions, user],
  );

  const onDecisionCommentBlur = useCallback(() => {
    if (!selectedId) return;
    const text = (decisionComment ?? "").trim();
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
    return Object.values(currentNotes.criteria ?? {}).filter(Boolean).length;
  }, [currentNotes.criteria]);

  // ✅ Nota efectiva: primero NOTAS, si está vacía usa el comentario de DECISIÓN
  const effectiveNote = useMemo(() => {
    const n = String(currentNotes.notes ?? "").trim();
    if (n.length) return n;
    return String(decisionComment ?? "").trim();
  }, [currentNotes.notes, decisionComment]);

  const effectiveNoteLen = effectiveNote.length;

  const missingReasons = useMemo(() => {
    const out: string[] = [];
    if (!selectedId) out.push("Selecciona una evaluación.");
    if (decision === "PENDIENTE") out.push("Selecciona una decisión (Aprobar o Rechazar).");
    if (effectiveNoteLen < 30) out.push("Escribe una nota breve (mínimo 30 caracteres).");
    if (checkedCount < 2) out.push("Marca al menos 2 criterios en Notas.");
    return out;
  }, [checkedCount, decision, selectedId, effectiveNoteLen]);

  const canSubmitDecision = missingReasons.length === 0;

  const submitDecisionToAdmin = useCallback(async () => {
    if (!selectedId) return;
    if (!canSubmitDecision) return;
    if (submittingDecision) return;

    const status =
      decision === "APROBADO"
        ? "APPROVED"
        : decision === "RECHAZADO"
          ? "REJECTED"
          : "PENDING";

    try {
      setSubmittingDecision(true);

      await updateCoordinatorDecision(selectedId, {
        status,
        comment: String(decisionComment ?? "").trim() || undefined,
        notesBrief: effectiveNote,
        criteria: currentNotes.criteria as any,
      });

      auditAppend({
        type: "COORDINATOR_DECISION_SUBMITTED",
        actor,
        evaluationId: selectedId,
        metadata: {
          status: decision,
          criteria: currentNotes.criteria as any,
          noteLen: effectiveNoteLen,
          source: "coordinator-submit",
        },
      });

      bumpAudit();
      alert("✅ Decisión enviada al administrador.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "No se pudo enviar la decisión al administrador.";
      alert(`❌ ${message}`);
    } finally {
      setSubmittingDecision(false);
    }
  }, [
    actor,
    bumpAudit,
    canSubmitDecision,
    currentNotes.criteria,
    decision,
    decisionComment,
    effectiveNote,
    effectiveNoteLen,
    selectedId,
    submittingDecision,
  ]);

  return {
    selectedId,
    selectedDetail,
    loadingDetail,

    decision,
    decisionComment,
    decisionStatus,
    candidateGroup,

    // ✅ notas + criterios (para NotesTab / UI)
    notes: currentNotes.notes,
    criteria: currentNotes.criteria,
    setNotes,
    setCriteria,

    // ✅ validación + submit
    canSubmitDecision,
    submittingDecision,
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