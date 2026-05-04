import React from "react";
import { User, GraduationCap, ShieldCheck, Zap } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import type { AnalysisResult, InterviewData } from "../../../types";
import { CandidateStatusBadge } from "./CandidateStatusBadge";
import { normalizeCoordinatorDecision } from "../utils/coordinatorStatus";

interface EvaluationSummaryCardProps {
  interview?: InterviewData | null;
  analysis?: AnalysisResult | null;
  candidateName: string;
  program: string;
  school: string;
  score: number;
  risk: string;
  verdict: string;
  isAlreadyEvaluated: boolean;
  evaluatedVerdictLabel?: string;
  coordinatorDecisionStatus?: string | null;
  adminDecisionStatus?: string | null;
}

export const EvaluationSummaryCard: React.FC<EvaluationSummaryCardProps> = ({
  candidateName,
  program,
  school,
  score,
  risk,
  verdict,
  coordinatorDecisionStatus,
  adminDecisionStatus,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const riskLevel = (risk ?? "").toLowerCase();
  const riskDesc =
    riskLevel.includes("alto")
      ? "Se han detectado anomalías que requieren una revisión manual exhaustiva antes de proceder con la contratación."
      : "El perfil se encuentra dentro de los parámetros de seguridad y confiabilidad esperados.";

  return (
    <div className="relative group">
      <div
        className={`absolute -inset-0.5 rounded-[32px] blur opacity-50 group-hover:opacity-100 transition duration-500 ${
          isDark
            ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20"
            : "bg-gradient-to-r from-emerald-300/40 to-cyan-300/30"
        }`}
      />
      <div
        className={`relative rounded-[30px] border p-8 shadow-2xl ${
          isDark
            ? "bg-[#080A0E] border-white/10"
            : "bg-white border-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
        }`}
      >
        <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
          <div className="flex-1">
            <div
              className={`flex items-center gap-2 mb-3 ${
                isDark ? "text-emerald-500" : "text-emerald-600"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                Perfil del Candidato
              </span>
            </div>
            <h1
              className={`text-4xl font-black tracking-tight mb-4 drop-shadow-md ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {candidateName}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {program && (
                <div
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border ${
                    isDark
                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-200/80"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 opacity-70" />
                  {program}
                </div>
              )}
              {school && (
                <span
                  className={`text-lg ${
                    isDark ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  •
                </span>
              )}
              {school && (
                <span
                  className={`font-medium ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {school}
                </span>
              )}
            </div>

            <div className="mt-4">
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
                size="md"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          {/* Score */}
          <div
            className={`rounded-2xl border p-6 ${
              isDark
                ? "bg-white/[0.02] border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Score IA
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-5xl font-black tracking-tighter ${
                  score >= 70
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300"
                    : isDark
                      ? "text-slate-200"
                      : "text-slate-800"
                }`}
              >
                {score}
              </span>
              <span className="text-lg font-medium text-slate-500">/100</span>
            </div>
            <div className="mt-3">
              <div className={`h-1.5 w-full rounded-full overflow-hidden border ${isDark ? "bg-[#15191E] border-white/5" : "bg-slate-100 border-slate-200"}`}>
                <div
                  className={`h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] bg-gradient-to-r ${
                    score >= 80
                      ? "from-emerald-600 to-emerald-400"
                      : score >= 50
                        ? "from-amber-600 to-amber-400"
                        : "from-rose-600 to-rose-400"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Riesgo */}
          <div
            className={`rounded-2xl border p-6 ${
              isDark
                ? "bg-white/[0.02] border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Riesgo
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase ${
                riskLevel.includes("alto")
                  ? isDark
                    ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                  : riskLevel.includes("medio")
                    ? isDark
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                    : isDark
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  riskLevel.includes("alto")
                    ? "bg-rose-500"
                    : riskLevel.includes("medio")
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              {risk || "N/A"}
            </span>
            <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {riskDesc}
            </p>
          </div>
        </div>

        {/* Veredicto */}
        {verdict && (
          <div
            className={`mt-5 rounded-xl p-5 border ${
              isDark
                ? "bg-[#050709]/50 border-white/5"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Veredicto IA
            </span>
            <p className={`mt-1 text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {verdict}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationSummaryCard;
