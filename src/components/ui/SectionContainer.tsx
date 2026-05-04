import React from "react";
import { cn } from "../../utils/cn";

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  padded?: boolean;
}

const maxWidthStyles: Record<string, string> = {
  sm: "max-w-4xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export const SectionContainer = React.forwardRef<
  HTMLDivElement,
  SectionContainerProps
>(
  (
    { maxWidth = "lg", padded = true, className, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto",
          maxWidthStyles[maxWidth],
          padded && "px-4 sm:px-6 lg:px-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SectionContainer.displayName = "SectionContainer";
