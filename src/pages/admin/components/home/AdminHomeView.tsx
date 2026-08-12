import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileBarChart,
  FileText,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";

import { useTheme } from "../../../../context/ThemeContext";
import type { TeacherEvaluationSummary } from "../../../../types";
import { usersService } from "../../../../services/usersService";
import { queryKeys } from "../../../../services/queryKeys";
import type { AdminView } from "../../../../features/admin/components/AdminModeHeader";
import type { AdminMetrics } from "../../adminTypes";

type Props = {
  metrics: AdminMetrics;
  evaluations: TeacherEvaluationSummary[];
  scopeLabel: string;
  recommendedPct: number;
  loading?: boolean;
  onNavigate: (view: AdminView) => void;
};

function SkeletonBox({
  className = "",
  isDark,
}: {
  className?: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg ${
        isDark ? "bg-white/[0.07]" : "bg-slate-200/80"
      } ${className}`}
    />
  );
}

function AdminHeroMesh({ isDark }: { isDark: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-y-0 right-0 hidden h-full w-[52%] lg:block"
      viewBox="0 0 620 170"
      preserveAspectRatio="xMaxYMid slice"
      fill="none"
    >
      <defs>
        <linearGradient id="adminMeshLine" x1="150" y1="35" x2="610" y2="135">
          <stop stopColor="#2dd4bf" stopOpacity="0" />
          <stop offset="0.46" stopColor="#2dd4bf" stopOpacity={isDark ? "0.42" : "0.22"} />
          <stop offset="1" stopColor="#10b981" stopOpacity={isDark ? "0.14" : "0.08"} />
        </linearGradient>
        <radialGradient id="adminMeshGlow">
          <stop stopColor="#34d399" stopOpacity={isDark ? "0.32" : "0.2"} />
          <stop offset="1" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
        <filter id="adminMeshBlur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <circle cx="292" cy="84" r="76" stroke="url(#adminMeshLine)" strokeWidth="0.8" />
      <circle cx="292" cy="84" r="52" stroke="url(#adminMeshLine)" strokeWidth="0.7" />
      <path d="M182 170C222 112 242 44 292 0" stroke="url(#adminMeshLine)" strokeWidth="0.8" />

      <g opacity={isDark ? "0.68" : "0.5"}>
        {Array.from({ length: 10 }).flatMap((_, row) =>
          Array.from({ length: 24 }).map((__, column) => {
            const x = 286 + column * 14;
            const y = 31 + row * 8 + Math.sin(column * 0.5 + row * 0.34) * 17;
            const edgeFade = Math.min(1, column / 5, (23 - column) / 4);

            return (
              <circle
                key={`${row}-${column}`}
                cx={x}
                cy={y}
                r={column % 5 === 0 ? 1.15 : 0.85}
                fill="#2dd4bf"
                opacity={Math.max(0.08, edgeFade) * (0.35 + row * 0.045)}
              />
            );
          }),
        )}
      </g>

      <path
        d="M278 70C356 8 422 132 492 70S584 60 636 88"
        stroke="url(#adminMeshLine)"
        strokeWidth="1"
      />

      <circle cx="274" cy="58" r="25" fill="url(#adminMeshGlow)" filter="url(#adminMeshBlur)" />
      <circle cx="274" cy="58" r="3.5" fill="#34d399" />
      <circle cx="274" cy="58" r="8" stroke="#34d399" strokeOpacity="0.16" />
    </svg>
  );
}

function ModuleWave({ color }: { color: "emerald" | "violet" }) {
  const stroke = color === "emerald" ? "#10b981" : "#8b5cf6";

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 h-[82%] w-[64%] opacity-[0.12]"
      viewBox="0 0 520 180"
      preserveAspectRatio="none"
      fill="none"
    >
      <path d="M0 172C120 112 174 164 260 104S412 88 520 18" stroke={stroke} strokeWidth="1.2" />
      <path d="M0 180C116 130 190 174 278 118S422 94 520 42" stroke={stroke} strokeWidth="0.8" opacity="0.6" />
      <path d="M64 180C174 142 228 166 314 126S440 114 520 68" stroke={stroke} strokeWidth="0.6" opacity="0.45" />
    </svg>
  );
}

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

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: usersService.list,
    staleTime: 1000 * 60 * 5,
  });

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pendingCount = useMemo(
    () =>
      evaluations.filter((evaluation: any) => {
        const status = String(
          evaluation?.adminDecisionStatus ?? evaluation?.adminDecision?.status ?? "PENDING",
        ).toUpperCase();
        return status === "PENDING" || status === "PENDIENTE";
      }).length,
    [evaluations],
  );

  const activeUsers = useMemo(
    () => users.filter((user: any) => user?.isActive !== false).length,
    [users],
  );

  const kpiCards = [
    {
      label: "Total evaluaciones",
      value: String(metrics.total),
      helper: `${metrics.total} registros disponibles`,
      icon: FileText,
      iconClass: isDark
        ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-300"
        : "border-emerald-100 bg-emerald-50 text-emerald-700",
      helperClass: isDark ? "text-emerald-300/85" : "text-emerald-700",
    },
    {
      label: "Promedio IA",
      value: metrics.avgScore.toFixed(1),
      helper: "Puntaje global sobre 100",
      icon: BrainCircuit,
      iconClass: isDark
        ? "border-violet-400/15 bg-violet-400/10 text-violet-300"
        : "border-violet-100 bg-violet-50 text-violet-700",
      helperClass: isDark ? "text-violet-300/85" : "text-violet-700",
    },
    {
      label: "Recomendados",
      value: `${recommendedPct.toFixed(0)}%`,
      helper: `${metrics.recommended} de ${metrics.total} evaluaciones`,
      icon: CheckCircle2,
      iconClass: isDark
        ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-300"
        : "border-emerald-100 bg-emerald-50 text-emerald-700",
      helperClass: isDark ? "text-emerald-300/85" : "text-emerald-700",
    },
    {
      label: "Pendientes",
      value: String(pendingCount),
      helper: pendingCount === 1 ? "Decisión por revisar" : "Decisiones por revisar",
      icon: Clock3,
      iconClass: isDark
        ? "border-amber-400/15 bg-amber-400/10 text-amber-300"
        : "border-amber-100 bg-amber-50 text-amber-700",
      helperClass: isDark ? "text-amber-300/90" : "text-amber-700",
    },
  ];

  const cardShell = isDark
    ? "border-white/[0.075] bg-[#0b2026]/88 shadow-[0_22px_52px_-38px_rgba(0,0,0,0.9)]"
    : "border-slate-200/80 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.2)]";

  return (
    <div className="space-y-5">
      <section
        className={`relative min-h-[146px] overflow-hidden rounded-2xl border ${
          isDark
            ? "border-emerald-400/15 bg-[linear-gradient(110deg,#0b242a_0%,#092027_56%,#071b21_100%)] shadow-[0_24px_70px_-50px_rgba(16,185,129,0.55)]"
            : "border-emerald-100 bg-[linear-gradient(110deg,#ffffff_0%,#f5fffb_58%,#ecfdf5_100%)] shadow-[0_20px_50px_-34px_rgba(5,150,105,0.22)]"
        }`}
        title={`Alcance activo: ${scopeLabel}`}
      >
        <AdminHeroMesh isDark={isDark} />
        <div className="relative z-10 flex min-h-[146px] max-w-[760px] flex-col justify-center px-6 py-6 md:px-8">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.19em] ${
              isDark ? "text-emerald-300/80" : "text-emerald-700"
            }`}
          >
            {today}
          </p>
          <h1
            className={`mt-4 text-2xl font-black leading-tight tracking-[-0.03em] md:text-[28px] ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Bienvenido al Panel de{" "}
            <span className={isDark ? "text-emerald-400" : "text-emerald-600"}>
              Administración
            </span>
          </h1>
          <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Gestiona evaluaciones, candidatos, usuarios y configura el sistema.
          </p>

          {!scopeLabel.startsWith("Global") && (
            <span
              className={`mt-3 w-fit rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                isDark
                  ? "border-white/10 bg-white/[0.035] text-slate-300"
                  : "border-emerald-100 bg-white/70 text-slate-600"
              }`}
            >
              {scopeLabel}
            </span>
          )}
        </div>
      </section>

      {loading && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            isDark
              ? "border-emerald-400/15 bg-emerald-400/[0.055] text-emerald-100"
              : "border-emerald-100 bg-emerald-50 text-emerald-900"
          }`}
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-500" />
          <p className="text-xs font-medium">Sincronizando métricas del panel...</p>
        </div>
      )}

      <section aria-label="Resumen del panel" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiCards.map(({ label, value, helper, icon: Icon, iconClass, helperClass }) => (
          <article
            key={label}
            className={`group rounded-2xl border px-4 py-4 transition duration-200 hover:-translate-y-0.5 ${cardShell}`}
          >
            <div className="flex items-start gap-3.5">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}>
                {loading ? <SkeletonBox isDark={isDark} className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                {loading ? (
                  <>
                    <SkeletonBox isDark={isDark} className="h-2.5 w-24" />
                    <SkeletonBox isDark={isDark} className="mt-2 h-7 w-14" />
                  </>
                ) : (
                  <>
                    <p className={`text-[9px] font-bold uppercase tracking-[0.14em] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      {label}
                    </p>
                    <p className={`mt-1 text-[25px] font-black leading-none tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
                      {value}
                    </p>
                  </>
                )}
              </div>
            </div>
            {!loading && (
              <p className={`mt-3 flex items-center gap-1.5 text-[10px] font-medium ${helperClass}`}>
                <TrendingUp className="h-3 w-3" />
                {helper}
              </p>
            )}
          </article>
        ))}
      </section>

      <section aria-labelledby="admin-main-modules">
        <h2
          id="admin-main-modules"
          className={`mb-3 text-[10px] font-bold uppercase tracking-[0.2em] ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          Módulos principales
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onNavigate("EVALUATIONS")}
            disabled={loading}
            className={`group relative overflow-hidden rounded-2xl border border-t-2 border-t-emerald-400 p-5 text-left transition duration-200 hover:-translate-y-0.5 ${
              isDark
                ? "border-emerald-400/15 bg-[linear-gradient(125deg,rgba(10,40,42,0.96),rgba(7,27,32,0.94))] hover:border-emerald-400/30"
                : "border-emerald-100 bg-[linear-gradient(125deg,#ffffff,#f0fdf8)] hover:border-emerald-300"
            } ${loading ? "cursor-wait" : ""}`}
            aria-busy={loading}
          >
            <ModuleWave color="emerald" />
            <div className="relative z-10 flex items-start gap-4">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${isDark ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-300" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
                <FileText className="h-7 w-7" />
              </span>
              <div className="min-w-0 pt-1">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                  Evaluaciones
                </h3>
                <p className={`mt-1 text-xs leading-5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Revisa y gestiona todas las evaluaciones de candidatos. Accede al detalle, reporte IA y decisiones.
                </p>
              </div>
            </div>
            <div className={`relative z-10 mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/[0.07]" : "border-emerald-100"}`}>
              <span className={`inline-flex items-center gap-2 text-[11px] font-medium ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                <FileBarChart className="h-4 w-4" />
                {metrics.total} registros totales
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold transition group-hover:gap-3 ${isDark ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                Ver evaluaciones
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("USERS")}
            disabled={loading || usersLoading}
            className={`group relative overflow-hidden rounded-2xl border border-t-2 border-t-violet-400 p-5 text-left transition duration-200 hover:-translate-y-0.5 ${
              isDark
                ? "border-violet-400/15 bg-[linear-gradient(125deg,rgba(24,29,44,0.96),rgba(11,26,34,0.94))] hover:border-violet-400/30"
                : "border-violet-100 bg-[linear-gradient(125deg,#ffffff,#faf7ff)] hover:border-violet-300"
            } ${loading || usersLoading ? "cursor-wait" : ""}`}
            aria-busy={loading || usersLoading}
          >
            <ModuleWave color="violet" />
            <div className="relative z-10 flex items-start gap-4">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${isDark ? "border-violet-400/15 bg-violet-400/10 text-violet-300" : "border-violet-100 bg-violet-50 text-violet-700"}`}>
                <Users className="h-7 w-7" />
              </span>
              <div className="min-w-0 pt-1">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                  Usuarios
                </h3>
                <p className={`mt-1 text-xs leading-5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Administra coordinadores, líderes y sus accesos. Crea, edita y controla permisos.
                </p>
              </div>
            </div>
            <div className={`relative z-10 mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/[0.07]" : "border-violet-100"}`}>
              <span className={`inline-flex items-center gap-2 text-[11px] font-medium ${isDark ? "text-violet-300" : "text-violet-700"}`}>
                <Users className="h-4 w-4" />
                {usersLoading ? "Cargando usuarios..." : `${activeUsers} usuarios activos`}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold transition group-hover:gap-3 ${isDark ? "border-violet-400/20 bg-violet-400/[0.07] text-violet-300" : "border-violet-200 bg-violet-50 text-violet-700"}`}>
                Ver usuarios
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
