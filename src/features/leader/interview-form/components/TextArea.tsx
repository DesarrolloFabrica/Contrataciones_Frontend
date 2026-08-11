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
  maxLength?: number;
  showCount?: boolean;
  maxHeight?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  name,
  value,
  onChange,
  rows = 3,
  placeholder,
  disabled = false,
  maxLength,
  showCount = false,
  maxHeight,
}) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    const next = maxHeight
      ? Math.min(ref.current.scrollHeight, maxHeight)
      : ref.current.scrollHeight;
    ref.current.style.height = `${next}px`;
  }, [value, maxHeight]);

  return (
    <div className="relative">
      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        className={`${
          isDark ? darkInputStyles : lightInputStyles
        } resize-none leading-relaxed ${
          maxHeight ? "overflow-y-auto min-h-[56px]" : "overflow-hidden min-h-[80px]"
        } ${showCount ? "pb-7" : ""}`}
        style={maxHeight ? { maxHeight } : undefined}
        placeholder={placeholder}
        disabled={disabled}
        required
      />
      {showCount && maxLength && (
        <span className="pointer-events-none absolute bottom-2.5 right-3 text-[10px] font-medium text-slate-500">
          {value.length} / {maxLength}
        </span>
      )}
    </div>
  );
};

export default TextArea;
