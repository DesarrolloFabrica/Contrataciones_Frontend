import React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

type Props = {
  className?: string;
};

const baseBtn =
  "inline-flex items-center justify-center px-2.5 py-1.5 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-transparent";

export const ThemeToggle: React.FC<Props> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        baseBtn,
        isDark
          ? "border-white/15 bg-white/10 text-neutral-100 hover:bg-white/20"
          : "border-[#00B894]/40 bg-[#E6FFF7] text-[#006B57] hover:bg-[#D1FFF0]",
        className ?? "",
      ].join(" ")}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {isDark ? (
        <SunMedium className="w-4 h-4" />
      ) : (
        <MoonStar className="w-4 h-4" />
      )}
    </button>
  );
};

export default ThemeToggle;

