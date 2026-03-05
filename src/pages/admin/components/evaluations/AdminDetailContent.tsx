// src/pages/admin/components/evaluations/AdminDetailContent.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  LayoutDashboard,
  Loader2,
  ShieldCheck,
  User,
  FileText,
  Gavel,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import type { TeacherEvaluationSummary } from "../../../../types";
import { getBucket } from "../../utils/adminSelectors";
import { useAdminAudit } from "../../hooks/useAdminAudit";

import {
  getExecutiveSummary,
  type TeacherExecutiveSummary as ExecSummary,
} from "../../../../services/teachersService";

import {
  apiGetUserBasicById,
  type UserBasic,
} from "../../../../services/adminUsersService";
import { useTheme } from "../../../../context/ThemeContext";

// ==========================================
// 1) HELPERS
// ==========================================
const statusLabelEs = (
  status?: "PENDING" | "APPROVED" | "REJECTED" | null
): string => {
  switch (status) {
    case "APPROVED":
      return "Aprobado";
    case "REJECTED":
      return "No recomendado";
    case "PENDING":
    default:
      return "Pendiente";
  }
};

const safeString = (v: unknown, fallback = "-") =>
  v === null || v === undefined ? fallback : String(v).trim() || fallback;

const asNumber = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function parseBullets(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);
  }
  if (typeof v !== "string") return [];

  return v
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) =>
      s
        .replace(/^[-•*]\s+/, "")
        .replace(/^\d+[\.\)]\s+/, "")
        .replace(/^\[[^\]]+\]\s*/, "")
        .trim()
    )
    .filter(Boolean);
}

