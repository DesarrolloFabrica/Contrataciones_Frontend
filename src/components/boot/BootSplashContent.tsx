import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BriefcaseBusiness, LockKeyhole } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface BootSplashContentProps {
  animate?: boolean;
  complete?: boolean;
}

export const BootSplashContent: React.FC<BootSplashContentProps> = ({
  animate = true,
  complete = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(prefersReducedMotion ? 68 : 10);

  useEffect(() => {
    if (complete) {
      setProgress(100);
      return;
    }

    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        if (current < 42) return Math.min(92, current + 4);
        if (current < 70) return Math.min(92, current + 2);
        return Math.min(92, current + 1);
      });
    }, 115);

    return () => window.clearInterval(timer);
  }, [complete, prefersReducedMotion]);

  const shouldAnimate = animate && !prefersReducedMotion;

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 12, scale: 0.985 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-[min(88vw,520px)] flex-col items-center text-center"
    >
      <div className="relative flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44">
        <div
          aria-hidden="true"
          className={[
            "absolute inset-[9px] rounded-full blur-2xl",
            isDark ? "bg-emerald-400/[0.09]" : "bg-emerald-400/[0.13]",
          ].join(" ")}
        />
        <div
          aria-hidden="true"
          className={[
            "absolute inset-0 rounded-full border",
            isDark ? "border-emerald-300/[0.08]" : "border-emerald-700/[0.08]",
          ].join(" ")}
        />
        <div
          aria-hidden="true"
          className={[
            "absolute inset-[13px] rounded-full border",
            isDark
              ? "border-emerald-400/45 shadow-[inset_0_0_32px_rgba(16,185,129,0.04),0_0_30px_-18px_rgba(52,211,153,0.75)]"
              : "border-emerald-500/55 shadow-[inset_0_0_30px_rgba(16,185,129,0.05),0_0_30px_-18px_rgba(5,150,105,0.55)]",
          ].join(" ")}
        />
        <div
          aria-hidden="true"
          className="absolute inset-[4px] animate-[spin_9s_linear_infinite] rounded-full motion-reduce:animate-none"
        >
          <span
            className={[
              "absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full",
              isDark
                ? "bg-emerald-300 shadow-[0_0_12px_3px_rgba(110,231,183,0.55)]"
                : "bg-emerald-600 shadow-[0_0_12px_3px_rgba(5,150,105,0.3)]",
            ].join(" ")}
          />
        </div>
        <div
          className={[
            "relative flex h-[106px] w-[106px] items-center justify-center rounded-full border backdrop-blur-md sm:h-[116px] sm:w-[116px]",
            isDark
              ? "border-emerald-300/[0.16] bg-[#071a1e]/80 shadow-[0_22px_55px_-24px_rgba(0,0,0,0.9)]"
              : "border-white/90 bg-white/75 shadow-[0_22px_55px_-26px_rgba(15,23,42,0.32)]",
          ].join(" ")}
        >
          <BriefcaseBusiness aria-label="CHARLAS CUN" className="h-14 w-14 text-emerald-600" />
        </div>
      </div>

      <div className="mt-5">
        <h1
          className={`text-2xl font-bold tracking-[-0.03em] sm:text-[32px] ${
            isDark ? "text-white" : "text-slate-950"
          }`}
        >
          CHARLAS <span className={isDark ? "text-emerald-400" : "text-emerald-600"}>CUN</span>
        </h1>
        <p className={`mt-2 text-sm font-medium sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Preparando tu espacio de trabajo
        </p>
      </div>

      <div className="mt-9 w-full max-w-[450px]">
        <div
          className={[
            "relative h-2 overflow-hidden rounded-full",
            isDark ? "bg-[#15343b]/90" : "bg-emerald-950/10",
          ].join(" ")}
          role="progressbar"
          aria-label="Preparando tu espacio de trabajo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className={[
              "absolute inset-y-0 left-0 rounded-full transition-[width] duration-150 ease-out motion-reduce:transition-none",
              isDark
                ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_0_18px_rgba(52,211,153,0.42)]"
                : "bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-400 shadow-[0_0_16px_rgba(5,150,105,0.3)]",
            ].join(" ")}
            style={{ width: `${progress}%` }}
          >
            <span
              aria-hidden="true"
              className={[
                "absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full",
                isDark
                  ? "bg-white shadow-[0_0_14px_4px_rgba(110,231,183,0.72)]"
                  : "bg-white shadow-[0_0_12px_3px_rgba(5,150,105,0.45)]",
              ].join(" ")}
            />
          </div>
        </div>

        <p className={`mt-5 text-2xl font-semibold tabular-nums ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
          {progress}%
        </p>
        <div className={`mt-3 flex items-center justify-center gap-2 text-[11px] sm:text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <LockKeyhole className={isDark ? "h-4 w-4 text-emerald-400" : "h-4 w-4 text-emerald-700"} strokeWidth={1.8} />
          <span>Cargando información segura</span>
        </div>
      </div>
    </motion.div>
  );
};

export default BootSplashContent;
