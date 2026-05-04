import React from "react";
import { Users } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { TextArea } from "./TextArea";
import type { InterviewFormChangeHandler } from "../types";
import type { InterviewData } from "../../../../types";

interface PedagogySectionProps {
  formData: Pick<InterviewData, "evaluationMethodology" | "failureRatePlan" | "apatheticStudentPlan">;
  onChange: InterviewFormChangeHandler;
}

export const PedagogySection: React.FC<PedagogySectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <FormSection
      title="Estrategia Pedagógica"
      icon={<Users className="w-6 h-6" />}
      step={3}
      subtitle="Explora cómo el candidato enseña, evalúa y maneja retos en el aula."
    >
      <FormField
        label="Metodología de Evaluación"
        name="evaluationMethodology"
      >
        <TextArea
          name="evaluationMethodology"
          value={formData.evaluationMethodology}
          onChange={onChange}
          placeholder="Describa instrumentos, rúbricas y criterios de evaluación..."
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField
          label="Plan de Retención (Alto Fracaso)"
          name="failureRatePlan"
        >
          <TextArea
            name="failureRatePlan"
            value={formData.failureRatePlan}
            onChange={onChange}
            placeholder="Estrategia ante un 50% de reprobación..."
          />
        </FormField>
        <FormField
          label="Manejo de Estudiantes Difíciles"
          name="apatheticStudentPlan"
        >
          <TextArea
            name="apatheticStudentPlan"
            value={formData.apatheticStudentPlan}
            onChange={onChange}
            placeholder="Caso: Estudiante brillante pero apático..."
          />
        </FormField>
      </div>
    </FormSection>
  );
};

export default PedagogySection;
