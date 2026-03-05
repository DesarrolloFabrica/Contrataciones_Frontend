import React, { useMemo } from "react";
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

  return (
    <div
      className={[
        "rounded-3xl border p-5",
        isDark
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={[
              "text-[11px] uppercase tracking-widest font-bold",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Score (AI Teaching Suitability)
          </div>
          <div
            className={[
              "text-xs mt-1",
              isDark ? "text-neutral-400" : "text-slate-600",
            ].join(" ")}
          >
            Solo evaluaciones con score ≠ null
          </div>
        </div>

        <div
          className={[
            "text-[11px] uppercase tracking-widest font-bold",
            isDark ? "text-neutral-500" : "text-slate-500",
          ].join(" ")}
        >
          n={count ?? 0}
        </div>
      </div>

      {/* “pill” principal como tu boceto */}
      <div
        className={[
          "mt-5 rounded-2xl border px-6 py-6 flex items-center justify-center",
          isDark
            ? "border-emerald-500/20 bg-emerald-500/20"
            : "border-emerald-200 bg-emerald-50",
        ].join(" ")}
      >
        <div
          className={[
            "text-4xl font-black",
            isDark ? "text-emerald-50" : "text-emerald-700",
          ].join(" ")}
        >
          {show ? main : "—"}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Promedio" value={show ? fmt(avg, 2) : "—"} />
        <Stat label="Mediana" value={show ? fmt(median, 2) : "—"} />
        <Stat label="Mín" value={show ? fmt(min, 2) : "—"} />
        <Stat label="Máx" value={show ? fmt(max, 2) : "—"} />
      </div>

      {!show && (
        <div
          className={[
            "mt-4 text-xs",
            isDark ? "text-neutral-500" : "text-slate-500",
          ].join(" ")}
        >
          No hay evaluaciones con score en el rango/filters seleccionados.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "rounded-2xl border p-3",
        isDark
          ? "border-white/10 bg-black/20"
          : "border-slate-200 bg-slate-50",
      ].join(" ")}
    >
      <div
        className={[
          "text-[11px] uppercase tracking-widest font-bold",
          isDark ? "text-neutral-500" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </div>
      <div
        className={[
          "mt-1 text-xl font-extrabold",
          isDark ? "text-neutral-100" : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
