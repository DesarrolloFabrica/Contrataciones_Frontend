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
import { GraduationCap, AlertCircle, Users } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

type BySchoolRow = {
  schoolId: string;
  schoolName: string;
  candidates: number;
  approved: number;
  rejected: number;
  pending: number;
  noEval: number;
  acceptanceRate: number; // 0..1
  share: number; // 0..1
};

type Props = {
  bySchool: BySchoolRow[];
};

type Row = {
  key: string;
  name: string;
  acceptancePct: number;
  candidates: number;
  sharePct: number;
};

export default function AdminBySchoolCard({ bySchool }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const sorted = [...(bySchool ?? [])].sort((a, b) => Number(b.candidates ?? 0) - Number(a.candidates ?? 0));
    return sorted.slice(0, 7).map((r) => ({
      key: String(r.schoolId),
      name: String(r.schoolName),
      acceptancePct: Math.round(Number(r.acceptanceRate ?? 0) * 1000) / 10,
      candidates: Number(r.candidates ?? 0),
      sharePct: Math.round(Number(r.share ?? 0) * 1000) / 10,
    }));
  }, [bySchool]);

  const maxVal = useMemo(() => Math.max(1, ...rows.map((r) => r.acceptancePct)), [rows]);

  // Tooltip personalizado para integrar métricas extra
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as Row;
      return (
        <div className={[
          "rounded-2xl border p-4 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 min-w-[160px]",
          isDark 
            ? "border-white/10 bg-[#0a0c0b]/90 shadow-black/50" 
            : "border-slate-200 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.12)]"
        ].join(" ")}>
          <p className={["mb-3 text-xs font-bold uppercase tracking-wider", isDark ? "text-neutral-400" : "text-slate-500"].join(" ")}>
            {label}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className={["text-xs font-medium flex items-center gap-1.5", isDark ? "text-neutral-400" : "text-slate-500"].join(" ")}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Aceptación
              </span>
              <span className={["text-sm font-black", isDark ? "text-emerald-400" : "text-emerald-600"].join(" ")}>
                {data.acceptancePct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className={["text-xs font-medium flex items-center gap-1.5", isDark ? "text-neutral-400" : "text-slate-500"].join(" ")}>
                <Users className="w-3 h-3" />
                Candidatos
              </span>
              <span className={["text-sm font-bold", isDark ? "text-neutral-200" : "text-slate-700"].join(" ")}>
                {data.candidates}
              </span>
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
        "relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-lg flex flex-col",
        isDark 
          ? "border-white/10 bg-[#0a0c0b]/80 backdrop-blur-xl hover:border-white/20" 
          : "border-slate-200 bg-white/90 backdrop-blur-xl hover:border-slate-300",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <div className={[
            "flex h-10 w-10 items-center justify-center rounded-2xl border",
            isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600"
          ].join(" ")}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className={[
              "text-sm font-bold tracking-wide",
              isDark ? "text-neutral-100" : "text-slate-800"
            ].join(" ")}>
              Distribución por Escuelas
            </h3>
            <p className={[
              "text-xs mt-0.5",
              isDark ? "text-neutral-500" : "text-slate-500"
            ].join(" ")}>
              Top escuelas por volumen y participación
            </p>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-[280px] w-full mt-2">
        {rows.length === 0 ? (
          <div className={[
            "flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed",
            isDark ? "border-white/10 bg-white/5 text-neutral-500" : "border-slate-200 bg-slate-50 text-slate-500"
          ].join(" ")}>
            <AlertCircle className="h-6 w-6 opacity-50" />
            <span className="text-sm font-medium">No hay datos en el rango seleccionado</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              {/* Definición de gradiente para las barras */}
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={1} />
                  <stop offset="100%" stopColor={isDark ? "#059669" : "#047857"} stopOpacity={isDark ? 0.6 : 0.8} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)"}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: isDark ? "#737373" : "#64748b", fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                minTickGap={10}
                dy={8}
              />
              <YAxis
                domain={[0, Math.ceil(maxVal * 1.15)]}
                tick={{ fill: isDark ? "#737373" : "#64748b", fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
                }}
              />
              {/* Redujimos el barSize ligeramente y cambiamos el radio para que se apoyen en el eje X */}
              <Bar dataKey="acceptancePct" radius={[8, 8, 0, 0]} barSize={32}>
                {rows.map((r) => (
                  <Cell
                    key={r.key}
                    fill="url(#colorBar)"
                    className="transition-all duration-300"
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

      {/* Summary Grid with Mini Progress Bars */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.slice(0, 4).map((r) => (
          <div 
            key={r.key} 
            className={[
              "rounded-2xl border p-4 transition-all duration-300 group", 
              isDark 
                ? "border-white/10 bg-[#121514] hover:bg-white/5 hover:border-white/20" 
                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm"
            ].join(" ")}
          >
            <div className="flex justify-between items-start mb-2">
              <div className={[
                "font-bold uppercase tracking-widest text-[10px] truncate max-w-[70%]", 
                isDark ? "text-neutral-500 group-hover:text-neutral-400" : "text-slate-400 group-hover:text-slate-500"
              ].join(" ")}>
                {r.name}
              </div>
              <div className={[
                "text-xs font-black", 
                isDark ? "text-emerald-400" : "text-emerald-600"
              ].join(" ")}>
                {r.acceptancePct.toFixed(1)}%
              </div>
            </div>
            
            {/* Mini Progress Bar */}
            <div className={["w-full h-1.5 rounded-full overflow-hidden mt-1", isDark ? "bg-white/10" : "bg-slate-200"].join(" ")}>
              <div 
                className={["h-full rounded-full transition-all duration-1000", isDark ? "bg-emerald-400" : "bg-emerald-500"].join(" ")}
                style={{ width: `${Math.min(100, r.acceptancePct)}%` }}
              />
            </div>
            
            <div className={[
              "mt-2 text-[10px] font-medium flex items-center justify-between", 
              isDark ? "text-neutral-500" : "text-slate-500"
            ].join(" ")}>
              <span>Tasa de Aceptación</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.candidates} cands.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}