import React, { useMemo } from "react";
import { Clock, UserCheck } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  avgHours: number | null;
  medianHours: number | null;
  decided: number;
};

function fmtHours(v: number | null) {
  if (v === null || !Number.isFinite(Number(v))) return "—";
  const n = Number(v);
  return `${Math.round(n * 10) / 10}h`;
}

export default function AdminTimeToDecisionCard({ avgHours, medianHours, decided }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const show = (decided ?? 0) > 0;

  const avgLabel = useMemo(() => fmtHours(avgHours), [avgHours]);
  const medianLabel = useMemo(() => fmtHours(medianHours), [medianHours]);

  return (
    <div
      className={[
        "relative flex h-full min-h-[220px] w-full min-w-0 flex-col overflow-hidden rounded-[24px] border p-6 transition-all duration-500",
        isDark
          ? "border-white/[0.04] bg-[#0c0c0e] hover:border-white/[0.08]"
          : "border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/20",
      ].join(" ")}
    >
      {/* Header Minimalista */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h3
            className={[
              "text-sm font-semibold uppercase tracking-widest",
              isDark ? "text-neutral-300" : "text-slate-800",
            ].join(" ")}
          >
            Tiempo a Decisión
          </h3>
          <p
            className={[
              "text-[13px]",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Promedios de candidatos decididos
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Badge de Decididos */}
          <div
            className={[
              "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold",
              isDark
                ? "bg-white/[0.02] border-white/10 text-neutral-400"
                : "bg-slate-50 border-slate-200 text-slate-500",
            ].join(" ")}
          >
            <UserCheck className="w-3.5 h-3.5 opacity-70" />
            <span>{decided ?? 0} decididos</span>
          </div>
          {/* Ícono de fondo */}
          <div className={isDark ? "text-neutral-800" : "text-slate-200"}>
            <Clock strokeWidth={1.5} className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid de Datos */}
      <div className="mt-auto grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Tarjeta Promedio */}
        <div
          className={[
            "relative group flex min-h-0 flex-col justify-center rounded-[16px] border p-5 transition-all duration-300 overflow-hidden sm:h-full",
            isDark
              ? "border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] hover:border-emerald-500/20"
              : "border-slate-100 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-sm",
          ].join(" ")}
        >
          {/* Resplandor Hover Esmeralda */}
          {isDark && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 transition-all duration-500" />
          )}
          
          <div className={["text-[10px] uppercase tracking-[0.2em] font-bold relative z-10", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}>
            Promedio
          </div>
          <div
            className={[
              "mt-2 text-4xl font-black tracking-tighter relative z-10",
              isDark
                ? show ? "text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-200" : "text-neutral-700"
                : show ? "text-emerald-700" : "text-slate-300",
            ].join(" ")}
          >
            {show ? avgLabel : "—"}
          </div>
        </div>

        {/* Tarjeta Mediana */}
        <div
          className={[
            "relative group flex min-h-0 flex-col justify-center rounded-[16px] border p-5 transition-all duration-300 overflow-hidden sm:h-full",
            isDark
              ? "border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] hover:border-cyan-500/20"
              : "border-slate-100 bg-slate-50 hover:bg-white hover:border-cyan-200 hover:shadow-sm",
          ].join(" ")}
        >
          {/* Resplandor Hover Cyan */}
          {isDark && (
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 transition-all duration-500" />
          )}

          <div className={["text-[10px] uppercase tracking-[0.2em] font-bold relative z-10", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}>
            Mediana
          </div>
          <div
            className={[
              "mt-2 text-4xl font-black tracking-tighter relative z-10",
              isDark
                ? show ? "text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-cyan-200" : "text-neutral-700"
                : show ? "text-cyan-700" : "text-slate-300",
            ].join(" ")}
          >
            {show ? medianLabel : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}