import React from "react";
import { FileText } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { FormSection } from "./FormSection";
import { DocumentRequirementCard } from "./DocumentRequirementCard";
import type { CandidateDocumentsDraft, CandidateDocumentDraft } from "../types";

interface CandidateDocumentsSectionProps {
  candidateDocuments: CandidateDocumentsDraft;
  onChange: (updated: CandidateDocumentsDraft) => void;
}

export const CandidateDocumentsSection: React.FC<CandidateDocumentsSectionProps> = ({
  candidateDocuments,
  onChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleItemChange = (updatedItem: CandidateDocumentDraft) => {
    const nextItems = candidateDocuments.items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item,
    );
    onChange({ items: nextItems });
  };

  return (
    <FormSection
      title="Repositorio documental del candidato"
      icon={<FileText className="w-6 h-6" />}
      step={-1}
      subtitle="Registra qué documentos tiene disponibles el candidato. Sin carga de archivos por ahora."
    >
      <div className="grid grid-cols-1 gap-5">
        {candidateDocuments.items.map((item) => (
          <DocumentRequirementCard
            key={item.id}
            item={item}
            onChange={handleItemChange}
          />
        ))}
      </div>

      <div
        className={[
          "rounded-2xl border px-5 py-4 text-xs leading-relaxed",
          isDark
            ? "bg-cyan-500/5 border-cyan-500/15 text-cyan-300/70"
            : "bg-cyan-50 border-cyan-200 text-cyan-700",
        ].join(" ")}
      >
        Esta sección prepara la trazabilidad documental. La carga real de
        archivos se conectará al backend en una fase posterior.
      </div>
    </FormSection>
  );
};

export default CandidateDocumentsSection;
