// src/components/AnimatedBackground.tsx
import React from "react";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/cn";

const LIGHT_DOTS = [
  { top: "14%", left: "8%", size: 3, delay: "0s" },
  { top: "22%", right: "12%", size: 4, delay: "1.2s" },
  { top: "58%", left: "6%", size: 3, delay: "2.4s" },
  { top: "72%", right: "18%", size: 3, delay: "0.8s" },
  { bottom: "18%", left: "42%", size: 4, delay: "1.8s" },
] as const;

const DARK_DOTS = [
  { top: "16%", left: "10%", size: 2 },
  { top: "34%", right: "14%", size: 2 },
  { bottom: "24%", left: "22%", size: 2 },
] as const;

const AnimatedBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {/* Base surface */}
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-700",
          isDark
            ? "bg-[radial-gradient(ellipse_at_18%_0%,#0d292d_0%,#07171c_48%,#041116_100%)]"
            : "bg-[radial-gradient(ellipse_at_12%_0%,#effcf7_0%,#ffffff_42%,#f4f7fb_100%)]"
        )}
      />

      {/* Soft mesh accent */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          isDark
            ? "bg-[radial-gradient(ellipse_at_82%_88%,rgba(55,127,116,0.055)_0%,transparent_52%)]"
            : "bg-[radial-gradient(ellipse_at_82%_88%,rgba(16,185,129,0.08)_0%,transparent_48%)]"
        )}
      />

      {/* Dot grid */}
      <div
        className={cn(
          "absolute inset-0 dot-grid transition-opacity duration-700",
          isDark ? "opacity-[0.035]" : "opacity-[0.28]"
        )}
      />

      {/* Fine structural grid */}
      <div
        className={cn(
          "absolute inset-0",
          isDark ? "opacity-[0.018]" : "opacity-[0.04]"
        )}
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"} 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Diagonal accent lines */}
      <svg
        className={cn(
          "absolute -right-6 top-0 h-full w-[55%] transition-opacity duration-700",
          isDark ? "opacity-[0.025]" : "opacity-[0.07]"
        )}
        viewBox="0 0 600 900"
        preserveAspectRatio="xMaxYMid slice"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1={100 + i * 72}
            y1="0"
            x2={260 + i * 72}
            y2="900"
            stroke={isDark ? "#58BEA1" : "#10B981"}
            strokeWidth="0.75"
          />
        ))}
      </svg>

      {/* Corner arcs — top left */}
      <svg
        className={cn(
          "absolute -left-16 -top-16 h-80 w-80 transition-opacity duration-700",
          isDark ? "opacity-[0.045]" : "opacity-[0.18]"
        )}
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="92" stroke={isDark ? "#58BEA1" : "#10B981"} strokeWidth="0.75" />
        <circle cx="100" cy="100" r="68" stroke={isDark ? "#347C70" : "#059669"} strokeWidth="0.5" strokeOpacity="0.6" />
        <circle cx="100" cy="100" r="44" stroke={isDark ? "#58BEA1" : "#10B981"} strokeWidth="0.5" strokeOpacity="0.35" />
      </svg>

      {/* Corner arcs — bottom right */}
      <svg
        className={cn(
          "absolute -bottom-20 -right-20 h-96 w-96 transition-opacity duration-700",
          isDark ? "opacity-[0.035]" : "opacity-[0.12]"
        )}
        viewBox="0 0 240 240"
        fill="none"
      >
        <circle cx="120" cy="120" r="108" stroke={isDark ? "#347C70" : "#059669"} strokeWidth="0.75" />
        <circle cx="120" cy="120" r="78" stroke={isDark ? "#58BEA1" : "#10B981"} strokeWidth="0.5" strokeOpacity="0.5" />
      </svg>

      {/* Concentric rings */}
      <div
        className={cn(
          "absolute right-[8%] top-[18%] h-64 w-64 rounded-full border transition-colors duration-700",
          isDark ? "border-brand-400/[0.07]" : "border-brand-400/25"
        )}
      />
      <div
        className={cn(
          "absolute right-[10%] top-[20%] h-48 w-48 rounded-full border transition-colors duration-700",
          isDark ? "border-brand-500/[0.05]" : "border-brand-400/18"
        )}
      />
      <div
        className={cn(
          "absolute left-[4%] bottom-[22%] h-28 w-28 rounded-full border transition-colors duration-700",
          isDark ? "border-white/[0.04]" : "border-brand-300/30"
        )}
      />

      {/* Ambient light pools */}
      <div
        className={cn(
          "absolute rounded-full blur-[120px]",
          isDark
            ? "-left-32 top-[4%] h-[360px] w-[360px] bg-[#347c70]/[0.05]"
            : "-left-24 top-[6%] h-[420px] w-[420px] bg-brand-300/30 animate-float-slow"
        )}
      />
      <div
        className={cn(
          "absolute rounded-full blur-[100px]",
          isDark
            ? "right-[2%] top-[12%] h-[240px] w-[240px] bg-[#315b73]/[0.035]"
            : "right-[2%] top-[12%] h-[280px] w-[280px] bg-brand-200/45 animate-float-reverse"
        )}
      />
      {!isDark && (
        <div className="absolute bottom-[8%] left-[28%] h-[180px] w-[180px] rounded-full blur-[90px] bg-brand-100/70 animate-float-medium" />
      )}

      {/* Accent dots */}
      {isDark
        ? DARK_DOTS.map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#58bea1]/20"
              style={{
                top: "top" in dot ? dot.top : undefined,
                left: "left" in dot ? dot.left : undefined,
                right: "right" in dot ? dot.right : undefined,
                bottom: "bottom" in dot ? dot.bottom : undefined,
                width: dot.size,
                height: dot.size,
              }}
            />
          ))
        : LIGHT_DOTS.map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse-glow bg-brand-500/40"
              style={{
                top: "top" in dot ? dot.top : undefined,
                left: "left" in dot ? dot.left : undefined,
                right: "right" in dot ? dot.right : undefined,
                bottom: "bottom" in dot ? dot.bottom : undefined,
                width: dot.size,
                height: dot.size,
                animationDelay: dot.delay,
              }}
            />
          ))}

      {/* Vignette for depth */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-40 transition-opacity duration-700",
          isDark
            ? "bg-gradient-to-b from-[#041116]/65 to-transparent"
            : "bg-gradient-to-b from-white/50 to-transparent"
        )}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-32 transition-opacity duration-700",
          isDark
            ? "bg-gradient-to-t from-[#041116]/55 to-transparent"
            : "bg-gradient-to-t from-slate-100/80 to-transparent"
        )}
      />

      {/* Noise texture */}
      <div
        className={cn(
          "absolute inset-0 mix-blend-overlay",
          isDark ? "opacity-[0.022]" : "opacity-[0.025]"
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
