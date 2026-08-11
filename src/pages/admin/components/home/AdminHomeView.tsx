// src/pages/admin/components/home/AdminHomeView.tsx
import React, { useMemo } from "react";
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Brain,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import type { AdminMetrics } from "../../adminTypes";
import type { TeacherEvaluationSummary } from "../../../../types";
import type { AdminView } from "../../../../features/admin/components/AdminModeHeader";

type Props = {
  metrics: AdminMetrics;
  evaluations: TeacherEvaluationSummary[];
  scopeLabel: string;
  recommendedPct: number;
  loading?: boolean;
  onNavigate: (view: AdminView) => void;
};

// ── Skeleton pulse box ────────────────────────────────────────────────────────
function SkeletonBox({
  className = "",
  isDark,
}: {
  className?: string;
  isDark: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl animate-pulse",
        isDark ? "bg-white/[0.07]" : "bg-slate-200",
        className,
      ].join(" ")}
    />
  );
}

type AccentKey = "cyan" | "blue";

type AccentStyle = {
  cardBg: string;
  cardBorder: string;
  iconBox: string;
  iconText: string;
  badgeCls: string;
  arrowCls: string;
};

export default function AdminHomeView({
  metrics,
  evaluations,
  scopeLabel,
  recommendedPct,
  loading = false,
  onNavigate,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pendingCount = useMemo(
    () =>
      evaluations.filter((e: any) => {
        const status =
          e?.coordinatorDecision?.status ?? e?.coordinatorStatus ?? null;
        return !status || status === "PENDIENTE";
      }).length,
    [evaluations]
  );

  // ── Accent palette ──────────────────────────────────────────────────────────
  const accents: Record<AccentKey, AccentStyle> = {
    cyan: {
      cardBg: isDark ? "hover:bg-brand-500/[0.07]" : "hover:bg-brand-50",
      cardBorder: isDark
        ? "border-white/[0.07] hover:border-brand-500/40"
        : "border-slate-200 hover:border-brand-200",
      iconBox: isDark
        ? "bg-brand-500/15 border-brand-500/25 text-brand-400"
        : "bg-brand-50 border-brand-100 text-brand-600",
      iconText: isDark ? "text-brand-400" : "text-brand-600",
      badgeCls: isDark
        ? "bg-brand-500/15 text-brand-300 border-brand-500/20"
        : "bg-brand-50 text-brand-700 border-brand-100",
      arrowCls: isDark ? "text-brand-400" : "text-brand-600",
    },
    blue: {
      cardBg: isDark ? "hover:bg-brand-500/[0.07]" : "hover:bg-brand-50",
      cardBorder: isDark
        ? "border-white/[0.07] hover:border-brand-500/40"
        : "border-slate-200 hover:border-brand-200",
      iconBox: isDark
        ? "bg-brand-500/15 border-brand-500/25 text-brand-400"
        : "bg-brand-50 border-brand-100 text-brand-600",
      iconText: isDark ? "text-brand-400" : "text-brand-600",
      badgeCls: isDark
        ? "bg-brand-500/15 text-brand-300 border-brand-500/20"
        : "bg-brand-50 text-brand-700 border-brand-100",
      arrowCls: isDark ? "text-brand-400" : "text-brand-600",
    },
  };

  // ── KPI strip ───────────────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: "Total evaluaciones",
      value: String(metrics.total),
      icon: <FileText className="w-5 h-5 text-brand-400" />,
    },
    {
      label: "Promedio IA",
      value: metrics.avgScore.toFixed(1),
      icon: <Brain className="w-5 h-5 text-violet-400" />,
    },
    {
      label: "Recomendados",
      value: `${recommendedPct.toFixed(0)}%`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: "Pendientes",
      value: String(pendingCount),
      icon: <Clock className="w-5 h-5 text-amber-400" />,
    },
  ];

  // ── Module cards ────────────────────────────────────────────────────────────
  const moduleCards: Array<{
    id: AdminView;
    title: string;
    description: string;
    icon: React.ReactNode;
    stat: string;
    accent: AccentKey;
  }> = [
    {
      id: "EVALUATIONS",
      title: "Evaluaciones",
      description:
        "Revisa y gestiona todas las evaluaciones de candidatos. Accede al detalle, reporte IA y decisiones.",
      icon: <FileText className="w-8 h-8" />,
      stat: `${metrics.total} registros`,
      accent: "cyan",
    },
    {
      id: "USERS",
      title: "Usuarios",
      description:
        "Administra coordinadores, líderes y sus accesos. Crea, edita y controla permisos.",
      icon: <Users className="w-8 h-8" />,
      stat: "Gestión de roles",
      accent: "blue",
    },
  ];

  // ── Shared class helpers ────────────────────────────────────────────────────
  const shellCls = isDark
    ? "bg-white/[0.03] border border-brand-500/25 border-t-2 border-t-brand-500 rounded-3xl"
    : "bg-white border border-brand-500/20 border-t-2 border-t-brand-500 rounded-3xl shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)]";

  const sectionLabel = [
    "text-[11px] uppercase tracking-[0.22em] font-bold mb-4",
    isDark ? "text-neutral-400" : "text-slate-600",
  ].join(" ");

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Welcome header ── */}
      <section className="relative overflow-hidden rounded-2xl border border-t-2 border-t-brand-500">
        {isDark && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-16 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-brand-500/8 via-brand-500/4 to-transparent blur-[100px]" />
            <div className="absolute -bottom-24 -left-12 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-brand-500/5 to-transparent blur-[80px]" />
          </div>
        )}

        <div
          className={`relative px-6 py-4 md:px-8 md:py-5 rounded-2xl ${
            isDark
              ? "bg-gradient-to-b from-[#0b232a]/92 via-[#091d22]/88 to-[#07171c] border-[#579689]/22 shadow-[0_22px_60px_-45px_rgba(88,190,161,0.28)]"
              : "bg-gradient-to-b from-white via-slate-50/80 to-white border-brand-500/20 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.06)]"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5 lg:gap-6 items-start">
            <div className="min-w-0 space-y-3">
              <p
                className={[
                  "text-[11px] uppercase tracking-[0.22em] font-bold",
                  isDark ? "text-neutral-400" : "text-slate-600",
                ].join(" ")}
              >
                {today}
              </p>
              <h2
                className={[
                  "text-xl md:text-2xl font-black tracking-tight leading-tight",
                  isDark ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                Panel de{" "}
                <span className="bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent">
                  administracion
                </span>
              </h2>
              <p className={["text-sm max-w-lg leading-relaxed", isDark ? "text-neutral-300" : "text-slate-700"].join(" ")}>
                Scope activo:{" "}
                <span className={isDark ? "text-neutral-100 font-semibold" : "text-slate-900 font-semibold"}>
                  {scopeLabel}
                </span>
              </p>
              {loading && (
                <div
                  className={[
                    "inline-flex items-start gap-3 rounded-2xl border px-4 py-3",
                    isDark
                      ? "border-brand-400/20 bg-brand-500/[0.06]"
                      : "border-brand-200 bg-brand-50",
                  ].join(" ")}
                  role="status"
                  aria-live="polite"
                >
                  <Loader2
                    className={[
                      "w-4 h-4 mt-0.5 animate-spin shrink-0",
                      isDark ? "text-brand-300" : "text-brand-700",
                    ].join(" ")}
                  />
                  <div className="leading-tight">
                    <p
                      className={[
                        "text-xs font-semibold",
                        isDark ? "text-brand-100" : "text-brand-900",
                      ].join(" ")}
                    >
                      Cargando datos del panel...
                    </p>
                    <p
                      className={[
                        "text-[11px] mt-1",
                        isDark ? "text-neutral-300" : "text-brand-800",
                      ].join(" ")}
                    >
                      Estamos sincronizando metricas y modulos para mostrar la informacion actualizada.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className={[
                "rounded-xl border border-t-2 border-t-brand-500 p-3 space-y-2.5",
                isDark ? "bg-white/[0.02] border-brand-500/25" : "bg-white/80 border-brand-500/20",
              ].join(" ")}
            >
              <p
                className={[
                  "text-[10px] font-bold uppercase tracking-[0.2em]",
                  isDark ? "text-brand-300" : "text-brand-700",
                ].join(" ")}
              >
                Modulos del sistema
              </p>
              <div className="space-y-2">
                {[
                  "Revisa y gestiona todas las evaluaciones.",
                  "Administra coordinadores, lideres y accesos.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span
                      className={[
                        "mt-0.5 h-1.5 w-1.5 rounded-full shrink-0",
                        isDark ? "bg-brand-400/80" : "bg-brand-500/80",
                      ].join(" ")}
                    />
                    <p
                      className={[
                        "text-[11px] leading-snug",
                        isDark ? "text-slate-300" : "text-slate-600",
                      ].join(" ")}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k, i) => (
          <div key={i} className={shellCls}>
            <div className="p-5 flex items-start gap-4">
              <div
                className={[
                  "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0",
                  isDark
                    ? "bg-white/[0.05] border-white/10"
                    : "bg-slate-50 border-slate-200",
                ].join(" ")}
              >
                {loading ? (
                  <SkeletonBox isDark={isDark} className="w-5 h-5" />
                ) : (
                  k.icon
                )}
              </div>
              <div className="min-w-0 flex-1">
                {loading ? (
                  <SkeletonBox isDark={isDark} className="h-3 w-24 mt-1" />
                ) : (
                  <p
                    className={[
                      "text-[10px] uppercase tracking-widest font-bold",
                      isDark ? "text-neutral-400" : "text-slate-600",
                    ].join(" ")}
                  >
                    {k.label}
                  </p>
                )}
                {loading ? (
                  <SkeletonBox isDark={isDark} className="h-7 w-16 mt-2" />
                ) : (
                  <p
                    className={[
                      "text-2xl font-black mt-1",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    {k.value}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Module cards ── */}
      <div>
        <p className={sectionLabel}>Accesos rapidos</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moduleCards.map((mod) => {
            const ac = accents[mod.accent];
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => onNavigate(mod.id)}
                disabled={loading}
                className={[
                  "text-left rounded-3xl border border-t-2 border-t-brand-500 p-6 transition-all duration-200 group",
                  loading ? "cursor-wait" : "",
                  isDark ? "bg-white/[0.02]" : "bg-white",
                  ac.cardBg,
                  ac.cardBorder,
                ].join(" ")}
                aria-busy={loading}
              >
                <div
                  className={[
                    "w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110",
                    ac.iconBox,
                  ].join(" ")}
                >
                  {loading ? <SkeletonBox isDark={isDark} className="w-8 h-8" /> : mod.icon}
                </div>
                {loading ? (
                  <>
                    <SkeletonBox isDark={isDark} className="h-4 w-24 mb-2" />
                    <SkeletonBox isDark={isDark} className="h-3 w-full mb-1.5" />
                    <SkeletonBox isDark={isDark} className="h-3 w-10/12 mb-1.5" />
                    <SkeletonBox isDark={isDark} className="h-3 w-8/12 mb-4" />
                  </>
                ) : (
                  <>
                    <h3
                      className={[
                        "text-sm font-black mb-1",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {mod.title}
                    </h3>
                    <p
                      className={[
                        "text-xs leading-relaxed mb-4",
                        isDark ? "text-neutral-300" : "text-slate-700",
                      ].join(" ")}
                    >
                      {mod.description}
                    </p>
                  </>
                )}
                <div className="flex items-center justify-between">
                  {loading ? (
                    <SkeletonBox isDark={isDark} className="h-5 w-20" />
                  ) : (
                    <span
                      className={[
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        ac.badgeCls,
                      ].join(" ")}
                    >
                      {mod.stat}
                    </span>
                  )}
                  <ArrowRight
                    className={[
                      "w-4 h-4 transition-opacity duration-200",
                      loading ? "opacity-40" : "opacity-0 group-hover:opacity-100",
                      ac.arrowCls,
                    ].join(" ")}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
