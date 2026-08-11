import React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

type Props = {
  className?: string;
  variant?: "default" | "login";
};

const baseBtn =
  "inline-flex items-center justify-center px-2.5 py-1.5 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-transparent";

export const ThemeToggle: React.FC<Props> = ({ className, variant = "default" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "login") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={[
          "group inline-flex h-10 items-center gap-2 rounded-full border p-1 pl-2 shadow-lg backdrop-blur-xl transition-all",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          isDark
            ? "border-[#315d58]/70 bg-[#071a20]/88 text-slate-100 shadow-black/30 hover:border-[#4b8c7e]"
            : "border-slate-200/90 bg-white/80 text-slate-800 shadow-slate-900/10 hover:border-brand-300",
          className ?? "",
        ].join(" ")}
        title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        aria-pressed={isDark}
      >
        {isDark ? (
          <SunMedium className="h-[18px] w-[18px]" strokeWidth={1.8} />
        ) : (
          <MoonStar className="h-[18px] w-[18px]" strokeWidth={1.8} />
        )}
        <span
          className={[
            "relative block h-6 w-10 rounded-full transition-colors",
            isDark ? "bg-[#178b70]" : "bg-brand-600",
          ].join(" ")}
        >
          <span
            className={[
              "absolute left-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-300",
              isDark ? "translate-x-[19px]" : "translate-x-[3px]",
            ].join(" ")}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        baseBtn,
        isDark
          ? "border-white/15 bg-white/10 text-neutral-100 hover:bg-white/20"
          : "border-brand-500/40 bg-brand-50 text-brand-700 hover:bg-brand-100",
        className ?? "",
      ].join(" ")}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </button>
  );
};

export default ThemeToggle;
