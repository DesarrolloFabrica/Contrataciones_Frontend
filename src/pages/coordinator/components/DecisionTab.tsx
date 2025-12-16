import React from "react";
import { CheckCircle2, XCircle, Send, AlertTriangle } from "lucide-react";
import type { LocalDecision } from "../types";

type Props = {
  decision: LocalDecision;
  decisionComment: string;
  setDecisionComment: (v: string) => void;
  onDecisionCommentBlur: () => void;
  onApplyDecision: (d: LocalDecision) => void;

  // ✅ Validación + submit
  canSubmitDecision: boolean;
  missingReasons: string[];
  onSubmitDecision: () => void;
};

const DecisionTab: React.FC<Props> = ({
  decision,
  decisionComment,
  setDecisionComment,
  onDecisionCommentBlur,
  onApplyDecision,
  canSubmitDecision,
  missingReasons,
  onSubmitDecision,
}) => {
  return (
    <div className="space-y-5">
      <div className="bg-[#090909] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500">
              Decisión del Coordinador
            </p>
            <p className="text-sm text-gray-300">
              El coordinador define la recomendación y deja trazabilidad para el admin.
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
            placeholder="Ej. Recomendado por horas. Fortalezas: experiencia, claridad. Riesgo: disponibilidad limitada."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50 resize-none"
          />
        </div>

        {/* ✅ Bloque de validación */}
        {!canSubmitDecision && missingReasons.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              Falta completar para enviar
            </div>
            <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
              {missingReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ✅ Enviar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSubmitDecision}
            disabled={!canSubmitDecision}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 border transition ${
              canSubmitDecision
                ? "bg-emerald-600 text-white border-emerald-500/40 hover:bg-emerald-500"
                : "bg-white/5 text-gray-500 border-white/10 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
            Enviar decisión
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionTab;
