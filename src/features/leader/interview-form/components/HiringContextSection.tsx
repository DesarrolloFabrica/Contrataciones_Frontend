import React from "react";
import { Briefcase } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";
import { SelectInput } from "./SelectInput";
import type { HiringContextDraft } from "../types";

interface HiringContextSectionProps {
  hiringContext: HiringContextDraft;
  onChange: (updated: HiringContextDraft) => void;
}

const processTypeOptions = [
  { value: "Facilitador", label: "Facilitador" },
  { value: "Docente", label: "Docente" },
  { value: "Administrativo", label: "Administrativo" },
  { value: "Otro", label: "Otro" },
];

const priorityOptions = [
  { value: "Alta", label: "Alta" },
  { value: "Media", label: "Media" },
  { value: "Baja", label: "Baja" },
];

export const HiringContextSection: React.FC<HiringContextSectionProps> = ({
  hiringContext,
  onChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    onChange({ ...hiringContext, [name]: value });
  };

  return (
    <FormSection
      title="Contexto de búsqueda / Perfil solicitado"
      icon={<Briefcase className="w-6 h-6" />}
      step={0}
      subtitle="Define el perfil y las condiciones de la vacante antes de evaluar al candidato."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Cargo o perfil buscado" name="targetRole">
          <TextInput
            name="targetRole"
            value={hiringContext.targetRole}
            onChange={handleFieldChange}
            placeholder="Ej. Facilitador de Matemáticas"
            required={false}
          />
        </FormField>

        <FormField label="Tipo de proceso" name="processType">
          <SelectInput
            name="processType"
            value={hiringContext.processType}
            onChange={handleFieldChange}
            options={processTypeOptions}
            placeholder="Seleccione tipo..."
          />
        </FormField>
      </div>

      <FormField label="Área solicitante" name="requestingArea">
        <TextInput
          name="requestingArea"
          value={hiringContext.requestingArea}
          onChange={handleFieldChange}
          placeholder="Ej. Coordinación Académica, Facultad de Ciencias"
          required={false}
        />
      </FormField>

      <FormField label="Descripción de la necesidad" name="needDescription">
        <TextArea
          name="needDescription"
          value={hiringContext.needDescription}
          onChange={handleFieldChange}
          rows={3}
          placeholder="Describe brevemente por qué se requiere este perfil, el contexto y las expectativas..."
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Prioridad" name="priority">
          <SelectInput
            name="priority"
            value={hiringContext.priority}
            onChange={handleFieldChange}
            options={priorityOptions}
            placeholder="Seleccione prioridad..."
          />
        </FormField>
      </div>

      <div
        className={[
          "rounded-xl border px-5 py-4 text-xs leading-relaxed",
          isDark
            ? "bg-cyan-500/5 border-cyan-500/15 text-cyan-300/70"
            : "bg-cyan-50 border-cyan-200 text-cyan-700",
        ].join(" ")}
      >
        Esta informacion prepara la trazabilidad del proceso y podra conectarse
        al backend en una fase posterior.
      </div>
    </FormSection>
  );
};

export default HiringContextSection;
