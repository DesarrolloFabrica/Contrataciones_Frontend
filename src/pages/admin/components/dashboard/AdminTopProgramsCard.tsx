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
import { TrendingUp, AlertCircle } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

type ProgramsMode = "VOLUME" | "ACCEPTANCE";

type ByVolumeRow = { programId: string; name: string; candidates: number };
type ByAcceptanceRow = { programId: string; name: string; decided: number; approved: number; acceptanceRate: number };

type Props = {
  mode: ProgramsMode;
  byVolume: ByVolumeRow[];
  byAcceptance: ByAcceptanceRow[];
};

type Row = {
  key: string;
  name: string;
  value: number;
  subtitle: string;
  accent: "cyan" | "cyan";
};

export default function AdminTopProgramsCard({ mode, byVolume, byAcceptance }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    if (mode === "VOLUME") {
      return (byVolume ?? [])
        .slice(0, 10)
        .map((r) => ({
          key: String(r.programId),
          name: String(r.name),
          value: Number(r.candidates ?? 0),
          subtitle: `${Number(r.candidates ?? 0)} candidatos`,
          accent: "cyan" as const,
        }));
    }

    return (byAcceptance ?? [])
      .slice(0, 10)
      .map((r) => ({
        key: String(r.programId),
        name: String(r.name),
        value: Math.round(Number(r.acceptanceRate ?? 0) * 1000) / 10,
        subtitle: `${Number(r.decided ?? 0)} decididos · ${Math.round(Number(r.approved ?? 0) * 10) / 10}% aprobados`,
        accent: "cyan" as const,
      }));
  }, [mode, byVolume, byAcceptance]);

  const maxVal = useMemo(() => Math.max(1, ...rows.map((r) => r.value)), [rows]);

  // Tooltip personalizado para un look más Premium
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as Row;
      return (
        <div
          className={[
            "rounded-[16px] border p-4 shadow-2xl backdrop-blur-xl transition-all",
            isDark
              ? "border-white/10 bg-[#0c0c0e]/95 shadow-black/50"
              : "border-slate-200 bg-white/95 shadow-slate-300/50",
          ].join(" ")}
        >
          <p className={["text-[11px] uppercase tracking-widest font-bold mb-1", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}>
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span
              className={[
                "text-3xl font-black tracking-tight",
                data.accent === "cyan" 
                  ? (isDark ? "text-cyan-400" : "text-cyan-600")
                  : (isDark ? "text-cyan-400" : "text-cyan-600"),
              ].join(" ")}
            >
              {data.value}
            </span>
            <span className={["text-sm font-semibold", isDark ? "text-neutral-400" : "text-slate-500"].join(" ")}>
              {mode === "ACCEPTANCE" ? "%" : ""}
            </span>
          </div>
          <p className={["text-xs font-medium mt-1", isDark ? "text-neutral-400" : "text-slate-500"].join(" ")}>
            {data.subtitle}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={[
        "relative flex h-full min-h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-xl border p-5",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-0.5">
          <h3
            className={[
              "text-xs font-semibold uppercase tracking-widest",
              isDark ? "text-neutral-300" : "text-slate-800",
            ].join(" ")}
          >
            Programas Top
          </h3>
          <p
            className={[
              "text-xs",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            {mode === "VOLUME" ? "Ranking por volumen de candidatos" : "Ranking por porcentaje de aceptación"}
          </p>
        </div>

        <div
          className={[
            "flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-medium shrink-0",
            isDark
              ? "bg-white/[0.02] border-white/10 text-neutral-500"
              : "bg-slate-50 border-slate-200 text-slate-500",
          ].join(" ")}
        >
          <span>Top {rows.length}</span>
        </div>
      </div>

      <div className="mt-2 min-h-[250px] flex-1">
        {rows.length === 0 ? (
          <div
            className={[
              "flex h-full flex-col items-center justify-center rounded-[16px] border border-dashed p-8",
              isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-slate-50",
            ].join(" ")}
          >
            <AlertCircle className={["w-8 h-8 mb-3 opacity-40", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")} />
            <p className={["text-sm font-medium text-center", isDark ? "text-neutral-500" : "text-slate-500"].join(" ")}>
              No hay datos suficientes para el rango seleccionado.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                {/* Gradientes para las barras */}
                <linearGradient id="gradEmerald" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={isDark ? "#047857" : "#34d399"} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={1} />
                </linearGradient>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={isDark ? "#0e7490" : "#22d3ee"} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={isDark ? "#22d3ee" : "#06b6d4"} stopOpacity={1} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={true}
                horizontal={false}
                stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.04)"}
              />
              <XAxis
                type="number"
                domain={[0, Math.ceil(maxVal * 1.1)]}
                tick={{ fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.5)", fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tickFormatter={(v) => (mode === "ACCEPTANCE" ? `${v}%` : `${v}`)}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: isDark ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.8)", fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip
                cursor={{
                  fill: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                }}
                content={<CustomTooltip />}
              />

              <Bar 
                dataKey="value" 
                barSize={20} 
                radius={[0, 6, 6, 0]} // Solo redondea la punta derecha
              >
                {rows.map((r) => (
                  <Cell
                    key={r.key}
                    fill={r.accent === "cyan" ? "url(#gradEmerald)" : "url(#gradCyan)"}
                    className="transition-opacity duration-300"
                    opacity={hoveredKey && hoveredKey !== r.key ? 0.3 : 1}
                    onMouseEnter={() => setHoveredKey(r.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}