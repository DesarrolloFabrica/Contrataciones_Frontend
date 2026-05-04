import React from "react";
import { cn } from "../../utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-emerald-500/15 text-emerald-600 border-emerald-500/25 dark:text-emerald-300 dark:border-emerald-500/40",
  success:
    "bg-green-500/15 text-green-600 border-green-500/25 dark:text-green-300 dark:border-green-500/40",
  warning:
    "bg-amber-500/15 text-amber-600 border-amber-500/25 dark:text-amber-300 dark:border-amber-500/40",
  danger:
    "bg-red-500/15 text-red-600 border-red-500/25 dark:text-red-300 dark:border-red-500/40",
  info:
    "bg-cyan-500/15 text-cyan-600 border-cyan-500/25 dark:text-cyan-300 dark:border-cyan-500/40",
  neutral:
    "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-white/10 dark:text-neutral-300 dark:border-white/15",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-colors",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
