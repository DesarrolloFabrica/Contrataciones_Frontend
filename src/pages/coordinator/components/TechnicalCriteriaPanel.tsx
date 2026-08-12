import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import type { CoordinatorCriteria, CoordinatorCriteriaKey } from "../types";

interface TechnicalCriteriaPanelProps {
  criteria: CoordinatorCriteria;
  setCriteria: (next: CoordinatorCriteria) => void;
  compact?: boolean;
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
  compact = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const checkedCount = Object.values(criteria).filter(Boolean).length;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          2. Criterios técnicos
        </span>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${
            checkedCount >= 2
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : isDark
                ? "border-white/10 text-slate-500"
                : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          {checkedCount}/{CRITERIA_DEFINITIONS.length}
        </span>
      </div>

      <div className={compact ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "space-y-2.5"}>
        {CRITERIA_DEFINITIONS.map((c) => {
          const active = !!criteria[c.key];
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCriteria({ ...criteria, [c.key]: !active })}
              className={`group flex w-full items-start gap-2.5 rounded-lg border text-left transition-all ${
                compact ? "p-2" : "gap-3 rounded-xl p-3.5"
              } ${
                active
                  ? isDark
                    ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                    : "border-emerald-200 bg-emerald-50"
                  : isDark
                    ? "border-white/[0.06] bg-[#07171c]/55 hover:bg-white/[0.04]"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div
                className={`mt-0.5 flex items-center justify-center rounded border shadow-sm transition-all ${
                  compact ? "h-4 w-4" : "h-5 w-5"
                } ${
                  active
                    ? "border-emerald-500 bg-emerald-500"
                    : isDark
                      ? "border-slate-600 bg-transparent"
                      : "border-slate-300 bg-white"
                }`}
              >
                {active && <CheckCircle2 className={compact ? "h-3 w-3 text-white" : "h-3.5 w-3.5 text-white"} />}
              </div>
              <div className="min-w-0">
                <div
                  className={`font-semibold transition-colors ${compact ? "text-xs" : "text-sm"} ${
                    active
                      ? isDark
                        ? "text-emerald-100"
                        : "text-emerald-800"
                      : isDark
                        ? "text-slate-400 group-hover:text-slate-200"
                        : "text-slate-700"
                  }`}
                >
                  {c.label}
                </div>
                <div
                  className={`mt-0.5 ${compact ? "text-[10px] leading-4" : "text-xs"} ${
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
