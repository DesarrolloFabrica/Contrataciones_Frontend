import React from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import type { CoordinatorCriteria, CoordinatorCriteriaKey } from "../types";

type Props = {
  notes: string;
  setNotes: (v: string) => void;
  criteria: CoordinatorCriteria;
  setCriteria: (next: CoordinatorCriteria) => void;
};

const CRITERIA: Array<{ k: CoordinatorCriteriaKey; label: string; hint: string }> = [
  { k: "docs_ok", label: "Documentación completa", hint: "CV, certificados, soporte de experiencia." },
  { k: "profile_fit", label: "Perfil alineado al programa", hint: "Ajuste real a necesidades académicas." },
  { k: "risk_ok", label: "Riesgos controlados", hint: "Sin banderas rojas críticas en el análisis." },
  { k: "communication_ok", label: "Comunicación / claridad", hint: "Respuestas coherentes en entrevista." },
];

export default function NotesTab({ notes, setNotes, criteria, setCriteria }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const toggle = (key: CoordinatorCriteriaKey) => setCriteria({ ...criteria, [key]: !criteria[key] });
  const checkedCount = Object.values(criteria).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-4 ${isDark ? "bg-[#091d22] border-[#579689]/20" : "bg-white border-slate-200 shadow-sm"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${isDark ? "bg-[#102a30] border-[#579689]/22" : "bg-brand-50 border-brand-200"}`}>
              <ClipboardList className={`h-5 w-5 ${isDark ? "text-[#72c4ae]" : "text-brand-700"}`} />
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Notas del coordinador
              </p>
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Deja trazabilidad clara para el administrador mediante criterios y una nota breve.
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${isDark ? "bg-[#58bea1]/10 text-[#72c4ae]" : "bg-brand-50 text-brand-700"}`}>
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {checkedCount}/{CRITERIA.length} criterios
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {CRITERIA.map((item) => {
            const active = !!criteria[item.k];
            return (
              <button
                key={item.k}
                type="button"
                onClick={() => toggle(item.k)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? isDark
                      ? "border-[#58bea1]/35 bg-[#58bea1]/10"
                      : "border-brand-300 bg-brand-50"
                    : isDark
                      ? "border-[#579689]/18 bg-[#0d252b] hover:bg-[#102a30]"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{item.label}</div>
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? "border-[#58bea1]/40 bg-[#58bea1]/16" : isDark ? "border-[#579689]/28 bg-[#102a30]" : "border-slate-300 bg-white"}`}>
                    {active && <div className="h-2 w-2 rounded-full bg-[#58bea1]" />}
                  </div>
                </div>
                <div className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.hint}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-1">
          <label className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Nota breve
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Ej: Recomendado para contratación por horas. Fortalezas, riesgos y disponibilidad."
            className={`w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none transition ${isDark ? "bg-[#0a2025] border-[#579689]/20 text-slate-200 placeholder:text-slate-500 focus:border-[#58bea1]/40" : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-brand-500"}`}
          />
        </div>
      </div>
    </div>
  );
}
