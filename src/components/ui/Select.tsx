import React from "react";
import { cn } from "../../utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "text-xs font-bold uppercase tracking-[0.14em]",
              "text-neutral-600 dark:text-neutral-400"
            )}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200",
            "bg-white border border-slate-200 text-slate-900",
            "focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30",
            "hover:border-slate-300",
            "dark:bg-[#07090B] dark:border-white/[0.10] dark:text-gray-200",
            "dark:focus:bg-[#0F1216] dark:focus:border-emerald-500/25 dark:focus:ring-emerald-500/20",
            "dark:hover:border-white/[0.14] dark:hover:bg-[#0C0F12]",
            props.disabled &&
              "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-[#07090B]/50",
            error &&
              "border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/50",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
