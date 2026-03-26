import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Activity, AlertCircle } from "lucide-react";
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

  // Tooltip estilo "Glassmorphism Premium"
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const color = isDark ? "#10b981" : "#059669"; // Emerald

      return (
        <div
          className={[
            "px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-200",
            isDark
              ? "bg-[#0a0a0a]/80 border-white/10 text-white shadow-black/50"
              : "bg-white/90 border-slate-200/60 text-slate-900 shadow-slate-300/50",
          ].join(" ")}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold opacity-60">
              {fmtTooltipLabel(label)}
            </span>
            <div className="flex items-center gap-2.5">
              {/* Indicador de color con un sutil resplandor (glow) */}
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute w-3 h-3 rounded-full opacity-40 blur-[4px]"
                  style={{ backgroundColor: color }}
                />
                <div
                  className="relative w-2 h-2 rounded-full border border-white/20"
                  style={{ backgroundColor: color }}
                />
              </div>
              <p className="text-xl font-bold tracking-tight leading-none">
                {value}
                <span className="text-xs font-medium ml-1.5 opacity-50 tracking-normal">
                  evaluaciones
                </span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={[
        "relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-[24px] border p-6 transition-all duration-500",
        isDark
          ? "border-white/[0.04] bg-[#0c0c0e] hover:border-white/[0.08]"
          : "border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/20",
      ].join(" ")}
    >
      {/* Encabezado limpio y minimalista */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h3
            className={[
              "text-sm font-semibold uppercase tracking-widest",
              isDark ? "text-neutral-300" : "text-slate-800",
            ].join(" ")}
          >
            Serie Temporal
          </h3>
          <p
            className={[
              "text-[13px]",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Frecuencia de evaluaciones por fecha
          </p>
        </div>
        {/* Ícono sutil como marca de agua a la derecha */}
        <div className={isDark ? "text-neutral-800" : "text-slate-200"}>
          <Activity strokeWidth={1.5} className="w-6 h-6" />
        </div>
      </div>

      {/* Contenedor de la gráfica */}
      <div className="min-h-[200px] w-full flex-1">
        {data.length === 0 ? (
          <div
            className={[
              "flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed",
              isDark
                ? "border-white/5 bg-white/[0.02] text-neutral-600"
                : "border-slate-200 bg-slate-50 text-slate-400",
            ].join(" ")}
          >
            <AlertCircle className="h-6 w-6 opacity-50" />
            <span className="text-sm font-medium">No hay datos en el rango seleccionado</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              {/* Definición de gradiente premium */}
              <defs>
                <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isDark ? "#10b981" : "#059669"}
                    stopOpacity={isDark ? 0.3 : 0.15}
                  />
                  <stop
                    offset="100%"
                    stopColor={isDark ? "#10b981" : "#059669"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              {/* Cuadrícula sólida ultra tenue en lugar de punteada */}
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.04)"}
              />

              <XAxis
                dataKey="bucket"
                tickFormatter={fmtTick}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? "#737373" : "#64748b",
                  fontSize: 11,
                  fontWeight: 500,
                }}
                dy={12}
                minTickGap={25}
              />

              <YAxis
                domain={[0, Math.ceil(maxVal * 1.15)]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? "#525252" : "#94a3b8",
                  fontSize: 11,
                }}
                allowDecimals={false}
                dx={-10}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)",
                  strokeWidth: 1,
                  strokeDasharray: "0",
                }}
              />

              <Area
                type="monotone"
                dataKey="evaluations"
                stroke={isDark ? "#10b981" : "#059669"}
                strokeWidth={3}
                fill="url(#glowGradient)"
                animationDuration={1500}
                animationEasing="ease-out"
                activeDot={{
                  r: 5,
                  strokeWidth: 4,
                  stroke: isDark ? "#0c0c0e" : "#ffffff", // Borde del color del fondo
                  fill: isDark ? "#10b981" : "#059669",
                  style: { filter: isDark ? "drop-shadow(0 0 4px rgba(16,185,129,0.8))" : "none" }
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}