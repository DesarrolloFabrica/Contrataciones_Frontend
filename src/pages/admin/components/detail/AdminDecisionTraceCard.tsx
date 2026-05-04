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
  adminStatus: string;
};

const stepBase =
  "relative flex items-start gap-3 p-4 rounded-2xl border transition-colors";

function StepIcon({ status }: { status?: string | null }) {
  const s = (status ?? "").toUpperCase();
  if (s === "APROBADO")
    return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
  if (s === "RECHAZADO" || s === "NO_RECOMENDAR")
    return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
  return <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? "").toUpperCase();
  let cls = "bg-white/5 text-neutral-300 border-white/10";
  if (s === "APROBADO") cls = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
  else if (s === "RECHAZADO") cls = "bg-rose-500/10 text-rose-300 border-rose-500/30";
  else if (s === "NO_RECOMENDAR") cls = "bg-rose-500/10 text-rose-300 border-rose-500/30";
  else if (s === "PRECAUCION") cls = "bg-yellow-500/10 text-yellow-200 border-yellow-500/30";
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border leading-none ${cls}`}
    >
      {s || "PENDIENTE"}
    </span>
  );
}

export default function AdminDecisionTraceCard({
  aiScore,
  aiBucket,
  aiRecommendation,
  leader,
  coordinator,
  adminStatus,
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
        <Gavel className="w-4 h-4 text-emerald-300" />
        <h5 className={`text-sm font-extrabold uppercase tracking-[0.18em] ${isDark ? "text-white" : "text-slate-900"}`}>
          Trazabilidad completa
        </h5>
      </div>

      <p className={`text-[12px] mb-4 ${isDark ? "text-white/45" : "text-slate-600"}`}>
        Flujo de decisión: IA → Líder → Coordinador → Admin
      </p>

      <div className="space-y-3">
        {/* IA */}
        <div className={`${stepBase} ${isDark ? "bg-white/[0.04] border-white/10" : "bg-slate-50 border-slate-200"}`}>
          <Brain className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
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
        <div className={`${stepBase} ${isDark ? "bg-white/[0.04] border-white/10" : "bg-slate-50 border-slate-200"}`}>
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

        {/* Coordinador */}
        <div className={`${stepBase} ${isDark ? "bg-white/[0.04] border-white/10" : "bg-slate-50 border-slate-200"}`}>
          <StepIcon status={coordinator.status} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                Coordinador
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

        {connector()}

        {/* Admin */}
        <div className={`${stepBase} ${isDark ? "bg-white/[0.04] border-white/10" : "bg-slate-50 border-slate-200"}`}>
          <StepIcon status={adminStatus} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                Admin (decisión final)
              </span>
              <StatusBadge status={adminStatus} />
            </div>
            <p className={`text-sm font-bold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {adminStatus === "APROBADO" || adminStatus === "RECHAZADO"
                ? "Decisión registrada"
                : "Pendiente de revisión"}
            </p>
            <p className={`text-[11px] mt-0.5 ${isDark ? "text-white/40" : "text-slate-500"}`}>
              {adminStatus === "APROBADO" || adminStatus === "RECHAZADO"
                ? "Revisar panel de decisión final"
                : "Sin acción aún"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
