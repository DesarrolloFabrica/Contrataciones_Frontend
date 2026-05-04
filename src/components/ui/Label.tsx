import React from "react";
import { cn } from "../../utils/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-xs font-bold uppercase tracking-[0.14em]",
          "text-neutral-600 dark:text-neutral-400",
          "select-none",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-red-500 dark:text-red-400">*</span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";
