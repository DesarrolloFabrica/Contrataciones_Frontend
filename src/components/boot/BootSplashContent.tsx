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
      className="flex flex-col items-center gap-7 sm:gap-8"
    >
      <AppLogo
        variant="splash"
        className="h-32 w-auto sm:h-36 md:h-40 dark:drop-shadow-[0_4px_28px_rgba(255,255,255,0.18)]"
      />

      <div className="flex w-full flex-col items-center gap-4">
        <div
          className={[
            "w-48 overflow-hidden rounded-full sm:w-56",
            isDark ? "bg-brand-900/50" : "bg-brand-100",
          ].join(" ")}
          style={{ height: "3px" }}
          aria-hidden
        >
          <div
            className={[
              "h-full w-2/5 rounded-full boot-progress-bar",
              isDark
                ? "bg-gradient-to-r from-brand-500 to-brand-300"
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
                isDark ? "text-brand-200/80" : "text-brand-700/75",
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
