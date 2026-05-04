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
      <div className="flex flex-col gap-3 group">
        <label
          htmlFor={name}
          className={`text-xs font-bold uppercase tracking-[0.14em] ml-1 transition-colors duration-300 group-focus-within:text-emerald-500 ${
            isDark ? "text-gray-100" : "text-slate-700"
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
