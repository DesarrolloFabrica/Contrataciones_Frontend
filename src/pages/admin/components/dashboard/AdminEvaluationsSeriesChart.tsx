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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div>
        <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
          Serie temporal de evaluaciones
        </div>
        <div className="text-xs text-neutral-400 mt-1">
          Evaluaciones por intervalo (día/semana/mes según rango)
        </div>
      </div>

      <div className="mt-4 h-[320px]">
        {data.length === 0 ? (
          <div className="h-full rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center text-neutral-500 text-sm">
            No hay datos en el rango seleccionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />

              <XAxis
                dataKey="bucket"
                tickFormatter={fmtTick}
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={false}
                minTickGap={18}
              />

              <YAxis
                domain={[0, Math.ceil(maxVal * 1.15)]}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={false}
                allowDecimals={false}
              />

              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.10)" }}
                contentStyle={{
                  background: "rgba(11,13,12,0.95)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 14,
                  color: "rgba(255,255,255,0.9)",
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
