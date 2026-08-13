import React from "react";
import { motion, type Variants } from "framer-motion";
import { BriefcaseBusiness, ShieldCheck, UsersRound, Zap } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 + i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const benefits = [
  { icon: ShieldCheck, title: "Seguro", copy: "Tus datos están protegidos" },
  { icon: Zap, title: "Eficiente", copy: "Procesos ágiles y centralizados" },
  { icon: UsersRound, title: "Confiable", copy: "Información precisa y actualizada" },
];

export const BrandPanel: React.FC = () => {
  return (
    <aside className="relative z-10 hidden lg:flex lg:items-center lg:justify-center">
      <div className="w-full max-w-[570px] pb-3 text-center xl:max-w-[620px]">
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <span className="mx-auto flex h-28 w-28 items-center justify-center rounded-[1.2rem] border border-white/90 bg-emerald-600 text-white shadow-xl xl:h-32 xl:w-32"><BriefcaseBusiness className="h-14 w-14" /></span>
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="mt-7 text-[2.55rem] font-black leading-[1.08] tracking-[-0.045em] text-slate-950 [text-shadow:0_1px_0_rgba(255,255,255,0.7)] dark:text-white dark:[text-shadow:none] xl:text-[3rem]">
            CHARLAS <span className="text-brand-700 dark:text-[#58bea1]">CUN</span>
          </h1>
          <span className="mx-auto mt-5 block h-0.5 w-24 rounded-full bg-brand-600" />
          <p className="mx-auto mt-5 max-w-md text-[15px] font-semibold leading-6 text-slate-700 [text-shadow:0_1px_0_rgba(255,255,255,0.65)] dark:text-slate-200 dark:[text-shadow:none] xl:text-base">
            Plataforma institucional para evaluar candidatos
            <br className="hidden xl:block" /> en procesos vinculados a vacantes.
          </p>
        </motion.div>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-9 grid grid-cols-3"
        >
          {benefits.map(({ icon: Icon, title, copy }, index) => (
            <div
              key={title}
              className={[
                "flex min-w-0 flex-col items-center px-4",
                index > 0 ? "border-l border-brand-500/25 dark:border-brand-300/15" : "",
              ].join(" ")}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-200/70 bg-brand-100/80 text-brand-800 shadow-[0_10px_30px_-12px_rgba(16,185,129,0.55)] backdrop-blur-sm dark:border-[#4d8e80]/30 dark:bg-[#173238]/65 dark:text-[#79cdb4] dark:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.85)]">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </span>
              <strong className="mt-3 text-sm font-extrabold text-slate-950 dark:text-white">{title}</strong>
              <span className="mt-1 max-w-[150px] text-xs font-medium leading-[1.45] text-slate-700 dark:text-slate-200">
                {copy}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </aside>
  );
};

export default BrandPanel;
