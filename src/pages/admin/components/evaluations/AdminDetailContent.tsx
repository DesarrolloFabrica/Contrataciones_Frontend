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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { TeacherEvaluationSummary } from "../../../../types";
import { getBucket } from "../../utils/adminSelectors";

import { useAdminAudit } from "../../hooks/useAdminAudit";

import {
  getExecutiveSummary,
  type TeacherExecutiveSummary as ExecSummary,
} from "../../../../services/teachersService";

// ✅ NEW: traer coordinador por coordinatorUserId
import {
  apiGetUserBasicById,
  type UserBasic,
} from "../../../../services/adminUsersService";

// ==========================================
// 1) STYLES / HELPERS
// ==========================================
const STYLES = {
  card: "rounded-2xl border border-white/10 bg-black/20 p-4",
  subCard: "rounded-xl border border-white/10 bg-black/30 p-3",
  pillBase:
    "px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2",
  label: "text-[11px] uppercase tracking-widest text-neutral-500 font-bold",
  chip:
    "px-3 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition inline-flex items-center gap-2",
};

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
// 2) UI BLOQUES
// ==========================================
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
  let className = STYLES.pillBase;

  if (customClass) {
    className += ` ${customClass}`;
  } else if (status === "APPROVED" || status === "RECOMENDADA") {
    className += " border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  } else if (status === "REJECTED" || status === "NO_RECOMENDAR") {
    className += " border-rose-500/30 bg-rose-500/10 text-rose-300";
  } else if (status === "PRECAUCION") {
    className += " border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  } else {
    className += " border-white/10 bg-white/5 text-neutral-300";
  }

  return (
    <span className={`${className} normal-case`}>
      {Icon && <Icon className="w-4 h-4" />}
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

const ActorCard = ({ actor }: { actor: ActorData }) => (
  <div className={STYLES.subCard}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-neutral-500">
          {actor.label}
        </p>
        <p className="text-sm font-bold text-white mt-1 truncate inline-flex items-center gap-2">
          <User className="w-4 h-4 text-neutral-400" />
          {actor.name}
        </p>

        {(actor.email || actor.id) && (
          <p className="text-[11px] text-neutral-500 mt-1 truncate">
            {actor.email ? actor.email : actor.id}
          </p>
        )}

        {actor.at && (
          <p className="text-[11px] text-neutral-600 mt-1">{actor.at}</p>
        )}
      </div>

      {actor.status && (
        <StatusPill status={actor.status} text={statusLabelEs(actor.status)} />
      )}
    </div>
  </div>
);

function CollapsibleSection(props: {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  open: boolean;
  onToggle: () => void;
  innerRef?: React.RefObject<HTMLDivElement>;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { title, subtitle, icon: Icon, open, onToggle, innerRef, right } = props;

  return (
    <div ref={innerRef} className={STYLES.card}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {Icon ? <Icon className="w-4 h-4 text-neutral-400" /> : null}
            <h5 className="text-sm font-bold text-white uppercase tracking-widest">
              {title}
            </h5>
          </div>
          {subtitle ? (
            <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {right}
          <span className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
            {open ? (
              <ChevronUp className="w-4 h-4 text-neutral-200" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-200" />
            )}
          </span>
        </div>
      </button>

      {open ? <div className="mt-4">{props.children}</div> : null}
    </div>
  );
}

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

type SectionKey = "RESUMEN" | "DECISION" | "TRAZABILIDAD" | "AUDITORIA";

export default function AdminDetailContent({
  selectedId,
  loadingDetail,
  hasDetail,
  selectedSummary,
  selectedDetail,
}: Props) {
  const { audit, loadingAudit } = useAdminAudit({
    entityType: "EVALUATION",
    entityId: selectedId ?? undefined,
  });

  const [execSummary, setExecSummary] = useState<ExecSummary | null>(null);
  const [execLoading, setExecLoading] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  // ✅ NEW: user básico del coordinador (por coordinatorUserId)
  const [coordUser, setCoordUser] = useState<UserBasic | null>(null);
  const [coordUserLoading, setCoordUserLoading] = useState(false);

  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    RESUMEN: true,
    DECISION: true,
    TRAZABILIDAD: false,
    AUDITORIA: false,
  });

  const [auditExpanded, setAuditExpanded] = useState(false);

  const refResumen = useRef<HTMLDivElement>(null);
  const refDecision = useRef<HTMLDivElement>(null);
  const refTraz = useRef<HTMLDivElement>(null);
  const refAudit = useRef<HTMLDivElement>(null);

  const scrollTo = (key: SectionKey) => {
    setOpen((prev) => ({ ...prev, [key]: true }));
    window.setTimeout(() => {
      const map: Record<SectionKey, React.RefObject<HTMLDivElement>> = {
        RESUMEN: refResumen,
        DECISION: refDecision,
        TRAZABILIDAD: refTraz,
        AUDITORIA: refAudit,
      };
      map[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  useEffect(() => {
    setOpen({
      RESUMEN: true,
      DECISION: true,
      TRAZABILIDAD: false,
      AUDITORIA: false,
    });
    setAuditExpanded(false);
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

  // ✅ coordinatorUserId: primero desde raw/summary (porque executive-summary no trae decidedBy)
  const coordinatorUserId = useMemo(() => {
    const v =
      safeString(rawDetail?.coordinatorUserId, "") ||
      safeString((selectedSummary as any)?.coordinatorUserId, "") ||
      safeString((execSummary as any)?.coordinatorDecision?.decidedBy?.id, "");
    return v || null;
  }, [rawDetail?.coordinatorUserId, selectedSummary, execSummary]);

  // ✅ fetch user básico del coordinador por id
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
    rawDetail?.aiSummaryWeaknesses ?? (selectedSummary as any)?.aiSummaryWeaknesses
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

    // ✅ coordinador: prioridad -> decidedBy (si existe) -> coordUser (lookup por id) -> raw.coordinator
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
  }, [selectedDetail, selectedSummary, execSummary, rawDetail, coordUser]);

  const auditVisible = useMemo(() => {
    const items = audit ?? [];
    if (auditExpanded) return items;
    return items.slice(0, 10);
  }, [audit, auditExpanded]);

  if (!selectedId)
    return <EmptyState icon={LayoutDashboard} msg="Selecciona una evaluación." />;
  if (loadingDetail)
    return <EmptyState icon={Loader2} msg="Cargando detalle..." spin />;
  if (!hasDetail || !selectedDetail)
    return (
      <EmptyState icon={AlertCircle} msg="No se pudo cargar el detalle." isError />
    );

  const chipClass = (active: boolean) =>
    `${STYLES.chip} ${
      active
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
        : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10"
    }`;

  const schoolProgramLabel = pickCandidateSchoolProgramLabel(
    selectedSummary,
    rawDetail,
    execSummary
  );

  return (
    <div className="space-y-6">
      <div className={STYLES.card}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={STYLES.label}>Candidato</p>
            <h4 className="text-white font-bold text-xl leading-tight truncate">
              {selectedSummary?.candidate?.fullName ??
                rawDetail?.candidate?.fullName ??
                rawDetail?.formRawData?.candidate?.fullName ??
                "Sin nombre"}
            </h4>

            <p className="text-xs text-neutral-500 mt-1">{schoolProgramLabel}</p>
          </div>

          <div className="text-right">
            <p className={STYLES.label}>Score IA</p>
            <p className="text-3xl font-black text-white">
              {aiScore.toFixed(0)}
              <span className="text-sm text-neutral-600 font-normal">/100</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill
            status={bucket}
            text={selectedSummary?.aiFinalRecommendation ?? "Sin recomendación"}
            icon={bucket === "RECOMENDADA" ? ShieldCheck : AlertCircle}
          />

          <StatusPill
            status="CUSTOM"
            customClass="border-white/10 bg-white/5 text-neutral-300"
            text={`Coordinador: ${statusLabelEs(actors.coord.status ?? "PENDING")}`}
            icon={User}
          />

          {coordUserLoading && (
            <StatusPill
              status="CUSTOM"
              customClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
              text="Buscando coordinador…"
              icon={Loader2}
            />
          )}

          {execLoading && (
            <StatusPill
              status="CUSTOM"
              customClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
              text="Sincronizando decisión…"
              icon={Loader2}
            />
          )}

          {execError && (
            <StatusPill
              status="CUSTOM"
              customClass="border-rose-500/20 bg-rose-500/10 text-rose-300"
              text="No se pudo traer decisión"
              icon={AlertCircle}
            />
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(open.RESUMEN)}
            onClick={() => scrollTo("RESUMEN")}
            title="Ir a Resumen"
          >
            <FileText className="w-4 h-4" />
            Resumen
          </button>

          <button
            type="button"
            className={chipClass(open.DECISION)}
            onClick={() => scrollTo("DECISION")}
            title="Ir a Decisión"
          >
            <Gavel className="w-4 h-4" />
            Decisión
          </button>

          <button
            type="button"
            className={chipClass(open.TRAZABILIDAD)}
            onClick={() => scrollTo("TRAZABILIDAD")}
            title="Ir a Trazabilidad"
          >
            <Users className="w-4 h-4" />
            Trazabilidad
          </button>
        </div>
      </div>

      <CollapsibleSection
        id="sec-resumen"
        title="Resumen ejecutivo (IA)"
        subtitle="Síntesis del análisis y señales clave."
        icon={FileText}
        open={open.RESUMEN}
        onToggle={() => setOpen((p) => ({ ...p, RESUMEN: !p.RESUMEN }))}
        innerRef={refResumen}
      >
        <p className="text-sm text-neutral-300 leading-relaxed">
          {executiveText || "Aún no hay resumen ejecutivo disponible."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className={STYLES.subCard}>
            <p className={`${STYLES.label} mb-2 text-emerald-500/80`}>
              Fortalezas
            </p>

            {strengths.length ? (
              <ul className="text-sm text-neutral-300 space-y-1">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-400">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-500">Sin datos</p>
            )}
          </div>

          <div className={STYLES.subCard}>
            <p className={`${STYLES.label} mb-2 text-rose-500/80`}>
              Riesgos / Alertas
            </p>

            {risks.length ? (
              <ul className="text-sm text-neutral-300 space-y-1">
                {risks.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-rose-400">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-500">Sin datos</p>
            )}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="sec-decision"
        title="Decisión del Coordinador"
        subtitle="Veredicto y comentario (si aplica)."
        icon={Gavel}
        open={open.DECISION}
        onToggle={() => setOpen((p) => ({ ...p, DECISION: !p.DECISION }))}
        innerRef={refDecision}
        right={
          <StatusPill
            status={actors.coord.status ?? "PENDING"}
            text={statusLabelEs(actors.coord.status ?? "PENDING")}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActorCard actor={actors.coord} />

          <div className={STYLES.subCard}>
            <p className={STYLES.label}>Comentario</p>
            <textarea
              rows={4}
              className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none"
              value={(execSummary as any)?.coordinatorDecision?.notes ?? ""}
              readOnly
              placeholder="Sin comentario."
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="sec-trazabilidad"
        title="Trazabilidad humana"
        subtitle="Roles y responsables."
        icon={Users}
        open={open.TRAZABILIDAD}
        onToggle={() =>
          setOpen((p) => ({ ...p, TRAZABILIDAD: !p.TRAZABILIDAD }))
        }
        innerRef={refTraz}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActorCard actor={actors.leader} />
          <ActorCard actor={actors.coord} />
        </div>
      </CollapsibleSection>

      {/* Auditoría apagada */}
      {false && loadingAudit && (
        <pre className="text-xs text-neutral-400">
          {JSON.stringify(auditVisible, null, 2)}
        </pre>
      )}
    </div>
  );
}

// Empty / Loading
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
}) => (
  <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-4 min-h-[300px]">
    <div
      className={`p-4 rounded-full ${
        isError ? "bg-rose-500/10 text-rose-500" : "bg-white/5"
      }`}
    >
      <Icon
        size={32}
        className={`opacity-70 ${spin ? "animate-spin text-emerald-500" : ""}`}
      />
    </div>
    <p className="text-sm text-center max-w-xs">{msg}</p>
  </div>
);
