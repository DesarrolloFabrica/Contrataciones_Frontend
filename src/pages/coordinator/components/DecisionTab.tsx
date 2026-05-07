// src/pages/coordinator/components/DecisionTab.tsx
import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Send,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { LocalDecision } from "../types";
import {
  saveCoordinatorDecision,
  type CoordinatorDecisionStatusApi,
  type CoordinatorCriteriaPayload,
} from "../../../services/teachersService";

type Props = {
  selectedId: string | null;

  decision: LocalDecision;
  decisionComment: string;
  setDecisionComment: (v: string) => void;
  onDecisionCommentBlur: () => void;

  // ✅ SOLO estado local
  onApplyDecision: (d: LocalDecision) => void;

  // ✅ Datos del tab NOTAS (para persistirlos al enviar)
  notes: string;
  criteria: CoordinatorCriteriaPayload;

  // ✅ Validación externa (Notes/criteria/etc)
  canSubmitDecision: boolean;
  missingReasons: string[];

  // ✅ Acción del padre (timeline, submit admin, etc.)
  onSubmitDecision?: () => void;
};

const DecisionTab: React.FC<Props> = ({
  selectedId,
  decision,
  decisionComment,
  setDecisionComment,
  onDecisionCommentBlur,
  onApplyDecision,
  notes,
  criteria,
  canSubmitDecision,
  missingReasons,
  onSubmitDecision,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ normalizadores para evitar .trim() en undefined/null
  const commentText = useMemo(
    () => (decisionComment ?? "").toString(),
    [decisionComment]
  );
  const notesText = useMemo(() => (notes ?? "").toString(), [notes]);

  const mapLocalToApi = (d: LocalDecision): CoordinatorDecisionStatusApi => {
    if (d === "APROBADO") return "APPROVED";
    if (d === "RECHAZADO") return "REJECTED";
    return "PENDING";
  };

  // ✅ validación adicional requerida para “Enviar”
  const decisionPicked = decision !== "PENDIENTE";
  const hasComment = commentText.trim().length > 0;

  const extraMissing = useMemo(() => {
    const extra: string[] = [];
    if (!decisionPicked) extra.push("Selecciona Aprobar o Rechazar.");
    if (!hasComment) extra.push("Escribe un comentario del coordinador.");
    if (!selectedId) extra.push("Selecciona una evaluación para enviar.");
    return extra;
  }, [decisionPicked, hasComment, selectedId]);

  const allMissingReasons = useMemo(() => {
    const set = new Set<string>([...extraMissing, ...(missingReasons ?? [])]);
    return Array.from(set);
  }, [extraMissing, missingReasons]);

  const canSendNow = useMemo(() => {
    return (
      !!selectedId &&
      !saving &&
      decisionPicked &&
      hasComment &&
      canSubmitDecision
    );
  }, [selectedId, saving, decisionPicked, hasComment, canSubmitDecision]);

  // ✅ Aprobar/Rechazar = SOLO local
  const handleApply = (newDecision: LocalDecision) => {
    onApplyDecision(newDecision);
    setError(null);
  };

  // ✅ Enviar = backend (incluye NOTAS) + luego callback del padre
  const handleSubmit = async () => {
    if (!selectedId || !canSendNow) return;

    setSaving(true);
    setError(null);

    try {
      await saveCoordinatorDecision(selectedId, {
        status: mapLocalToApi(decision),
        comment: commentText.trim() || undefined,

        // ✅ nuevos campos (tab NOTAS)
        notes: notesText.trim() || undefined,
        criteria:
          criteria && Object.keys(criteria ?? {}).length ? criteria : undefined,
      });

      // ✅ solo después de guardar OK
      onSubmitDecision?.();
    } catch (err) {
      console.error("Error guardando decisión del coordinador:", err);
      setError(
        "No se pudo guardar la decisión en el sistema. Intenta de nuevo o verifica tu conexión."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#090909] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500">
              Decisión del Coordinador
            </p>
            <p className="text-sm text-gray-300">
              El coordinador define la decisión oficial del proceso. El resultado
              queda registrado con trazabilidad completa. Se aplica al presionar{" "}
              <b>Registrar decisión oficial</b>.
            </p>
          </div>

          <div>
            {decision === "PENDIENTE" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-600/20 text-slate-200 text-[11px] font-bold uppercase tracking-widest">
                Pendiente
              </span>
            )}
            {decision === "APROBADO" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Aprobado
              </span>
            )}
            {decision === "RECHAZADO" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-600/20 text-rose-300 text-[11px] font-bold uppercase tracking-widest">
                <XCircle className="w-3 h-3 mr-1" />
                Rechazado
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleApply("APROBADO")}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
              decision === "APROBADO"
                ? "bg-emerald-600 text-white"
                : "bg-[#111] text-gray-300 hover:bg-emerald-600/10 hover:text-emerald-300"
            } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Aprobar candidato
          </button>

          <button
            type="button"
            onClick={() => handleApply("RECHAZADO")}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
              decision === "RECHAZADO"
                ? "bg-rose-600 text-white"
                : "bg-[#111] text-gray-300 hover:bg-rose-600/10 hover:text-rose-300"
            } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <XCircle className="w-4 h-4" />
            Rechazar candidato
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-widest text-gray-500">
            Comentario del coordinador
          </label>
          <textarea
            value={commentText}
            onChange={(e) => setDecisionComment(e.target.value)}
            onBlur={onDecisionCommentBlur}
            rows={3}
            placeholder="Ej. Recomendado por horas. Fortalezas: experiencia, claridad. Riesgo: disponibilidad limitada."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50 resize-none"
            disabled={saving}
          />
        </div>

        {/* ✅ Bloque de validación combinado */}
        {!canSendNow && allMissingReasons.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              Falta completar para enviar
            </div>
            <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
              {allMissingReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-[11px] text-rose-400">{error}</p>}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSendNow}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 border transition ${
              canSendNow
                ? "bg-emerald-600 text-white border-emerald-500/40 hover:bg-emerald-500"
                : "bg-white/5 text-gray-500 border-white/10 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {saving ? "Enviando..." : "Registrar decisión oficial"}
          </button>
        </div>

        <p className="text-[11px] text-gray-500">
          Esta decisión define el estado oficial del candidato y se refleja en los listados del sistema.
        </p>
      </div>
    </div>
  );
};

export default DecisionTab;
