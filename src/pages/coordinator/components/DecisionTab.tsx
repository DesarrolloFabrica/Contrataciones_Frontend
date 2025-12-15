// src/pages/coordinator/components/DecisionTab.tsx
import React, { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { LocalDecision } from "../types";
import {
  saveCoordinatorDecision,
  type CoordinatorDecisionStatusApi,
} from "../../../services/teachersService";

type Props = {
  selectedId: string | null;

  decision: LocalDecision;
  decisionComment: string;
  setDecisionComment: (v: string) => void;
  onDecisionCommentBlur: () => void;

  // sigue siendo el handler del hook: actualiza estado local, timeline, etc.
  onApplyDecision: (d: LocalDecision) => void;
};

const DecisionTab: React.FC<Props> = ({
  selectedId,
  decision,
  decisionComment,
  setDecisionComment,
  onDecisionCommentBlur,
  onApplyDecision,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapLocalToApi = (d: LocalDecision): CoordinatorDecisionStatusApi => {
    if (d === "APROBADO") return "APPROVED";
    if (d === "RECHAZADO") return "REJECTED";
    return "PENDING";
  };

  const handleApply = async (newDecision: LocalDecision) => {
    // siempre actualizamos primero la UX local (como antes)
    onApplyDecision(newDecision);

    // si por alguna razón no hay id seleccionado, no llamamos a backend
    if (!selectedId) return;

    setSaving(true);
    setError(null);

    try {
      await saveCoordinatorDecision(selectedId, {
        status: mapLocalToApi(newDecision),
        comment: decisionComment.trim() || undefined,
      });
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
              Esta decisión se guarda en backend y alimenta la aprobación final del admin.
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
            } ${saving ? "opacity-70 cursor-wait" : ""}`}
          >
            {saving && decision === "APROBADO" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
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
            } ${saving ? "opacity-70 cursor-wait" : ""}`}
          >
            {saving && decision === "RECHAZADO" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Rechazar candidato
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-widest text-gray-500">
            Comentario del coordinador
          </label>
          <textarea
            value={decisionComment}
            onChange={(e) => setDecisionComment(e.target.value)}
            onBlur={onDecisionCommentBlur}
            rows={3}
            placeholder="Ej. Se recomienda perfilar para curso corto, no para nombramiento de planta..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50 resize-none"
          />
        </div>

        {error && (
          <p className="text-[11px] text-rose-400">
            {error}
          </p>
        )}

        <p className="text-[11px] text-gray-500">
          La decisión registrada aquí se usa luego para trazabilidad y paneles de
          administración.
        </p>
      </div>
    </div>
  );
};

export default DecisionTab;
