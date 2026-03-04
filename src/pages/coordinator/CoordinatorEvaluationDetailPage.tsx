import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  ShieldCheck,
  User,
  GraduationCap,
  Activity,
  Zap,
  Sparkles,
  Scale,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { actorFromUser } from "../../services/auditActor";
import { useCoordinatorEvaluations } from "./hooks/useCoordinatorEvaluations";
import { useEvaluationDetail } from "./hooks/useEvaluationDetail";
import { getTeacherEvaluationById } from "../../services/teachersService";
import { compareInterviewsWithGemini } from "../../services/geminiService";

// --- COMPONENTES UI DE ALTA GAMA ---

const GlassCard = ({
  children,
  className = "",
  glowing = false,
}: {
  children: React.ReactNode;
  className?: string;
  glowing?: boolean;
}) => (
  <div
    className={`relative overflow-hidden rounded-[24px] border backdrop-blur-xl transition-all duration-300
    ${
      glowing
        ? "bg-[#0A1014]/80 border-emerald-500/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.1)]"
        : "bg-[#0A0C10]/60 border-white/[0.06] shadow-2xl"
    } ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ icon: Icon, label }: { icon?: any; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    {Icon && <Icon className="w-3.5 h-3.5 text-emerald-500" />}
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
      {label}
    </span>
  </div>
);

function RiskBadge({ risk }: { risk: string }) {
  const r = (risk ?? "").toLowerCase();
  let style = "bg-slate-500/10 text-slate-400 border-slate-500/20";

  if (r.includes("alto"))
    style =
      "bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
  if (r.includes("medio"))
    style =
      "bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]";
  if (r.includes("bajo"))
    style =
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wide uppercase transition-all ${style}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          r.includes("alto")
            ? "bg-rose-500"
            : r.includes("medio")
              ? "bg-amber-500"
              : "bg-emerald-500"
        }`}
      />
      {risk || "N/A"}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "").toUpperCase();
  const isApproved = s.includes("APROB");
  const isRejected = s.includes("RECH");

  return (
    <div
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all
      ${
        isApproved
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]"
          : isRejected
            ? "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]"
            : "bg-white/5 border-white/10 text-slate-400"
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

// Helper: contar criterios
function countChecked(criteria: Record<string, boolean> | null | undefined) {
  return Object.values(criteria ?? {}).filter(Boolean).length;
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
  const canExport = !!selected && !loading;

  const CRITERIA_ITEMS = [
    {
      key: "documentationComplete",
      title: "Documentación Verificada",
      desc: "Soportes y certificados validados.",
    },
    {
      key: "profileAligned",
      title: "Alineación de Perfil",
      desc: "Cumple requisitos académicos.",
    },
    {
      key: "risksControlled",
      title: "Control de Riesgos",
      desc: "Sin banderas rojas críticas.",
    },
    {
      key: "communicationClarity",
      title: "Claridad Comunicativa",
      desc: "Desempeño coherente.",
    },
  ];

  const criteriaChecked = countChecked(detail.criteria as any);

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
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#020408]">
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] mix-blend-screen opacity-40" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[100px] mix-blend-screen opacity-30" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
    </div>
  );

  return (
    <div className="min-h-screen w-full text-slate-200 font-sans selection:bg-emerald-500/30">
      <BackgroundEffects />

      <div className="max-w-[1500px] mx-auto px-6 py-8 space-y-8">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button
            onClick={() => navigate("/coordinator")}
            className="group flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors pl-1"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/5 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="tracking-wide">Volver al Dashboard</span>
          </button>

          <div className="flex items-center gap-4">
            <StatusBadge
              status={
                (detail.decisionStatus as any) ?? (detail.decision as any)
              }
            />

            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

            <button
              onClick={detail.exportPdf}
              disabled={!canExport}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-lg
                ${
                  canExport
                    ? "bg-[#0F161A] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-[#020408] hover:border-transparent hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : "bg-white/[0.02] border-white/5 text-white/10 cursor-not-allowed"
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
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20"></div>
              <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-emerald-500/50 animate-pulse tracking-widest uppercase">
              Cargando Análisis...
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
              {/* Tarjeta Principal del Candidato */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[32px] blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative rounded-[30px] bg-[#080A0E] border border-white/10 p-8 shadow-2xl">
                  <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-500 mb-3">
                        <User className="w-4 h-4" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                          Perfil del Candidato
                        </span>
                      </div>
                      <h1 className="text-4xl font-black text-white tracking-tight mb-4 drop-shadow-md">
                        {candidateName}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3">
                        {program && (
                          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-4 py-1.5 rounded-full text-emerald-200/80 text-sm font-medium">
                            <GraduationCap className="w-4 h-4 opacity-70" />
                            {program}
                          </div>
                        )}
                        {school && (
                          <span className="text-slate-600 text-lg">•</span>
                        )}
                        {school && (
                          <span className="text-slate-400 font-medium">
                            {school}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        ID Evaluación
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
                        {id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Score Card */}
                <GlassCard className="p-7 flex flex-col justify-between h-full group hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <SectionLabel icon={Zap} label="Score Global" />
                    <div className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 border border-white/10 text-slate-400">
                      IA CALCULATED
                    </div>
                  </div>

                  <div className="relative pt-2">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-6xl font-black tracking-tighter ${
                          score >= 70
                            ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300"
                            : "text-slate-200"
                        }`}
                      >
                        {score}
                      </span>
                      <span className="text-lg font-medium text-slate-500">
                        /100
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold tracking-wider mb-2">
                      <span>BAJO</span>
                      <span>ALTO</span>
                    </div>
                    <div className="h-2 w-full bg-[#15191E] rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-gradient-to-r ${
                          score >= 80
                            ? "from-emerald-600 via-emerald-400 to-teal-300"
                            : score >= 50
                              ? "from-amber-600 to-amber-400"
                              : "from-rose-600 to-rose-400"
                        }`}
                        style={{
                          width: `${score}%`,
                          transition: "width 1.5s ease-out",
                        }}
                      />
                    </div>
                  </div>
                </GlassCard>

                {/* Riesgo Card */}
                <GlassCard className="p-7 flex flex-col h-full hover:border-white/10">
                  <SectionLabel
                    icon={ShieldCheck}
                    label="Diagnóstico de Riesgo"
                  />
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    <div>
                      <RiskBadge risk={risk} />
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-white/5 pl-3">
                      {risk.toLowerCase().includes("alto") ? (
                        <span className="text-rose-200">
                          Se han detectado anomalías que requieren una revisión
                          manual exhaustiva antes de proceder con la
                          contratación.
                        </span>
                      ) : (
                        "El perfil se encuentra dentro de los parámetros de seguridad y confiabilidad esperados."
                      )}
                    </p>
                  </div>
                </GlassCard>
              </div>

              {/* Tabs de Detalle */}
              <div className="pt-2">
                <div className="flex items-center gap-8 border-b border-white/5 mb-6">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`pb-3 text-sm font-semibold tracking-wide transition-colors relative ${
                      activeTab === "details"
                        ? "text-emerald-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Análisis Inteligente
                    {activeTab === "details" && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981]" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("interviews")}
                    className={`pb-3 text-sm font-semibold tracking-wide transition-colors relative ${
                      activeTab === "interviews"
                        ? "text-emerald-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Historial Entrevistas
                    {activeTab === "interviews" && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981]" />
                    )}
                  </button>

                  {/* ❌ QUITAMOS el botón de comparar de aquí */}
                </div>

                {activeTab === "details" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <GlassCard className="p-8">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" />{" "}
                        Veredicto del Sistema
                      </h3>
                      <div className="bg-[#050709]/50 rounded-xl p-6 border border-white/5">
                        <p className="text-slate-300 leading-7 text-[15px]">
                          {verdict || "Sin veredicto disponible."}
                        </p>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                      <h3 className="text-lg font-bold text-white mb-4">
                        Resumen Ejecutivo
                      </h3>
                      <p className="text-slate-400 leading-7 text-sm whitespace-pre-wrap">
                        {executive || "Sin resumen ejecutivo disponible."}
                      </p>
                    </GlassCard>
                  </div>
                )}

                {activeTab === "interviews" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* ✅ Compare Bar (Premium) */}
                    {interviewsSorted.length >= 2 && (
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent" />
                        <div className="relative p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              Comparación IA entre entrevistas
                            </div>
                            <div className="mt-1 text-sm text-slate-300">
                              Compara la entrevista actual vs la más reciente
                              del historial.
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.02]">
                                {interviewsSorted.length} entrevistas
                              </span>
                              <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.02]">
                                {compareWithId
                                  ? "Listo para comparar"
                                  : "Sin pareja"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={runCompareInline}
                              disabled={!canCompareInline || compareLoading}
                              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all
                      ${
                        canCompareInline && !compareLoading
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-[#020408] hover:border-transparent shadow-[0_0_18px_rgba(16,185,129,0.18)]"
                          : "border-white/10 bg-white/[0.02] text-white/25 cursor-not-allowed"
                      }`}
                              title={
                                canCompareInline
                                  ? "Comparar con IA"
                                  : "Necesitas al menos 2 entrevistas"
                              }
                            >
                              {compareLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Comparando…
                                </>
                              ) : (
                                <>
                                  <Scale className="w-4 h-4" />
                                  Comparar IA
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ✅ Error Premium (compacto) */}
                    {compareError && (
                      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 flex items-start gap-3">
                        <div className="mt-0.5 w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-rose-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-rose-200">
                            No se pudo generar la comparación IA
                          </div>
                          <div className="mt-1 text-sm text-rose-100/80">
                            {compareError}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={runCompareInline}
                              disabled={compareLoading}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15 transition-all disabled:opacity-50"
                            >
                              <Sparkles className="w-4 h-4" />
                              Reintentar
                            </button>

                            <button
                              type="button"
                              onClick={() => setCompareError("")}
                              className="text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors"
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
                            <div className="mt-1 text-sm text-slate-300">
                              Diferencias clave y recomendación final.
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setComparison(null)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.04] transition-all"
                          >
                            Cerrar
                          </button>
                        </div>

                        <div className="mt-4 rounded-xl border border-white/10 bg-[#050709]/40 p-5">
                          {typeof comparison?.executiveSummary === "string" ? (
                            <p className="text-sm text-slate-200/90 whitespace-pre-wrap leading-7">
                              {comparison.executiveSummary}
                            </p>
                          ) : (
                            <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words">
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
                          className="group flex items-center justify-between p-5 rounded-2xl bg-[#0A0C10] border border-white/5 hover:border-emerald-500/30 hover:bg-[#0F1418] transition-all"
                        >
                          {/* ✅ Click en el bloque: ir a REPORTE IA */}
                          <button
                            type="button"
                            className="flex flex-1 items-center gap-4 text-left"
                            onClick={() => goToReport(evId)}
                            title="Abrir análisis IA"
                          >
                            <div className="w-12 h-12 rounded-full bg-[#151a20] flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                              <FileText className="w-5 h-5" />
                            </div>

                            <div className="min-w-0">
                              <div className="text-white font-semibold group-hover:text-emerald-300 transition-colors truncate">
                                {String(
                                  ev?.candidate?.fullName ?? "Entrevista",
                                )}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {dateStr || "Fecha N/A"}
                              </div>
                            </div>
                          </button>

                          {/* ✅ Acciones rápidas */}
                          <div className="flex items-center gap-2 ml-4">
                            <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black group-hover:border-transparent transition-all">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {interviewsSorted.length === 0 && (
                      <div className="text-sm text-slate-500 italic p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
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
                <div className="relative rounded-[32px] p-[1px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl">
                  <div className="rounded-[31px] bg-[#0E1216] backdrop-blur-xl overflow-hidden">
                    <div className="bg-[#13181E] px-8 py-6 border-b border-white/5">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          {isAlreadyEvaluated
                            ? "Evaluación Cerrada"
                            : "Consola de Decisión"}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 font-medium ml-6">
                        {isAlreadyEvaluated
                          ? "Este candidato ya tiene un veredicto final del coordinador."
                          : "Complete los pasos requeridos para finalizar."}
                      </p>
                    </div>

                    {isAlreadyEvaluated ? (
                      <div className="p-8">
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">
                            Ya evaluado
                          </div>
                          <p className="text-sm text-emerald-100 leading-relaxed">
                            Esta evaluación ya fue registrada con veredicto{" "}
                            <span className="font-bold">
                              {evaluatedVerdictLabel}
                            </span>{" "}
                            y no puede volver a ser enviada.
                          </p>
                          {summary?.coordinatorDecisionAt && (
                            <p className="text-[11px] text-emerald-200/80 mt-3">
                              Fecha de registro:{" "}
                              {String(summary.coordinatorDecisionAt).slice(
                                0,
                                19,
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 space-y-8">
                      {/* PASO 1 */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            1. Veredicto Humano
                          </span>
                          {detail.decision && (
                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/20 tracking-wider">
                              SELECCIONADO
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => detail.applyDecision("APROBADO")}
                            className={`relative group rounded-2xl border-2 transition-all duration-300 py-4 flex flex-col items-center justify-center gap-2
                              ${
                                String(detail.decision ?? "").includes("APROB")
                                  ? "bg-[#062C1E] border-emerald-500 text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
                                  : "bg-[#13181E] border-transparent text-slate-500 hover:border-emerald-500/30 hover:text-emerald-300 hover:bg-[#1A2026]"
                              }`}
                          >
                            <CheckCircle2
                              className={`w-6 h-6 transition-transform ${
                                String(detail.decision ?? "").includes("APROB")
                                  ? "scale-110"
                                  : "group-hover:scale-110"
                              }`}
                            />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Aprobar
                            </span>
                          </button>

                          <button
                            onClick={() => detail.applyDecision("RECHAZADO")}
                            className={`relative group rounded-2xl border-2 transition-all duration-300 py-4 flex flex-col items-center justify-center gap-2
                              ${
                                String(detail.decision ?? "").includes("RECH")
                                  ? "bg-[#2C0612] border-rose-500 text-rose-400 shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]"
                                  : "bg-[#13181E] border-transparent text-slate-500 hover:border-rose-500/30 hover:text-rose-300 hover:bg-[#1A2026]"
                              }`}
                          >
                            <XCircle
                              className={`w-6 h-6 transition-transform ${
                                String(detail.decision ?? "").includes("RECH")
                                  ? "scale-110"
                                  : "group-hover:scale-110"
                              }`}
                            />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Rechazar
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* PASO 2 */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            2. Checklist de Criterios
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              criteriaChecked >= 2
                                ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                                : "border-slate-700 text-slate-500"
                            }`}
                          >
                            {criteriaChecked}/{CRITERIA_ITEMS.length}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {CRITERIA_ITEMS.map((x) => {
                            const checked = !!(detail.criteria as any)?.[x.key];
                            return (
                              <button
                                key={x.key}
                                onClick={() => {
                                  const next = { ...(detail.criteria as any) };
                                  next[x.key] = !checked;
                                  detail.setCriteria(next);
                                }}
                                className={`w-full group flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200
                                  ${
                                    checked
                                      ? "bg-emerald-500/[0.05] border-emerald-500/30"
                                      : "bg-[#13181E] border-transparent hover:bg-[#1A2026]"
                                  }`}
                              >
                                <div
                                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 shadow-sm
                                    ${
                                      checked
                                        ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                        : "border-slate-600 bg-transparent group-hover:border-slate-500"
                                    }`}
                                >
                                  {checked && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                                  )}
                                </div>
                                <div>
                                  <div
                                    className={`text-sm font-semibold transition-colors ${
                                      checked
                                        ? "text-emerald-100"
                                        : "text-slate-400 group-hover:text-slate-200"
                                    }`}
                                  >
                                    {x.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                                    {x.desc}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* PASO 3 */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            3. Nota Oficial
                          </span>
                        </div>

                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                          <textarea
                            value={detail.decisionComment ?? ""}
                            onChange={(e) =>
                              detail.setDecisionComment(e.target.value)
                            }
                            onBlur={detail.onDecisionCommentBlur}
                            placeholder="Escribe tu justificación profesional aquí... (Mínimo 30 caracteres)"
                            className="relative block w-full h-36 bg-[#13181E] border border-transparent rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:bg-[#0A0C10] resize-none transition-all"
                          />
                          <div
                            className={`absolute bottom-3 right-3 text-[10px] font-mono transition-colors font-bold ${
                              (detail.decisionComment ?? "").length < 30
                                ? "text-rose-500"
                                : "text-emerald-500"
                            }`}
                          >
                            {(detail.decisionComment ?? "").length} / 30
                          </div>
                        </div>
                      </div>

                      {/* Alertas */}
                      {!detail.canSubmitDecision &&
                        (detail.missingReasons?.length ?? 0) > 0 && (
                          <div className="rounded-xl bg-amber-900/10 border border-amber-500/20 p-4">
                            <div className="flex items-center gap-2 text-amber-500 mb-2">
                              <Info className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Requisitos Pendientes
                              </span>
                            </div>
                            <ul className="space-y-1">
                              {detail.missingReasons.map(
                                (r: string, i: number) => (
                                  <li
                                    key={i}
                                    className="text-xs text-amber-500/80 pl-1 border-l-2 border-amber-500/30"
                                  >
                                    {r}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                      {/* BOTÓN PRINCIPAL */}
                      <div className="pt-2">
                        <button
                          onClick={detail.submitDecisionToAdmin}
                          disabled={!detail.canSubmitDecision || detail.submittingDecision}
                          className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 group
                            ${
                              detail.canSubmitDecision && !detail.submittingDecision
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.7)] hover:scale-[1.02]"
                                : "bg-[#1A2026] text-slate-600 cursor-not-allowed border border-white/5"
                            }`}
                        >
                          {detail.submittingDecision
                            ? "Enviando..."
                            : detail.canSubmitDecision
                            ? "Finalizar Evaluación"
                            : "Formulario Incompleto"}
                          {detail.canSubmitDecision && !detail.submittingDecision && (
                            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                          )}
                        </button>
                        <p className="text-center text-[10px] text-slate-600 mt-4">
                          Esta acción es irreversible y se registrará en la
                          Blockchain.
                        </p>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
                {/* Fin Panel */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
