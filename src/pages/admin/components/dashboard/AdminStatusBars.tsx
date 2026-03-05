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
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  approved: number;
  rejected: number;
  pending: number;
  noEval: number;
};

type Row = { key: string; label: string; value: number; color: string };

export default function AdminStatusBars({ approved, rejected, pending, noEval }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
    <div
      className={[
        "rounded-3xl border p-5",
        isDark
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div
            className={[
              "text-[11px] uppercase tracking-widest font-bold",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Candidatos por estado
          </div>
          <div
            className={[
              "text-xs mt-1",
              isDark ? "text-neutral-400" : "text-slate-600",
            ].join(" ")}
          >
            Aprobados · Rechazados · Pendientes · Sin evaluar
          </div>
        </div>
      </div>

      <div className="mt-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.10)"}
            />
            <XAxis
              dataKey="label"
              tick={{
                fill: isDark ? "rgba(255,255,255,0.75)" : "rgba(15,23,42,0.80)",
                fontSize: 12,
              }}
              axisLine={{
                stroke: isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(148,163,184,0.6)",
              }}
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(maxVal * 1.15)]}
              tick={{
                fill: isDark ? "rgba(255,255,255,0.45)" : "rgba(100,116,139,1)",
                fontSize: 12,
              }}
              axisLine={{
                stroke: isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(148,163,184,0.6)",
              }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{
                fill: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(16,185,129,0.06)",
              }}
              contentStyle={{
                background: isDark
                  ? "rgba(11,13,12,0.95)"
                  : "rgba(255,255,255,0.98)",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.10)"
                  : "1px solid rgba(148,163,184,0.4)",
                borderRadius: 14,
                color: isDark
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(15,23,42,0.9)",
                fontSize: 12,
              }}
              labelStyle={{
                color: isDark
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(15,23,42,0.9)",
              }}
              itemStyle={{
                color: isDark
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(15,23,42,0.9)",
              }}
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
