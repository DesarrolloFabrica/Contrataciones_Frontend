import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Props = {
  approved: number;
  rejected: number;
  pending: number;
  noEval: number;
};

type Row = { key: string; label: string; value: number; color: string };

export default function AdminStatusBars({ approved, rejected, pending, noEval }: Props) {
  const rows: Row[] = useMemo(
    () => [
      { key: "APPROVED", label: "Aprobados", value: Number(approved ?? 0), color: "#f8b4b4" }, // rosado
      { key: "REJECTED", label: "Rechazados", value: Number(rejected ?? 0), color: "#f59e0b" }, // naranja
      { key: "PENDING", label: "Pendientes", value: Number(pending ?? 0), color: "#fde68a" }, // amarillo
      { key: "NO_EVAL", label: "Sin evaluar", value: Number(noEval ?? 0), color: "#86efac" }, // verde
    ],
    [approved, rejected, pending, noEval]
  );

  const maxVal = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
            Candidatos por estado
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Aprobados · Rechazados · Pendientes · Sin evaluar
          </div>
        </div>
      </div>

      <div className="mt-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(maxVal * 1.15)]}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "rgba(11,13,12,0.95)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 14,
                color: "rgba(255,255,255,0.9)",
                fontSize: 12,
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
              formatter={(v: any) => [Number(v), "Candidatos"]}
            />

            <Bar dataKey="value" radius={[14, 14, 14, 14]} barSize={42}>
              {rows.map((r) => (
                <Cell key={r.key} fill={r.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
