import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import type { CoordinatorCriteria, CoordinatorCriteriaKey } from "../types";

interface TechnicalCriteriaPanelProps {
  criteria: CoordinatorCriteria;
  setCriteria: (next: CoordinatorCriteria) => void;
}

const CRITERIA_DEFINITIONS: Array<{
  key: CoordinatorCriteriaKey;
  label: string;
  hint: string;
}> = [
  {
    key: "docs_ok",
    label: "Documentación completa",
    hint: "CV, certificados, soporte de experiencia.",
  },
  {
    key: "profile_fit",
    label: "Perfil alineado al programa",
    hint: "Ajuste real a necesidades académicas.",
  },
  {
    key: "risk_ok",
    label: "Riesgos controlados",
    hint: "Sin banderas rojas críticas en el análisis.",
  },
  {
    key: "communication_ok",
    label: "Comunicación / claridad",
    hint: "Respuestas coherentes en entrevista.",
  },
];

export const TechnicalCriteriaPanel: React.FC<TechnicalCriteriaPanelProps> = ({
  criteria,
  setCriteria,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const checkedCount = Object.values(criteria).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Criterios técnicos
        </span>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            checkedCount >= 2
              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              : "border-slate-700 text-slate-500"
          }`}
        >
          {checkedCount}/{CRITERIA_DEFINITIONS.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {CRITERIA_DEFINITIONS.map((c) => {
          const active = !!criteria[c.key];
          return (
            <button
              key={c.key}
              type="button"
              onClick={() =>
                setCriteria({ ...criteria, [c.key]: !active })
              }
              className={`w-full group flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                active
                  ? isDark
                    ? "bg-emerald-500/[0.05] border-emerald-500/30"
                    : "bg-emerald-50 border-emerald-200"
                  : isDark
                    ? "bg-[#13181E] border-transparent hover:bg-[#1A2026]"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 shadow-sm ${
                  active
                    ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    : isDark
                      ? "border-slate-600 bg-transparent group-hover:border-slate-500"
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                }`}
              >
                {active && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                )}
              </div>
              <div>
                <div
                  className={`text-sm font-semibold transition-colors ${
                    active
                      ? isDark
                        ? "text-emerald-100"
                        : "text-emerald-800"
                      : isDark
                        ? "text-slate-400 group-hover:text-slate-200"
                        : "text-slate-700 group-hover:text-slate-900"
                  }`}
                >
                  {c.label}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  {c.hint}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TechnicalCriteriaPanel;
