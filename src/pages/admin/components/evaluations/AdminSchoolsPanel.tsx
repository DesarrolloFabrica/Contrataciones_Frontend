// src/pages/admin/components/evaluations/AdminSchoolsPanel.tsx
import React, { useMemo } from "react";
import { Building2 } from "lucide-react";
import type { SchoolSummary } from "../../adminTypes";
import { clampPct } from "../../utils/adminSelectors";

type Props = {
  schoolsSummary: SchoolSummary[];
  selectedSchool: string;
  onSelectSchool: (schoolNameOrAll: string) => void; // "TODAS" o nombre
};

export default function AdminSchoolsPanel(props: Props) {
  const { schoolsSummary, selectedSchool, onSelectSchool } = props;

  const totalAll = useMemo(
    () => schoolsSummary.reduce((acc, s) => acc + (s.total ?? 0), 0),
    [schoolsSummary]
  );

  return (
    <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
            <Building2 size={16} className="text-emerald-400" />
            Escuelas
          </h3>

          <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-neutral-400 border border-white/5">
            {totalAll} total
          </span>
        </div>

        <p className="text-xs text-neutral-500 mt-2">
          Selecciona una escuela para enfocar el panel. (También puedes usar el filtro).
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* ✅ “Todas” como opción visual */}
        <button
          type="button"
          onClick={() => onSelectSchool("TODAS")}
          className={[
            "w-full text-left rounded-2xl border transition-all p-4",
            selectedSchool === "TODAS"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-white/10 bg-black/20 hover:border-emerald-500/20",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-neutral-500">
                Vista global
              </p>
              <p className="text-sm font-bold text-white mt-1">Todas las escuelas</p>
            </div>
            <span className="shrink-0 text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-neutral-400 border border-white/5">
              {totalAll}
            </span>
          </div>
        </button>

        {/* ✅ Tarjetas por escuela (clic) */}
        {schoolsSummary.map((s) => {
          const recRate = s.total > 0 ? (s.recommended / s.total) * 100 : 0;
          const active = selectedSchool === s.schoolName;

          return (
            <button
              key={s.schoolName}
              type="button"
              onClick={() => onSelectSchool(s.schoolName)}
              className={[
                "w-full text-left bg-[#0a0a0a] p-4 rounded-2xl border transition-all group",
                active
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-white/5 hover:border-emerald-500/20",
              ].join(" ")}
              title={`Filtrar por: ${s.schoolName}`}
            >
              <div className="flex justify-between items-start mb-3 gap-3">
                <h4
                  className={[
                    "text-sm font-bold line-clamp-1 transition-colors",
                    active ? "text-emerald-300" : "text-white group-hover:text-emerald-400",
                  ].join(" ")}
                >
                  {s.schoolName}
                </h4>
                <span className="shrink-0 text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-neutral-400 border border-white/5">
                  {s.total}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-neutral-500 font-medium">Score promedio</span>
                    <span className="text-cyan-400 font-mono">{s.avgScore.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${clampPct(s.avgScore)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-neutral-500 font-medium">Tasa recomendación</span>
                    <span
                      className={`font-mono ${
                        recRate >= 70 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {recRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        recRate >= 70 ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${clampPct(recRate)}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {schoolsSummary.length === 0 && (
          <div className="text-center text-neutral-600 text-sm py-10">
            Sin datos disponibles
          </div>
        )}
      </div>
    </div>
  );
}
