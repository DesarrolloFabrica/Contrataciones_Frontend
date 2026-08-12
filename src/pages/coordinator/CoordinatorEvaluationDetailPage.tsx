import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronRight,
  MoreHorizontal,
  History,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { actorFromUser } from "../../services/auditActor";
import { useCoordinatorEvaluations } from "./hooks/useCoordinatorEvaluations";
import { useEvaluationDetail } from "./hooks/useEvaluationDetail";
import { getTeacherEvaluationById } from "../../services/teachersService";
import { compareInterviewsWithGemini } from "../../services/geminiService";
import { useTheme } from "../../context/ThemeContext";
import { CoordinatorModeHeader } from "../../features/coordinator/components/CoordinatorModeHeader";
import { EvaluationSummaryCard } from "./components/EvaluationSummaryCard";
import { ProcessTimeline } from "./components/ProcessTimeline";
import { CandidateDecisionPanel } from "./components/CandidateDecisionPanel";
import { EvaluationComparisonPreview } from "./components/EvaluationComparisonPreview";
import { DecisionSupportSidebar } from "./components/DecisionSupportSidebar";
import { buildTimelineEvents } from "./utils/coordinatorTimeline";

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "").toUpperCase();
  const isApproved = s.includes("APROB");
  const isRejected = s.includes("RECH");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
        isApproved
          ? isDark
            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
          : isRejected
            ? isDark
              ? "border-rose-400/30 bg-rose-500/10 text-rose-300"
              : "border-rose-200 bg-rose-50 text-rose-700"
            : isDark
              ? "border-white/10 bg-white/[0.04] text-slate-400"
              : "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {isApproved ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : isRejected ? (
        <XCircle className="h-3.5 w-3.5" />
      ) : (
        <span className="h-2 w-2 rounded-full bg-slate-400" />
      )}
      {isApproved ? "APROBADO" : isRejected ? "RECHAZADO" : "PENDIENTE"}
    </div>
  );
}

