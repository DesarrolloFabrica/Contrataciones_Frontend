import React, { useEffect, useRef } from "react";
import { useTheme } from "../../../../context/ThemeContext";
import { darkInputStyles, lightInputStyles } from "../constants";

interface TextAreaProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  name,
  value,
  onChange,
  rows = 3,
  placeholder,
  disabled = false,
}) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`${
        isDark ? darkInputStyles : lightInputStyles
      } resize-none leading-relaxed overflow-hidden min-h-[80px]`}
      placeholder={placeholder}
      disabled={disabled}
      required
    />
  );
};

export default TextArea;
