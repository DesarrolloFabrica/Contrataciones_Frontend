import React from "react";
import { useTheme } from "../../../../context/ThemeContext";
import { darkInputStyles, lightInputStyles } from "../constants";

interface TextInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  disabled = false,
  inputMode,
  pattern,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={isDark ? darkInputStyles : lightInputStyles}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      autoComplete="off"
      inputMode={inputMode}
      pattern={pattern}
    />
  );
};

export default TextInput;
