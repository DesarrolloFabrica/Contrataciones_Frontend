import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { LocalDecision } from "../types";

type Props = {
  decision: LocalDecision;
  decisionComment: string;
  setDecisionComment: (v: string) => void;
  onDecisionCommentBlur: () => void;

  onApplyDecision: (d: LocalDecision) => void;
};

const DecisionTab: React.FC<Props> = ({
  decision,
  decisionComment,
  setDecisionComment,
  onDecisionCommentBlur,
  onApplyDecision,
}) => {
  return (
    <div className="space-y-5">
      <div className="bg-[#090909] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500">
              Decisión del Coordinador (prototipo)
            </p>
            <p className="text-sm text-gray-300">
              Esta decisión aún no se guarda en backend; solo define la UX. Luego la conectamos a la API y trazabilidad completa.
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
            onClick={() => onApplyDecision("APROBADO")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
              decision === "APROBADO"
                ? "bg-emerald-600 text-white"
                : "bg-[#111] text-gray-300 hover:bg-emerald-600/10 hover:text-emerald-300"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Aprobar candidato
          </button>

          <button
            type="button"
            onClick={() => onApplyDecision("RECHAZADO")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
              decision === "RECHAZADO"
                ? "bg-rose-600 text-white"
                : "bg-[#111] text-gray-300 hover:bg-rose-600/10 hover:text-rose-300"
            }`}
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
            value={decisionComment}
            onChange={(e) => setDecisionComment(e.target.value)}
            onBlur={onDecisionCommentBlur}
            rows={3}
            placeholder="Ej. Se recomienda perfilar para curso corto, no para nombramiento de planta..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50 resize-none"
          />
        </div>

        <p className="text-[11px] text-gray-500">
          En la siguiente iteración, este bloque enviará la decisión a un endpoint tipo{" "}
          <code className="bg-black/40 px-1 rounded">POST /teachers/evaluations/:id/decision</code>{" "}
          y se reflejará de forma persistente en los tableros.
        </p>
      </div>
    </div>
  );
};

export default DecisionTab;
