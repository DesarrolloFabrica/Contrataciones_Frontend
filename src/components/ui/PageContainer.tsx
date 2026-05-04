import React from "react";
import { cn } from "../../utils/cn";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "sm" | "md" | "lg";
}

const spacingStyles: Record<string, string> = {
  sm: "space-y-4",
  md: "space-y-6",
  lg: "space-y-10",
};

export const PageContainer = React.forwardRef<
  HTMLDivElement,
  PageContainerProps
>(({ spacing = "md", className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col w-full",
        spacingStyles[spacing],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

PageContainer.displayName = "PageContainer";