function takeTop(items: string[], max = 8) {
  return Array.from(new Set(items.map((x) => x.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function isoToEs(v?: any) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString("es-CO");
}

function pickActorFromAny(
  obj: any
): { name: string; email?: string | null; id?: string | null } | null {
  if (!obj) return null;
  const name =
    safeString(obj?.fullName, "") ||
    safeString(
      obj?.name && obj?.lastName ? `${obj.name} ${obj.lastName}` : obj?.name,
      ""
    ) ||
    safeString(obj?.user?.fullName, "") ||
    safeString(obj?.actorName, "") ||
    safeString(obj?.createdByName, "");

  const email =
    safeString(obj?.email, "") || safeString(obj?.user?.email, "") || null;
  const id = safeString(obj?.id, "") || safeString(obj?.userId, "") || null;

  if (!name && !email && !id) return null;
  return { name: name || email || id || "No disponible", email, id };
}

function pickCandidateSchoolProgramLabel(
  summary: TeacherEvaluationSummary | null,
  raw: any,
  execSummary: ExecSummary | null
) {
  const school =
    safeString((summary as any)?.candidate?.schoolNameSnapshot, "") ||
    safeString(raw?.candidate?.schoolNameSnapshot, "") ||
    safeString(raw?.formRawData?.candidate?.schoolName, "") ||
    safeString((summary as any)?.formRawData?.candidate?.schoolName, "") ||
    safeString((execSummary as any)?.schoolName, "") ||
    "-";

  const program =
    safeString((summary as any)?.candidate?.programNameSnapshot, "") ||
    safeString(raw?.candidate?.programNameSnapshot, "") ||
    safeString(raw?.formRawData?.candidate?.programName, "") ||
    safeString((summary as any)?.formRawData?.candidate?.programName, "") ||
    safeString((execSummary as any)?.programName, "") ||
    "-";

  return `${school} · ${program}`;
}

// ==========================================
// 2) UI TOKENS
// ==========================================
const STYLES = {
  shellDark:
    "relative rounded-[28px] overflow-hidden border border-white/10 bg-[#0B0E10] shadow-[0_30px_120px_rgba(0,0,0,0.70)]",
  shellInnerDark: "relative p-5 sm:p-6",
  cardDark:
    "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
  cardPad: "p-5",
  subCardDark:
    "rounded-2xl border border-white/10 bg-black/25 backdrop-blur-sm p-4",
  labelDark:
    "text-[10px] uppercase tracking-[0.24em] text-white/35 font-bold",
  pillBase:
    "px-3 py-1.5 rounded-full border text-[11px] font-semibold transition inline-flex items-center gap-2",
  chipBase:
    "px-3 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-[0.18em] transition inline-flex items-center gap-2",
};

const StatusPill = ({
  status,
  text,
  icon: Icon,
  customClass,
}: {
  status?: string | null;
  text?: string;
  icon?: any;
  customClass?: string;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  let className = STYLES.pillBase;

  if (customClass) {
    className += ` ${customClass}`;
  } else if (status === "APPROVED" || status === "RECOMENDADA") {
    className += isDark
      ? " border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
      : " border-emerald-200 bg-emerald-50 text-emerald-700";
  } else if (status === "REJECTED" || status === "NO_RECOMENDAR") {
    className += isDark
      ? " border-rose-400/25 bg-rose-500/10 text-rose-200"
      : " border-rose-200 bg-rose-50 text-rose-700";
  } else if (status === "PRECAUCION") {
    className += isDark
      ? " border-yellow-400/25 bg-yellow-500/10 text-yellow-100"
      : " border-amber-200 bg-amber-50 text-amber-700";
  } else {
    className += isDark
      ? " border-white/10 bg-white/5 text-white/70"
      : " border-slate-200 bg-slate-50 text-slate-700";
  }

  return (
    <span className={className}>
      {Icon && (
        <Icon className={`w-4 h-4 ${Icon === Loader2 ? "animate-spin" : ""}`} />
      )}
      {text ?? status ?? "-"}
    </span>
  );
};

type ActorData = {
  label: string;
  name: string;
  email?: string | null;
  id?: string | null;
  at?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED" | null;
};

const ActorCard = ({ actor }: { actor: ActorData }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={
        isDark
          ? STYLES.subCardDark
          : "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      }
    >
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <p
            className={
              isDark
                ? STYLES.labelDark
                : "text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold"
            }
          >
            {actor.label}
          </p>

          <p
            className={`text-sm font-extrabold mt-1 flex items-start gap-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <span
              className={[
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border",
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-slate-100 border-slate-200",
              ].join(" ")}
            >
              <User
                className={isDark ? "w-4 h-4 text-white/60" : "w-4 h-4 text-slate-600"}
              />
            </span>
            <span className="break-words min-w-0">{actor.name}</span>
          </p>

          {(actor.email || actor.id) && (
            <p
              className={`text-[12px] mt-1 break-all ${
                isDark ? "text-white/45" : "text-slate-600"
              }`}
            >
              {actor.email ? actor.email : actor.id}
            </p>
          )}

          {actor.at && (
            <p
              className={`text-[11px] mt-1 ${
                isDark ? "text-white/35" : "text-slate-500"
              }`}
            >
              {actor.at}
            </p>
          )}
        </div>

        {actor.status && (
          <div className="shrink-0">
            <StatusPill status={actor.status} text={statusLabelEs(actor.status)} />
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({
  icon: Icon,
  msg,
  spin,
  isError,
}: {
  icon: any;
  msg: string;
  spin?: boolean;
  isError?: boolean;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "min-h-[420px] flex flex-col items-center justify-center gap-4 text-center px-6",
        isDark ? "text-white/55" : "text-slate-600",
      ].join(" ")}
    >
      <div
        className={[
          "p-4 rounded-2xl border",
          isError
            ? isDark
              ? "bg-rose-500/10 border-rose-400/20"
              : "bg-rose-50 border-rose-200"
            : isDark
              ? "bg-white/5 border-white/10"
              : "bg-slate-50 border-slate-200",
        ].join(" ")}
      >
        <Icon
          size={30}
          className={[
            "opacity-80",
            spin ? "animate-spin text-emerald-300" : "",
            isError
              ? isDark
                ? "text-rose-200"
                : "text-rose-500"
              : isDark
                ? "text-white/70"
                : "text-slate-500",
          ].join(" ")}
        />
      </div>
      <p
        className={`text-sm font-semibold max-w-sm ${
          isDark ? "text-white/70" : "text-slate-700"
        }`}
      >
        {msg}
      </p>
      <p
        className={`text-xs max-w-sm ${
          isDark ? "text-white/35" : "text-slate-500"
        }`}
      >
        Si el problema persiste, revisa conectividad y permisos del rol.
      </p>
    </div>
  );
};

// ==========================================
// 3) MAIN
// ==========================================
type Props = {
  selectedId: string | null;
  loadingDetail: boolean;
  hasDetail: boolean;
  selectedSummary: TeacherEvaluationSummary | null;
  selectedDetail: { analysis: any; interview: any; raw: any } | null;
};

type TabKey = "RESUMEN" | "DECISION" | "TRAZABILIDAD";

export default function AdminDetailContent({
  selectedId,
  loadingDetail,
  hasDetail,
  selectedSummary,
  selectedDetail,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { audit, loadingAudit } = useAdminAudit({
    entityType: "EVALUATION",
    entityId: selectedId ?? undefined,
  });

  const [execSummary, setExecSummary] = useState<ExecSummary | null>(null);
  const [execLoading, setExecLoading] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  const [coordUser, setCoordUser] = useState<UserBasic | null>(null);
  const [coordUserLoading, setCoordUserLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("RESUMEN");

  const refResumen = useRef<HTMLDivElement>(null);
  const refDecision = useRef<HTMLDivElement>(null);
  const refTraz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab("RESUMEN");
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setExecSummary(null);
      return;
    }
    let active = true;

    const load = async () => {
      setExecLoading(true);
      setExecError(null);
      try {
        const data = await getExecutiveSummary(selectedId);
        if (active) setExecSummary(data);
      } catch {
        if (active) setExecError("Error al cargar resumen ejecutivo.");
      } finally {
        if (active) setExecLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [selectedId]);

  const analysis = selectedDetail?.analysis ?? {};
  const rawDetail = (selectedDetail?.raw ?? {}) as any;

  const coordinatorUserId = useMemo(() => {
    const v =
      safeString(rawDetail?.coordinatorUserId, "") ||
      safeString((selectedSummary as any)?.coordinatorUserId, "") ||
      safeString((execSummary as any)?.coordinatorDecision?.decidedBy?.id, "");
    return v || null;
  }, [rawDetail?.coordinatorUserId, selectedSummary, execSummary]);

  useEffect(() => {
    let alive = true;

    if (!coordinatorUserId) {
      setCoordUser(null);
      setCoordUserLoading(false);
      return;
    }

    setCoordUserLoading(true);

    apiGetUserBasicById(coordinatorUserId)
      .then((u) => {
        if (!alive) return;
        setCoordUser(u);
      })
      .catch((e) => {
        if (!alive) return;
        console.error("No se pudo traer coordinator user:", e);
        setCoordUser(null);
      })
      .finally(() => {
        if (!alive) return;
        setCoordUserLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [coordinatorUserId]);

  const bucket = getBucket(selectedSummary?.aiFinalRecommendation);

  const aiScore = asNumber(
    (analysis as any)?.scores?.teachingSuitability ??
      rawDetail?.aiTeachingSuitabilityScore ??
      (selectedSummary as any)?.aiTeachingSuitabilityScore ??
      0
  );

  const executiveText = safeString(
    rawDetail?.executiveSummary ??
      rawDetail?.aiOverallComment ??
      (analysis as any)?.executiveSummary ??
      (analysis as any)?.summary,
    ""
  );

  const strengthsFromSummary = parseBullets(
    rawDetail?.aiSummaryStrengths ?? (selectedSummary as any)?.aiSummaryStrengths
  );
  const risksFromSummary = parseBullets(
    rawDetail?.aiSummaryWeaknesses ??
      (selectedSummary as any)?.aiSummaryWeaknesses
  );

  const categoryAnalyses =
    rawDetail?.categoryAnalyses ?? (analysis as any)?.categoryAnalyses ?? [];

  const strengthsFromCats = (categoryAnalyses ?? []).flatMap((c: any) =>
    parseBullets(c?.oportunidades)
  );
  const risksFromCats = (categoryAnalyses ?? []).flatMap((c: any) =>
    parseBullets(c?.recomendaciones)
  );

  const temporalRiskFactors =
    rawDetail?.aiRawJson?.temporalRiskFactors ??
    rawDetail?.temporalRiskFactors ??
    (analysis as any)?.temporalRiskFactors ??
    [];

  const risksFromTemporal = parseBullets(temporalRiskFactors);

  const strengths = takeTop([...strengthsFromSummary, ...strengthsFromCats], 8);
  const risks = takeTop(
    [...risksFromSummary, ...risksFromCats, ...risksFromTemporal],
    8
  );

  const actors = useMemo(() => {
    const raw = rawDetail ?? {};
    const sum = selectedSummary ?? ({} as any);

    const leaderSrc =
      selectedDetail?.interview?.leader ||
      selectedDetail?.interview?.interviewer ||
      raw?.leader ||
      (sum as any)?.leader ||
      raw?.interviewerUser;

    const leader: ActorData = {
      label: "Líder (Entrevista)",
      ...(pickActorFromAny(leaderSrc) || { name: "No disponible" }),
      at: isoToEs(raw?.createdAt || (sum as any)?.createdAt),
      status: null,
    };

    const coordSrc =
      (execSummary as any)?.coordinatorDecision?.decidedBy ||
      coordUser ||
      raw?.coordinator ||
      (coordinatorUserId ? { id: coordinatorUserId } : null);

    const coordAt =
      (execSummary as any)?.coordinatorDecision?.decidedAt ??
      raw?.coordinatorDecidedAt ??
      (sum as any)?.coordinatorDecidedAt;

    const coordStatus =
      ((execSummary as any)?.coordinatorDecision?.verdict as any) ||
      (raw?.coordinatorDecisionStatus as any) ||
      ((sum as any)?.coordinatorDecisionStatus as any) ||
      "PENDING";

    const coord: ActorData = {
      label: "Coordinador",
      ...(pickActorFromAny(coordSrc) || { name: "No disponible" }),
      at: isoToEs(coordAt),
      status: coordStatus,
    };

    return { leader, coord };
  }, [selectedDetail, selectedSummary, execSummary, rawDetail, coordUser, coordinatorUserId]);

  const chipClass = (tab: TabKey) =>
    [
      STYLES.chipBase,
      activeTab === tab
        ? isDark
          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100 shadow-[0_0_22px_rgba(16,185,129,0.12)]"
          : "border-emerald-500 bg-emerald-600 text-white shadow-[0_10px_25px_rgba(16,185,129,0.35)]"
        : isDark
          ? "border-white/10 bg-white/5 text-white/65 hover:text-white/85 hover:bg-white/10 hover:border-white/15"
          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50",
    ].join(" ");

  const schoolProgramLabel = pickCandidateSchoolProgramLabel(
    selectedSummary,
    rawDetail,
    execSummary
  );

  const candidateName =
    selectedSummary?.candidate?.fullName ??
    rawDetail?.candidate?.fullName ??
    rawDetail?.formRawData?.candidate?.fullName ??
    "Sin nombre";

  if (!selectedId)
    return <EmptyState icon={LayoutDashboard} msg="Selecciona una evaluación." />;
  if (loadingDetail)
    return <EmptyState icon={Loader2} msg="Cargando detalle..." spin />;
  if (!hasDetail || !selectedDetail)
    return (
      <EmptyState
        icon={AlertCircle}
        msg="No se pudo cargar el detalle."
        isError
      />
    );

  const shellClass = isDark
    ? STYLES.shellDark
    : "relative rounded-[28px] overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]";

  const shellInnerClass = isDark
    ? STYLES.shellInnerDark
    : "relative p-5 sm:p-6";

  const cardClass = isDark
    ? `${STYLES.cardDark} ${STYLES.cardPad}`
    : "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.10)]";

  const subCardClass = isDark
    ? STYLES.subCardDark
    : "rounded-2xl border border-slate-200 bg-slate-50 p-4";

  return (
    <div className={shellClass}>
      {/* Fondo premium solo en oscuro */}
      {isDark && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent" />
          <div className="absolute inset-0 [background:radial-gradient(1200px_circle_at_15%_0%,rgba(16,185,129,0.10),transparent_55%),radial-gradient(900px_circle_at_85%_25%,rgba(34,211,238,0.08),transparent_55%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_0)] [background-size:18px_18px]" />
        </div>
      )}

      <div className={shellInnerClass}>
        {/* Header pequeño */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <p
              className={`text-sm font-extrabold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Detalle de evaluación
            </p>
            <p
              className={`text-xs ${
                isDark ? "text-white/40" : "text-slate-600"
              }`}
            >
              Vista completa de la ficha de evaluación seleccionada.
            </p>
          </div>
        </div>

        {/* HERO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-5">
            <div className={cardClass}>
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <p
                    className={
                      isDark
                        ? STYLES.labelDark
                        : "text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold"
                    }
                  >
                    Candidato
                  </p>
                  <h4
                    className={`font-extrabold text-2xl leading-tight mt-1 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {candidateName}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-white/55" : "text-slate-600"
                    }`}
                  >
                    {schoolProgramLabel}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill
                      status={bucket}
                      text={selectedSummary?.aiFinalRecommendation ?? "Sin recomendación"}
                      icon={bucket === "RECOMENDADA" ? ShieldCheck : AlertCircle}
                    />

                    <StatusPill
                      status={actors.coord.status ?? "PENDING"}
                      text={`Coordinador: ${statusLabelEs(
                        actors.coord.status ?? "PENDING",
                      )}`}
                      icon={User}
                      customClass={
                        isDark
                          ? "border-white/10 bg-white/5 text-white/70"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }
                    />

                    {coordUserLoading && (
                      <StatusPill
                        status="CUSTOM"
                        customClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                        text="Buscando coordinador…"
                        icon={Loader2}
                      />
                    )}

                    {execLoading && (
                      <StatusPill
                        status="CUSTOM"
                        customClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                        text="Sincronizando decisión…"
                        icon={Loader2}
                      />
                    )}

                    {execError && (
                      <StatusPill
                        status="CUSTOM"
                        customClass="border-rose-500/20 bg-rose-500/10 text-rose-200"
                        text="No se pudo traer decisión"
                        icon={AlertCircle}
                      />
                    )}
                  </div>

                  {/* Extract “micro” de resumen si hay */}
                  {executiveText ? (
                    <div
                      className={[
                        "mt-4 rounded-2xl border p-4",
                        isDark
                          ? "border-white/10 bg-black/25"
                          : "border-slate-200 bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-emerald-300" />
                        <p
                          className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${
                            isDark ? "text-white/70" : "text-slate-600"
                          }`}
                        >
                          Insight rápido (IA)
                        </p>
                      </div>
                      <p
                        className={`text-sm leading-relaxed line-clamp-3 ${
                          isDark ? "text-white/75" : "text-slate-700"
                        }`}
                      >
                        {executiveText}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* SCORE */}
                <div className="shrink-0">
                  <p
                    className={[
                      isDark
                        ? STYLES.labelDark
                        : "text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold",
                      "text-right",
                    ].join(" ")}
                  >
                    Score IA
                  </p>
                  <div className="mt-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 shadow-[0_0_28px_rgba(16,185,129,0.12)]">
                    <div className="flex items-baseline gap-2 justify-end">
                      <span
                        className={`text-3xl font-black ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {aiScore.toFixed(0)}
                      </span>
                      <span
                        className={`text-xs ${
                          isDark ? "text-white/50" : "text-slate-500"
                        }`}
                      >
                        / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div
                className={`mt-6 pt-4 border-t ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <p
                  className={`mb-3 ${
                    isDark
                      ? STYLES.labelDark
                      : "text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold"
                  }`}
                >
                  Contenido
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={chipClass("RESUMEN")}
                    onClick={() => setActiveTab("RESUMEN")}
                  >
                    <FileText className="w-4 h-4" />
                    Resumen
                  </button>

                  <button
                    type="button"
                    className={chipClass("DECISION")}
                    onClick={() => setActiveTab("DECISION")}
                  >
                    <Gavel className="w-4 h-4" />
                    Decisión
                  </button>

                  <button
                    type="button"
                    className={chipClass("TRAZABILIDAD")}
                    onClick={() => setActiveTab("TRAZABILIDAD")}
                  >
                    <Users className="w-4 h-4" />
                    Trazabilidad
                  </button>
                </div>
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "RESUMEN" && (
              <div ref={refResumen} className={cardClass}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-emerald-300" />
                  <h5
                    className={`text-sm font-extrabold uppercase tracking-[0.18em] ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Resumen ejecutivo (IA)
                  </h5>
                </div>
                <p
                  className={`text-[12px] mb-4 ${
                    isDark ? "text-white/45" : "text-slate-600"
                  }`}
                >
                  Síntesis del análisis y señales clave.
                </p>

                <div className={subCardClass}>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? "text-white/80" : "text-slate-700"
                    }`}
                  >
                    {executiveText || "Aún no hay resumen ejecutivo disponible."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div className={subCardClass}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-200/90">
                        Fortalezas
                      </p>
                    </div>

                    {strengths.length ? (
                      <ul
                        className={`text-sm space-y-2 ${
                          isDark ? "text-white/75" : "text-slate-700"
                        }`}
                      >
                        {strengths.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-emerald-300 shrink-0">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className={`text-xs ${
                          isDark ? "text-white/40" : "text-slate-500"
                        }`}
                      >
                        Sin datos
                      </p>
                    )}
                  </div>

                  <div className={subCardClass}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-rose-300" />
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-rose-200/90">
                        Riesgos / Alertas
                      </p>
                    </div>

                    {risks.length ? (
                      <ul
                        className={`text-sm space-y-2 ${
                          isDark ? "text-white/75" : "text-slate-700"
                        }`}
                      >
                        {risks.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-rose-300 shrink-0">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className={`text-xs ${
                          isDark ? "text-white/40" : "text-slate-500"
                        }`}
                      >
                        Sin datos
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "DECISION" && (
              <div ref={refDecision} className={cardClass}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-emerald-300" />
                    <h5 className="text-sm font-extrabold text-white uppercase tracking-[0.18em]">
                      Decisión del coordinador
                    </h5>
                  </div>

                  <StatusPill
                    status={actors.coord.status ?? "PENDING"}
                    text={statusLabelEs(actors.coord.status ?? "PENDING")}
                  />
                </div>

                <p className="text-[12px] text-white/45 mb-4">
                  Veredicto y comentario (si aplica).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActorCard actor={actors.coord} />

                  <div className={subCardClass}>
                    <p
                      className={
                        isDark
                          ? STYLES.labelDark
                          : "text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold"
                      }
                    >
                      Comentario
                    </p>
                    <div
                      className={[
                        "mt-2 rounded-2xl border p-4 min-h-[120px]",
                        isDark
                          ? "bg-black/25 border-white/10"
                          : "bg-slate-50 border-slate-200",
                      ].join(" ")}
                    >
                      <p
                        className={`text-sm whitespace-pre-wrap leading-relaxed ${
                          isDark ? "text-white/80" : "text-slate-700"
                        }`}
                      >
                        {(execSummary as any)?.coordinatorDecision?.notes ||
                          "Sin comentario."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "TRAZABILIDAD" && (
              <div ref={refTraz} className={cardClass}>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-cyan-300" />
                  <h5 className="text-sm font-extrabold text-white uppercase tracking-[0.18em]">
                    Trazabilidad humana
                  </h5>
                </div>

                <p className="text-[12px] text-white/45 mb-4">
                  Roles y responsables en el proceso.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActorCard actor={actors.leader} />
                  <ActorCard actor={actors.coord} />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-4 space-y-4">
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-cyan-300" />
                <h6 className="text-sm font-extrabold text-white uppercase tracking-[0.18em]">
                  Responsables
                </h6>
              </div>
              <div className="space-y-3">
                <ActorCard actor={actors.leader} />
                <ActorCard actor={actors.coord} />
              </div>
            </div>

            <div className={cardClass}>
              <p
                className={
                  isDark
                    ? STYLES.labelDark
                    : "text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold"
                }
              >
                Guía rápida
              </p>
              <ul
                className={`mt-3 space-y-2 text-sm ${
                  isDark ? "text-white/65" : "text-slate-700"
                }`}
              >
                <li className="flex gap-2">
                  <span className="text-emerald-300">1)</span>
                  <span>Revisa resumen y señales (fortalezas/riesgos).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-300">2)</span>
                  <span>Valida decisión del coordinador y comentario.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-300">3)</span>
                  <span>Comprueba trazabilidad (líder/coordinador).</span>
                </li>
              </ul>
            </div>

            {/* Si luego activas auditoría */}
            {loadingAudit && (
              <div className={cardClass}>
                <p
                  className={
                    isDark
                      ? STYLES.labelDark
                      : "text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold"
                  }
                >
                  Auditoría
                </p>
                <div
                  className={`mt-3 flex items-center gap-2 text-sm ${
                    isDark ? "text-white/55" : "text-slate-600"
                  }`}
                >
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  Cargando auditoría…
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}