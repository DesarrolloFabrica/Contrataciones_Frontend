import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  step: number | string;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(
  ({ title, icon, step, subtitle }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
      <div className="mb-1 flex items-start gap-3">
        <div className="relative">
          <div className={`absolute -inset-1 rounded-xl blur-md ${isDark ? "bg-emerald-500/20" : "bg-emerald-400/25"}`} />
          <div
            className={[
              "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
              isDark
                ? "border-emerald-400/20 bg-gradient-to-br from-emerald-500/25 to-teal-700/15 text-emerald-300"
                : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-700",
            ].join(" ")}
          >
            {icon}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={[
                "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md px-1.5 text-[11px] font-bold",
                isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-100 text-emerald-700",
              ].join(" ")}
            >
              {step}
            </span>
            <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  },
);

export default SectionHeader;
