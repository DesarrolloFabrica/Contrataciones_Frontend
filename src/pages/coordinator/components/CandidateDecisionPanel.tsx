import React from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { TechnicalCriteriaPanel } from "./TechnicalCriteriaPanel";
import type { LocalDecision, CoordinatorCriteria } from "../types";

interface CandidateDecisionPanelProps {
  decision: LocalDecision;
  onApplyDecision: (d: LocalDecision) => void;
  decisionComment: string;
  setDecisionComment: (v: string) => void;
  criteria: CoordinatorCriteria;
  setCriteria: (next: CoordinatorCriteria) => void;
  missingReasons: string[];
  canSubmitDecision: boolean;
  submittingDecision: boolean;
  onSubmitDecision: () => void;
  isAlreadyEvaluated: boolean;
  evaluatedVerdictLabel: string;
  coordinatorDecisionAt?: string;
}

export const CandidateDecisionPanel: React.FC<CandidateDecisionPanelProps> = ({
  decision,
  onApplyDecision,
  decisionComment,
  setDecisionComment,
  criteria,
  setCriteria,
  missingReasons,
  canSubmitDecision,
  submittingDecision,
  onSubmitDecision,
  isAlreadyEvaluated,
  evaluatedVerdictLabel,
  coordinatorDecisionAt,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const commentLen = (decisionComment ?? "").length;

  if (isAlreadyEvaluated) {
    return (
      <div
        className={`relative rounded-[32px] p-[1px] shadow-2xl ${
          isDark
            ? "bg-gradient-to-b from-white/10 to-transparent"
            : "bg-gradient-to-b from-emerald-200/40 via-transparent to-transparent"
        }`}
      >
        <div
          className={`rounded-[31px] backdrop-blur-xl overflow-hidden ${
            isDark ? "bg-[#0E1216]" : "bg-white"
          }`}
        >
          <div className="p-8">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">
                Ya evaluado
              </div>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Esta evaluación ya fue registrada con veredicto{" "}
                <span className="font-bold">{evaluatedVerdictLabel}</span>{" "}
                y no puede volver a ser enviada.
              </p>
              {coordinatorDecisionAt && (
                <p className="text-[11px] text-emerald-200/80 mt-3">
                  Fecha de registro:{" "}
                  {String(coordinatorDecisionAt).slice(0, 19)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-[32px] p-[1px] shadow-2xl ${
        isDark
          ? "bg-gradient-to-b from-white/10 to-transparent"
          : "bg-gradient-to-b from-emerald-200/40 via-transparent to-transparent"
      }`}
    >
      <div
        className={`rounded-[31px] backdrop-blur-xl overflow-hidden ${
          isDark ? "bg-[#0E1216]" : "bg-white"
        }`}
      >
        <div
          className={`px-8 py-6 border-b ${
            isDark
              ? "bg-[#13181E] border-white/5"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </div>
            <h2
              className={`text-lg font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Consola de Decisión
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium ml-6">
            Complete los pasos requeridos para finalizar.
          </p>
        </div>

        <div className="p-8 space-y-8">
          {/* PASO 1 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                1. Veredicto Humano
              </span>
              {decision !== "PENDIENTE" && (
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded border tracking-wider ${
                    isDark
                      ? "text-emerald-400 bg-emerald-900/30 border-emerald-500/20"
                      : "text-emerald-700 bg-emerald-50 border-emerald-200"
                  }`}
                >
                  SELECCIONADO
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onApplyDecision("APROBADO")}
                className={`relative group rounded-2xl border-2 transition-all duration-300 py-4 flex flex-col items-center justify-center gap-2 ${
                  String(decision ?? "").includes("APROB")
                    ? isDark
                      ? "bg-[#062C1E] border-emerald-500 text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
                      : "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_18px_40px_rgba(16,185,129,0.25)]"
                    : isDark
                      ? "bg-[#13181E] border-transparent text-slate-500 hover:border-emerald-500/30 hover:text-emerald-300 hover:bg-[#1A2026]"
                      : "bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <CheckCircle2
                  className={`w-6 h-6 transition-transform ${
                    String(decision ?? "").includes("APROB")
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Aprobar
                </span>
              </button>

              <button
                type="button"
                onClick={() => onApplyDecision("RECHAZADO")}
                className={`relative group rounded-2xl border-2 transition-all duration-300 py-4 flex flex-col items-center justify-center gap-2 ${
                  String(decision ?? "").includes("RECH")
                    ? isDark
                      ? "bg-[#2C0612] border-rose-500 text-rose-400 shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]"
                      : "bg-rose-50 border-rose-500 text-rose-700 shadow-[0_18px_40px_rgba(244,63,94,0.25)]"
                    : isDark
                      ? "bg-[#13181E] border-transparent text-slate-500 hover:border-rose-500/30 hover:text-rose-300 hover:bg-[#1A2026]"
                      : "bg-white border-slate-200 text-slate-500 hover:border-rose-200 hover:text-rose-700 hover:bg-rose-50"
                }`}
              >
                <XCircle
                  className={`w-6 h-6 transition-transform ${
                    String(decision ?? "").includes("RECH")
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Rechazar
                </span>
              </button>
            </div>
          </div>

          {/* PASO 2 */}
          <TechnicalCriteriaPanel
            criteria={criteria}
            setCriteria={setCriteria}
          />

          {/* PASO 3 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                3. Nota Oficial
              </span>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 group-focus-within:opacity-20 transition duration-500" />
              <textarea
                value={decisionComment ?? ""}
                onChange={(e) => setDecisionComment(e.target.value)}
                placeholder="Escribe tu justificación profesional aquí... (Mínimo 30 caracteres)"
                className={`relative block w-full h-36 rounded-xl p-4 text-sm resize-none transition-all focus:outline-none ${
                  isDark
                    ? "bg-[#13181E] border border-transparent text-slate-200 placeholder:text-slate-600 focus:bg-[#0A0C10]"
                    : "bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-slate-50"
                }`}
              />
              <div
                className={`absolute bottom-3 right-3 text-[10px] font-mono transition-colors font-bold ${
                  commentLen < 30
                    ? "text-rose-500"
                    : "text-emerald-500"
                }`}
              >
                {commentLen} / 30
              </div>
            </div>
          </div>

          {/* Alertas */}
          {!canSubmitDecision && missingReasons.length > 0 && (
            <div
              className={`rounded-xl border p-4 ${
                isDark
                  ? "bg-amber-900/10 border-amber-500/20"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Requisitos Pendientes
                </span>
              </div>
              <ul className="space-y-1">
                {missingReasons.map((r, i) => (
                  <li
                    key={i}
                    className="text-xs text-amber-500/80 pl-1 border-l-2 border-amber-500/30"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* BOTÓN */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onSubmitDecision}
              disabled={!canSubmitDecision || submittingDecision}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 group ${
                canSubmitDecision
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.7)] hover:scale-[1.02]"
                  : "bg-[#1A2026] text-slate-600 cursor-not-allowed border border-white/5"
              }`}
            >
              {submittingDecision
                ? "Enviando..."
                : canSubmitDecision
                  ? "Finalizar Evaluación"
                  : "Formulario Incompleto"}
              {canSubmitDecision && !submittingDecision && (
                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
            <p className="text-center text-[10px] text-slate-600 mt-4">
              Esta acción es irreversible y se registrará en la Blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDecisionPanel;
