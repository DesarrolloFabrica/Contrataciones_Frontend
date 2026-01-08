// src/pages/admin/components/evaluations/AdminKpiGrid.tsx
import React from "react";
import { Activity, AlertCircle, FileText, TrendingUp } from "lucide-react";
import type { AdminMetrics } from "../../adminTypes";
import { clampPct } from "../../utils/adminSelectors";

type Props = {
  metrics: AdminMetrics;
  recommendedPct: number;
  highRiskPct: number;
  scopeLabel: string;
};

const CardShell = ({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "emerald" | "cyan" | "rose";
}) => {
  const toneCls =
    tone === "emerald"
      ? "hover:border-emerald-500/30"
      : tone === "cyan"
      ? "hover:border-cyan-500/30"
      : "hover:border-rose-500/30";

  const glowCls =
    tone === "emerald"
      ? "from-emerald-500/10 via-transparent"
      : tone === "cyan"
      ? "from-cyan-500/10 via-transparent"
      : "from-rose-500/10 via-transparent";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border border-white/10",
        "bg-gradient-to-b from-white/[0.06] to-white/[0.02]",
        "backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
        "transition-all",
        toneCls,
      ].join(" ")}
    >
      {/* ambient glow */}
      <div
        className={[
          "pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl",
          "bg-gradient-to-br",
          glowCls,
        ].join(" ")}
      />
      {/* subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_20%,#000_70%,transparent_100%)] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 p-6">{children}</div>
    </div>
  );
};

const StatHeader = ({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "emerald" | "cyan" | "rose";
}) => {
  const iconCls =
    tone === "emerald"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
      : tone === "cyan"
      ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
      : "bg-rose-500/10 text-rose-300 border-rose-500/20";

  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div
        className={[
          "h-11 w-11 rounded-2xl border flex items-center justify-center",
          iconCls,
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
          {label}
        </p>
      </div>
    </div>
  );
};

const Progress = ({
  value,
  tone,
}: {
  value: number;
  tone: "emerald" | "rose";
}) => {
  const pct = clampPct(value);

  const barCls =
    tone === "emerald"
      ? "bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
      : "bg-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.35)]";

  return (
    <div className="mt-3">
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={["h-full rounded-full", barCls].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default function AdminKpiGrid({
  metrics,
  recommendedPct,
  highRiskPct,
  scopeLabel,
}: Props) {
  const safeMetrics: AdminMetrics = metrics ?? {
    total: 0,
    avgScore: 0,
    recommended: 0,
    caution: 0,
    notRecommended: 0,
  };

  return (
    <section className="space-y-4">
      {/* Title strip (más ejecutivo) */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Métricas del scope
          </p>
          <h3 className="text-white font-black text-lg">Resumen ejecutivo</h3>
          <p className="text-xs text-neutral-500 mt-1">{scopeLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Total */}
        <CardShell tone="emerald">
          <StatHeader
            tone="emerald"
            label="Total"
            icon={<FileText className="w-5 h-5" />}
          />
          <div className="flex items-end justify-between gap-3">
            <div className="text-4xl font-black text-white tracking-tight">
              {safeMetrics.total}
            </div>
            <div className="text-xs text-neutral-500">evaluaciones</div>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Registros completos disponibles para revisión.
          </p>
        </CardShell>

        {/* Promedio */}
        <CardShell tone="cyan">
          <StatHeader
            tone="cyan"
            label="Promedio"
            icon={<Activity className="w-5 h-5" />}
          />
          <div className="flex items-end justify-between gap-3">
            <div className="text-4xl font-black text-white tracking-tight">
              {Number.isFinite(safeMetrics.avgScore)
                ? safeMetrics.avgScore.toFixed(1)
                : "0.0"}
              <span className="text-lg text-neutral-600 font-semibold">
                /100
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Score promedio de idoneidad (IA).
          </p>
        </CardShell>

        {/* Aprobados */}
        <CardShell tone="emerald">
          <StatHeader
            tone="emerald"
            label="Recomendados"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <div className="flex items-end justify-between gap-3">
            <div className="text-4xl font-black text-white tracking-tight">
              {Number.isFinite(recommendedPct)
                ? recommendedPct.toFixed(0)
                : "0"}
              %
            </div>
            <div className="text-xs text-neutral-500">
              {safeMetrics.recommended} candidatos
            </div>
          </div>

          <p className="mt-2 text-xs text-neutral-400">
            Candidatos con recomendación positiva.
          </p>

          <Progress value={recommendedPct} tone="emerald" />
        </CardShell>

        {/* Riesgo alto */}
        <CardShell tone="rose">
          <StatHeader
            tone="rose"
            label="Riesgo alto"
            icon={<AlertCircle className="w-5 h-5" />}
          />
          <div className="flex items-end justify-between gap-3">
            <div className="text-4xl font-black text-white tracking-tight">
              {Number.isFinite(highRiskPct) ? highRiskPct.toFixed(0) : "0"}%
            </div>
            <div className="text-xs text-neutral-500">
              {safeMetrics.notRecommended} casos
            </div>
          </div>

          <p className="mt-2 text-xs text-neutral-400">
            Casos marcados como no recomendados.
          </p>

          <Progress value={highRiskPct} tone="rose" />
        </CardShell>
      </div>
    </section>
  );
}
