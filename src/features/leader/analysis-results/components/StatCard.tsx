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
        "relative overflow-hidden group p-5 rounded-2xl transition-all duration-300 border",
        isDark
          ? "bg-[#0A0A0A] border-white/5 hover:border-white/10"
          : "bg-white border-slate-200 hover:border-emerald-200 shadow-[0_12px_35px_rgba(15,23,42,0.08)]",
      ].join(" ")}
    >
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity grayscale group-hover:grayscale-0">
        {icon}
      </div>
      <div className="flex flex-col relative z-10">
        <span
          className={[
            "text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2",
            isDark ? "text-neutral-500" : "text-slate-500",
          ].join(" ")}
        >
          {icon} {label}
        </span>
        <div
          className={[
            "text-2xl font-bold tracking-tight",
            isDark ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
          {value}
        </div>
        {sub && (
          <div
            className={[
              "mt-1 text-xs font-medium",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
