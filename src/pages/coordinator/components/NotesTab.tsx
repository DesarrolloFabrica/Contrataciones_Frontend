import React from "react";
import { ClipboardList, CheckCircle2 } from "lucide-react";
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
  const toggle = (k: CoordinatorCriteriaKey) =>
    setCriteria({ ...criteria, [k]: !criteria[k] });

  const checkedCount = Object.values(criteria).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="bg-[#090909] border border-white/10 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-emerald-300" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-widest text-gray-500">
                Notas del coordinador
              </p>
              <p className="text-sm text-gray-300">
                Se deja trazabilidad clara y rápida para el admin (criterios + nota breve).
              </p>
            </div>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {checkedCount}/{CRITERIA.length} criterios
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {CRITERIA.map((c) => {
            const active = !!criteria[c.k];
            return (
              <button
                key={c.k}
                type="button"
                onClick={() => toggle(c.k)}
                className={`text-left rounded-2xl border px-4 py-3 transition ${
                  active
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-white/10 bg-black/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">{c.label}</div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      active
                        ? "border-emerald-500/40 bg-emerald-500/20"
                        : "border-white/15 bg-white/5"
                    }`}
                  >
                    {active && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{c.hint}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-1">
          <label className="text-[11px] uppercase tracking-widest text-gray-500">
            Nota breve (lo importante)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Ej: Recomendado para contratación por horas. Fortalezas: experiencia, claridad. Riesgo: disponibilidad limitada."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
