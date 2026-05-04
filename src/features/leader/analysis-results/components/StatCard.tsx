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
          ? "bg-gradient-to-b from-[#111A2B]/85 via-[#0F1727]/78 to-[#0B1220]/65 border-white/[0.1] hover:border-cyan-400/35 hover:shadow-[0_18px_35px_-18px_rgba(6,182,212,0.45)]"
          : "bg-white border-slate-200 hover:border-cyan-200 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(15,23,42,0.1)]",
      ].join(" ")}
    >
      <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-30 transition-opacity duration-300">
        {icon}
      </div>
      <div className="flex flex-col relative z-10">
        <span
          className={[
            "text-[10px] font-bold uppercase tracking-[0.16em] mb-2 flex items-center gap-2",
            isDark ? "text-slate-500" : "text-slate-400",
          ].join(" ")}
        >
          {icon} {label}
        </span>
        <div
          className={[
            "text-2xl font-black tracking-tight",
            isDark ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
          {value}
        </div>
        {sub && (
          <div
            className={[
              "mt-1 text-[11px] font-medium",
              isDark ? "text-slate-500" : "text-slate-400",
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
