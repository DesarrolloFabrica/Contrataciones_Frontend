// src/pages/admin/components/AdminSchoolsPanel.tsx
import React from "react";
import { Building2 } from "lucide-react";
import type { SchoolSummary } from "../utils/adminTypes";
import { clampPct } from "../utils/adminSelectors";

export default function AdminSchoolsPanel(props: { schoolsSummary: SchoolSummary[] }) {
  const { schoolsSummary } = props;

  return (
    <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[680px] lg:sticky lg:top-24">
      <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm">
        <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
          <Building2 size={16} className="text-emerald-400" />
          Desempeño por Escuela
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {schoolsSummary.map((s) => {
          const recRate = s.total > 0 ? (s.recommended / s.total) * 100 : 0;
          return (
            <div
              key={s.schoolName}
              className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <h4
                  className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors"
                  title={s.schoolName}
                >
                  {s.schoolName}
                </h4>
                <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-neutral-400 border border-white/5">
                  {s.total}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-neutral-500 font-medium">Score Promedio</span>
                    <span className="text-cyan-400 font-mono">{s.avgScore.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${clampPct(s.avgScore)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-neutral-500 font-medium">Tasa Aprobación</span>
                    <span className={`font-mono ${recRate >= 70 ? "text-emerald-400" : "text-rose-400"}`}>
                      {recRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${recRate >= 70 ? "bg-emerald-500" : "bg-rose-500"}`}
                      style={{ width: `${clampPct(recRate)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {schoolsSummary.length === 0 && (
          <div className="text-center text-neutral-600 text-sm py-10">Sin datos disponibles</div>
        )}
      </div>
    </div>
  );
}
