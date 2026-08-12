import React from "react";
import {
  TrendingUp,
  Info,
  GraduationCap,
  Brain,
  Users,
  Shield,
  BookOpen,
  Target,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

interface DimensionCardProps {
  cat: any;
  roleAverage?: number;
  open: boolean;
  onToggle: () => void;
  /** Primera / última fila del listado unificado */
  isFirst?: boolean;
  isLast?: boolean;
}

const pickIcon = (category: string) => {
  const c = (category || "").toLowerCase();
  if (c.includes("experiencia") || c.includes("trayector")) return Briefcase;
  if (c.includes("pedagog") || c.includes("aula") || c.includes("manejo")) return BookOpen;
  if (c.includes("ia") || c.includes("actitud")) return Brain;
  if (c.includes("ética") || c.includes("etica") || c.includes("escenario") || c.includes("coherencia"))
    return Shield;
  if (c.includes("disponib")) return Users;
  if (c.includes("programa") || c.includes("académ")) return GraduationCap;
  return Target;
};

export const DimensionCard: React.FC<DimensionCardProps> = ({
  cat,
  roleAverage = 72,
  open,
  onToggle,
  isFirst = false,
  isLast = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const Icon = pickIcon(cat.category);
  const score = Math.round(Number(cat.score) || 0);
  const avg = Math.min(100, Math.max(0, roleAverage));

  return (
    <article
      className={[
        "border-b last:border-b-0",
        isDark ? "border-white/[0.06]" : "border-slate-100",
        open
          ? isDark
            ? "bg-emerald-500/[0.04]"
            : "bg-emerald-50/40"
          : "",
        isFirst ? "rounded-t-xl" : "",
        isLast && !open ? "rounded-b-xl" : "",
        isLast && open ? "rounded-b-xl" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className={[
          "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-3.5 py-3 text-left transition-colors md:grid-cols-[auto_minmax(0,1fr)_7.5rem_auto] md:px-4",
          open ? "pb-2.5" : "",
          isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80",
        ].join(" ")}
        aria-expanded={open}
      >
        <span
          className={[
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            isDark
              ? "border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
        </span>

        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className={`text-[13px] font-semibold leading-5 ${isDark ? "text-white" : "text-slate-900"}`}>
              {cat.category}
            </span>
            <span className={`text-[13px] font-bold tabular-nums leading-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
              {score}
              <span className={`font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}> / 100</span>
            </span>
          </span>
          {!open && (
            <span className={`mt-0.5 block truncate text-[11px] leading-4 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              {cat.reporteAnalitico}
            </span>
          )}
        </span>

        <span className="hidden w-[7.5rem] shrink-0 self-center md:block">
          <span className={`mb-1 block h-1 overflow-hidden rounded-full ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
            <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${score}%` }} />
          </span>
          <span className={`block h-1 overflow-hidden rounded-full ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
            <span
              className={`block h-full rounded-full ${isDark ? "bg-emerald-500/35" : "bg-emerald-300"}`}
              style={{ width: `${avg}%` }}
            />
          </span>
        </span>

        <ChevronDown
          className={[
            "mt-1.5 h-4 w-4 shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "",
            isDark ? "text-slate-500" : "text-slate-400",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="space-y-3.5 px-3.5 pb-4 pt-1 md:px-4 md:pl-[3.25rem]">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center justify-between text-[10px]">
                <span className={isDark ? "text-slate-500" : "text-slate-400"}>Candidato</span>
                <span className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{score}</span>
              </div>
              <div className={`h-1.5 overflow-hidden rounded-full ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${score}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[10px]">
                <span className={isDark ? "text-slate-500" : "text-slate-400"}>Promedio del rol</span>
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>{avg}</span>
              </div>
              <div className={`h-1.5 overflow-hidden rounded-full ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
                <div
                  className={`h-full rounded-full ${isDark ? "bg-emerald-500/35" : "bg-emerald-300"}`}
                  style={{ width: `${avg}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Analisis
            </p>
            <p className={`text-[13px] leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {cat.reporteAnalitico}
            </p>
          </div>

          <div className="grid gap-2.5 md:grid-cols-2">
            <div
              className={[
                "rounded-lg p-3",
                isDark ? "bg-emerald-500/[0.07]" : "bg-emerald-50",
              ].join(" ")}
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <TrendingUp className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                  Fortaleza
                </span>
              </div>
              <p className={`text-[12px] leading-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {cat.oportunidades}
              </p>
            </div>

            <div
              className={[
                "rounded-lg p-3",
                isDark ? "bg-amber-500/[0.07]" : "bg-amber-50",
              ].join(" ")}
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <Info className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                  A mejorar
                </span>
              </div>
              <p className={`text-[12px] leading-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {cat.recomendaciones}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default DimensionCard;
