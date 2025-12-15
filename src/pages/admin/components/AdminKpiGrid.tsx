// src/pages/admin/components/AdminKpiGrid.tsx
import React from "react";
import { Activity, AlertCircle, FileText, TrendingUp } from "lucide-react";
import type { AdminMetrics } from "../utils/adminTypes";
import { clampPct } from "../utils/adminSelectors";

export default function AdminKpiGrid(props: {
  metrics: AdminMetrics;
  recommendedPct: number;
  highRiskPct: number;
}) {
  const { metrics, recommendedPct, highRiskPct } = props;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total */}
      <div className="bg-[#0f1110]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <FileText size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Total</span>
        </div>
        <div className="text-4xl font-bold text-white mb-1 tracking-tight">{metrics.total}</div>
        <div className="text-xs text-neutral-400">Evaluaciones registradas</div>
      </div>

      {/* Avg */}
      <div className="bg-[#0f1110]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Activity size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Promedio</span>
        </div>
        <div className="text-4xl font-bold text-white mb-1 tracking-tight">
          {metrics.avgScore.toFixed(1)}
          <span className="text-lg text-neutral-600 font-medium">/100</span>
        </div>
        <div className="text-xs text-neutral-400">Score de idoneidad global</div>
      </div>

      {/* Approved */}
      <div className="bg-[#0f1110]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <TrendingUp size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Aprobados</span>
        </div>
        <div className="text-4xl font-bold text-white mb-1 tracking-tight">{recommendedPct.toFixed(0)}%</div>
        <div className="text-xs text-neutral-400 mb-3">{metrics.recommended} candidatos viables</div>
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${clampPct(recommendedPct)}%` }}
          />
        </div>
      </div>

      {/* High risk */}
      <div className="bg-[#0f1110]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-rose-500/30 transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <AlertCircle size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Riesgo Alto</span>
        </div>
        <div className="text-4xl font-bold text-white mb-1 tracking-tight">{highRiskPct.toFixed(0)}%</div>
        <div className="text-xs text-neutral-400 mb-3">{metrics.notRecommended} no recomendados</div>
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
            style={{ width: `${clampPct(highRiskPct)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
