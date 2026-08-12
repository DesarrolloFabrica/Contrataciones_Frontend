import React from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Edit3,
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
  hideMissingBlock?: boolean;
  compact?: boolean;
  /** Sin borde propio (cuando va dentro de un panel compuesto). */
  embedded?: boolean;
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
  hideMissingBlock = false,
  compact = false,
  embedded = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const commentLen = (decisionComment ?? "").length;

  const isApprovedLabel = evaluatedVerdictLabel === "APROBADO";
  const verdictColor = isApprovedLabel
    ? isDark
      ? "text-emerald-300"
      : "text-emerald-700"
    : isDark
      ? "text-rose-300"
      : "text-rose-700";
  const verdictBg = isApprovedLabel
    ? isDark
      ? "bg-emerald-500/10 border-emerald-400/25"
      : "bg-emerald-50 border-emerald-200"
    : isDark
      ? "bg-rose-500/10 border-rose-400/25"
      : "bg-rose-50 border-rose-200";

  const card = isDark
    ? "border-white/[0.08] bg-[#0d252b]"
    : "border-slate-200/80 bg-white shadow-[0_14px_36px_-28px_rgba(15,23,42,0.22)]";

  return (
    <section
      className={
        embedded
          ? "flex flex-col"
          : `flex flex-col overflow-hidden rounded-2xl border ${card}`
      }
    >
      <div
        className={`border-b px-4 py-4 md:px-5 ${
          isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-100 bg-slate-50/80"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`} />
            <div className="min-w-0">
            <h2 className={`truncate text-[15px] font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {isAlreadyEvaluated ? "Decisión registrada" : "Decisión del coordinador"}
            </h2>
            <p className={`mt-0.5 text-[12px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {isAlreadyEvaluated
                ? "Puedes modificar la decisión existente si es necesario"
                : "Completa los pasos para finalizar la evaluación"}
            </p>
            </div>
          </div>
          <span
            className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] sm:inline-flex ${
              isDark
                ? "border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            Revisión final
          </span>
        </div>
      </div>

      <div className={`flex flex-col ${compact ? "gap-4 p-4 md:p-5" : "gap-5 p-5"}`}>
        {isAlreadyEvaluated && (
          <div className={`rounded-xl border px-4 py-3 ${verdictBg}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isApprovedLabel ? (
                  <CheckCircle2 className={`h-4 w-4 ${verdictColor}`} />
                ) : (
                  <XCircle className={`h-4 w-4 ${verdictColor}`} />
                )}
                <span className={`text-sm font-bold ${verdictColor}`}>{evaluatedVerdictLabel}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <Edit3 className="h-3.5 w-3.5" />
                Modificable
              </span>
            </div>
            {coordinatorDecisionAt && (
              <p className={`mt-1.5 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Registrado ·{" "}
                {new Date(coordinatorDecisionAt).toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              1. Veredicto humano
            </span>
            {decision !== "PENDIENTE" && (
              <span
                className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                Seleccionado
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onApplyDecision("APROBADO")}
              aria-pressed={String(decision ?? "").includes("APROB")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 font-bold transition-all ${compact ? "py-3" : "py-4"} ${
                String(decision ?? "").includes("APROB")
                  ? isDark
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                    : "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : isDark
                    ? "border-white/[0.06] bg-[#07171c]/60 text-slate-400 hover:border-emerald-400/30"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-200"
              }`}
            >
              <CheckCircle2 className={compact ? "h-5 w-5" : "h-6 w-6"} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Aprobar</span>
            </button>

            <button
              type="button"
              onClick={() => onApplyDecision("RECHAZADO")}
              aria-pressed={String(decision ?? "").includes("RECH")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 font-bold transition-all ${compact ? "py-3" : "py-4"} ${
                String(decision ?? "").includes("RECH")
                  ? isDark
                    ? "border-rose-400 bg-rose-500/15 text-rose-300"
                    : "border-rose-500 bg-rose-50 text-rose-700"
                  : isDark
                    ? "border-white/[0.06] bg-[#07171c]/60 text-slate-400 hover:border-rose-400/30"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-rose-200"
              }`}
            >
              <XCircle className={compact ? "h-5 w-5" : "h-6 w-6"} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Rechazar</span>
            </button>
          </div>
        </div>

        <TechnicalCriteriaPanel criteria={criteria} setCriteria={setCriteria} compact={compact} />

        <div className="space-y-3">
          <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            3. Nota oficial
          </span>
          <div className="relative">
            <textarea
              value={decisionComment ?? ""}
              onChange={(e) => setDecisionComment(e.target.value)}
              placeholder="Escribe tu justificación profesional aquí..."
              className={`block w-full resize-none rounded-xl border p-3.5 pb-7 text-sm outline-none transition ${compact ? "h-24" : "h-28"} ${
                isDark
                  ? "border-white/[0.08] bg-[#07171c] text-slate-200 placeholder:text-slate-600 focus:border-emerald-400/35"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400/50 focus:bg-white"
              }`}
            />
            <div
              className={`absolute bottom-2.5 right-3 text-[10px] font-bold tabular-nums ${
                commentLen < 30
                  ? isDark
                    ? "text-rose-400"
                    : "text-rose-500"
                  : isDark
                    ? "text-emerald-400"
                    : "text-emerald-600"
              }`}
            >
              {commentLen < 30 ? `${commentLen} / 30 mín.` : `${commentLen} ✓`}
            </div>
          </div>
        </div>

        {!hideMissingBlock && !canSubmitDecision && missingReasons.length > 0 && (
          <div
            className={`rounded-xl border p-3.5 ${
              isDark ? "border-amber-400/20 bg-amber-500/[0.07]" : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className={`mb-1.5 text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-amber-300" : "text-amber-700"}`}>
              Requisitos pendientes
            </p>
            <ul className="space-y-1">
              {missingReasons.map((r, i) => (
                <li key={i} className={`text-[12px] ${isDark ? "text-amber-100/75" : "text-amber-800"}`}>
                  · {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div
        className={`border-t ${compact ? "p-4" : "p-4 md:px-5"} ${
          isDark ? "border-white/[0.06] bg-white/[0.015]" : "border-slate-100 bg-slate-50/40"
        }`}
      >
        <button
          type="button"
          onClick={onSubmitDecision}
          disabled={!canSubmitDecision || submittingDecision}
          className={`flex w-full items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase tracking-wider transition ${compact ? "py-3" : "py-3.5"} ${
            canSubmitDecision
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : isDark
                ? "cursor-not-allowed border border-white/[0.06] bg-white/[0.04] text-slate-500"
                : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
          }`}
        >
          {submittingDecision
            ? "Enviando..."
            : canSubmitDecision
              ? isAlreadyEvaluated
                ? "Actualizar decisión"
                : "Registrar decisión"
              : "Formulario incompleto"}
          {canSubmitDecision && !submittingDecision && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </section>
  );
};

export default CandidateDecisionPanel;