function toTimeMaybe(v: any) {
  const t = new Date(String(v ?? "")).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function CoordinatorEvaluationDetailPage() {
  const navigate = useNavigate();
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const id = evaluationId;

  const { user, logout } = useAuth();
  const actor = actorFromUser(user);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const evals = useCoordinatorEvaluations();
  const [showHistory, setShowHistory] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleChangeMode = (mode: "evaluations" | "users") => {
    navigate("/coordinator", { state: { tab: mode } });
  };

  const summaryForHook = useMemo(() => {
    if (!id) return null;
    return evals.evaluations.find((e: any) => String(e?.id) === String(id)) ?? null;
  }, [evals.evaluations, id]);

  const coordinatorApiStatusForHook = String(
    summaryForHook?.coordinatorDecisionStatus ?? "",
  ).toUpperCase();
  const isAlreadyEvaluated =
    coordinatorApiStatusForHook === "APPROVED" ||
    coordinatorApiStatusForHook === "REJECTED";

  const detail = useEvaluationDetail({
    user,
    actor,
    evaluations: evals.evaluations,
    localDecisions: evals.localDecisions,
    setLocalDecisions: evals.setLocalDecisions,
    isAlreadyEvaluated,
  });

  useEffect(() => {
    if (!id) return;
    detail.handleSelectEvaluation(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const selected = detail.selectedDetail;
  const analysis = selected?.analysis ?? null;
  const interview = selected?.interview ?? null;
  const summary = summaryForHook;

  const candidateName =
    interview?.candidateName || summary?.candidate?.fullName || "Candidato";
  const program =
    interview?.program || summary?.candidate?.programNameSnapshot || "";
  const school =
    interview?.school || summary?.candidate?.schoolNameSnapshot || "";

  const score = useMemo(() => {
    const v = Number(analysis?.overallScore ?? 0);
    return Number.isFinite(v) ? Math.round(v * 10) / 10 : 0;
  }, [analysis]);

  const evaluatedVerdictLabel =
    coordinatorApiStatusForHook === "APPROVED"
      ? "APROBADO"
      : coordinatorApiStatusForHook === "REJECTED"
        ? "RECHAZADO"
        : "PENDIENTE";

  const risk = useMemo(() => String(analysis?.overallRiskLevel ?? ""), [analysis]);
  const verdict = useMemo(() => String(analysis?.finalVerdict ?? ""), [analysis]);
  const executive = useMemo(
    () => String(analysis?.executiveSummary ?? ""),
    [analysis],
  );
  const retention = useMemo(
    () => String(analysis?.resignationRiskWindow ?? ""),
    [analysis],
  );
  const mitigations = useMemo(
    () => (Array.isArray(analysis?.mitigationRecommendations) ? analysis!.mitigationRecommendations : []),
    [analysis],
  );

  const loading = detail.loadingDetail;
  const canExport = !!analysis && !loading;

  const interviewsSorted = useMemo(() => {
    const list = ((detail.candidateGroup as any)?.interviews ?? []) as any[];
    return [...list].sort(
      (a, b) =>
        Math.max(toTimeMaybe(b?.updatedAt), toTimeMaybe(b?.createdAt)) -
        Math.max(toTimeMaybe(a?.updatedAt), toTimeMaybe(a?.createdAt)),
    );
  }, [detail.candidateGroup]);

  const compareWithId = useMemo(() => {
    if (!id) return null;
    if (interviewsSorted.length < 2) return null;
    const other = interviewsSorted.find((ev) => String(ev?.id) !== String(id));
    return other?.id ? String(other.id) : null;
  }, [interviewsSorted, id]);

  const goToReport = (evaluationId: string) => {
    navigate(
      `/coordinator/evaluations/${encodeURIComponent(String(evaluationId))}/report`,
    );
  };

  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState("");
  const [comparison, setComparison] = useState<any>(null);

  const runCompareInline = async () => {
    if (!id || !compareWithId) return;
    setCompareError("");
    setComparison(null);
    setCompareLoading(true);
    try {
      const [a, b] = await Promise.all([
        getTeacherEvaluationById(String(id)),
        getTeacherEvaluationById(String(compareWithId)),
      ]);
      const aJson = (a as any)?.aiRawJson ?? (a as any)?.aiResult ?? (a as any)?.ai_raw_json;
      const bJson = (b as any)?.aiRawJson ?? (b as any)?.aiResult ?? (b as any)?.ai_raw_json;
      if (!aJson || !bJson) {
        throw new Error("Falta el reporte IA guardado en una de las entrevistas.");
      }
      const result = await compareInterviewsWithGemini({
        interviewA: aJson,
        interviewB: bJson,
        meta: {
          candidateName,
          program: program || null,
          school: school || null,
          evaluationIdA: String(id),
          evaluationIdB: String(compareWithId),
          createdAtA: (a as any)?.createdAt ?? null,
          createdAtB: (b as any)?.createdAt ?? null,
        },
      });
      setComparison(result);
    } catch (e: any) {
      setCompareError(e?.message ?? "No se pudo comparar con IA.");
    } finally {
      setCompareLoading(false);
    }
  };

  const shell = isDark
    ? "border-white/[0.08] bg-[#0d252b]"
    : "border-slate-200/80 bg-white shadow-[0_14px_36px_-28px_rgba(15,23,42,0.18)]";

  return (
    <div
      className={`min-h-[100dvh] w-full overflow-x-hidden font-sans xl:fixed xl:inset-0 xl:flex xl:h-[100dvh] xl:min-h-0 xl:flex-col xl:overflow-hidden ${
        isDark ? "bg-[#061419] text-slate-200" : "bg-[#F4F7FB] text-slate-900"
      }`}
    >
      <CoordinatorModeHeader
        mode="evaluations"
        onChangeMode={handleChangeMode}
        onLogout={handleLogout}
        statusLabel={loading ? "Cargando..." : evaluatedVerdictLabel}
      />

      <main
        className={`mx-auto flex w-full max-w-[1760px] flex-col gap-3 px-4 py-3 pb-4 md:px-6 md:py-3 md:pb-4 xl:min-h-0 xl:flex-1 ${
          showHistory ? "xl:overflow-y-auto" : "xl:overflow-hidden"
        }`}
      >
        {/* Subheader de detalle */}
        <header className="flex shrink-0 items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/coordinator", { state: { tab: "evaluations" } })}
            className={`group inline-flex items-center gap-2.5 text-sm font-medium transition ${
              isDark
                ? "text-slate-400 hover:text-emerald-300"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                isDark
                  ? "border-white/[0.08] bg-white/[0.03] group-hover:border-emerald-400/30"
                  : "border-slate-200 bg-white group-hover:border-emerald-200"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
            </span>
            Volver a la bandeja
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge
              status={(detail.decisionStatus as any) ?? (detail.decision as any)}
            />
            <button
              type="button"
              onClick={detail.exportPdf}
              disabled={!canExport}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                canExport
                  ? isDark
                    ? "border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10"
                    : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  : isDark
                    ? "cursor-not-allowed border-white/5 text-slate-600"
                    : "cursor-not-allowed border-slate-200 text-slate-400"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Exportar reporte
            </button>
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                isDark
                  ? "border-white/[0.08] text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              title="Historial de entrevistas"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex min-h-[calc(100dvh-11rem)] flex-col items-center justify-center gap-4">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
              <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-emerald-500" />
            </div>
            <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? "text-emerald-400/70" : "text-emerald-700/70"}`}>
              Cargando decisión...
            </p>
          </div>
        ) : !selected ? (
          <div
            className={`rounded-2xl border border-dashed p-8 text-center ${
              isDark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-500"
            }`}
          >
            No se encontró información disponible para esta evaluación.
          </div>
        ) : showHistory ? (
          <section className={`rounded-2xl border p-4 ${shell}`}>
            <div className="mb-3 flex items-center gap-2">
              <History className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Historial de entrevistas
              </h3>
            </div>

            <EvaluationComparisonPreview
              interviewsCount={interviewsSorted.length}
              candidateName={candidateName}
              hasComparisonData={!!comparison}
              onCompare={runCompareInline}
              compareLoading={compareLoading}
              compareError={compareError}
            />

            {comparison?.executiveSummary && (
              <div
                className={`mt-3 rounded-xl border p-3 text-sm leading-6 ${
                  isDark
                    ? "border-white/[0.08] bg-[#07171c]/70 text-slate-300"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {String(comparison.executiveSummary)}
              </div>
            )}

            <div className="mt-3 space-y-2">
              {interviewsSorted.map((ev: any) => {
                const evId = String(ev?.id ?? "");
                const dateStr = String(ev?.createdAt ?? "").slice(0, 10);
                return (
                  <button
                    key={evId}
                    type="button"
                    onClick={() => goToReport(evId)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left transition ${
                      isDark
                        ? "border-white/[0.06] bg-[#07171c]/55 hover:border-emerald-400/20"
                        : "border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {String(ev?.candidate?.fullName ?? candidateName)}
                      </p>
                      <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {dateStr || "Fecha N/A"}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  </button>
                );
              })}
              {interviewsSorted.length === 0 && (
                <p className={`py-6 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  No hay historial disponible.
                </p>
              )}
            </div>
          </section>
        ) : (
          <div className="pb-2">
            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(360px,0.86fr)_minmax(0,1.3fr)]">
              {/* Columna 1: perfil del candidato */}
              <div className={`overflow-hidden rounded-2xl border xl:sticky xl:top-4 ${shell}`}>
                <div className="p-4 md:p-5">
                  <EvaluationSummaryCard
                    candidateName={candidateName}
                    program={program}
                    school={school}
                    score={score}
                    risk={risk}
                    verdict={verdict}
                    executive={executive}
                    retention={retention}
                    age={interview?.age}
                    documentNumber={interview?.documentNumber}
                    coordinatorDecisionStatus={summary?.coordinatorDecisionStatus ?? null}
                    adminDecisionStatus={summary?.adminDecisionStatus ?? null}
                    compact
                    flush
                  />
                </div>

                {summary && (
                  <section
                    className={`border-t px-5 py-3 md:px-5 ${
                      isDark ? "border-white/[0.06] bg-white/[0.015]" : "border-slate-100 bg-slate-50/50"
                    }`}
                  >
                    <h3
                      className={`mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Trazabilidad del proceso
                    </h3>
                    <ProcessTimeline
                      events={buildTimelineEvents(summary)}
                      orientation="horizontal"
                      compact
                    />
                  </section>
                )}
              </div>

              {/* Columna 2: decisión y soporte contextual */}
              <div className="grid grid-cols-1 items-start gap-4 2xl:grid-cols-[minmax(430px,1.18fr)_minmax(300px,0.82fr)]">
                <CandidateDecisionPanel
                  decision={detail.decision}
                  onApplyDecision={detail.applyDecision}
                  decisionComment={detail.decisionComment}
                  setDecisionComment={detail.setDecisionComment}
                  criteria={detail.criteria}
                  setCriteria={detail.setCriteria}
                  missingReasons={detail.missingReasons}
                  canSubmitDecision={detail.canSubmitDecision}
                  submittingDecision={detail.submittingDecision}
                  onSubmitDecision={detail.submitDecisionToAdmin}
                  isAlreadyEvaluated={isAlreadyEvaluated}
                  evaluatedVerdictLabel={evaluatedVerdictLabel}
                  coordinatorDecisionAt={
                    summary?.coordinatorDecidedAt ??
                    summary?.coordinatorDecisionAt ??
                    undefined
                  }
                  hideMissingBlock
                  compact
                />

                <DecisionSupportSidebar
                  evaluationId={id}
                  missingReasons={detail.missingReasons}
                  mitigations={mitigations}
                  lastUpdated={
                    summary?.coordinatorDecidedAt ??
                    summary?.coordinatorDecisionAt ??
                    summary?.createdAt ??
                    null
                  }
                  compact
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
