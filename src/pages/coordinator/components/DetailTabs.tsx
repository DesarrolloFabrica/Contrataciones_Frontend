import React from "react";
import { DetailTabKey } from "../types";

const TABS: Array<{ key: DetailTabKey; label: string }> = [
  { key: "DECISION", label: "Decisión" },
  { key: "AI", label: "Resumen IA" },
  { key: "AUDIT", label: "Actividad" },
  { key: "TECH", label: "Detalle técnico (IA)" },
];

type Props = {
  value: DetailTabKey;
  onChange: (k: DetailTabKey) => void;
};

const DetailTabs: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest ${
            value === t.key
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
              : "border-white/10 text-gray-400 hover:border-emerald-500/40"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default DetailTabs;
