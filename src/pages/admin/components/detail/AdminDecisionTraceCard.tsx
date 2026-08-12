import React from "react";
import {
  Brain,
  User,
  ShieldCheck,
  Gavel,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

type ActorInfo = {
  label: string;
  name: string;
  status?: string | null;
  at?: string | null;
};

type Props = {
  aiScore: number;
  aiBucket: string;
  aiRecommendation: string;
  leader: ActorInfo;
  coordinator: ActorInfo;
};

const stepBase =
  "relative flex items-start gap-3 p-4 rounded-2xl border transition-colors";

function StepIcon({ status }: { status?: string | null }) {
  const s = (status ?? "").toUpperCase();
  if (s === "APPROVED" || s === "APROBADO")
    return <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />;
  if (s === "REJECTED" || s === "RECHAZADO" || s === "NO_RECOMENDAR")
    return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
  return <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? "").toUpperCase();
  let cls = "bg-white/[0.03] text-neutral-300 border-white/[0.05]";
  if (s === "APPROVED" || s === "APROBADO") cls = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  else if (s === "REJECTED" || s === "RECHAZADO") cls = "bg-rose-500/10 text-rose-300 border-rose-500/20";
  else if (s === "NO_RECOMENDAR") cls = "bg-rose-500/10 text-rose-300 border-rose-500/20";
  else if (s === "PRECAUCION") cls = "bg-amber-500/10 text-amber-200 border-amber-500/20";
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border leading-none ${cls}`}
    >
      {s === "APPROVED" ? "APROBADO" : s === "REJECTED" ? "RECHAZADO" : s || "PENDIENTE"}
    </span>
  );
}

export default function AdminDecisionTraceCard({
  aiScore,
  aiBucket,
  aiRecommendation,
  leader,
  coordinator,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const connector = () => (
    <div className="flex justify-center py-0.5">
      <ArrowRight className={`w-4 h-4 ${isDark ? "text-neutral-600" : "text-slate-300"}`} />
    </div>
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-3">
        <Gavel className="w-4 h-4 text-brand-300" />
        <h5 className={`text-sm font-extrabold uppercase tracking-[0.18em] ${isDark ? "text-white" : "text-slate-900"}`}>
          Trazabilidad completa
        </h5>
      </div>

      <p className={`text-[12px] mb-4 ${isDark ? "text-white/45" : "text-slate-600"}`}>
        Flujo de decisión: IA → Líder → Coordinador (decisión oficial)
      </p>

      <div className="space-y-3">
        {/* IA */}
        <div className={`${stepBase} ${isDark ? "border-white/[0.04] bg-white/[0.025]" : "border-slate-200/60 bg-slate-50/80"}`}>
          <Brain className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                IA
              </span>
              <StatusBadge status={aiBucket} />
            </div>
            <p className={`text-sm font-bold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              Score: {aiScore.toFixed(0)} / 100
            </p>
            <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? "text-white/60" : "text-slate-600"}`}>
              {aiRecommendation || "Sin recomendación"}
            </p>
          </div>
        </div>

        {connector()}

        {/* Líder */}
        <div className={`${stepBase} ${isDark ? "border-white/[0.04] bg-white/[0.025]" : "border-slate-200/60 bg-slate-50/80"}`}>
          <StepIcon status={leader.status} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                Líder (entrevista)
              </span>
              <StatusBadge status={leader.status} />
            </div>
            <p className={`text-sm font-bold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {leader.name}
            </p>
            {leader.at && (
              <p className={`text-[11px] mt-0.5 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                {leader.at}
              </p>
            )}
          </div>
        </div>

        {connector()}

        {/* Coordinador - decisión oficial */}
        <div className={`${stepBase} ${
          isDark
            ? "border-emerald-500/15 bg-emerald-500/[0.05]"
            : "border-emerald-200/70 bg-emerald-50"
        }`}>
          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isDark ? "bg-emerald-500/15" : "bg-emerald-100"}`}>
            <ShieldCheck className={`h-3.5 w-3.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-brand-300" : "text-brand-700"}`}>
                Coordinador (decisión oficial)
              </span>
              <StatusBadge status={coordinator.status} />
            </div>
            <p className={`text-sm font-bold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {coordinator.name}
            </p>
            {coordinator.at && (
              <p className={`text-[11px] mt-0.5 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                {coordinator.at}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
