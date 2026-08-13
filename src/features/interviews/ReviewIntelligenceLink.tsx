import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import { getInterviewAnalysis } from "../intelligence/intelligenceApi";
import { isAnalysisBusy } from "./analysisLabels";

type Props = {
  interviewId: string;
};

export function ReviewIntelligenceLink({ interviewId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const analysis = useQuery({
    queryKey: ["charlas-interview-analysis", interviewId],
    queryFn: () => getInterviewAnalysis(interviewId),
    refetchInterval: (query) =>
      ["PENDING", "PROCESSING"].includes(query.state.data?.status ?? "") ||
      ["PENDING", "PROCESSING"].includes(query.state.data?.job?.status ?? "")
        ? 2500
        : false,
  });

  const busy = isAnalysisBusy(analysis.data);
  const statusLabel = !analysis.data
    ? "Sin análisis"
    : busy
      ? "Procesando"
      : analysis.data.status === "FAILED"
        ? "Fallido"
        : analysis.data.status === "COMPLETED"
          ? "Disponible"
          : analysis.data.status === "STALE"
            ? "Desactualizado"
            : "Disponible";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
        isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white",
      )}
    >
      <div className="min-w-0 flex items-center gap-2">
        <BrainCircuit
          className={cn("h-4 w-4 shrink-0", isDark ? "text-violet-300" : "text-violet-700")}
        />
        <div className="min-w-0">
          <p className={cn("text-sm font-semibold", isDark ? "text-slate-100" : "text-slate-800")}>
            Análisis IA
          </p>
          <p className={cn("text-[11px]", isDark ? "text-slate-400" : "text-slate-500")}>
            {statusLabel}
            {analysis.data?.model ? ` · ${analysis.data.model}` : ""}
          </p>
        </div>
      </div>
      <Link
        to={`/interviews/${interviewId}/analysis`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          isDark
            ? "text-emerald-300 hover:bg-emerald-500/10"
            : "text-emerald-700 hover:bg-emerald-50",
        )}
      >
        Ver análisis IA <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
