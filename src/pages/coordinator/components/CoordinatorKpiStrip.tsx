import React from "react";
import { FileText, Activity, ShieldCheck, UserCheck } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

interface CoordinatorKpiStripProps {
  total: number;
  avgScore: number;
  isScoped?: boolean;
}

export const CoordinatorKpiStrip: React.FC<CoordinatorKpiStripProps> = ({
  total,
  avgScore,
  isScoped = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cards = [
    {
      label: "Evaluaciones",
      value: String(total),
      suffix: "total",
      icon: FileText,
    },
    {
      label: "Promedio Global",
      value: avgScore.toFixed(1),
      suffix: "/100",
      icon: Activity,
    },
    {
      label: "Flujo Activo",
      value: isScoped ? "Escuela asignada" : "Global",
      suffix: isScoped ? "Coordinación actual" : "Cobertura disponible",
      icon: UserCheck,
    },
    {
      label: "Trazabilidad",
      value: "100%",
      suffix: "del proceso",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={[
            "group relative min-h-[96px] overflow-hidden rounded-2xl p-4 transition-colors duration-300",
            isDark
              ? "border border-white/[0.08] bg-[#0d252b] hover:border-white/[0.12] hover:bg-[#102a31]"
              : "border border-slate-200/80 bg-white shadow-[0_10px_28px_-22px_rgba(15,23,42,0.35)] hover:bg-white",
          ].join(" ")}
        >
          <div className="relative flex h-full items-center gap-3.5">
            <div
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                isDark
                  ? "bg-gradient-to-br from-emerald-400/18 via-teal-400/10 to-transparent text-emerald-300 shadow-[0_0_14px_-6px_rgba(52,211,153,0.35)] ring-1 ring-emerald-400/20 group-hover:from-emerald-400/24 group-hover:ring-emerald-400/28"
                  : "bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 ring-1 ring-emerald-200/80 group-hover:from-emerald-200/80"
              }`}
            >
              {isDark && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_25%,rgba(52,211,153,0.16),transparent_70%)]"
                />
              )}
              <card.icon
                className={`relative h-5 w-5 ${isDark ? "drop-shadow-[0_0_4px_rgba(52,211,153,0.35)]" : ""}`}
                strokeWidth={2}
              />
            </div>

            <div className="min-w-0 flex-1">
              <span
                className={`mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {card.label}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <p
                  className={`${card.label === "Flujo Activo" ? "text-[15px]" : "text-2xl"} font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {card.value}
                </p>
                {card.suffix && (
                  <span className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {card.suffix}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoordinatorKpiStrip;
