import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import { apiErrorMessage } from "../vacancies/formatters";
import { InterviewerCharlaCard } from "./InterviewerCharlaCard";
import { getInterviews } from "./interviewsApi";
import {
  groupInterviewsByWorkTab,
  type InterviewerWorkTab,
} from "./interviewInboxGroups";

type Props = {
  /** Mis charlas → tabs de trabajo; Historial → enfocadas en completadas */
  mode?: "inbox" | "history";
  onCountsChange?: (counts: { pending: number; inProgress: number; completed: number }) => void;
};

const TABS: Array<{ value: InterviewerWorkTab; label: string }> = [
  { value: "PENDING", label: "Pendientes" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "COMPLETED", label: "Completadas" },
];

export function InterviewerInbox({ mode = "inbox", onCountsChange }: Props) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tab, setTab] = useState<InterviewerWorkTab>(mode === "history" ? "COMPLETED" : "PENDING");

  useEffect(() => {
    setTab(mode === "history" ? "COMPLETED" : "PENDING");
  }, [mode]);

  const interviews = useQuery({
    queryKey: ["charlas-interviews"],
    queryFn: () => getInterviews(),
  });

  const groups = useMemo(() => groupInterviewsByWorkTab(interviews.data), [interviews.data]);

  useEffect(() => {
    onCountsChange?.({
      pending: groups.PENDING.length,
      inProgress: groups.IN_PROGRESS.length,
      completed: groups.COMPLETED.length,
    });
  }, [groups.PENDING.length, groups.IN_PROGRESS.length, groups.COMPLETED.length, onCountsChange]);

  const visibleTabs = mode === "history" ? TABS.filter((item) => item.value === "COMPLETED") : TABS;
  const items = groups[tab];
  const emptyTitle =
    interviews.data && interviews.data.length === 0
      ? "No tienes charlas asignadas actualmente."
      : tab === "PENDING"
        ? "No tienes charlas pendientes."
        : tab === "IN_PROGRESS"
          ? "No tienes charlas en progreso."
          : "No tienes charlas completadas.";

  return (
    <div className="space-y-4">
      {mode === "inbox" && (
        <nav
          className={cn(
            "flex gap-1 overflow-x-auto rounded-2xl border p-1.5",
            isDark
              ? "border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              : "border-slate-200/90 bg-slate-100/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
          )}
          aria-label="Estados de mis charlas"
        >
          {visibleTabs.map((item) => {
            const active = tab === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setTab(item.value)}
                className={cn(
                  "relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 md:flex-none md:min-w-[140px]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                  active
                    ? "text-white"
                    : isDark
                      ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                      : "text-slate-500 hover:bg-white/80 hover:text-slate-800",
                )}
              >
                {active && (
                  <span
                    className={cn(
                      "absolute inset-0 rounded-xl",
                      isDark
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.65)]"
                        : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_8px_18px_-8px_rgba(16,185,129,0.55)]",
                    )}
                  />
                )}
                <span className="relative">
                  {item.label} ({groups[item.value].length})
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {interviews.isLoading && (
        <StatePanel isDark={isDark}>
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <p className={cn("mt-3 text-sm font-medium", isDark ? "text-slate-300" : "text-slate-600")}>
            Cargando tus charlas…
          </p>
        </StatePanel>
      )}

      {interviews.isError && (
        <StatePanel isDark={isDark} tone="error">
          <p className={cn("text-sm font-semibold", isDark ? "text-rose-200" : "text-rose-700")}>
            No pudimos cargar tus charlas
          </p>
          <p className={cn("mt-1 text-xs", isDark ? "text-rose-200/80" : "text-rose-600")}>
            {apiErrorMessage(interviews.error)}
          </p>
        </StatePanel>
      )}

      {!interviews.isLoading && !interviews.isError && items.length === 0 && (
        <StatePanel isDark={isDark}>
          <p className={cn("text-sm font-semibold", isDark ? "text-slate-200" : "text-slate-800")}>{emptyTitle}</p>
          <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
            Este espacio se actualizará cuando te asignen nuevas charlas en un proceso.
          </p>
        </StatePanel>
      )}

      {!interviews.isLoading && !interviews.isError && items.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((interview) => (
            <InterviewerCharlaCard
              key={interview.id}
              interview={interview}
              onOpen={() => navigate(`/interviews/${interview.id}`)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function StatePanel({
  children,
  isDark,
  tone = "neutral",
}: {
  children: ReactNode;
  isDark: boolean;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border px-6 py-12 text-center",
        tone === "error"
          ? isDark
            ? "border-rose-400/20 bg-rose-500/10"
            : "border-rose-200 bg-rose-50"
          : isDark
            ? "border-white/10 bg-[#0e1c20]/80"
            : "border-slate-200 bg-slate-50",
      )}
    >
      {children}
    </div>
  );
}
