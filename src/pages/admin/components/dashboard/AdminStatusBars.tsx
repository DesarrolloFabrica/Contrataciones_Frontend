import React, { useMemo, useState } from "react";
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

type Row = { key: string; label: string; value: number; color: string; colorEnd: string };

export default function AdminStatusBars({ approved, rejected, pending, noEval }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const rows: Row[] = useMemo(
    () => [
      {
        key: "APPROVED",
        label: "Aprobados",
        value: Number(approved ?? 0),
        color: isDark ? "#10b981" : "#10b981", // Neon Emerald
        colorEnd: isDark ? "#047857" : "#047857",
      },
      {
        key: "REJECTED",
        label: "Rechazados",
        value: Number(rejected ?? 0),
        color: isDark ? "#f43f5e" : "#e11d48", // Neon Rose
        colorEnd: isDark ? "#9f1239" : "#be123c",
      },
      {
        key: "PENDING",
        label: "Pendientes",
        value: Number(pending ?? 0),
        color: isDark ? "#facc15" : "#f59e0b", // Neon Yellow/Amber
        colorEnd: isDark ? "#a16207" : "#b45309",
      },
      {
        key: "NO_EVAL",
        label: "Sin evaluar",
        value: Number(noEval ?? 0),
        color: isDark ? "#22d3ee" : "#06b6d4", // Neon Cyan
        colorEnd: isDark ? "#0e7490" : "#0891b2",
      },
    ],
    [approved, rejected, pending, noEval, isDark]
  );

  const maxVal = Math.max(1, ...rows.map((r) => r.value));

  // Tooltip estilo "Glassmorphism Premium"
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
              {label}
            </span>
            <div className="flex items-center gap-2.5">
              {/* Indicador de color con un sutil resplandor (glow) */}
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute w-3 h-3 rounded-full opacity-40 blur-[4px]"
                  style={{ backgroundColor: data.color }}
                />
                <div
                  className="relative w-2 h-2 rounded-full border border-white/20"
                  style={{ backgroundColor: data.color }}
                />
              </div>
              <p className="text-xl font-bold tracking-tight leading-none">
                {payload[0].value}
                <span className="text-xs font-medium ml-1.5 opacity-50 tracking-normal">
                  candidatos
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
        "relative w-full overflow-hidden rounded-xl border p-5",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-0.5">
          <h3
            className={[
              "text-xs font-semibold uppercase tracking-widest",
              isDark ? "text-neutral-300" : "text-slate-800",
            ].join(" ")}
          >
            Estado de Candidatos
          </h3>
          <p
            className={[
              "text-xs",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Distribución del proceso de selección por estado
          </p>
        </div>
      </div>

      <div className="h-[250px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              {rows.map((r) => (
                <linearGradient id={`grad-${r.key}`} x1="0" y1="0" x2="0" y2="1" key={r.key}>
                  <stop offset="0%" stopColor={r.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={r.colorEnd} stopOpacity={0.4} />
                </linearGradient>
              ))}
            </defs>

            {/* Cuadrícula sólida ultra tenue en lugar de punteada para un look más moderno */}
            <CartesianGrid
              strokeDasharray="0"
              vertical={false}
              stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.04)"}
            />
            
            <XAxis
              dataKey="label"
              tick={{
                fill: isDark ? "#737373" : "#64748b",
                fontSize: 12,
                fontWeight: 500,
              }}
              axisLine={false}
              tickLine={false}
              tickMargin={16}
            />
            
            <YAxis
              domain={[0, Math.ceil(maxVal * 1.15)]}
              tick={{
                fill: isDark ? "#525252" : "#94a3b8",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tickMargin={12}
            />
            
            <Tooltip
              cursor={{
                // Cursor redondeado y ultra sutil
                fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.02)",
                rx: 8,
                ry: 8,
              }}
              content={<CustomTooltip />}
              offset={20}
            />

            {/* Barras más esbeltas (barSize 36) con esquinas redondeadas suaves */}
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]} 
              barSize={36} 
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {rows.map((r) => (
                <Cell
                  key={r.key}
                  fill={`url(#grad-${r.key})`}
                  // Dimming extremo para enfocar la barra activa
                  opacity={hoveredKey && hoveredKey !== r.key ? 0.2 : 1}
                  className="transition-all duration-300 ease-in-out cursor-pointer"
                  onMouseEnter={() => setHoveredKey(r.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}