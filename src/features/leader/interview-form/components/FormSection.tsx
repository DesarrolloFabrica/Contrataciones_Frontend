import React from "react";
import { useTheme } from "../../../../context/ThemeContext";
import { SectionHeader } from "./SectionHeader";

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  step: number;
  subtitle?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = React.memo(
  ({ title, icon, step, subtitle, children }) => {
    return (
      <div className="space-y-6">
        <SectionHeader
          title={title}
          icon={icon}
          step={step}
          subtitle={subtitle}
        />
        <div className="space-y-6">{children}</div>
      </div>
    );
  }
);

export default FormSection;
