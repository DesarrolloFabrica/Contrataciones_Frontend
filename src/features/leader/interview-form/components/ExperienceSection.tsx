import React from "react";
import { FormField } from "./FormField";
import { TextArea } from "./TextArea";
import type { InterviewFormChangeHandler } from "../types";

interface ExperienceSectionProps {
  formData: {
    careerSummary: string;
    previousExperience: string;
  };
  onChange: InterviewFormChangeHandler;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <FormField label="Resumen Profesional" name="careerSummary">
        <TextArea
          name="careerSummary"
          value={formData.careerSummary}
          onChange={onChange}
          rows={4}
          placeholder="Describa la trayectoria y aspiraciones del candidato..."
        />
      </FormField>

      <FormField label="Experiencia Docente" name="previousExperience">
        <TextArea
          name="previousExperience"
          value={formData.previousExperience}
          onChange={onChange}
          rows={4}
          placeholder="Instituciones previas, materias impartidas y logros..."
        />
      </FormField>
    </div>
  );
};

export default ExperienceSection;
