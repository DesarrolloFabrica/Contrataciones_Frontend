import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTheme } from "../../../../context/ThemeContext";

type Point = {
  bucket: string; // ISO
  evaluations: number;
};

type Props = {
  points: Point[];
};

function fmtTick(iso: string) {
  const d = new Date(iso);
  // corto y legible
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

function fmtTooltipLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "2-digit" });
}

export default function AdminEvaluationsSeriesChart({ points }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = useMemo(
    () =>
      (points ?? []).map((p) => ({
        ...p,
        evaluations: Number(p.evaluations ?? 0),
      })),
    [points]
  );

  const maxVal = Math.max(1, ...data.map((d) => d.evaluations));

  return (
    <div
      className={[
        "rounded-3xl border p-5",
        isDark
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div>
        <div
          className={[
            "text-[11px] uppercase tracking-widest font-bold",
            isDark ? "text-neutral-500" : "text-slate-500",
          ].join(" ")}
        >
          Serie temporal de evaluaciones
        </div>
        <div
          className={[
            "text-xs mt-1",
            isDark ? "text-neutral-400" : "text-slate-600",
          ].join(" ")}
        >
          Evaluaciones por intervalo (día/semana/mes según rango)
        </div>
      </div>

      <div className="mt-4 h-[320px]">
        {data.length === 0 ? (
          <div
            className={[
              "h-full rounded-2xl border flex items-center justify-center text-sm",
              isDark
                ? "border-white/10 bg-black/20 text-neutral-500"
                : "border-slate-200 bg-slate-50 text-slate-600",
            ].join(" ")}
          >
            No hay datos en el rango seleccionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={
                  isDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.10)"
                }
              />

              <XAxis
                dataKey="bucket"
                tickFormatter={fmtTick}
                tick={{
                  fill: isDark
                    ? "rgba(255,255,255,0.75)"
                    : "rgba(15,23,42,0.80)",
                  fontSize: 12,
                }}
                axisLine={{
                  stroke: isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(148,163,184,0.6)",
                }}
                tickLine={false}
                minTickGap={18}
              />

              <YAxis
                domain={[0, Math.ceil(maxVal * 1.15)]}
                tick={{
                  fill: isDark
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(100,116,139,1)",
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
                  stroke: isDark
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(16,185,129,0.45)",
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
                labelFormatter={(l: any) => fmtTooltipLabel(String(l))}
                formatter={(v: any) => [Number(v), "Evaluaciones"]}
              />

              <Line
                type="monotone"
                dataKey="evaluations"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
