import React from "react";
import { useTheme } from "../../../../context/ThemeContext";
import { SectionHeader } from "./SectionHeader";

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  step: number;
  subtitle?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = React.memo(
  ({ title, icon, step, subtitle, children }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
      <section
        className={[
          "relative group rounded-3xl overflow-hidden border",
          isDark
            ? "bg-white/[0.03] backdrop-blur-2xl border-white/10 shadow-[0_22px_80px_rgba(0,0,0,0.75)]"
            : "bg-white border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.10)]",
        ].join(" ")}
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400/60 via-emerald-200/40 to-cyan-400/60" />

        {isDark && (
          <div className="pointer-events-none absolute -top-24 right-0 w-56 h-40 bg-emerald-500/8 blur-3xl" />
        )}

        <div
          className={[
            "relative p-6 md:p-8 lg:p-10",
            isDark
              ? "bg-gradient-to-br from-[#05070b] via-[#070b11] to-[#05070b]"
              : "bg-gradient-to-br from-white via-slate-50 to-slate-50",
          ].join(" ")}
        >
          <SectionHeader
            title={title}
            icon={icon}
            step={step}
            subtitle={subtitle}
          />
          <div className="space-y-8 relative z-10">{children}</div>
        </div>
      </section>
    );
  }
);

export default FormSection;
