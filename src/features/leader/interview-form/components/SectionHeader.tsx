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
          <div className="absolute inset-0 bg-brand-500 blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
          <div
            className={[
              "relative flex items-center justify-center h-11 w-11 rounded-xl border transition-all duration-300",
              isDark
                ? "bg-gradient-to-br from-brand-500/20 via-brand-500/10 to-transparent border-brand-500/25 text-brand-300 shadow-[0_0_24px_rgba(16,185,129,0.15)]"
                : "bg-gradient-to-br from-brand-50 via-white to-brand-50 border-brand-200 text-brand-600",
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
                  ? "border-brand-500/30 bg-brand-500/10 text-brand-300"
                  : "border-brand-200 bg-brand-50 text-brand-700",
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
              "h-px w-16 mt-2 rounded-full bg-gradient-to-r from-brand-500/50 via-brand-400/10 to-transparent",
              !isDark ? "opacity-60" : "",
            ].join(" ")}
          />
        </div>
      </div>
    );
  }
);

export default SectionHeader;
