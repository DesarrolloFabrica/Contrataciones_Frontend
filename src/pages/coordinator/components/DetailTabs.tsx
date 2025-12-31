import React, { useMemo } from "react";
import { FileText, BrainCircuit, NotebookPen } from "lucide-react";
import type { DetailTabKey } from "../types";

type Props = {
  value: DetailTabKey;
  onChange: (v: DetailTabKey) => void;
};

const tabBtn = (active: boolean) =>
  `px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors flex items-center gap-2 ${
    active
      ? "bg-emerald-600 text-white border-emerald-500/40"
      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
  }`;

export default function DetailTabs({ value, onChange }: Props) {
  const tabs = useMemo(
    () => [
      { id: "AI" as const, label: "Resumen IA", Icon: BrainCircuit },
      { id: "INTERVIEWS" as const, label: "Entrevistas", Icon: NotebookPen },
      { id: "NOTES" as const, label: "Notas", Icon: NotebookPen },
      { id: "DECISION" as const, label: "Decisión", Icon: FileText },
    ],
    []
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
      {(tabs ?? []).map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            className={tabBtn(active)}
            onClick={() => onChange(t.id)}
          >
            <t.Icon className="w-4 h-4" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
