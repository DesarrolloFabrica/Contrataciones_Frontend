// src/pages/admin/components/dashboard/AdminDashboardPanel.tsx
import React, { useMemo } from "react";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  School,
  ScrollText,
  TrendingUp,
  Layers,
} from "lucide-react";
import type { AdminMetrics, SchoolSummary } from "../adminTypes";
import { useAdminAudit } from "../hooks/useAdminAudit";
import AdminAuditTimeline from "../components/audit/AdminAuditTimeline";

function pct(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function StatCard(props: {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: React.ReactNode;
  tone?: "emerald" | "cyan" | "rose" | "amber";
  extra?: React.ReactNode;
}) {
  const tone = props.tone ?? "emerald";

  const toneMap: Record<string, string> = {
    emerald: "border-emerald-500/20 hover:border-emerald-400/35",
    cyan: "border-cyan-500/20 hover:border-cyan-400/35",
    rose: "border-rose-500/20 hover:border-rose-400/35",
    amber: "border-amber-500/20 hover:border-amber-400/35",
  };

  const glowMap: Record<string, string> = {
    emerald: "bg-emerald-500/10",
    cyan: "bg-cyan-500/10",
    rose: "bg-rose-500/10",
    amber: "bg-amber-500/10",
  };

  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border bg-[#0f1110] p-5 md:p-6",
        "shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
        "transition-all",
        toneMap[tone],
      ].join(" ")}
    >
      {/* corner glow */}
      <div
        className={[
          "absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl",
          glowMap[tone],
        ].join(" ")}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-400 font-bold">
            {props.icon}
            {props.title}
          </div>
          <div className="text-3xl md:text-4xl font-black text-white mt-3 leading-none">
            {props.value}
          </div>
          <div className="text-xs text-neutral-500 mt-2">{props.subtitle}</div>
        </div>

        {props.extra && (
          <div className="shrink-0 flex items-start justify-end">{props.extra}</div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPanel(props: {
  metrics: AdminMetrics;
  schoolsSummary: SchoolSummary[];
  recommendedPct: number;
  highRiskPct: number;
}) {
  const { metrics, schoolsSummary, recommendedPct, highRiskPct } = props;

  // Auditoría global (sin filtros)
  const { audit, loadingAudit } = useAdminAudit();

  const topSchools = useMemo(() => {
    return [...schoolsSummary].sort((a, b) => b.total - a.total).slice(0, 6);
  }, [schoolsSummary]);

  const recP = pct(recommendedPct);
  const riskP = pct(highRiskPct);

  return (
    <section className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          tone="cyan"
          title="Total Evaluaciones"
          icon={<Activity className="w-4 h-4 text-cyan-300" />}
          value={metrics.total}
          subtitle="Registro global"
          extra={
            <div className="px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neutral-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 opacity-80" />
              Global
            </div>
          }
        />

        <StatCard
          tone="emerald"
          title="Recomendadas"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-300" />}
          value={`${recP.toFixed(0)}%`}
          subtitle={`${metrics.recommended} candidatos viables`}
          extra={
            <div className="w-24">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2 text-right">
                avance
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${recP}%` }}
                />
              </div>
            </div>
          }
        />

        <StatCard
          tone="rose"
          title="Riesgo alto"
          icon={<ShieldAlert className="w-4 h-4 text-rose-300" />}
          value={`${riskP.toFixed(0)}%`}
          subtitle={`${metrics.notRecommended} no recomendados`}
          extra={
            <div className="w-24">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2 text-right">
                alerta
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-rose-500"
                  style={{ width: `${riskP}%` }}
                />
              </div>
            </div>
          }
        />

        <StatCard
          tone="amber"
          title="Promedio score"
          icon={<School className="w-4 h-4 text-amber-300" />}
          value={metrics.avgScore.toFixed(1)}
          subtitle="Promedio global IA"
          extra={
            <div className="px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neutral-300 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 opacity-80" />
              /100
            </div>
          }
        />
      </div>

      {/* Top schools */}
      <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-300" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-300">
                Resumen por escuela
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Ranking por volumen y calidad (promedio IA + recomendadas).
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neutral-300">
            Top {topSchools.length || 0}
          </div>
        </div>

        <div className="p-4 md:p-6">
          {topSchools.length === 0 ? (
            <div className="text-sm text-neutral-500 py-8 text-center">
              Sin datos.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {topSchools.map((s, idx) => {
                const recRate = s.total ? (s.recommended / s.total) * 100 : 0;
                const riskRate = s.total ? (s.notRecommended / s.total) * 100 : 0;

                return (
                  <div
                    key={s.schoolName}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black text-neutral-300">
                            {idx + 1}
                          </div>
                          <div className="text-white font-semibold truncate">
                            {s.schoolName}
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neutral-300">
                            Total: <b className="text-white">{s.total}</b>
                          </span>

                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] uppercase tracking-widest text-cyan-200">
                            Avg: <b className="text-cyan-100">{s.avgScore.toFixed(1)}</b>
                          </span>

                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] uppercase tracking-widest text-emerald-200">
                            Rec: <b className="text-emerald-100">{Math.round(recRate)}%</b>
                          </span>

                          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] uppercase tracking-widest text-rose-200">
                            Riesgo: <b className="text-rose-100">{Math.round(riskRate)}%</b>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${pct(recRate)}%` }}
                        />
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-rose-500"
                          style={{ width: `${pct(riskRate)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-neutral-500">
                        <span>Recomendadas</span>
                        <span>No recomendadas</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Auditoría reciente */}
      <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-cyan-300" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-300">
                Auditoría reciente
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Últimos eventos relevantes del sistema.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neutral-300">
            {audit.length} total
          </div>
        </div>

        <div className="p-4 md:p-6 bg-[#0a0a0a]/40">
          {loadingAudit ? (
            <div className="text-sm text-neutral-500 py-6">Cargando auditoría…</div>
          ) : audit.length === 0 ? (
            <div className="text-sm text-neutral-500 py-10 text-center">
              Aún no hay eventos de auditoría.
            </div>
          ) : (
            <AdminAuditTimeline events={audit.slice(0, 10)} />
          )}
        </div>
      </div>
    </section>
  );
}
