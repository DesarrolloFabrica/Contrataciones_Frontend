import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  sub?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, sub }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "relative p-4 rounded-xl transition-colors",
        isDark ? "bg-white/[0.03]" : "bg-slate-50",
      ].join(" ")}
    >
      <div className="flex flex-col">
        <span
          className={[
            "mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
            isDark ? "text-slate-500" : "text-slate-400",
          ].join(" ")}
        >
          <span className={isDark ? "text-emerald-400/80" : "text-emerald-600"}>{icon}</span>
          {label}
        </span>
        <div className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
          {value}
        </div>
        {sub && (
          <div className={`mt-1 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{sub}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
