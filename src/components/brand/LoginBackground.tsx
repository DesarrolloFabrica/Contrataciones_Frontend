import React from "react";
import { useTheme } from "../../context/ThemeContext";

const LoginBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div
        className={[
          "absolute inset-0 transition-colors duration-700",
          isDark
            ? "bg-[radial-gradient(ellipse_at_20%_0%,#064E3B_0%,#022C22_50%,#011A12_100%)]"
            : "bg-[radial-gradient(ellipse_at_18%_0%,#ECFDF5_0%,#ffffff_55%,#F0FDF4_100%)]",
        ].join(" ")}
      />

      {/* Mesh overlay */}
      <div
        className={[
          "absolute inset-0 transition-opacity duration-700",
          isDark
            ? "bg-[radial-gradient(ellipse_at_80%_90%,rgba(16,185,129,0.20)_0%,transparent_55%)]"
            : "bg-[radial-gradient(ellipse_at_75%_85%,rgba(16,185,129,0.18)_0%,transparent_50%)]",
        ].join(" ")}
      />

      {/* Dot grid */}
      <div
        className={[
          "absolute inset-0 dot-grid transition-opacity duration-700",
          isDark ? "opacity-[0.12]" : "opacity-55",
        ].join(" ")}
      />

      {/* Diagonal accent lines */}
      <svg
        className={[
          "absolute -right-10 top-0 h-full w-[60%] transition-opacity duration-700",
          isDark ? "opacity-[0.07]" : "opacity-[0.14]",
        ].join(" ")}
        viewBox="0 0 600 900"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={120 + i * 80}
            y1="0"
            x2={280 + i * 80}
            y2="900"
            stroke={isDark ? "#34D399" : "#10B981"}
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Ambient orbs */}
      <div
        className={[
          "absolute -left-20 top-[8%] h-[480px] w-[480px] rounded-full blur-[130px] animate-float-slow",
          isDark ? "bg-brand-500/20" : "bg-brand-400/35",
        ].join(" ")}
      />
      <div
        className={[
          "absolute right-[5%] top-[4%] h-[320px] w-[320px] rounded-full blur-[110px] animate-float-reverse",
          isDark ? "bg-emerald-400/12" : "bg-brand-300/55",
        ].join(" ")}
      />
      <div
        className={[
          "absolute bottom-[20%] left-[30%] h-[200px] w-[200px] rounded-full blur-[90px] animate-float-medium",
          isDark ? "bg-brand-400/10" : "bg-brand-300/45",
        ].join(" ")}
      />

      {/* Decorative rings */}
      <div
        className={[
          "absolute left-[32%] top-[14%] h-72 w-72 rounded-full border transition-colors duration-700",
          isDark ? "border-brand-400/15" : "border-brand-400/50",
        ].join(" ")}
      />
      <div
        className={[
          "absolute left-[34%] top-[16%] h-56 w-56 rounded-full border transition-colors duration-700",
          isDark ? "border-brand-500/10" : "border-brand-400/40",
        ].join(" ")}
      />
      <div
        className={[
          "absolute bottom-[35%] left-[8%] h-36 w-36 rounded-full border transition-colors duration-700",
          isDark ? "border-white/8" : "border-brand-400/50",
        ].join(" ")}
      />

      {/* Floating dots */}
      {[
        { top: "18%", left: "22%", size: 4 },
        { top: "42%", left: "48%", size: 3 },
        { top: "28%", right: "32%", size: 5 },
        { bottom: "38%", left: "18%", size: 3 },
        { bottom: "22%", right: "28%", size: 4 },
      ].map((dot, i) => (
        <div
          key={i}
          className={[
            "absolute rounded-full animate-pulse-glow",
            isDark ? "bg-brand-400/40" : "bg-brand-500/60",
          ].join(" ")}
          style={{
            top: dot.top,
            left: dot.left,
            right: dot.right,
            bottom: dot.bottom,
            width: dot.size,
            height: dot.size,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}

      {/* Organic wave — solid green, hugging the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-[18vh] min-h-[120px] sm:h-[16vh] lg:h-[20vh]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 500"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="#10B981"
            fillOpacity={isDark ? "0.90" : "0.95"}
            d="M0,500 L1440,500 L1440,380 C1180,340 1020,420 780,400 C540,380 380,320 160,360 C60,380 0,420 0,440 Z"
          />
        </svg>
      </div>

      {/* Top vignette for depth */}
      <div
        className={[
          "absolute inset-x-0 top-0 h-32 transition-opacity duration-700",
          isDark
            ? "bg-gradient-to-b from-[#010d08]/80 to-transparent"
            : "bg-gradient-to-b from-white/60 to-transparent",
        ].join(" ")}
      />
    </div>
  );
};

export default LoginBackground;
