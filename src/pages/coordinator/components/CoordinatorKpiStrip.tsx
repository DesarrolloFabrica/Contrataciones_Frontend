import React from "react";
import { FileText, Activity, UserCheck } from "lucide-react";
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
      iconBg: isDark
        ? "bg-[#15191E] border-white/5 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-[#0A0C10] group-hover:border-transparent"
        : "bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500",
      glow: isDark
        ? "bg-emerald-500/10"
        : "bg-emerald-50",
      from: "from-emerald-600",
      to: "to-emerald-400",
    },
    {
      label: "Promedio Global",
      value: avgScore.toFixed(1),
      suffix: "/100",
      icon: Activity,
      iconBg: isDark
        ? "bg-[#15191E] border-white/5 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-[#0A0C10]"
        : "bg-cyan-50 border-cyan-100 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white",
      glow: isDark
        ? "bg-cyan-500/10"
        : "bg-cyan-50",
      from: "from-cyan-600",
      to: "to-cyan-400",
    },
    {
      label: "Flujo Activo",
      value: isScoped ? "Escuela asignada" : "Global",
      suffix: "",
      icon: UserCheck,
      iconBg: isDark
        ? "bg-white/5 border-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
        : "bg-slate-50 border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-200",
      glow: isDark
        ? "bg-white/5"
        : "bg-slate-50",
      from: "from-slate-600",
      to: "to-slate-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`group relative overflow-hidden rounded-[24px] p-6 transition-all duration-500 hover:-translate-y-1 ${
            isDark
              ? "border border-white/5 bg-[#0A0C10] shadow-2xl hover:border-emerald-500/30 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)]"
              : "border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] hover:border-emerald-200"
          }`}
        >
          {isDark && (
            <>
              <div className={`absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full ${card.glow} blur-[80px] transition-all duration-700 group-hover:opacity-80`} />
              <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-40 w-40 rounded-full bg-teal-500/5 blur-[60px]" />
            </>
          )}

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                    isDark
                      ? "text-slate-400 group-hover:text-emerald-400/80"
                      : "text-slate-500 group-hover:text-emerald-600"
                  }`}
                >
                  {card.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <p
                  className={`text-5xl font-black tracking-tighter drop-shadow-lg ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {card.value}
                </p>
                {card.suffix && (
                  <span className="text-sm font-medium text-slate-500">
                    {card.suffix}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner group-hover:scale-110 group-hover:border-transparent transition-all duration-300 ${card.iconBg}`}
            >
              <card.icon className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-6">
            <div
              className={`h-1.5 w-full rounded-full overflow-hidden border ${
                isDark
                  ? "bg-[#15191E] border-white/5"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <div
                className={`h-full rounded-full bg-gradient-to-r ${card.from} ${card.to} shadow-[0_0_12px_rgba(16,185,129,0.4)]`}
                style={{
                  width: `${Math.max(0, Math.min(100, (Number(total) || 0) * 6.5))}%`,
                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoordinatorKpiStrip;
