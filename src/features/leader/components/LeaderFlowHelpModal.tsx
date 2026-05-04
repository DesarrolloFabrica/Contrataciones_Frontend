import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

interface LeaderFlowHelpModalProps {
  onClose: () => void;
}

export const LeaderFlowHelpModal: React.FC<LeaderFlowHelpModalProps> = ({
  onClose,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={[
          "relative w-full max-w-2xl mx-4 rounded-3xl border shadow-[0_30px_120px_rgba(0,0,0,0.9)] overflow-hidden",
          isDark
            ? "border-white/10 bg-[#050505]"
            : "border-slate-200 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent",
            !isDark ? "opacity-70" : "",
          ].join(" ")}
        />

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div
                className={[
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-[0.18em]",
                  isDark
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-200"
                    : "bg-cyan-50 border-cyan-400/40 text-cyan-700",
                ].join(" ")}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Guía para el líder</span>
              </div>
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Cómo usar este panel de evaluación
              </h3>
              <p
                className={`text-sm ${
                  isDark ? "text-neutral-400" : "text-slate-600"
                }`}
              >
                Esta vista está pensada para que registres evaluaciones trazables de
                cada docente y generes evidencia clara para quienes toman la decisión final,
                combinando tu criterio con la analítica de IA.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full border transition",
                isDark
                  ? "border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700",
              ].join(" ")}
              aria-label="Cerrar guía rápida"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={[
                "rounded-2xl p-4 space-y-2 border",
                isDark
                  ? "bg-white/[0.02] border-white/10"
                  : "bg-slate-50 border-slate-200",
              ].join(" ")}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                  isDark ? "text-neutral-400" : "text-slate-500"
                }`}
              >
                Paso 1 · Captura
              </p>
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Registra el contexto completo del docente.
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? "text-neutral-400" : "text-slate-600"
                }`}
              >
                Entre más detalladas sean las respuestas, más preciso será el
                análisis. Evita copiar textos genéricos de hojas de vida.
              </p>
            </div>

            <div
              className={[
                "rounded-2xl p-4 space-y-2 border",
                isDark
                  ? "bg-white/[0.02] border-white/10"
                  : "bg-slate-50 border-slate-200",
              ].join(" ")}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                  isDark ? "text-neutral-400" : "text-slate-500"
                }`}
              >
                Paso 2 · Análisis IA
              </p>
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Interpreta el resumen ejecutivo y los riesgos.
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? "text-neutral-400" : "text-slate-600"
                }`}
              >
                Revisa el veredicto, las alertas y las recomendaciones antes de
                decidir. Usa el PDF como soporte formal de la entrevista.
              </p>
            </div>

            <div
              className={[
                "rounded-2xl p-4 space-y-2 border",
                isDark
                  ? "bg-white/[0.02] border-white/10"
                  : "bg-slate-50 border-slate-200",
              ].join(" ")}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                  isDark ? "text-neutral-400" : "text-slate-500"
                }`}
              >
                Paso 3 · Reporte
              </p>
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Genera y comparte el reporte oficial.
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? "text-neutral-400" : "text-slate-600"
                }`}
              >
                Descarga el PDF y compártelo con el comité o con las personas
                responsables de tomar la decisión institucional sobre el docente.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
            <div
              className={`flex items-center gap-2 text-[11px] ${
                isDark ? "text-neutral-500" : "text-slate-500"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Recuerda: la IA es un apoyo, la decisión siempre es humana.
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-white text-[11px] font-bold uppercase tracking-[0.22em] hover:brightness-110 transition"
            >
              Entendido, continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderFlowHelpModal;
