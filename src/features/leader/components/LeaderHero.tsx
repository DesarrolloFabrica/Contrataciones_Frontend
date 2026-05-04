import React from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, CheckCircle2, Clock3, ListChecks, ShieldCheck } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

export function LeaderHero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative overflow-hidden rounded-2xl">
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-16 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-500/6 via-blue-500/4 to-transparent blur-[100px]" />
          <div className="absolute -bottom-24 -left-12 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-500/5 to-transparent blur-[80px]" />
        </div>
      )}

      <div
        className={`relative px-6 py-4 md:px-8 md:py-5 ${
          isDark
            ? "bg-gradient-to-b from-[#080D16]/90 via-[#0A1018]/80 to-[#060A12] border border-white/[0.06] shadow-[0_0_40px_-12px_rgba(6,182,212,0.06)]"
            : "bg-gradient-to-b from-white via-slate-50/80 to-white border border-slate-200/60 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.06)]"
        } rounded-2xl`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5 lg:gap-6 items-start">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-row items-center gap-5 md:gap-7">
              <div
                className="relative shrink-0 flex items-center justify-center overflow-visible pointer-events-none h-16 w-16 md:h-20 md:w-20"
                aria-hidden
              >
                <motion.div
                  className={[
                    "absolute inset-0 rounded-full blur-xl",
                    isDark ? "bg-cyan-400/20" : "bg-cyan-500/15",
                  ].join(" ")}
                  animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.45, 0.9, 0.45] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.div
                  className={[
                    "relative z-[1] flex h-14 w-14 items-center justify-center rounded-2xl border backdrop-blur-sm md:h-16 md:w-16",
                    isDark
                      ? "border-cyan-300/25 bg-cyan-400/10"
                      : "border-cyan-400/30 bg-cyan-500/10",
                  ].join(" ")}
                  animate={{ y: [0, -4, 0], rotate: [0, -2, 0, 2, 0], scale: [1, 1.04, 1] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BookOpenCheck
                    className={["h-7 w-7 md:h-8 md:w-8", isDark ? "text-cyan-200" : "text-cyan-700"].join(" ")}
                  />
                </motion.div>
              </div>

              <div className="min-w-0 space-y-0.5">
                <h1
                  className={`text-xl md:text-2xl font-black leading-tight tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Evaluacion de{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Talento Docente
                  </span>
                </h1>
                <p
                  className={`text-sm max-w-lg leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Flujo guiado para la contratacion de facilitadores.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                  isDark
                    ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
                    : "border-cyan-200 bg-cyan-50 text-cyan-700",
                ].join(" ")}
              >
                <ListChecks className="h-3.5 w-3.5" />
                5 pasos guiados
              </span>
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                  isDark
                    ? "border-white/10 bg-white/[0.03] text-slate-300"
                    : "border-slate-200 bg-white text-slate-600",
                ].join(" ")}
              >
                <Clock3 className="h-3.5 w-3.5" />
                8-12 min
              </span>
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                  isDark
                    ? "border-white/10 bg-white/[0.03] text-slate-300"
                    : "border-slate-200 bg-white text-slate-600",
                ].join(" ")}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Trazabilidad activa
              </span>
            </div>
          </div>

          <div
            className={[
              "rounded-xl border p-3 space-y-2.5",
              isDark ? "bg-white/[0.02] border-white/[0.08]" : "bg-white/70 border-slate-200/80",
            ].join(" ")}
          >
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                isDark ? "text-cyan-300" : "text-cyan-700"
              }`}
            >
              Recomendado para iniciar
            </p>
            <div className="space-y-2">
              {[
                "Define perfil y prioridad del cargo.",
                "Completa documentos y datos del candidato.",
                "Ejecuta el analisis y revisa el reporte final.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isDark ? "text-cyan-300" : "text-cyan-600"}`}
                  />
                  <p className={`text-[11px] leading-snug ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
