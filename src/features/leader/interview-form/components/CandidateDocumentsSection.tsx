import React from "react";
import { FileText } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { FormSection } from "./FormSection";
import { DocumentRequirementCard } from "./DocumentRequirementCard";
import type { CandidateDocumentsDraft, CandidateDocumentDraft } from "../types";

interface CandidateDocumentsSectionProps {
  candidateDocuments: CandidateDocumentsDraft;
  onChange: (updated: CandidateDocumentsDraft) => void;
  resumeError?: string | null;
}

export const CandidateDocumentsSection: React.FC<CandidateDocumentsSectionProps> = ({
  candidateDocuments,
  onChange,
  resumeError,
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
      subtitle="Registra la hoja de vida como archivo principal y los demás soportes como links/observaciones opcionales."
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

      {resumeError && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${isDark ? "bg-red-500/10 border-red-400/30 text-red-200" : "bg-red-50 border-red-200 text-red-700"}`}>
          {resumeError}
        </div>
      )}

      <div
        className={[
          "rounded-2xl border px-5 py-4 text-xs leading-relaxed",
          isDark
            ? "bg-cyan-500/5 border-cyan-500/15 text-cyan-300/70"
            : "bg-cyan-50 border-cyan-200 text-cyan-700",
        ].join(" ")}
      >
        La hoja de vida se carga como archivo obligatorio y se registra como
        documento principal del candidato.
      </div>
    </FormSection>
  );
};

export default CandidateDocumentsSection;
