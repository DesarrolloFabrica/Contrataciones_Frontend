import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";

type WizardStep = 1 | 2 | 3 | 4 | 5;
type ExamplePreset = "approved" | "medium" | "rejected";

type Props = {
  currentStep: WizardStep;
  onOpenHelp: () => void;
  onLoadExample: (preset: ExamplePreset) => void;
};

export function LeaderProcessRail({ currentStep, onOpenHelp, onLoadExample }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const progress = currentStep * 20;
  const today = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());

  const cardClass = `rounded-2xl border p-3.5 ${
    isDark
      ? "border-[#579689]/20 bg-[#091d22]/90 shadow-[0_20px_55px_-42px_rgba(0,4,8,0.88)] backdrop-blur-xl"
      : "border-slate-200 bg-white/90 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.24)] backdrop-blur-xl"
  }`;

  return (
    <div className="space-y-2.5">
      <section className={cardClass}>
        <p className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>Progreso del proceso</p>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${isDark ? "#43d8ae" : "#10b981"} ${progress}%, ${isDark ? "rgba(87,150,137,.14)" : "#e2e8f0"} ${progress}% 100%)`,
            }}
          >
            <div className={`flex h-[56px] w-[56px] items-center justify-center rounded-full ${isDark ? "bg-[#091d22]" : "bg-white"}`}>
              <span className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{progress}%</span>
            </div>
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>En progreso</p>
            <p className="mt-0.5 text-xs text-slate-500">Paso {currentStep} de 5</p>
            <div className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold ${isDark ? "bg-[#58bea1]/10 text-[#72c4ae]" : "bg-emerald-50 text-emerald-700"}`}>
              <Clock3 className="h-3 w-3" /> Borrador automático
            </div>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <p className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>Información del proceso</p>
        <dl className="mt-2.5 space-y-2">
          {[
            ["Fecha de creación", today],
            ["Solicitado por", user?.name ?? "Líder académico"],
            ["Estado", "Borrador"],
            ["Guardado", "Local automático"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <dt className="text-[10px] text-slate-500">{label}</dt>
              <dd className={`max-w-[145px] truncate text-right text-[10px] font-semibold ${label === "Estado" ? (isDark ? "rounded-md bg-[#58bea1]/10 px-2 py-0.5 text-[#72c4ae]" : "rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700") : isDark ? "text-slate-300" : "text-slate-700"}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={cardClass}>
        <p className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>Acciones rápidas</p>
        <button
          type="button"
          onClick={onOpenHelp}
          className={`mt-2.5 flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[11px] font-semibold transition ${isDark ? "border-[#579689]/20 bg-[#102a30] text-slate-200 hover:border-[#58bea1]/30" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"}`}
        >
          <CircleHelp className="h-4 w-4 text-[#58bea1]" /> Ver guía completa
        </button>

        <div className={`my-2.5 h-px ${isDark ? "bg-[#579689]/10" : "bg-slate-200"}`} />
        <div className="mb-1.5 flex items-center gap-2">
          <FlaskConical className="h-3.5 w-3.5 text-slate-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Datos de ejemplo</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "approved" as const, label: "Aprobado", Icon: CheckCircle2, color: "text-emerald-500" },
            { id: "medium" as const, label: "Medio", Icon: AlertCircle, color: "text-amber-500" },
            { id: "rejected" as const, label: "Riesgo", Icon: ShieldCheck, color: "text-rose-500" },
          ].map(({ id, label, Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => onLoadExample(id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-1.5 text-[9px] font-semibold transition ${isDark ? "border-[#579689]/20 bg-[#071a20] text-slate-400 hover:border-[#58bea1]/30 hover:text-slate-200" : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-slate-700"}`}
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LeaderProcessRail;
