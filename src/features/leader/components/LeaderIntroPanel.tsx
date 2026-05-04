import React from "react";
import { Sparkles, ListChecks, FileText, Info, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

interface LeaderIntroPanelProps {
  currentStep: 1 | 2 | 3;
  status: { label: string; cls: string };
  onOpenFlowHelp: () => void;
}

export const LeaderIntroPanel: React.FC<LeaderIntroPanelProps> = ({
  currentStep,
  status,
  onOpenFlowHelp,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={[
        "relative overflow-hidden rounded-3xl backdrop-blur-2xl",
        isDark
          ? "border border-white/10 bg-[#050505]/90 shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
          : "border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)]",
      ].join(" ")}
    >
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-0 w-80 h-80 rounded-full blur-[90px] bg-emerald-500/12" />
          <div className="absolute -bottom-40 left-10 w-72 h-72 rounded-full blur-[100px] bg-cyan-500/8" />
        </div>
      )}

      <div className="relative p-6 md:p-8 flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <div
              className={[
                "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-[0.18em]",
                isDark
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                  : "border-emerald-400/30 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Panel principal de líder</span>
            </div>
            <div>
              <h2
                className={[
                  "text-xl md:text-2xl font-semibold tracking-tight",
                  isDark ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                Evaluación asistida por IA
              </h2>
              <p
                className={[
                  "text-sm max-w-xl",
                  isDark ? "text-neutral-400" : "text-slate-600",
                ].join(" ")}
              >
                Registra la entrevista, ejecuta el análisis y genera un reporte
                listo para el comité académico o quien defina la decisión final.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch md:items-end gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${status.cls}`}
              >
                {status.label}
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenFlowHelp}
              className={[
                "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-[0.2em] transition",
                isDark
                  ? "border-white/10 bg-white/[0.03] text-neutral-200 hover:bg-white/[0.08] hover:border-white/20"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
              ].join(" ")}
            >
              <Info className="w-3.5 h-3.5" />
              Ver guía rápida
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-4 md:gap-6">
          <div
            className={[
              "relative p-5 rounded-2xl border",
              isDark
                ? "bg-white/[0.02] border-white/10"
                : "bg-white border-slate-200 shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
            ].join(" ")}
          >
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                  <ListChecks className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    className={[
                      "text-xs font-bold uppercase tracking-[0.22em]",
                      isDark ? "text-neutral-300" : "text-slate-700",
                    ].join(" ")}
                  >
                    Flujo de evaluación
                  </h3>
                  <p
                    className={[
                      "text-[11px]",
                      isDark ? "text-neutral-500" : "text-slate-500",
                    ].join(" ")}
                  >
                    3 pasos guiados para registrar la evaluación y su evidencia.
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-neutral-500 uppercase tracking-[0.18em]">
                Paso {currentStep} de 3
              </span>
            </div>

            <ol className="space-y-3">
              {[
                {
                  id: 1,
                  title: "Capturar información del docente",
                  desc: "Completa identidad, trayectoria, disponibilidad y casos éticos.",
                },
                {
                  id: 2,
                  title: "Ejecutar análisis de IA",
                  desc: "Envía el formulario y revisa en segundos el resumen ejecutivo.",
                },
                {
                  id: 3,
                  title: "Generar reporte para comité",
                  desc: "Descarga el PDF y compártelo con el comité o con quien toma la decisión final.",
                },
              ].map((step) => {
                const isActive = currentStep === step.id;
                const isDone = currentStep > step.id || (step.id === 2 && currentStep === 3);

                return (
                  <li
                    key={step.id}
                    className="flex items-start gap-3 relative"
                  >
                    {step.id !== 3 && (
                      <div className="absolute left-3 top-6 bottom-[-6px] w-px bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-transparent pointer-events-none" />
                    )}

                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold
                        ${
                          isDone
                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                            : isActive
                            ? "border-emerald-400/70 bg-emerald-500/10 text-emerald-200"
                            : isDark
                            ? "border-white/15 bg-black/40 text-neutral-400"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                    >
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                    </div>

                    <div className="ml-1 space-y-0.5">
                      <p
                        className={`text-[13px] font-semibold ${
                          isActive || isDone
                            ? isDark
                              ? "text-white"
                              : "text-slate-900"
                            : isDark
                            ? "text-neutral-300"
                            : "text-slate-600"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p
                        className={`text-[11px] leading-relaxed ${
                          isDark ? "text-neutral-500" : "text-slate-500"
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div
            className={[
              "relative p-5 rounded-2xl border",
              isDark
                ? "bg-gradient-to-br from-[#050b07] via-[#050505] to-[#040812] border-white/10"
                : "bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 border-slate-200 shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={[
                  "p-2 rounded-xl flex items-center justify-center",
                  isDark
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "bg-cyan-100 text-cyan-700",
                ].join(" ")}
              >
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3
                  className={[
                    "text-xs font-bold uppercase tracking-[0.22em]",
                    isDark ? "text-neutral-300" : "text-slate-700",
                  ].join(" ")}
                >
                  Recomendaciones para líderes
                </h3>
                <p
                  className={`text-[11px] ${
                    isDark ? "text-neutral-500" : "text-slate-500"
                  }`}
                >
                  Usa estas pautas para formular mejores preguntas.
                </p>
              </div>
            </div>

            <ul
              className={`space-y-3 text-sm ${
                isDark ? "text-neutral-300" : "text-slate-700"
              }`}
            >
              <li className="flex gap-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                    isDark ? "bg-cyan-400/80" : "bg-cyan-400/70"
                  }`}
                />
                <div>
                  <p className="text-[13px] font-medium">Pide ejemplos concretos.</p>
                  <p
                    className={`text-[11px] ${
                      isDark ? "text-neutral-500" : "text-slate-500"
                    }`}
                  >
                    Evita respuestas genéricas: solicita casos reales, cifras y resultados.
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                    isDark ? "bg-cyan-400/80" : "bg-cyan-400/70"
                  }`}
                />
                <div>
                  <p className="text-[13px] font-medium">
                    Explora vacíos laborales y cambios de rol.
                  </p>
                  <p
                    className={`text-[11px] ${
                      isDark ? "text-neutral-500" : "text-slate-500"
                    }`}
                  >
                    Profundiza en periodos sin docencia o transiciones poco claras.
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                    isDark ? "bg-cyan-400/80" : "bg-cyan-400/70"
                  }`}
                />
                <div>
                  <p className="text-[13px] font-medium">Refuerza la dimensión ética.</p>
                  <p
                    className={`text-[11px] ${
                      isDark ? "text-neutral-500" : "text-slate-500"
                    }`}
                  >
                    Verifica coherencia entre discurso, uso de IA y manejo de conflictos.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderIntroPanel;
