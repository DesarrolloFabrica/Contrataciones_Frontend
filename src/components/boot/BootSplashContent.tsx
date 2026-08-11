// Componente visual compartido: logo + barra + mensaje rotativo.

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { AppLogo } from "../brand/AppLogo";

const LOADING_MESSAGES = [
  "Cargando...",
  "Preparando panel...",
  "Sincronizando datos...",
];

const MESSAGE_INTERVAL_MS = 2400;

interface BootSplashContentProps {
  animate?: boolean;
}

export const BootSplashContent: React.FC<BootSplashContentProps> = ({
  animate = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  const currentMessage = LOADING_MESSAGES[messageIndex];
  const shouldAnimate = animate && !prefersReducedMotion;

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-w-[280px] flex-col items-center gap-6 rounded-[1.75rem] border border-slate-200/80 bg-white/88 px-10 py-9 text-center shadow-[0_28px_80px_-28px_rgba(15,23,42,0.3)] backdrop-blur-2xl dark:border-[#4d8e80]/35 dark:bg-[#07161b]/86 dark:shadow-[0_30px_90px_-28px_rgba(0,4,8,0.88)] sm:min-w-[340px] sm:px-12 sm:py-10"
    >
      <AppLogo
        variant="login"
        bare
        className="h-20 w-20 sm:h-24 sm:w-24"
      />

      <div className="space-y-1">
        <p className="text-base font-black tracking-[-0.025em] text-slate-950 dark:text-white">
          Contratación Académica <span className="text-brand-700 dark:text-[#58bea1]">CUN</span>
        </p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Preparando tu espacio de trabajo
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        <div
          className={[
            "w-48 overflow-hidden rounded-full sm:w-56",
            isDark ? "bg-[#173238]/80" : "bg-brand-100",
          ].join(" ")}
          style={{ height: "3px" }}
          aria-hidden
        >
          <div
            className={[
              "h-full w-2/5 rounded-full boot-progress-bar",
              isDark
                ? "bg-gradient-to-r from-[#178b70] to-[#72c4ae]"
                : "bg-gradient-to-r from-brand-600 to-brand-400",
            ].join(" ")}
          />
        </div>

        <div className="h-5 overflow-hidden text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={shouldAnimate ? { opacity: 0, y: 6 } : { opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldAnimate ? { opacity: 0, y: -6 } : { opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={[
                "text-sm font-medium tracking-wide",
                isDark ? "text-slate-300" : "text-brand-700/75",
              ].join(" ")}
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default BootSplashContent;
