import React from "react";
import { motion } from "framer-motion";

import { AppLogo } from "./AppLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const BrandPanel: React.FC = () => {
  return (
    <aside className="relative z-10 hidden lg:flex lg:items-end lg:justify-end lg:pr-2 xl:pr-4">
      <div className="flex max-w-sm flex-col gap-6 xl:max-w-md">
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <AppLogo variant="login" />
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-[2.1rem] font-black leading-[1.1] tracking-[-0.04em] text-slate-900 dark:text-white xl:text-[2.4rem]">
            Contratación
            <br />
            Académica{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent dark:from-brand-300 dark:to-brand-400">
              CUN
            </span>
          </h1>
          <p className="mt-3 max-w-xs text-[15px] leading-6 text-slate-500 dark:text-slate-400">
            Plataforma institucional para la gestión de procesos de contratación académica.
          </p>
        </motion.div>
      </div>
    </aside>
  );
};

export default BrandPanel;
