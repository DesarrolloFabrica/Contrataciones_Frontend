import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Activity,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { actorFromUser } from "../../services/auditActor";
import { useCoordinatorEvaluations } from "./hooks/useCoordinatorEvaluations";
import { useEvaluationDetail } from "./hooks/useEvaluationDetail";
import { getTeacherEvaluationById } from "../../services/teachersService";
import { compareInterviewsWithGemini } from "../../services/geminiService";
import { useTheme } from "../../context/ThemeContext";
import { EvaluationSummaryCard } from "./components/EvaluationSummaryCard";
import { ProcessTimeline } from "./components/ProcessTimeline";
import { CandidateDecisionPanel } from "./components/CandidateDecisionPanel";
import { EvaluationComparisonPreview } from "./components/EvaluationComparisonPreview";
import { buildTimelineEvents } from "./utils/coordinatorTimeline";

// --- COMPONENTES UI DE ALTA GAMA ---

const GlassCard = ({
  children,
  className = "",
  glowing = false,
}: {
  children: React.ReactNode;
  className?: string;
  glowing?: boolean;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300
      ${
        glowing
          ? isDark
            ? "bg-[#0A1014]/80 border-cyan-500/20 shadow-[0_0_40px_-10px_rgba(6,182,212,0.1)]"
            : "bg-cyan-50 border-cyan-200 shadow-[0_18px_50px_rgba(6,182,212,0.20)]"
          : isDark
            ? "bg-[#0A0C10]/60 border-white/[0.06] shadow-2xl"
            : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.10)]"
      } ${className}`}
    >
      {children}
    </div>
  );
};



function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "").toUpperCase();
  const isApproved = s.includes("APROB");
  const isRejected = s.includes("RECH");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all
      ${
        isApproved
          ? isDark
            ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]"
            : "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)]"
          : isRejected
            ? isDark
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]"
              : "bg-rose-50 border-rose-200 text-rose-700 shadow-[0_0_15px_-3px_rgba(244,63,94,0.25)]"
            : isDark
              ? "bg-white/5 border-white/10 text-slate-400"
              : "bg-slate-100 border-slate-300 text-slate-700"
      }`}
    >
      {isApproved ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : isRejected ? (
        <XCircle className="w-3.5 h-3.5" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
      )}
      {isApproved ? "APROBADO" : isRejected ? "RECHAZADO" : "PENDIENTE"}
    </div>
  );
}

// Helper: tiempo seguro
function toTimeMaybe(v: any) {
  const t = new Date(String(v ?? "")).getTime();
  return Number.isFinite(t) ? t : 0;
}

// --- PÁGINA PRINCIPAL ---

