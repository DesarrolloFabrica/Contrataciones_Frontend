import React from "react";
import { ShieldCheck } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { TextArea } from "./TextArea";
import type { InterviewFormChangeHandler } from "../types";
import type { InterviewData } from "../../../../types";

interface EthicsCasesSectionProps {
  formData: Pick<InterviewData, "scenario29" | "scenarioCoverage" | "scenarioFeedback">;
  onChange: InterviewFormChangeHandler;
}

export const EthicsCasesSection: React.FC<EthicsCasesSectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <FormSection
      title="Casos Éticos y Resolución de Conflictos"
      icon={<ShieldCheck className="w-6 h-6" />}
      step={5}
      subtitle="Profundiza en su criterio frente a dilemas éticos y situaciones sensibles."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FormField label="Caso: Nota Límite (2.9)" name="scenario29">
          <TextArea
            name="scenario29"
            value={formData.scenario29}
            onChange={onChange}
            rows={5}
            placeholder="Reacción ante solicitud de ayuda para aprobar..."
          />
        </FormField>

        <FormField
          label="Caso: Ausencia Inesperada"
          name="scenarioCoverage"
        >
          <TextArea
            name="scenarioCoverage"
            value={formData.scenarioCoverage}
            onChange={onChange}
            rows={5}
            placeholder="Protocolo de comunicación y reposición..."
          />
        </FormField>

        <FormField
          label="Caso: Feedback Negativo"
          name="scenarioFeedback"
        >
          <TextArea
            name="scenarioFeedback"
            value={formData.scenarioFeedback}
            onChange={onChange}
            rows={5}
            placeholder="Manejo de críticas metodológicas..."
          />
        </FormField>
      </div>
    </FormSection>
  );
};

export default EthicsCasesSection;
