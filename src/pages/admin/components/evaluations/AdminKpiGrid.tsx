// src/pages/admin/components/evaluations/AdminKpiGrid.tsx
import React, { useMemo } from "react";
import { AlertCircle, CheckCircle2, ShieldAlert, Shapes } from "lucide-react";
import type { AdminMetrics } from "../../adminTypes";
import { clampPct } from "../../utils/adminSelectors";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  metrics: AdminMetrics;
  recommendedPct: number;
  highRiskPct: number;
  scopeLabel: string;
};

export default function AdminKpiGrid({
  metrics,
  recommendedPct,
  highRiskPct,
  scopeLabel,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const safeMetrics: AdminMetrics = metrics ?? {
    total: 0,
    avgScore: 0,
    recommended: 0,
    caution: 0,
    notRecommended: 0,
  };

  const cautionPct = useMemo(() => {
    if (!safeMetrics.total) return 0;
    return clampPct((safeMetrics.caution / safeMetrics.total) * 100);
  }, [safeMetrics]);

  const unknownCount = useMemo(
    () =>
      Math.max(
        0,
        safeMetrics.total -
          safeMetrics.recommended -
          safeMetrics.caution -
          safeMetrics.notRecommended
      ),
    [safeMetrics]
  );

  const unknownPct = useMemo(() => {
    if (!safeMetrics.total) return 0;
    return clampPct((unknownCount / safeMetrics.total) * 100);
  }, [safeMetrics.total, unknownCount]);

  const cards = [
    {
      key: "ok",
      label: "Recomendados",
      count: safeMetrics.recommended,
      pct: clampPct(recommendedPct),
      icon: <CheckCircle2 className="h-4 w-4" />,
      tone: isDark
        ? "text-cyan-300 border-cyan-500/25 bg-cyan-500/10"
        : "text-cyan-700 border-cyan-200 bg-cyan-50",
      bar: "bg-cyan-500",
    },
    {
      key: "caution",
      label: "En cautela",
      count: safeMetrics.caution,
      pct: cautionPct,
      icon: <ShieldAlert className="h-4 w-4" />,
      tone: isDark
        ? "text-amber-300 border-amber-500/25 bg-amber-500/10"
        : "text-amber-700 border-amber-200 bg-amber-50",
      bar: "bg-amber-500",
    },
    {
      key: "risk",
      label: "Riesgo alto",
      count: safeMetrics.notRecommended,
      pct: clampPct(highRiskPct),
      icon: <AlertCircle className="h-4 w-4" />,
      tone: isDark
        ? "text-rose-300 border-rose-500/25 bg-rose-500/10"
        : "text-rose-700 border-rose-200 bg-rose-50",
      bar: "bg-rose-500",
    },
    {
      key: "unknown",
      label: "Sin clasificar",
      count: unknownCount,
      pct: unknownPct,
      icon: <Shapes className="h-4 w-4" />,
      tone: isDark
        ? "text-sky-300 border-sky-500/25 bg-sky-500/10"
        : "text-sky-700 border-sky-200 bg-sky-50",
      bar: "bg-sky-500",
    },
  ];

  return (
    <section
      className={[
        "rounded-[22px] border p-4 md:p-5",
        isDark
          ? "border-white/10 bg-black/25 shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
          : "border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p
            className={[
              "text-[10px] uppercase tracking-[0.22em] font-bold",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            Calidad del scope
          </p>
          <p
            className={[
              "mt-1 text-sm font-semibold truncate",
              isDark ? "text-neutral-100" : "text-slate-900",
            ].join(" ")}
            title={scopeLabel}
          >
            Distribucion de recomendaciones IA
          </p>
        </div>
        <span
          className={[
            "shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            isDark
              ? "border-white/10 bg-white/5 text-white/70"
              : "border-slate-200 bg-slate-50 text-slate-700",
          ].join(" ")}
        >
          {safeMetrics.total} evals
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map((card) => (
          <article
            key={card.key}
            className={[
              "rounded-2xl border p-3.5",
              isDark
                ? "border-white/10 bg-[#070a0d] hover:border-white/20"
                : "border-slate-200 bg-white hover:border-slate-300",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={["inline-flex h-7 w-7 items-center justify-center rounded-xl border", card.tone].join(" ")}>
                {card.icon}
              </span>
              <span
                className={[
                  "text-[11px] font-bold",
                  isDark ? "text-white/70" : "text-slate-700",
                ].join(" ")}
              >
                {card.pct.toFixed(0)}%
              </span>
            </div>
            <p
              className={[
                "mt-2 text-[11px] uppercase tracking-[0.18em] font-bold",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              {card.label}
            </p>
            <p
              className={[
                "mt-1 text-[28px] leading-none font-black",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {card.count}
            </p>
            <div
              className={[
                "mt-2 h-1.5 rounded-full overflow-hidden",
                isDark ? "bg-white/10" : "bg-slate-200",
              ].join(" ")}
            >
              <div className={["h-full rounded-full", card.bar].join(" ")} style={{ width: `${card.pct}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
