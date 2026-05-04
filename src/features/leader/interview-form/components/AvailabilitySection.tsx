import React from "react";
import { Clock } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { TextInput } from "./TextInput";
import { SelectInput } from "./SelectInput";
import { TextArea } from "./TextArea";
import type { InterviewFormChangeHandler } from "../types";
import type { InterviewData } from "../../../../types";

interface AvailabilitySectionProps {
  formData: Pick<InterviewData, "availabilityDetails" | "acceptsCommittees" | "otherJobs">;
  onChange: InterviewFormChangeHandler;
}

export const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <FormSection
      title="Disponibilidad y Compromiso"
      icon={<Clock className="w-6 h-6" />}
      step={2}
      subtitle="Define la compatibilidad horaria y los posibles conflictos de interés."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <FormField
            label="Horario Disponible"
            name="availabilityDetails"
          >
            <TextInput
              name="availabilityDetails"
              value={formData.availabilityDetails}
              onChange={onChange}
              placeholder="Ej. Lunes a Viernes (18:00 - 22:00)"
            />
          </FormField>
        </div>

        <div className="md:col-span-1">
          <FormField
            label="Disposición a Comités"
            name="acceptsCommittees"
          >
            <SelectInput
              name="acceptsCommittees"
              value={formData.acceptsCommittees}
              onChange={onChange}
              options={[
                { value: "Sí", label: "Totalmente disponible" },
                { value: "No", label: "No disponible" },
                { value: "Depende", label: "Condicionado" },
              ]}
            />
          </FormField>
        </div>
      </div>

      <FormField
        label="Conflictos de Interés / Otros Empleos"
        name="otherJobs"
      >
        <TextArea
          name="otherJobs"
          value={formData.otherJobs}
          onChange={onChange}
          rows={2}
          placeholder="Detalle otros compromisos laborales actuales..."
        />
      </FormField>
    </FormSection>
  );
};

export default AvailabilitySection;
