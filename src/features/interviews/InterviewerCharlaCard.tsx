import { ArrowRight, CalendarClock, CheckCircle2, CircleDot, MessageSquareText } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import { formatDate } from "../vacancies/formatters";
import {
  interviewActionLabel,
  interviewProgress,
  relevantInterviewDate,
} from "./interviewInboxGroups";
import { interviewStatusLabel, type InterviewStatus, type SelectionInterview } from "./types";

type Props = {
  interview: SelectionInterview;
  onOpen: () => void;
};

export function InterviewerCharlaCard({ interview, onOpen }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const progress = interview.status === "IN_PROGRESS" ? interviewProgress(interview) : null;
  const dateInfo = relevantInterviewDate(interview);
  const action = interviewActionLabel(interview.status);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group w-full rounded-2xl border p-5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        isDark
          ? "border-white/10 bg-gradient-to-b from-[#122226] via-[#0e1c20] to-[#0b171b] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.75)] hover:border-emerald-400/20"
          : "border-slate-200 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.22)] hover:border-emerald-200 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <StatusIcon status={interview.status} isDark={isDark} />
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            isDark ? "bg-white/[0.06] text-slate-300" : "bg-slate-100 text-slate-600",
          )}
        >
          {interviewStatusLabel[interview.status]}
        </span>
      </div>

      <h2 className={cn("mt-4 text-base font-semibold", isDark ? "text-white" : "text-slate-900")}>
        {interview.application.candidate.fullName}
      </h2>
      <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
        {interview.application.selectionProcess.vacancyReference.positionName}
      </p>
      {interview.application.selectionProcess.vacancyReference.areaName ? (
        <p className={cn("mt-2 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
          {interview.application.selectionProcess.vacancyReference.areaName}
        </p>
      ) : null}

      {progress && (
        <div className="mt-4">
          <div className={cn("flex justify-between text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
            <span>Progreso</span>
            <span>
              {progress.answered}/{progress.total} · {progress.percent}%
            </span>
          </div>
          <div className={cn("mt-2 h-1.5 overflow-hidden rounded-full", isDark ? "bg-white/5" : "bg-slate-100")}>
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}

      <div
        className={cn(
          "mt-4 flex items-center justify-between gap-3 border-t pt-4 text-xs",
          isDark ? "border-white/5 text-slate-400" : "border-slate-100 text-slate-400",
        )}
      >
        <span>
          {dateInfo.label} {formatDate(dateInfo.value)}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-300">
          {action}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

function StatusIcon({ status, isDark }: { status: InterviewStatus; isDark: boolean }) {
  const base = "flex h-10 w-10 items-center justify-center rounded-xl border";
  if (status === "COMPLETED") {
    return (
      <span className={cn(base, isDark ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
        <CheckCircle2 className="h-5 w-5" />
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className={cn(base, isDark ? "border-sky-400/20 bg-sky-500/10 text-sky-300" : "border-sky-200 bg-sky-50 text-sky-700")}>
        <CircleDot className="h-5 w-5" />
      </span>
    );
  }
  if (status === "ASSIGNED") {
    return (
      <span className={cn(base, isDark ? "border-amber-400/20 bg-amber-500/10 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-700")}>
        <CalendarClock className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className={cn(base, isDark ? "border-white/10 bg-white/[0.04] text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500")}>
      <MessageSquareText className="h-5 w-5" />
    </span>
  );
}
