import React, { useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full max-w-2xl mx-4 rounded-3xl border overflow-hidden",
          "bg-white border-slate-200 shadow-[0_30px_120px_rgba(15,23,42,0.35)]",
          "dark:bg-[#050505] dark:border-white/10 dark:shadow-[0_30px_120px_rgba(0,0,0,0.9)]",
          "animate-[fadeInUp_200ms_ease-out]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="p-6 md:p-8 pb-0 space-y-2">
            {title && (
              <h2
                className={cn(
                  "text-lg font-semibold",
                  "text-neutral-900 dark:text-white"
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn(
                  "text-sm",
                  "text-neutral-500 dark:text-neutral-400"
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}

        <div className="p-6 md:p-8">{children}</div>

        {footer && (
          <div
            className={cn(
              "px-6 md:px-8 py-4 flex items-center justify-end gap-3 border-t",
              "border-slate-100 dark:border-white/5"
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.displayName = "Modal";
