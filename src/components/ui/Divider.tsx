import React from "react";
import { cn } from "../../utils/cn";

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = "horizontal", className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "border-slate-200 dark:border-white/10",
          orientation === "horizontal"
            ? "w-full border-t"
            : "h-full border-l",
          className
        )}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";
