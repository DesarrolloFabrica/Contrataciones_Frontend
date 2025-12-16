// src/pages/admin/components/evaluations/AdminEvaluationsPanel.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { Search, Users } from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../../types";
import TeacherEvaluationItem from "../../../../components/TeacherEvaluationItem";

export default function AdminEvaluationsPanel(props: {
  filteredEvaluations: TeacherEvaluationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { filteredEvaluations, selectedId, onSelect } = props;

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!selectedId) return;
    const el = rowRefs.current[selectedId];
    if (!el) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  const countLabel = useMemo(() => {
    const n = filteredEvaluations.length;
    return `${n} ${n === 1 ? "registro" : "registros"}`;
  }, [filteredEvaluations.length]);

  return (
    <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex justify-between items-center">
        <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
          <Users size={16} className="text-cyan-400" />
          Evaluaciones
        </h3>
        <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-neutral-400 border border-white/5">
          {countLabel}
        </span>
      </div>

      {/* ✅ SIN overflow interno */}
      <div className="p-4 space-y-3">
        {filteredEvaluations.length > 0 ? (
          filteredEvaluations.map((ev) => {
            const isSelected = selectedId === ev.id;
            return (
              <div
                key={ev.id}
                ref={(node) => {
                  rowRefs.current[ev.id] = node;
                }}
                className={[
                  "rounded-2xl transition-all cursor-pointer select-none",
                  "hover:bg-white/[0.02]",
                  isSelected ? "ring-1 ring-emerald-500/40" : "ring-0",
                ].join(" ")}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onSelect(ev.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(ev.id);
                  }
                }}
              >
                <TeacherEvaluationItem evaluation={ev} selected={isSelected} />
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-600 gap-4 text-center px-6 py-10">
            <div className="p-4 bg-white/5 rounded-full">
              <Search size={32} className="opacity-50" />
            </div>
            <p className="text-sm">No se encontraron evaluaciones con los filtros actuales.</p>
          </div>
        )}
      </div>
    </div>
  );
}
