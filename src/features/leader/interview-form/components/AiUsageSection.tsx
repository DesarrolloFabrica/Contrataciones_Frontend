import React from "react";
import { Bot } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { TextArea } from "./TextArea";
import type { InterviewFormChangeHandler } from "../types";
import type { InterviewData } from "../../../../types";

interface AiUsageSectionProps {
  formData: Pick<InterviewData, "aiToolsUsage" | "ethicalAiMeasures" | "aiPlagiarismPrevention">;
  onChange: InterviewFormChangeHandler;
}

export const AiUsageSection: React.FC<AiUsageSectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <FormSection
      title="Integración de Inteligencia Artificial"
      icon={<Bot className="w-6 h-6" />}
      step={4}
      subtitle="Analiza su relación con la IA y las medidas éticas que aplica."
    >
      <FormField
        label="Uso Actual de Herramientas IA"
        name="aiToolsUsage"
      >
        <TextArea
          name="aiToolsUsage"
          value={formData.aiToolsUsage}
          onChange={onChange}
          rows={2}
          placeholder="Herramientas utilizadas (ChatGPT, Midjourney, etc.) y su aplicación..."
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Ética y IA en el Aula" name="ethicalAiMeasures">
          <TextArea
            name="ethicalAiMeasures"
            value={formData.ethicalAiMeasures}
            onChange={onChange}
            placeholder="¿Cómo fomenta el uso responsable?"
          />
        </FormField>
        <FormField
          label="Detección y Manejo de Plagio IA"
          name="aiPlagiarismPrevention"
        >
          <TextArea
            name="aiPlagiarismPrevention"
            value={formData.aiPlagiarismPrevention}
            onChange={onChange}
            placeholder="Protocolos de verificación académica..."
          />
        </FormField>
      </div>
    </FormSection>
  );
};

export default AiUsageSection;
