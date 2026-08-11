// src/components/LoadingState.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ListTodo } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const messages = [
  "Analizando observaciones cualitativas…",
  "Aplicando rúbrica de puntuación…",
  "Calculando puntaje global ponderado…",
  "Evaluando factores de riesgo…",
  "Contrastando con patrones históricos…",
  "Generando estrategias de mitigación…",
  "Redactando informe ejecutivo…",
];

const LoadingState: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2800);
    return () => clearInterval(msgInterval);
  }, []);

  const shellCls = [
    "relative overflow-hidden rounded-2xl border border-t-2 border-t-brand-500",
    isDark
      ? "border-[#579689]/24 bg-gradient-to-b from-[#0d252b]/95 via-[#0a2025]/92 to-[#07191f] shadow-[0_22px_60px_-30px_rgba(0,4,8,0.82)]"
      : "border-brand-500/20 bg-gradient-to-b from-white via-slate-50/90 to-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.06)]",
  ].join(" ");

  const statusCardCls = [
    "w-full rounded-xl border border-t-2 border-t-brand-500 p-4 relative overflow-hidden",
    isDark ? "border-brand-500/25 bg-white/[0.02]" : "border-brand-500/20 bg-white/80",
  ].join(" ");

  return (
    <div
      className={`min-h-[50vh] flex flex-col items-center justify-center p-6 md:p-10 ${shellCls}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/[0.07] blur-[90px]" />
          <div className="absolute bottom-0 right-0 h-[200px] w-[200px] rounded-full bg-brand-500/[0.05] blur-[70px]" />
        </div>
      )}

      <div className="relative z-10 flex max-w-md w-full flex-col items-center">
        <motion.div
          className={[
            "relative mb-8 flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-2xl border backdrop-blur-sm",
            isDark
              ? "border-brand-300/25 bg-brand-400/[0.08] shadow-[0_0_32px_-8px_rgba(52,211,153,0.25)]"
              : "border-brand-400/35 bg-brand-500/10 shadow-[0_12px_32px_-12px_rgba(5,150,105,0.2)]",
          ].join(" ")}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl border border-brand-400/20"
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <Loader2
            className={[
              "relative z-[1] h-9 w-9 animate-spin",
              isDark ? "text-brand-200" : "text-brand-600",
            ].join(" ")}
            strokeWidth={2}
            aria-hidden
          />
        </motion.div>

        <h2
          className={[
            "mb-2 text-center text-2xl font-black tracking-tight md:text-3xl",
            isDark ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
          Procesando{" "}
          <span className="bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent">
            perfil
          </span>
        </h2>

        <p
          className={[
            "mb-8 text-center text-sm leading-relaxed",
            isDark ? "text-slate-400" : "text-slate-600",
          ].join(" ")}
        >
          Generamos el informe de evaluación a partir de tus respuestas. Suele tardar unos
          instantes.
        </p>

        <div className={statusCardCls}>
          <div
            className={[
              "relative mb-3 h-1 w-full overflow-hidden rounded-full",
              isDark ? "bg-white/[0.06]" : "bg-slate-200/80",
            ].join(" ")}
            aria-hidden
          >
            <motion.div
              className="absolute top-0 h-full w-[32%] rounded-full bg-gradient-to-r from-brand-400 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.35)]"
              animate={{ left: ["-32%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="flex items-start gap-3">
            <div
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-brand-300"
                  : "border-slate-200 bg-slate-50 text-brand-700",
              ].join(" ")}
            >
              <ListTodo className="h-4 w-4" aria-hidden />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p
                  className={[
                    "text-[10px] font-bold uppercase tracking-[0.16em]",
                    isDark ? "text-slate-500" : "text-slate-500",
                  ].join(" ")}
                >
                  Actividad
                </p>
                <span
                  className={[
                    "tabular-nums text-[10px] font-semibold",
                    isDark ? "text-brand-400/90" : "text-brand-700",
                  ].join(" ")}
                >
                  {messageIndex + 1} / {messages.length}
                </span>
              </div>

              <div className="relative min-h-[2.75rem]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className={[
                      "text-sm font-medium leading-snug",
                      isDark ? "text-slate-200" : "text-slate-700",
                    ].join(" ")}
                  >
                    {messages[messageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
