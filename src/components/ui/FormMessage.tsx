import React from "react";
import { cn } from "../../utils/cn";

type FormMessageVariant = "error" | "success" | "info";

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: FormMessageVariant;
}

const variantStyles: Record<FormMessageVariant, string> = {
  error:
    "text-red-600 dark:text-red-400",
  success:
    "text-emerald-600 dark:text-emerald-400",
  info:
    "text-neutral-500 dark:text-neutral-400",
};

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  FormMessageProps
>(({ variant = "error", className, children, ...props }, ref) => {
  if (!children) return null;

  return (
    <p
      ref={ref}
      className={cn(
        "text-xs leading-relaxed",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

FormMessage.displayName = "FormMessage";