export default function CoordinatorEvaluationDetailPage() {
  const navigate = useNavigate();
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const id = evaluationId;

  const { user } = useAuth();
  const actor = actorFromUser(user);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const evals = useCoordinatorEvaluations();
  const [activeTab, setActiveTab] = useState<"details" | "interviews">(
    "details",
  );

  const detail = useEvaluationDetail({
    user,
    actor,
    evaluations: evals.evaluations,
    localDecisions: evals.localDecisions,
    setLocalDecisions: evals.setLocalDecisions,
  });

  useEffect(() => {
    if (!id) return;
    detail.handleSelectEvaluation(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const selected = detail.selectedDetail;
  const analysis = selected?.analysis ?? null;
  const interview = selected?.interview ?? null;

  const summary = useMemo(() => {
    if (!id) return null;
    return (
      evals.evaluations.find((e: any) => String(e?.id) === String(id)) ?? null
    );
  }, [evals.evaluations, id]);

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

  const coordinatorApiStatus = String(
    summary?.coordinatorDecisionStatus ?? "",
  ).toUpperCase();
  const isAlreadyEvaluated =
    coordinatorApiStatus === "APPROVED" || coordinatorApiStatus === "REJECTED";
  const evaluatedVerdictLabel =
    coordinatorApiStatus === "APPROVED"
      ? "APROBADO"
      : coordinatorApiStatus === "REJECTED"
        ? "RECHAZADO"
        : "PENDIENTE";

  const risk = useMemo(
    () => String(analysis?.overallRiskLevel ?? ""),
    [analysis],
  );
  const verdict = useMemo(
    () => String(analysis?.finalVerdict ?? ""),
    [analysis],
  );
  const executive = useMemo(
    () => String(analysis?.executiveSummary ?? ""),
    [analysis],
  );

  const loading = detail.loadingDetail;
  const canExport = !!analysis && !loading;

  // Entrevistas del candidato (ordenadas desc por fecha)
  const interviewsSorted = useMemo(() => {
    const list = ((detail.candidateGroup as any)?.interviews ?? []) as any[];
    return [...list].sort(
      (a, b) =>
        Math.max(toTimeMaybe(b?.updatedAt), toTimeMaybe(b?.createdAt)) -
        Math.max(toTimeMaybe(a?.updatedAt), toTimeMaybe(a?.createdAt)),
    );
  }, [detail.candidateGroup]);

  // Elegir pareja para comparar: (actual) + (más reciente diferente)
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

  const goToCompare = () => {
    if (!id || !compareWithId) return;
    navigate(
      `/coordinator/evaluations/${encodeURIComponent(String(id))}/report?compareWith=${encodeURIComponent(
        String(compareWithId),
      )}`,
    );
  };

  // --- ✅ Comparación IA (inline) ---
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState("");
  const [comparison, setComparison] = useState<any>(null);

  const canCompareInline = !!id && !!compareWithId;

  const runCompareInline = async () => {
    if (!id || !compareWithId) return;

    setCompareError("");
    setComparison(null);
    setCompareLoading(true);

    try {
      // 1) Traer IA guardada de ambas entrevistas
      const [a, b] = await Promise.all([
        getTeacherEvaluationById(String(id)),
        getTeacherEvaluationById(String(compareWithId)),
      ]);

      // Ajusta el nombre de la propiedad si tu backend usa otro
      const aJson =
        (a as any)?.aiRawJson ??
        (a as any)?.aiResult ??
        (a as any)?.ai_raw_json;
      const bJson =
        (b as any)?.aiRawJson ??
        (b as any)?.aiResult ??
        (b as any)?.ai_raw_json;

      if (!aJson || !bJson) {
        throw new Error(
          "Falta el reporte IA guardado en una de las entrevistas.",
        );
      }

      // 2) Comparar con Gemini
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

  // Background sofisticado
  const BackgroundEffects = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#060A12]">
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] mix-blend-screen opacity-40" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen opacity-30" />
    </div>
  );

  return (
    <div
      className={`min-h-screen w-full font-sans selection:bg-cyan-500/30 ${
        isDark ? "bg-[#060A12] text-slate-200" : "bg-[#F4F7FC] text-slate-900"
      }`}
    >
      {isDark && <BackgroundEffects />}

      <div className="max-w-[1500px] mx-auto px-6 py-8 space-y-8">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button
            onClick={() => navigate("/coordinator")}
            className={`group flex items-center gap-3 text-sm font-medium transition-colors pl-1 ${
              isDark
                ? "text-slate-400 hover:text-cyan-400"
                : "text-slate-600 hover:text-cyan-700"
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-xl border transition-all ${
                isDark
                  ? "bg-white/[0.03] border-white/[0.06] group-hover:border-cyan-500/25 group-hover:bg-cyan-500/5"
                  : "bg-white border-slate-200 group-hover:border-cyan-300 group-hover:bg-cyan-50 shadow-sm"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="tracking-wide">Volver a la Bandeja</span>
          </button>

          <div className="flex items-center gap-4">
            <StatusBadge
              status={
                (detail.decisionStatus as any) ?? (detail.decision as any)
              }
            />

            <div
              className={`h-6 w-px mx-1 hidden md:block ${
                isDark ? "bg-white/10" : "bg-slate-200"
              }`}
            ></div>

            <button
              onClick={detail.exportPdf}
              disabled={!canExport}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-lg
                ${
                  canExport
                    ? isDark
                      ? "bg-[#0A0D14] border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-transparent hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      : "bg-cyan-500 border-cyan-500 text-white hover:bg-cyan-600 hover:shadow-[0_18px_40px_rgba(6,182,212,0.45)]"
                    : isDark
                      ? "bg-white/[0.02] border-white/5 text-white/10 cursor-not-allowed"
                      : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Exportar Reporte</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
              <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-cyan-500/50 animate-pulse tracking-widest uppercase">
              Cargando Analisis...
            </p>
          </div>
        ) : !selected ? (
          <div className="p-16 text-center rounded-[32px] border border-dashed border-white/10 bg-white/[0.02]">
            <p className="text-slate-500">
              No se encontró información disponible para esta evaluación.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* --- COLUMNA IZQUIERDA --- */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <EvaluationSummaryCard
                candidateName={candidateName}
                program={program}
                school={school}
                score={score}
                risk={risk}
                verdict={verdict}
                coordinatorDecisionStatus={
                  summary?.coordinatorDecisionStatus ?? null
                }
                adminDecisionStatus={summary?.adminDecisionStatus ?? null}
              />

              {/* Timeline del proceso */}
              {summary && (
                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "bg-white/[0.02] border-white/10"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <h3
                    className={`text-xs font-bold uppercase tracking-widest mb-4 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Trazabilidad del proceso
                  </h3>
                  <ProcessTimeline events={buildTimelineEvents(summary)} />
                </div>
              )}

              {/* Tabs de Detalle */}
              <div className="pt-2">
                <div
                  className={`flex items-center gap-8 border-b mb-6 ${
                    isDark ? "border-white/5" : "border-slate-200"
                  }`}
                >
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`pb-3 text-sm font-semibold tracking-wide transition-colors relative ${
                      activeTab === "details"
                        ? isDark
                          ? "text-cyan-400"
                          : "text-cyan-600"
                        : isDark
                          ? "text-slate-500 hover:text-slate-300"
                          : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Analisis Inteligente
                    {activeTab === "details" && (
                      <div
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 ${
                          isDark
                            ? "shadow-[0_0_12px_#06b6d4]"
                            : "shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                        }`}
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("interviews")}
                    className={`pb-3 text-sm font-semibold tracking-wide transition-colors relative ${
                      activeTab === "interviews"
                        ? isDark
                          ? "text-cyan-400"
                          : "text-cyan-600"
                        : isDark
                          ? "text-slate-500 hover:text-slate-300"
                          : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Historial Entrevistas
                    {activeTab === "interviews" && (
                      <div
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 ${
                          isDark
                            ? "shadow-[0_0_12px_#06b6d4]"
                            : "shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                        }`}
                      />
                    )}
                  </button>

                  {/* ❌ QUITAMOS el botón de comparar de aquí */}
                </div>

                {activeTab === "details" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <GlassCard className="p-8">
                      <h3
                        className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        <Activity
                          className={`w-5 h-5 ${
                            isDark ? "text-emerald-500" : "text-emerald-600"
                          }`}
                        />{" "}
                        Veredicto del Sistema
                      </h3>
                      <div
                        className={`rounded-xl p-6 border ${
                          isDark
                            ? "bg-[#050709]/50 border-white/5"
                            : "bg-slate-100 border-slate-200"
                        }`}
                      >
                        <p
                          className={`leading-7 text-[15px] ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          {verdict || "Sin veredicto disponible."}
                        </p>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                      <h3
                        className={`text-lg font-bold mb-4 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Resumen Ejecutivo
                      </h3>
                      <p
                        className={`leading-7 text-sm whitespace-pre-wrap ${
                          isDark ? "text-slate-400" : "text-slate-700"
                        }`}
                      >
                        {executive || "Sin resumen ejecutivo disponible."}
                      </p>
                    </GlassCard>
                  </div>
                )}

                {activeTab === "interviews" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                    <EvaluationComparisonPreview
                      interviewsCount={interviewsSorted.length}
                      candidateName={candidateName}
                      hasComparisonData={!!comparison}
                      onCompare={runCompareInline}
                      compareLoading={compareLoading}
                      compareError={compareError}
                    />

                    {/* ✅ Error Premium (compacto) */}
                    {compareError && (
                      <div
                        className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${
                          isDark
                            ? "border-rose-500/20 bg-rose-500/10"
                            : "border-rose-200 bg-rose-50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-9 h-9 rounded-xl border flex items-center justify-center ${
                            isDark
                              ? "bg-rose-500/10 border-rose-500/20"
                              : "bg-white border-rose-200"
                          }`}
                        >
                          <AlertTriangle
                            className={`w-5 h-5 ${
                              isDark ? "text-rose-300" : "text-rose-500"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[11px] font-black uppercase tracking-[0.18em] ${
                              isDark ? "text-rose-200" : "text-rose-600"
                            }`}
                          >
                            No se pudo generar la comparación IA
                          </div>
                          <div
                            className={`mt-1 text-sm ${
                              isDark ? "text-rose-100/80" : "text-rose-700"
                            }`}
                          >
                            {compareError}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={runCompareInline}
                              disabled={compareLoading}
                              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border transition-all disabled:opacity-50 ${
                                isDark
                                  ? "border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15"
                                  : "border-rose-300 bg-rose-100 text-rose-700 hover:bg-rose-200"
                              }`}
                            >
                              <Sparkles className="w-4 h-4" />
                              Reintentar
                            </button>

                            <button
                              type="button"
                              onClick={() => setCompareError("")}
                              className={`text-[11px] font-bold transition-colors ${
                                isDark
                                  ? "text-slate-400 hover:text-slate-200"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              Ocultar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ✅ Resultado Premium */}
                    {comparison && (
                      <GlassCard className="p-6" glowing>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
                              Resultado Comparativo IA
                            </div>
                            <div
                              className={`mt-1 text-sm ${
                                isDark ? "text-slate-300" : "text-slate-700"
                              }`}
                            >
                              Diferencias clave y recomendación final.
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setComparison(null)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all ${
                              isDark
                                ? "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.04]"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            Cerrar
                          </button>
                        </div>

                        <div
                          className={`mt-4 rounded-xl border p-5 ${
                            isDark
                              ? "border-white/10 bg-[#050709]/40"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          {typeof comparison?.executiveSummary === "string" ? (
                            <p
                              className={`text-sm whitespace-pre-wrap leading-7 ${
                                isDark
                                  ? "text-slate-200/90"
                                  : "text-slate-800"
                              }`}
                            >
                              {comparison.executiveSummary}
                            </p>
                          ) : (
                            <pre className="text-xs text-slate-600 whitespace-pre-wrap break-words">
                              {JSON.stringify(comparison, null, 2)}
                            </pre>
                          )}
                        </div>
                      </GlassCard>
                    )}

                    {/* --- Lista Entrevistas --- */}
                    {interviewsSorted.map((ev: any) => {
                      const evId = String(ev?.id ?? "");
                      const dateStr = String(ev?.createdAt ?? "").slice(0, 10);

                      return (
                        <div
                          key={evId}
                          className={`group flex items-center justify-between p-5 rounded-2xl border transition-all
                            ${
                              isDark
                                ? "bg-[#0A0C10] border-white/5 hover:border-emerald-500/30 hover:bg-[#0F1418]"
                                : "bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                            }`}
                        >
                          {/* ✅ Click en el bloque: ir a REPORTE IA */}
                          <button
                            type="button"
                            className="flex flex-1 items-center gap-4 text-left"
                            onClick={() => goToReport(evId)}
                            title="Abrir análisis IA"
                          >
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                                ${
                                  isDark
                                    ? "bg-[#151a20] text-slate-500 group-hover:text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                    : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                                }`}
                            >
                              <FileText className="w-5 h-5" />
                            </div>

                            <div className="min-w-0">
                              <div
                                className={`font-semibold transition-colors truncate ${
                                  isDark
                                    ? "text-white group-hover:text-emerald-300"
                                    : "text-slate-900 group-hover:text-emerald-700"
                                }`}
                              >
                                {String(
                                  ev?.candidate?.fullName ?? "Entrevista",
                                )}
                              </div>
                              <div
                                className={`text-xs mt-1 ${
                                  isDark ? "text-slate-500" : "text-slate-500"
                                }`}
                              >
                                {dateStr || "Fecha N/A"}
                              </div>
                            </div>
                          </button>

                          {/* ✅ Acciones rápidas */}
                          <div className="flex items-center gap-2 ml-4">
                            <div
                              className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all
                                ${
                                  isDark
                                    ? "border-white/5 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-transparent"
                                    : "border-slate-200 bg-white text-slate-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500"
                                }`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {interviewsSorted.length === 0 && (
                      <div
                        className={`text-sm italic p-8 text-center border border-dashed rounded-2xl ${
                          isDark
                            ? "text-slate-500 border-white/10 bg-white/[0.01]"
                            : "text-slate-500 border-slate-200 bg-slate-50"
                        }`}
                      >
                        No hay historial disponible.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* --- COLUMNA DERECHA --- */}
            <div className="col-span-12 lg:col-span-5 relative">
              <div className="sticky top-6">
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
                    summary?.coordinatorDecisionAt ?? undefined
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
