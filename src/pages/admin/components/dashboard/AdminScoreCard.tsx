import React, { useMemo } from "react";
import { 
  Brain, 
  Users, 
  ArrowDownToLine, 
  ArrowUpToLine, 
  Activity, 
  Target,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  avg: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  count: number;
};

function fmt(n: number | null, digits = 1) {
  if (n === null || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  const p = Math.pow(10, digits);
  return String(Math.round(v * p) / p);
}

export default function AdminScoreCard({ avg, median, min, max, count }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const main = useMemo(() => fmt(avg, 1), [avg]);
  const show = (count ?? 0) > 0;

  const range = useMemo(() => {
    if (!show) return null;
    if (min === null || max === null) return null;
    const minV = Number(min);
    const maxV = Number(max);
    if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return null;
    const span = maxV - minV;
    return span === 0 ? { minV, maxV, span: 1 } : { minV, maxV, span };
  }, [show, min, max]);

  const medianPct = useMemo(() => {
    if (!range) return null;
    if (median === null) return null;
    const v = Number(median);
    if (!Number.isFinite(v)) return null;
    return ((v - range.minV) / range.span) * 100;
  }, [median, range]);

  const avgPct = useMemo(() => {
    if (!range) return null;
    if (avg === null) return null;
    const v = Number(avg);
    if (!Number.isFinite(v)) return null;
    return ((v - range.minV) / range.span) * 100;
  }, [avg, range]);

  return (
    <div
      className={[
        "relative flex h-full min-h-[380px] w-full min-w-0 flex-col overflow-hidden rounded-xl border p-5",
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
            AI Suitability Score
          </h3>
          <p
            className={[
              "text-xs",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Evaluaciones analizadas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={[
              "flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-medium",
              isDark
                ? "bg-white/[0.02] border-white/10 text-neutral-500"
                : "bg-slate-50 border-slate-200 text-slate-500",
            ].join(" ")}
          >
            <span>n={count ?? 0}</span>
          </div>
        </div>
      </div>

      {show ? (
        <div className="flex min-h-0 flex-1 flex-col justify-between">
          
          {/* Main Score Center */}
          <div className="relative flex flex-col items-center justify-center py-6">
            {/* Resplandor radial de fondo */}
            {isDark && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none" />
            )}
            
            <span
              className={[
                "text-6xl md:text-7xl font-black tracking-tighter relative z-10",
                isDark
                  ? "text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-cyan-400"
                  : "text-cyan-700",
              ].join(" ")}
            >
              {main}
            </span>
            <span
              className={[
                "text-[10px] uppercase tracking-[0.25em] font-bold mt-2 relative z-10",
                isDark ? "text-cyan-500/70" : "text-cyan-600/80",
              ].join(" ")}
            >
              Promedio General
            </span>
          </div>

          {/* Range bar (min->max) */}
          {range && medianPct !== null && avgPct !== null && (
            <div className="mt-2 mb-6 px-2">
              <div
                className={[
                  "relative h-1.5 rounded-full overflow-hidden border",
                  isDark ? "bg-neutral-900 border-white/5" : "bg-slate-100 border-slate-200/50",
                ].join(" ")}
              >
                {/* Gradient Fill (track) */}
                <div
                  className={[
                    "absolute inset-0 opacity-40",
                    isDark
                      ? "bg-gradient-to-r from-cyan-500/50 to-cyan-500/50"
                      : "bg-gradient-to-r from-cyan-400/50 to-cyan-400/50",
                  ].join(" ")}
                />

                {/* Mediana: Vertical Marker (Línea) */}
                <div
                  className={[
                    "absolute top-0 bottom-0 w-[2px] -translate-x-1/2 rounded-full",
                    isDark ? "bg-white/80" : "bg-slate-400",
                  ].join(" ")}
                  style={{ left: `${Math.max(0, Math.min(100, medianPct))}%` }}
                  title={`Mediana: ${fmt(median, 2)}`}
                />
              </div>

              {/* Promedio: Dot Marker (Nodo iluminado flotando sobre la barra) */}
              <div className="relative w-full h-0">
                <div
                  className={[
                    "absolute -top-[5px] -translate-x-1/2 w-3.5 h-3.5 rounded-full border-[2.5px] transition-all",
                    isDark
                      ? "bg-[#0c0c0e] border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                      : "bg-white border-cyan-500 shadow-sm",
                  ].join(" ")}
                  style={{ left: `${Math.max(0, Math.min(100, avgPct))}%` }}
                  title={`Promedio: ${fmt(avg, 2)}`}
                />
              </div>

              {/* Range Legend */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-col items-start gap-0.5">
                  <span className={["text-[10px] uppercase tracking-widest font-bold", isDark ? "text-neutral-600" : "text-slate-400"].join(" ")}>Mín</span>
                  <span className={["text-xs font-semibold", isDark ? "text-neutral-400" : "text-slate-600"].join(" ")}>{fmt(range.minV, 1)}</span>
                </div>
                
                <div className="flex gap-5">
                  <div className="flex items-center gap-1.5">
                    <span className={["w-1 h-2.5 rounded-full", isDark ? "bg-white/60" : "bg-slate-400"].join(" ")} />
                    <span className={["text-[9px] uppercase tracking-widest font-bold", isDark ? "text-neutral-500" : "text-slate-500"].join(" ")}>Mediana</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={["w-2 h-2 rounded-full border-[1.5px]", isDark ? "border-cyan-400 bg-transparent" : "border-cyan-500 bg-white"].join(" ")} />
                    <span className={["text-[9px] uppercase tracking-widest font-bold", isDark ? "text-neutral-500" : "text-slate-500"].join(" ")}>Avg</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-0.5">
                  <span className={["text-[10px] uppercase tracking-widest font-bold", isDark ? "text-neutral-600" : "text-slate-400"].join(" ")}>Máx</span>
                  <span className={["text-xs font-semibold", isDark ? "text-neutral-400" : "text-slate-600"].join(" ")}>{fmt(range.maxV, 1)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid Subordinado */}
          <div className={["grid grid-cols-2 gap-3 pt-6 border-t", isDark ? "border-white/[0.04]" : "border-slate-100"].join(" ")}>
            <Stat icon={Activity} label="Promedio" value={fmt(avg, 2)} />
            <Stat icon={Target} label="Mediana" value={fmt(median, 2)} />
            <Stat icon={ArrowDownToLine} label="Mínimo" value={fmt(min, 2)} />
            <Stat icon={ArrowUpToLine} label="Máximo" value={fmt(max, 2)} />
          </div>
        </div>
      ) : (
        /* Empty State Elegante */
        <div
          className={[
            "mt-4 flex flex-1 flex-col items-center justify-center p-8 rounded-2xl border border-dashed",
            isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-slate-50",
          ].join(" ")}
        >
          <AlertCircle
            className={["w-8 h-8 mb-3 opacity-40", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}
          />
          <p
            className={["text-sm font-medium text-center", isDark ? "text-neutral-500" : "text-slate-500"].join(" ")}
          >
            No hay evaluaciones con score en el rango seleccionado.
          </p>
        </div>
      )}
    </div>
  );
}

// Componente Stat refinado para encajar sin robar protagonismo
function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "rounded-[16px] border p-3 transition-colors flex items-center justify-between group",
        isDark
          ? "border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08]"
          : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200",
      ].join(" ")}
    >
      <div className="flex flex-col gap-0.5">
        <div
          className={[
            "text-[9px] uppercase tracking-widest font-semibold flex items-center gap-1.5",
            isDark ? "text-neutral-500" : "text-slate-400",
          ].join(" ")}
        >
          {label}
        </div>
        <div
          className={[
            "text-lg font-bold tracking-tight",
            isDark ? "text-neutral-200" : "text-slate-800",
          ].join(" ")}
        >
          {value}
        </div>
      </div>
      <div
        className={[
          "p-1.5 rounded-xl transition-colors opacity-60 group-hover:opacity-100",
          isDark
            ? "text-neutral-400 group-hover:text-cyan-400 bg-transparent group-hover:bg-cyan-500/10"
            : "text-slate-400 group-hover:text-cyan-600 bg-transparent group-hover:bg-cyan-50",
        ].join(" ")}
      >
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}