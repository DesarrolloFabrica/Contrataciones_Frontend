import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  step: number;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(
  ({ title, icon, step, subtitle }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
      <div className="flex items-start gap-4 mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
          <div
            className={[
              "relative flex items-center justify-center h-11 w-11 rounded-xl border transition-all duration-300",
              isDark
                ? "bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/25 text-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.15)]"
                : "bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-cyan-200 text-cyan-600",
            ].join(" ")}
          >
            {icon}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span
              className={[
                "inline-flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-bold",
                isDark
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                  : "border-cyan-200 bg-cyan-50 text-cyan-700",
              ].join(" ")}
            >
              {step}
            </span>
            <h3
              className={[
                "text-lg md:text-xl font-bold tracking-tight",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {title}
            </h3>
          </div>
          {subtitle && (
            <p
              className={`text-xs md:text-sm max-w-xl ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {subtitle}
            </p>
          )}
          <div
            className={[
              "h-px w-16 mt-2 rounded-full bg-gradient-to-r from-cyan-500/50 via-cyan-400/10 to-transparent",
              !isDark ? "opacity-60" : "",
            ].join(" ")}
          />
        </div>
      </div>
    );
  }
);

export default SectionHeader;
