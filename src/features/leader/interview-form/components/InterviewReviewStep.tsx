import React from "react";
import type { InterviewData } from "../../../../types";
import type {
  CandidateDocumentsDraft,
  HiringContextDraft,
} from "../types";
import { useTheme } from "../../../../context/ThemeContext";

interface InterviewReviewStepProps {
  formData: InterviewData;
  hiringContext: HiringContextDraft;
  candidateDocuments: CandidateDocumentsDraft;
  selectedCandidateId: string | null;
}

const Item: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
    <p className="text-sm font-semibold text-slate-700">
      {value && value.trim() ? value : "-"}
    </p>
  </div>
);

export const InterviewReviewStep: React.FC<InterviewReviewStepProps> = ({
  formData,
  hiringContext,
  candidateDocuments,
  selectedCandidateId,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const availableDocs = candidateDocuments.items.filter((x) => x.status === "Disponible").length;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className={isDark ? "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4" : "rounded-xl border border-slate-200 bg-slate-50/50 p-4"}>
          <h4 className={isDark ? "text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-300 mb-3" : "text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-700 mb-3"}>Contexto</h4>
          <div className="space-y-3">
            <Item label="Rol objetivo" value={hiringContext.targetRole} />
            <Item label="Tipo de proceso" value={hiringContext.processType} />
            <Item label="Prioridad" value={hiringContext.priority} />
          </div>
        </div>

        <div className={isDark ? "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4" : "rounded-xl border border-slate-200 bg-slate-50/50 p-4"}>
          <h4 className={isDark ? "text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-300 mb-3" : "text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-700 mb-3"}>Candidato</h4>
          <div className="space-y-3">
            <Item label="Nombre" value={formData.candidateName} />
            <Item label="Documento" value={formData.documentNumber} />
            <Item label="Escuela / Programa" value={`${formData.school || "-"} / ${formData.program || "-"}`} />
            <Item label="Candidate ID" value={selectedCandidateId} />
          </div>
        </div>
      </div>

      <div className={isDark ? "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4" : "rounded-xl border border-slate-200 bg-slate-50/50 p-4"}>
        <h4 className={isDark ? "text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-300 mb-3" : "text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-700 mb-3"}>Checklist previo</h4>
        <div className="grid md:grid-cols-3 gap-3">
          <Item label="Docs disponibles" value={`${availableDocs} de ${candidateDocuments.items.length}`} />
          <Item label="Experiencia" value={formData.previousExperience} />
          <Item label="Uso de IA" value={formData.aiToolsUsage} />
        </div>
      </div>
    </div>
  );
};

export default InterviewReviewStep;
