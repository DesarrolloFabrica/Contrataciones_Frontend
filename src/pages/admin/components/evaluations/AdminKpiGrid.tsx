// src/pages/admin/components/evaluations/AdminKpiGrid.tsx
import React from "react";
import { Activity, AlertCircle, FileText, TrendingUp } from "lucide-react";
import type { AdminMetrics } from "../../adminTypes";
import { clampPct } from "../../utils/adminSelectors";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  metrics: AdminMetrics;
  recommendedPct: number;
  highRiskPct: number;
  scopeLabel: string;
};

const CardShell = ({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "emerald" | "cyan" | "rose";
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const baseToneBorder =
    tone === "emerald"
      ? "hover:border-emerald-500/30 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.25)]"
      : tone === "cyan"
      ? "hover:border-cyan-500/30 hover:shadow-[0_20px_40px_-15px_rgba(34,211,238,0.25)]"
      : "hover:border-rose-500/30 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.25)]";

  const glowStrong =
    tone === "emerald"
      ? "bg-emerald-500/12"
      : tone === "cyan"
      ? "bg-cyan-500/14"
      : "bg-rose-500/14";

  const glowSoft =
    tone === "emerald"
      ? "bg-emerald-500/6"
      : tone === "cyan"
      ? "bg-cyan-500/6"
      : "bg-rose-500/6";

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-[24px] p-6",
        "transition-all duration-500 hover:-translate-y-1 border",
        isDark
          ? "bg-[#0A0C10] border-white/5 shadow-2xl"
          : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
        baseToneBorder,
      ].join(" ")}
    >
      {/* ambient glows solo en oscuro */}
      {isDark && (
        <>
          <div
            className={[
              "pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full blur-[80px] transition-all duration-700",
              glowStrong,
            ].join(" ")}
          />
          <div
            className={[
              "pointer-events-none absolute bottom-0 left-0 -mb-16 -ml-16 h-40 w-40 rounded-full blur-[60px]",
              glowSoft,
            ].join(" ")}
          />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};

const StatHeader = ({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "emerald" | "cyan" | "rose";
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const iconCls =
    tone === "emerald"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
      : tone === "cyan"
      ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
      : "bg-rose-500/10 text-rose-300 border-rose-500/20";

  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div
        className={[
          "h-11 w-11 rounded-2xl border flex items-center justify-center",
          iconCls,
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="text-right">
        <p
          className={[
            "text-[10px] font-bold uppercase tracking-[0.22em]",
            isDark ? "text-neutral-500" : "text-slate-500",
          ].join(" ")}
        >
          {label}
        </p>
      </div>
    </div>
  );
};

const Progress = ({
  value,
  tone,
  isDark,
}: {
  value: number;
  tone: "emerald" | "rose";
  isDark: boolean;
}) => {
  const pct = clampPct(value);

  const barCls =
    tone === "emerald"
      ? "bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
      : "bg-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.35)]";

  return (
    <div className="mt-3">
      <div
        className={[
          "w-full h-2 rounded-full overflow-hidden",
          isDark ? "bg-white/10" : "bg-slate-200",
        ].join(" ")}
      >
        <div
          className={["h-full rounded-full", barCls].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className={[
          "mt-2 flex justify-between text-[11px]",
          isDark ? "text-neutral-500" : "text-slate-500",
        ].join(" ")}
      >
        <span>0 %</span>
        <span>100 %</span>
      </div>
    </div>
  );
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

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <CardShell tone="emerald">
          <StatHeader
            tone="emerald"
            label="Total evaluaciones"
            icon={<FileText className="w-5 h-5" />}
          />
          <div className="flex items-end justify-between gap-3">
            <div
              className={[
                "text-4xl md:text-5xl font-black tracking-tight",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {safeMetrics.total}
            </div>
            <div
              className={[
                "text-xs text-right",
                isDark ? "text-neutral-500" : "text-slate-600",
              ].join(" ")}
            >
              Registros completos disponibles para revisión ejecutiva.
            </div>
          </div>
        </CardShell>

        <CardShell tone="cyan">
          <StatHeader
            tone="cyan"
            label="Promedio global"
            icon={<Activity className="w-5 h-5" />}
          />
          <div className="flex items-end justify-between gap-3">
            <div
              className={[
                "text-4xl font-black tracking-tight",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {Number.isFinite(safeMetrics.avgScore)
                ? safeMetrics.avgScore.toFixed(1)
                : "0.0"}
              <span
                className={[
                  "text-lg font-semibold",
                  isDark ? "text-neutral-600" : "text-slate-500",
                ].join(" ")}
              >
                /100
              </span>
            </div>
          </div>
          <p
            className={[
              "mt-2 text-xs",
              isDark ? "text-neutral-400" : "text-slate-600",
            ].join(" ")}
          >
            Score promedio de idoneidad (IA).
          </p>
        </CardShell>

        <CardShell tone="emerald">
          <StatHeader
            tone="emerald"
            label="Recomendados"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <div className="flex items-end justify-between gap-3">
            <div
              className={[
                "text-4xl font-black tracking-tight",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {Number.isFinite(recommendedPct)
                ? recommendedPct.toFixed(0)
                : "0"}
              %
            </div>
            <div
              className={[
                "text-xs text-right",
                isDark ? "text-neutral-500" : "text-slate-600",
              ].join(" ")}
            >
              {safeMetrics.recommended} candidatos
            </div>
          </div>

          <p
            className={[
              "mt-2 text-xs",
              isDark ? "text-neutral-400" : "text-slate-600",
            ].join(" ")}
          >
            Candidatos con recomendación positiva.
          </p>

          <Progress value={recommendedPct} tone="emerald" isDark={isDark} />
        </CardShell>

        <CardShell tone="rose">
          <StatHeader
            tone="rose"
            label="Riesgo alto"
            icon={<AlertCircle className="w-5 h-5" />}
          />
          <div className="flex items-end justify-between gap-3">
            <div
              className={[
                "text-4xl font-black tracking-tight",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {Number.isFinite(highRiskPct) ? highRiskPct.toFixed(0) : "0"}%
            </div>
            <div
              className={[
                "text-xs text-right",
                isDark ? "text-neutral-500" : "text-slate-600",
              ].join(" ")}
            >
              {safeMetrics.notRecommended} casos
            </div>
          </div>

          <p
            className={[
              "mt-2 text-xs",
              isDark ? "text-neutral-400" : "text-slate-600",
            ].join(" ")}
          >
            Casos marcados como no recomendados.
          </p>

          <Progress value={highRiskPct} tone="rose" isDark={isDark} />
        </CardShell>
      </div>
    </section>
  );
}
