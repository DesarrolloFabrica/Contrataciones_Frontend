import React, { useState } from "react";
import {
  User,
  GraduationCap,
  Building2,
  Calendar,
  IdCard,
  Zap,
  ShieldCheck,
  BrainCircuit,
  Clock,
  ChevronDown,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { CandidateStatusBadge } from "./CandidateStatusBadge";
import { normalizeCoordinatorDecision } from "../utils/coordinatorStatus";

interface EvaluationSummaryCardProps {
  candidateName: string;
  program: string;
  school: string;
  score: number;
  risk: string;
  verdict: string;
  executive?: string;
  retention?: string;
  age?: string;
  documentNumber?: string;
  coordinatorDecisionStatus?: string | null;
  adminDecisionStatus?: string | null;
  compact?: boolean;
  /** Sin borde/fondo propio (cuando va anidado en otro panel). */
  flush?: boolean;
}

function initialsFromName(name: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export const EvaluationSummaryCard: React.FC<EvaluationSummaryCardProps> = ({
  candidateName,
  program,
  school,
  score,
  risk,
  verdict,
  executive,
  retention,
  age,
  documentNumber,
  coordinatorDecisionStatus,
  adminDecisionStatus,
  compact = false,
  flush = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [verdictOpen, setVerdictOpen] = useState(true);

  const riskLevel = (risk ?? "").toLowerCase();
  const riskTone = riskLevel.includes("alto")
    ? "rose"
    : riskLevel.includes("medio")
      ? "amber"
      : "emerald";

  const card = isDark
    ? "border-white/[0.08] bg-[#0d252b]"
    : "border-slate-200/80 bg-white shadow-[0_14px_36px_-28px_rgba(15,23,42,0.22)]";

  const metricBox = isDark
    ? "border-white/[0.06] bg-[#07171c]/70"
    : "border-slate-100 bg-slate-50";

  const riskLabel =
    riskTone === "rose"
      ? isDark
        ? "text-rose-300"
        : "text-rose-700"
      : riskTone === "amber"
        ? isDark
          ? "text-amber-300"
          : "text-amber-700"
        : isDark
          ? "text-emerald-300"
          : "text-emerald-700";

  return (
    <section
      className={[
        "shrink-0 overflow-hidden",
        flush
          ? "rounded-none border-0 bg-transparent p-0 shadow-none"
          : [
              "rounded-xl border",
              compact ? "p-3.5" : "rounded-2xl p-5 md:p-6",
              card,
            ].join(" "),
      ].join(" ")}
    >
      <div className={`flex items-start ${compact ? "gap-3" : "gap-4"}`}>
        <div
          className={[
            "flex shrink-0 items-center justify-center rounded-full border font-bold",
            compact ? "h-11 w-11 text-sm" : "h-14 w-14 text-base",
            isDark
              ? "border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-900/40 text-emerald-100"
              : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-800",
          ].join(" ")}
        >
          {initialsFromName(candidateName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-emerald-400/80" : "text-emerald-700"}`}>
            <User className="h-3 w-3" />
            Perfil del candidato
          </div>
          <h1
            className={[
              "font-bold leading-tight tracking-tight",
              compact ? "text-base md:text-lg" : "text-xl md:text-2xl",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            {candidateName}
          </h1>

          <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "mt-1.5" : "mt-2.5 gap-2"}`}>
            {program && (
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700",
                ].join(" ")}
              >
                <GraduationCap className="h-3 w-3" />
                {program}
              </span>
            )}
            {school && (
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  isDark ? "bg-white/[0.05] text-slate-300" : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                <Building2 className="h-3 w-3" />
                {school}
              </span>
            )}
            <CandidateStatusBadge
              coordinatorStatus={
                coordinatorDecisionStatus
                  ? normalizeCoordinatorDecision(coordinatorDecisionStatus)
                  : null
              }
              adminStatus={
                adminDecisionStatus
                  ? normalizeCoordinatorDecision(adminDecisionStatus)
                  : null
              }
              size="sm"
            />
          </div>

          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${compact ? "mt-1.5" : "mt-3"} ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {documentNumber && (
              <span className="inline-flex items-center gap-1">
                <IdCard className="h-3 w-3 text-emerald-500" />
                {documentNumber}
              </span>
            )}
            {age && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-emerald-500" />
                {age} años
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-2 lg:grid-cols-4 ${compact ? "mt-3" : "mt-5 gap-2.5"}`}>
        <div className={`rounded-lg border ${compact ? "p-2" : "rounded-xl p-3"} ${metricBox}`}>
          <div className={`mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <Zap className="h-3 w-3 text-emerald-500" />
            Score IA
          </div>
          <p className={`font-bold tabular-nums ${compact ? "text-sm" : "text-lg"} ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            {Math.round(score)}
            <span className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}> /100</span>
          </p>
          <div className={`mt-1.5 h-1 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>

        <div className={`rounded-lg border ${compact ? "p-2" : "rounded-xl p-3"} ${metricBox}`}>
          <div className={`mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            Riesgo
          </div>
          <p className={`font-bold uppercase ${compact ? "text-xs" : "text-sm"} ${riskLabel}`}>{risk || "N/A"}</p>
          {!compact && (
            <p className={`mt-1 text-[10px] leading-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {riskTone === "rose"
                ? "Requiere revisión cuidadosa"
                : riskTone === "amber"
                  ? "Monitorear factores clave"
                  : "Dentro de parámetros"}
            </p>
          )}
        </div>

        <div className={`rounded-lg border ${compact ? "p-2" : "rounded-xl p-3"} ${metricBox}`}>
          <div className={`mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <BrainCircuit className="h-3 w-3 text-emerald-500" />
            Coherencia
          </div>
          <p className={`font-bold ${compact ? "text-xs" : "text-sm"} ${isDark ? "text-white" : "text-slate-800"}`}>Alta</p>
        </div>

        <div className={`rounded-lg border ${compact ? "p-2" : "rounded-xl p-3"} ${metricBox}`}>
          <div className={`mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <Clock className="h-3 w-3 text-emerald-500" />
            Retención
          </div>
          <p className={`truncate font-bold ${compact ? "text-xs" : "text-sm"} ${isDark ? "text-white" : "text-slate-800"}`} title={retention || "N/A"}>
            {retention || "N/A"}
          </p>
        </div>
      </div>

      {(verdict || executive) && (
        <div
          className={[
            "mt-2.5 overflow-hidden rounded-lg border",
            !compact ? "mt-4 rounded-xl" : "",
            isDark ? "border-emerald-400/15 bg-emerald-500/[0.05]" : "border-emerald-100 bg-emerald-50/60",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => setVerdictOpen((v) => !v)}
            className={`flex w-full items-center justify-between gap-2 text-left ${compact ? "px-3 py-2" : "px-4 py-3"}`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={[
                  "flex shrink-0 items-center justify-center rounded-md",
                  compact ? "h-6 w-6" : "h-7 w-7 rounded-lg",
                  isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-100 text-emerald-700",
                ].join(" ")}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className={`block text-[9px] font-semibold uppercase tracking-[0.1em] ${isDark ? "text-emerald-400/80" : "text-emerald-700"}`}>
                  IA · Veredicto
                </span>
                <span className={`block truncate font-semibold ${compact ? "text-xs" : "text-sm"} ${isDark ? "text-white" : "text-slate-900"}`}>
                  {score >= 70 ? "Recomendado para contratación" : score >= 50 ? "Revisión con reservas" : "No recomendado"}
                </span>
              </span>
            </span>
            <ChevronDown
              className={[
                "h-4 w-4 shrink-0 transition-transform",
                verdictOpen ? "rotate-180" : "",
                isDark ? "text-slate-500" : "text-slate-400",
              ].join(" ")}
            />
          </button>

          {verdictOpen && (
            <div
              className={[
                "space-y-2 border-t",
                compact ? "px-3 py-2.5" : "px-4 py-3",
                isDark ? "border-emerald-400/10" : "border-emerald-100",
              ].join(" ")}
            >
              {executive ? (
                <p
                  className={[
                    isDark ? "text-slate-300" : "text-slate-700",
                    compact ? "text-[11px] leading-5" : "text-[13px] leading-6",
                  ].join(" ")}
                >
                  {executive}
                </p>
              ) : null}

              {verdict && (!executive || verdict.trim() !== executive.trim()) ? (
                <p
                  className={[
                    executive
                      ? isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                      : isDark
                        ? "text-slate-300"
                        : "text-slate-700",
                    compact ? "text-[11px] leading-5" : "text-[13px] leading-6",
                  ].join(" ")}
                >
                  {verdict}
                </p>
              ) : null}

              <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                <BadgeCheck className="h-3.5 w-3.5" />
                Generado por análisis IA
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default EvaluationSummaryCard;
