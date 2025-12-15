// src/pages/admin/components/AdminEvaluationsPanel.tsx
import React from "react";
import { Search, Users } from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../types";
import TeacherEvaluationItem from "../../../components/TeacherEvaluationItem";

export default function AdminEvaluationsPanel(props: {
  filteredEvaluations: TeacherEvaluationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { filteredEvaluations, selectedId, onSelect } = props;

  return (
    <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[680px]">
      <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex justify-between items-center">
        <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
          <Users size={16} className="text-cyan-400" />
          Evaluaciones
        </h3>
        <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-neutral-400 border border-white/5">
          {filteredEvaluations.length} registros
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a]/50">
        {filteredEvaluations.length > 0 ? (
          filteredEvaluations.map((ev) => (
            <div
              key={ev.id}
              className={`transform transition-all hover:scale-[1.01] ${
                selectedId === ev.id ? "ring-1 ring-emerald-500/40 rounded-2xl" : ""
              }`}
              onClick={() => onSelect(ev.id)}
            >
              <TeacherEvaluationItem evaluation={ev} selected={selectedId === ev.id} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600 gap-4">
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
