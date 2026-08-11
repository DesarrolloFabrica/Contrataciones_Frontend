import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

interface FormFieldProps {
  label: string;
  name: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = React.memo(
  ({ label, name, children }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={name}
          className={`text-sm font-medium ${
            isDark ? "text-slate-200" : "text-slate-700"
          }`}
        >
          {label}
        </label>
        {children}
      </div>
    );
  }
);

export default FormField;
