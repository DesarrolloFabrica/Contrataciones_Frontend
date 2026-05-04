import React from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { darkInputStyles, lightInputStyles } from "../constants";

interface SelectInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  name,
  value,
  onChange,
  options,
  disabled,
  placeholder,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative group/select">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`${
          isDark ? darkInputStyles : lightInputStyles
        } appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10`}
        required
        disabled={disabled}
      >
        {placeholder && (
          <option
            value=""
            disabled
            className={isDark ? "text-gray-500" : "text-slate-400"}
          >
            {placeholder}
          </option>
        )}

        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className={isDark ? "bg-[#1a1a1a] py-2" : "bg-white py-2"}
          >
            {opt.label}
          </option>
        ))}
      </select>

      <div
        className={`absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none transition-colors ${
          isDark
            ? "text-gray-600 group-focus-within/select:text-emerald-400"
            : "text-slate-400 group-focus-within/select:text-emerald-500"
        }`}
      >
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
};

export default SelectInput;
