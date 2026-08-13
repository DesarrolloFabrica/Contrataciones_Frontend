import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";

type Props = {
  isFirstStep: boolean;
  isReviewStep: boolean;
  canExecute: boolean;
  readOnly: boolean;
  finishing?: boolean;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
  onBackToInbox: () => void;
};

export function DynamicWizardNavigation({
  isFirstStep,
  isReviewStep,
  canExecute,
  readOnly,
  finishing = false,
  onBack,
  onNext,
  onFinish,
  onBackToInbox,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const secondaryBtn = cn(
    "rounded-xl border px-4 py-2 text-sm font-medium transition",
    isDark
      ? "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/5 hover:text-white"
      : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
  );

  const primaryBtn = cn(
    "rounded-xl px-5 py-2 text-sm font-semibold text-white transition",
    "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_10px_24px_-12px_rgba(16,185,129,0.8)] hover:from-emerald-400 hover:to-emerald-500",
    finishing && "opacity-70",
  );

  return (
    <div className="flex items-center justify-between gap-3">
      {isFirstStep ? (
        <button type="button" onClick={onBackToInbox} className={secondaryBtn}>
          Volver a mis charlas
        </button>
      ) : (
        <button type="button" onClick={onBack} className={secondaryBtn}>
          Atrás
        </button>
      )}

      {readOnly || !canExecute ? (
        isReviewStep ? (
          <button type="button" onClick={onBackToInbox} className={primaryBtn}>
            Volver a mis charlas
          </button>
        ) : (
          <button type="button" onClick={onNext} className={primaryBtn}>
            Continuar
          </button>
        )
      ) : isReviewStep ? (
        <button type="button" disabled={finishing} onClick={onFinish} className={primaryBtn}>
          {finishing ? "Finalizando…" : "Finalizar charla"}
        </button>
      ) : (
        <button type="button" onClick={onNext} className={primaryBtn}>
          Continuar
        </button>
      )}
    </div>
  );
}
