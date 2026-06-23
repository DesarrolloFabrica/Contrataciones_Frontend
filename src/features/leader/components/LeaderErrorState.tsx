import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { cn } from "../../../utils/cn";

interface LeaderErrorStateProps {
  error: string;
  onRetry: () => void;
  variant?: "banner" | "card";
}

export const LeaderErrorState: React.FC<LeaderErrorStateProps> = ({
  error,
  onRetry,
  variant = "banner",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "card") {
    return (
      <div className="animate-[shake_0.5s_ease-in-out] mx-auto max-w-2xl mt-8">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-6 text-center shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
            Error en el análisis
          </h3>
          <p className={cn("mb-6", isDark ? "text-red-200/80" : "text-red-700")}>{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-4 rounded-xl border px-4 py-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-4",
        isDark
          ? "border-red-500/30 bg-red-500/10"
          : "border-red-200 bg-red-50"
      )}
      role="alert"
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div
          className={cn(
            "shrink-0 flex items-center justify-center w-9 h-9 rounded-full",
            isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-600"
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className={cn("text-sm font-semibold", isDark ? "text-red-200" : "text-red-800")}>
            Error en el análisis
          </p>
          <p className={cn("text-sm mt-0.5", isDark ? "text-red-200/80" : "text-red-700")}>{error}</p>
          <p className={cn("text-xs mt-1.5", isDark ? "text-slate-400" : "text-slate-500")}>
            Tus datos del formulario se conservan. Corrige el problema y vuelve a intentar desde el paso actual.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          "shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
          isDark
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        )}
      >
        Intentar nuevamente
      </button>
    </div>
  );
};

export default LeaderErrorState;
