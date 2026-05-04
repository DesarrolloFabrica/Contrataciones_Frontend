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
      suffix: "",
      icon: UserCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={[
            "group relative overflow-hidden rounded-xl p-4 transition-all duration-300 border",
            isDark
              ? "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
              : "bg-white border-slate-200 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)]",
          ].join(" ")}
        >
          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.16em] ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {card.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <p
                  className={`text-2xl font-black tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {card.value}
                </p>
                {card.suffix && (
                  <span className={`text-[11px] font-medium ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    {card.suffix}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-200 ${
                isDark
                  ? "bg-white/[0.03] border-white/[0.06] text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/25"
                  : "bg-cyan-50 border-cyan-200 text-cyan-600 group-hover:bg-cyan-100"
              }`}
            >
              <card.icon className="w-4 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoordinatorKpiStrip;
