import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BrainCircuit, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import {
  getInterviewAnalysis,
  requestInterviewAnalysis,
  retryIntelligenceJob,
} from "../intelligence/intelligenceApi";
import { intelligenceUnavailableMessage } from "../vacancies/formatters";
import {
  analysisStatusLabel,
  attentionPoints,
  formatConfidence,
  isAnalysisBusy,
} from "./analysisLabels";

type Props = {
  interviewId: string;
  canRead: boolean;
  canGenerate: boolean;
  canRegenerate: boolean;
};

export function CharlaIntelligencePanel({
  interviewId,
  canRead,
  canGenerate,
  canRegenerate,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const analysis = useQuery({
    queryKey: ["charlas-interview-analysis", interviewId],
    queryFn: () => getInterviewAnalysis(interviewId),
    enabled: canRead,
    refetchInterval: (query) =>
      ["PENDING", "PROCESSING"].includes(query.state.data?.status ?? "") ||
      ["PENDING", "PROCESSING"].includes(query.state.data?.job?.status ?? "")
        ? 2500
        : false,
  });

  const busy = isAnalysisBusy(analysis.data);
  const requestAnalysis = useMutation({
    mutationFn: (force: boolean) => requestInterviewAnalysis(interviewId, force),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charlas-interview-analysis", interviewId] }),
  });
  const retryAnalysis = useMutation({
    mutationFn: retryIntelligenceJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charlas-interview-analysis", interviewId] }),
  });

  if (!canRead) return null;

  const output = analysis.data?.output;
  const strengths = (output?.strengths ?? []).slice(0, 3);
  const attention = attentionPoints(output).slice(0, 3);
  const confidenceLabel = formatConfidence(output?.confidence ?? analysis.data?.scoring?.confidence);
  const score = analysis.data?.scoring?.overallScore;
  const scoringInsufficient =
    analysis.data?.scoring?.status === "INSUFFICIENT_SCORING_CONFIGURATION";

  return (
    <section
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border p-4 md:p-5",
        isDark
          ? "border-violet-400/20 bg-violet-500/10"
          : "border-violet-200 bg-violet-50/50",
      )}
    >
      <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className={cn("flex items-center gap-2", isDark ? "text-violet-200" : "text-violet-800")}>
            <BrainCircuit className="h-5 w-5 shrink-0" />
            <h2 className="font-semibold">Análisis IA</h2>
          </div>
          <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
            Resumen de apoyo. Consulta el análisis completo para evidencias y competencias.
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-2">
          {!analysis.data && canGenerate && (
            <ActionButton
              isDark={isDark}
              loading={requestAnalysis.isPending}
              disabled={requestAnalysis.isPending}
              onClick={() => requestAnalysis.mutate(false)}
            >
              <Sparkles className="h-4 w-4" /> Solicitar análisis
            </ActionButton>
          )}
          {analysis.data?.job?.status === "FAILED" && canGenerate && (
            <ActionButton
              isDark={isDark}
              variant="secondary"
              loading={retryAnalysis.isPending}
              disabled={retryAnalysis.isPending || busy}
              onClick={() => retryAnalysis.mutate(analysis.data!.job!.id)}
            >
              <RefreshCw className="h-4 w-4" /> Reintentar
            </ActionButton>
          )}
          {analysis.data && canRegenerate && (
            <ActionButton
              isDark={isDark}
              variant="secondary"
              loading={requestAnalysis.isPending}
              disabled={busy || requestAnalysis.isPending}
              onClick={() =>
                window.confirm("¿Crear una nueva versión del análisis?") &&
                requestAnalysis.mutate(true)
              }
            >
              Regenerar análisis
            </ActionButton>
          )}
        </div>
      </div>

      {analysis.isLoading && (
        <p className={cn("mt-4 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
          Consultando análisis…
        </p>
      )}

      {busy && (
        <div
          className={cn(
            "mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
            isDark ? "bg-black/20 text-slate-200" : "bg-white text-slate-700",
          )}
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-500" />
          Análisis en curso ({analysisStatusLabel[analysis.data!.status] || "Procesando"}). Puedes
          seguir navegando.
        </div>
      )}

      {analysis.data && (
        <div className="mt-4 min-w-0 space-y-3">
          <div className="flex min-w-0 flex-wrap gap-2 text-xs">
            <Chip isDark={isDark}>{analysisStatusLabel[analysis.data.status]}</Chip>
            <Chip isDark={isDark}>
              v{analysis.data.version}
              {analysis.data.model ? ` · ${analysis.data.model}` : ""}
            </Chip>
            {score != null && (
              <Chip isDark={isDark}>Indicador de ajuste IA {score}/100</Chip>
            )}
            {scoringInsufficient && <Chip isDark={isDark}>Indicador no disponible</Chip>}
            {confidenceLabel && <Chip isDark={isDark}>Confidence {confidenceLabel}</Chip>}
          </div>

          {output && !busy && (
            <>
              <p className={cn("text-sm leading-6", isDark ? "text-slate-200" : "text-slate-700")}>
                {output.summary}
              </p>
              <div className="grid min-w-0 gap-3 md:grid-cols-2">
                <List title="Fortalezas" items={strengths} tone="green" isDark={isDark} />
                <List title="Puntos de atención" items={attention} tone="amber" isDark={isDark} />
              </div>
            </>
          )}

          {analysis.data.errorMessage && (
            <p className="text-sm text-rose-500">{intelligenceUnavailableMessage()}</p>
          )}

          <div className="pt-1">
            <Link
              to={`/interviews/${interviewId}/analysis`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
              )}
            >
              Ver análisis completo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {(requestAnalysis.isError || retryAnalysis.isError) && (
        <p className="mt-3 text-sm text-rose-500">{intelligenceUnavailableMessage()}</p>
      )}
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  loading,
  disabled,
  isDark,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  isDark: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        variant === "primary"
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
          : isDark
            ? "border border-white/10 bg-white/[0.04] text-slate-200"
            : "border border-slate-200 bg-white text-slate-700",
        (disabled || loading) && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

function Chip({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <span
      className={cn(
        "max-w-full truncate rounded-full px-2.5 py-1 font-semibold",
        isDark ? "bg-black/20 text-slate-200" : "bg-white text-slate-700",
      )}
    >
      {children}
    </span>
  );
}

function List({
  title,
  items,
  tone,
  isDark,
}: {
  title: string;
  items: string[];
  tone: "green" | "amber";
  isDark: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl p-3",
        tone === "green"
          ? isDark
            ? "bg-emerald-500/10"
            : "bg-emerald-50"
          : isDark
            ? "bg-amber-500/10"
            : "bg-amber-50",
      )}
    >
      <p className="text-xs font-bold">{title}</p>
      {items.length ? (
        <ul className={cn("mt-2 space-y-1 break-words text-xs", isDark ? "text-slate-300" : "text-slate-600")}>
          {items.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className={cn("mt-2 text-xs", isDark ? "text-slate-500" : "text-slate-500")}>Sin hallazgos.</p>
      )}
    </div>
  );
}
