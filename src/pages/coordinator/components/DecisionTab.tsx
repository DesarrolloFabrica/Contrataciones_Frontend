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
import { useTheme } from "../../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
      <div className={`rounded-2xl border p-4 space-y-3 ${
        isDark
          ? "bg-[#0b232a]/85 border-[#579689]/20 shadow-[0_20px_55px_-42px_rgba(88,190,161,0.32)]"
          : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`text-[11px] uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Decisión del Coordinador
            </p>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
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
                : isDark
                  ? "bg-[#102a30] text-slate-300 border border-[#579689]/15 hover:bg-emerald-500/10 hover:text-emerald-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
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
                : isDark
                  ? "bg-[#102a30] text-slate-300 border border-[#579689]/15 hover:bg-rose-500/10 hover:text-rose-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-700"
            } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <XCircle className="w-4 h-4" />
            Rechazar candidato
          </button>
        </div>

        <div className="space-y-1">
          <label className={`text-[11px] uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-600"}`}>
            Comentario del coordinador
          </label>
          <textarea
            value={commentText}
            onChange={(e) => setDecisionComment(e.target.value)}
            onBlur={onDecisionCommentBlur}
            rows={3}
            placeholder="Ej. Recomendado por horas. Fortalezas: experiencia, claridad. Riesgo: disponibilidad limitada."
            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none transition-colors ${
              isDark
                ? "bg-[#091d22] border-[#579689]/20 text-slate-100 placeholder:text-slate-600 focus:border-[#58bea1]/55 focus:bg-[#102a30]"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
            }`}
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
                : isDark
                  ? "bg-[#102a30]/70 text-slate-600 border-[#579689]/15 cursor-not-allowed"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
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

        <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          Esta decisión define el estado oficial del candidato y se refleja en los listados del sistema.
        </p>
      </div>
    </div>
  );
};

export default DecisionTab;
