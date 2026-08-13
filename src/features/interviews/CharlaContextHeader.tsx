import { MessageSquareText } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import { formatDate } from "../vacancies/formatters";
import { computeCharlaProgress } from "./dynamicWizardSteps";
import type { SelectionInterview } from "./types";
import { interviewStatusLabel } from "./types";
import type { AutosaveStatus } from "./hooks/useCharlaAutosave";

type Props = {
  interview: SelectionInterview;
  answers: Record<string, unknown>;
  autosaveStatus: AutosaveStatus;
  sectionLabel?: string | null;
};

export function CharlaContextHeader({ interview, answers, autosaveStatus, sectionLabel }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const vacancy = interview.application.selectionProcess.vacancyReference;
  const progress = computeCharlaProgress(interview, answers);

  const saveLabel =
    autosaveStatus === "saving"
      ? "Guardando…"
      : autosaveStatus === "saved"
        ? "Guardado"
        : autosaveStatus === "error"
          ? "Error al guardar"
          : autosaveStatus === "dirty"
            ? "Cambios pendientes"
            : null;

  return (
    <section
      className={cn(
        "relative min-w-0 overflow-hidden rounded-2xl border px-3 py-3.5 sm:px-4 md:px-5 md:py-4",
        isDark
          ? "border-white/10 bg-gradient-to-r from-[#0f1f23]/95 via-[#0d1a1e]/90 to-[#102226]/80 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.7)]"
          : "border-slate-200 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.22)]",
      )}
    >
      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
              isDark
                ? "border-emerald-400/20 bg-gradient-to-br from-emerald-500/25 to-teal-700/20 text-emerald-300"
                : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-700",
            )}
          >
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700",
                )}
              >
                {interviewStatusLabel[interview.status]}
              </span>
              <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                {interview.templateSnapshot.templateName} · v{interview.templateSnapshot.versionNumber}
              </span>
            </div>
            <h1 className={cn("mt-1.5 text-xl font-bold tracking-tight md:text-2xl", isDark ? "text-white" : "text-slate-900")}>
              {interview.application.candidate.fullName}
            </h1>
            <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
              {vacancy.positionName}
              {vacancy.areaName ? ` · ${vacancy.areaName}` : ""}
            </p>
            <p className={cn("mt-1 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
              Asignada {formatDate(interview.assignedAt)}
              {interview.completedAt ? ` · finalizada ${formatDate(interview.completedAt)}` : ""}
              {sectionLabel ? ` · ${sectionLabel}` : ""}
            </p>
          </div>
        </div>

        <div className="min-w-[180px] space-y-2">
          <div className={cn("flex justify-between text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
            <span>Progreso</span>
            <span>
              {progress.answered}/{progress.total} · {progress.percent}%
            </span>
          </div>
          <div className={cn("h-1.5 overflow-hidden rounded-full", isDark ? "bg-white/5" : "bg-slate-100")}>
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
          {progress.missingRequired > 0 && (
            <p className={cn("text-[11px]", isDark ? "text-amber-300" : "text-amber-700")}>
              {progress.missingRequired} obligatoria{progress.missingRequired === 1 ? "" : "s"} pendiente
              {progress.missingRequired === 1 ? "" : "s"}
            </p>
          )}
          {saveLabel && (
            <p
              className={cn(
                "text-[11px] font-medium",
                autosaveStatus === "error"
                  ? "text-rose-500"
                  : autosaveStatus === "saved"
                    ? "text-emerald-600 dark:text-emerald-300"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-500",
              )}
            >
              {saveLabel}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
