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
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
          <div
            className={[
              "relative flex items-center justify-center h-12 w-12 rounded-2xl border shadow-[0_0_32px_rgba(16,185,129,0.35)]",
              isDark
                ? "bg-gradient-to-br from-emerald-500/25 via-emerald-500/12 to-transparent border-emerald-400/50 text-emerald-300"
                : "bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-emerald-200 text-emerald-600",
            ].join(" ")}
          >
            {icon}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span
              className={[
                "inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold",
                isDark
                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {step}
            </span>
            <h3
              className={[
                "text-xl md:text-2xl font-semibold tracking-tight",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {title}
            </h3>
          </div>
          {subtitle && (
            <p
              className={`text-xs md:text-sm max-w-xl ${
                isDark ? "text-gray-400" : "text-slate-600"
              }`}
            >
              {subtitle}
            </p>
          )}
          <div
            className={[
              "h-px w-20 mt-3 rounded-full bg-gradient-to-r from-emerald-500/60 via-emerald-400/10 to-transparent",
              !isDark ? "opacity-70" : "",
            ].join(" ")}
          />
        </div>
      </div>
    );
  }
);

export default SectionHeader;
