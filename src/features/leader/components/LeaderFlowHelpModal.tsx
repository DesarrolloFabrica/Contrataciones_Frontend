import React from "react";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Compass,
  Download,
  ShieldCheck,
  X,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

interface LeaderFlowHelpModalProps {
  onClose: () => void;
}

const GUIDE_STEPS = [
  {
    number: 1,
    eyebrow: "Paso 1 · Captura",
    title: "Registra el contexto de la vacante y la entrevista.",
    description:
      "Entre más detalladas sean las respuestas, más preciso será el análisis. Evita copiar textos genéricos de hojas de vida.",
    icon: ClipboardList,
  },
  {
    number: 2,
    eyebrow: "Paso 2 · Análisis IA",
    title: "Interpreta el resumen ejecutivo y los riesgos.",
    description:
      "Revisa el veredicto, las alertas y las recomendaciones antes de decidir. Usa el PDF como soporte formal de la entrevista.",
    icon: BarChart3,
  },
  {
    number: 3,
    eyebrow: "Paso 3 · Reporte",
    title: "Genera y comparte el reporte oficial.",
    description:
      "Descarga el PDF y compártelo con el comité o con las personas responsables de tomar la decisión institucional sobre el docente.",
    icon: Download,
  },
];

export const LeaderFlowHelpModal: React.FC<LeaderFlowHelpModalProps> = ({
  onClose,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 backdrop-blur-[7px] sm:px-6",
        isDark ? "bg-[#02090c]/80" : "bg-slate-950/55",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leader-guide-title"
    >
      <div
        className={[
          "relative flex max-h-[calc(100dvh-48px)] w-full max-w-[920px] flex-col overflow-hidden rounded-[22px] border shadow-[0_36px_110px_-30px_rgba(2,12,16,0.8)]",
          isDark
            ? "border-emerald-200/25 bg-[#09171c]"
            : "border-white/80 bg-white shadow-[0_38px_110px_-32px_rgba(15,23,42,0.48)] ring-1 ring-slate-900/10",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-x-0 top-0 h-52",
            isDark
              ? "bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.11),transparent_62%)]"
              : "bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.1),transparent_64%)]",
          ].join(" ")}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
        />

        <div className="relative min-h-0 overflow-y-auto modal-scroll">
          <header className="flex items-start justify-between gap-5 px-5 pb-5 pt-5 sm:px-8 sm:pb-6 sm:pt-7">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className={[
                  "mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                  isDark
                    ? "border-emerald-300/[0.12] bg-gradient-to-br from-emerald-400/[0.16] to-teal-500/[0.04] text-emerald-300 shadow-[0_14px_30px_-18px_rgba(16,185,129,0.7)]"
                    : "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white text-emerald-700 shadow-[0_14px_28px_-18px_rgba(5,150,105,0.38)]",
                ].join(" ")}
              >
                <Compass className="h-6 w-6" strokeWidth={1.7} />
              </div>

              <div className="min-w-0">
                <p
                  className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    isDark ? "text-emerald-300" : "text-emerald-700"
                  }`}
                >
                  Guía para el líder
                </p>
                <h2
                  id="leader-guide-title"
                  className={`text-xl font-semibold tracking-[-0.02em] sm:text-[23px] ${
                    isDark ? "text-white" : "text-slate-950"
                  }`}
                >
                  Cómo usar este panel de entrevistas
                </h2>
                <p
                  className={`mt-2 max-w-[650px] text-[12px] leading-[1.6] sm:text-[13px] ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Registra la charla con cada candidato para decidir si puede contratarse.
                  Combina tu criterio con la analítica de IA y deja evidencia clara para
                  quienes toman la decisión final.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
                isDark
                  ? "border-white/[0.09] bg-white/[0.04] text-slate-400 hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                  : "border-slate-200 bg-slate-50 text-slate-500 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-800",
              ].join(" ")}
              aria-label="Cerrar guía rápida"
            >
              <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </button>
          </header>

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_28px_1fr_28px_1fr] md:items-center md:gap-0">
              {GUIDE_STEPS.map(({ number, eyebrow, title, description, icon: Icon }, index) => (
                <React.Fragment key={number}>
                  <article
                    className={[
                      "group relative flex h-full min-h-[238px] flex-col rounded-2xl border px-5 pb-5 pt-6 transition-colors duration-200",
                      isDark
                        ? index === 0
                          ? "border-emerald-400/35 bg-gradient-to-b from-emerald-400/[0.055] to-white/[0.018] shadow-[inset_0_-2px_0_rgba(16,185,129,0.85),0_18px_34px_-26px_rgba(16,185,129,0.8)]"
                          : "border-emerald-200/[0.11] bg-white/[0.018] hover:border-emerald-200/[0.18]"
                        : index === 0
                          ? "border-emerald-300 bg-gradient-to-b from-emerald-50/75 to-white shadow-[inset_0_-2px_0_rgba(16,185,129,0.82),0_18px_34px_-27px_rgba(5,150,105,0.42)]"
                          : "border-slate-200 bg-gradient-to-b from-slate-50/75 to-white shadow-[0_16px_34px_-30px_rgba(15,23,42,0.28)] hover:border-emerald-200",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute -left-px -top-px flex h-7 min-w-7 items-center justify-center rounded-br-xl rounded-tl-2xl px-2 text-[11px] font-bold",
                        isDark
                          ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_7px_18px_-8px_rgba(16,185,129,0.85)]"
                          : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_7px_18px_-8px_rgba(5,150,105,0.7)]",
                      ].join(" ")}
                    >
                      {number}
                    </span>

                    <div
                      className={[
                        "mx-auto mb-4 flex h-[54px] w-[54px] items-center justify-center rounded-full border",
                        isDark
                          ? "border-emerald-300/[0.13] bg-gradient-to-br from-emerald-400/[0.08] to-emerald-400/[0.02] text-emerald-200 shadow-[inset_0_0_20px_rgba(16,185,129,0.04)]"
                          : "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white text-emerald-700 shadow-[0_12px_24px_-20px_rgba(5,150,105,0.55)]",
                      ].join(" ")}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.65} />
                    </div>

                    <p
                      className={`text-[9px] font-bold uppercase tracking-[0.14em] ${
                        isDark ? "text-emerald-300" : "text-emerald-700"
                      }`}
                    >
                      {eyebrow}
                    </p>
                    <h3
                      className={`mt-2 text-[13px] font-semibold leading-[1.5] ${
                        isDark ? "text-slate-100" : "text-slate-900"
                      }`}
                    >
                      {title}
                    </h3>
                    <p
                      className={`mt-3 text-[11px] leading-[1.6] ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {description}
                    </p>
                  </article>

                  {index < GUIDE_STEPS.length - 1 && (
                    <div className="relative hidden h-px items-center md:flex" aria-hidden="true">
                      <span
                        className={`h-px w-full ${
                          isDark
                            ? "bg-gradient-to-r from-emerald-300/30 via-emerald-300/65 to-emerald-300/30"
                            : "bg-gradient-to-r from-emerald-200 via-emerald-500/70 to-emerald-200"
                        }`}
                      />
                      <span
                        className={`absolute right-0 h-1.5 w-1.5 rounded-full ${
                          isDark ? "bg-emerald-400/75" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <footer
          className={[
            "relative flex shrink-0 flex-col items-stretch justify-between gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:px-8 sm:py-5",
            isDark
              ? "border-white/[0.07] bg-black/[0.08]"
              : "border-slate-200/80 bg-slate-50/80",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <span
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                isDark
                  ? "border-emerald-300/[0.1] bg-emerald-400/[0.09] text-emerald-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </span>
            <p className={`text-[10px] leading-4 sm:text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              <span className={isDark ? "text-emerald-300" : "font-medium text-emerald-700"}>
                Recuerda:
              </span>{" "}
              la IA es un apoyo,
              <br className="hidden sm:block" /> la decisión siempre es humana.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="group flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-emerald-300/25 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-6 text-[12px] font-semibold !text-white shadow-[0_12px_30px_-16px_rgba(5,150,105,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 sm:w-[286px]"
          >
            <span className="!text-white">Entendido, continuar</span>
            <ArrowRight className="h-4 w-4 !text-white transition-transform group-hover:translate-x-1" strokeWidth={1.8} />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LeaderFlowHelpModal;
