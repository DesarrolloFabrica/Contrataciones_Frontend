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
import type { AdminView } from "../AdminSidebar";

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
      cardBg: isDark ? "hover:bg-cyan-500/[0.07]" : "hover:bg-cyan-50",
      cardBorder: isDark
        ? "border-white/[0.07] hover:border-cyan-500/40"
        : "border-slate-200 hover:border-cyan-200",
      iconBox: isDark
        ? "bg-cyan-500/15 border-cyan-500/25 text-cyan-400"
        : "bg-cyan-50 border-cyan-100 text-cyan-600",
      iconText: isDark ? "text-cyan-400" : "text-cyan-600",
      badgeCls: isDark
        ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/20"
        : "bg-cyan-50 text-cyan-700 border-cyan-100",
      arrowCls: isDark ? "text-cyan-400" : "text-cyan-600",
    },
    blue: {
      cardBg: isDark ? "hover:bg-blue-500/[0.07]" : "hover:bg-blue-50",
      cardBorder: isDark
        ? "border-white/[0.07] hover:border-blue-500/40"
        : "border-slate-200 hover:border-blue-200",
      iconBox: isDark
        ? "bg-blue-500/15 border-blue-500/25 text-blue-400"
        : "bg-blue-50 border-blue-100 text-blue-600",
      iconText: isDark ? "text-blue-400" : "text-blue-600",
      badgeCls: isDark
        ? "bg-blue-500/15 text-blue-300 border-blue-500/20"
        : "bg-blue-50 text-blue-700 border-blue-100",
      arrowCls: isDark ? "text-blue-400" : "text-blue-600",
    },
  };

  // ── KPI strip ───────────────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: "Total evaluaciones",
      value: String(metrics.total),
      icon: <FileText className="w-5 h-5 text-cyan-400" />,
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
    ? "bg-white/[0.03] border border-white/[0.08] rounded-3xl"
    : "bg-white border border-slate-200 rounded-3xl shadow-sm";

  const sectionLabel = [
    "text-[11px] uppercase tracking-[0.22em] font-bold mb-4",
    isDark ? "text-neutral-400" : "text-slate-600",
  ].join(" ");

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* ── Welcome header ── */}
      <div>
        <p
          className={[
            "text-[11px] uppercase tracking-[0.22em] font-bold mb-1",
            isDark ? "text-neutral-400" : "text-slate-600",
          ].join(" ")}
        >
          {today}
        </p>
        <h2
          className={[
            "text-2xl md:text-3xl font-black tracking-tight",
            isDark ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
          Panel de administración
        </h2>
        <p className={["mt-2 text-sm", isDark ? "text-neutral-300" : "text-slate-700"].join(" ")}>
          Scope activo:{" "}
          <span className={isDark ? "text-neutral-100" : "text-slate-900"}>
            {scopeLabel}
          </span>
        </p>
        {loading && (
          <div
            className={[
              "mt-4 inline-flex items-start gap-3 rounded-2xl border px-4 py-3",
              isDark
                ? "border-cyan-400/20 bg-cyan-500/[0.06]"
                : "border-cyan-200 bg-cyan-50",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <Loader2
              className={[
                "w-4 h-4 mt-0.5 animate-spin shrink-0",
                isDark ? "text-cyan-300" : "text-cyan-700",
              ].join(" ")}
            />
            <div className="leading-tight">
              <p
                className={[
                  "text-xs font-semibold",
                  isDark ? "text-cyan-100" : "text-cyan-900",
                ].join(" ")}
              >
                Cargando datos del panel...
              </p>
              <p
                className={[
                  "text-[11px] mt-1",
                  isDark ? "text-neutral-300" : "text-cyan-800",
                ].join(" ")}
              >
                Estamos sincronizando métricas y módulos para mostrar la información actualizada.
              </p>
            </div>
          </div>
        )}
      </div>

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
        <p className={sectionLabel}>Módulos del sistema</p>
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
                  "text-left rounded-3xl border p-6 transition-all duration-200 group",
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
