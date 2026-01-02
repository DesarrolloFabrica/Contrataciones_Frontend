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
  ScrollText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { TeacherEvaluationSummary } from "../../../../types";
import { getBucket } from "../../utils/adminSelectors";

import { useAdminAudit } from "../../hooks/useAdminAudit";
import AdminAuditTimeline from "../audit/AdminAuditTimeline";

import {
  getExecutiveSummary,
  type TeacherExecutiveSummary as ExecSummary,
} from "../../../../services/teachersService";

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

function pickArrayStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, 8);
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
  // ✅ Hooks SIEMPRE arriba
  const { audit, loadingAudit } = useAdminAudit({
    entityType: "EVALUATION",
    entityId: selectedId ?? undefined,
  });

  const [execSummary, setExecSummary] = useState<ExecSummary | null>(null);
  const [execLoading, setExecLoading] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  // Collapsables
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    RESUMEN: true,
    DECISION: true,
    TRAZABILIDAD: false,
    AUDITORIA: false,
  });

  // Auditoría: 10 por defecto
  const [auditExpanded, setAuditExpanded] = useState(false);

  // Anchors (para chips)
  const refResumen = useRef<HTMLDivElement>(null);
  const refDecision = useRef<HTMLDivElement>(null);
  const refTraz = useRef<HTMLDivElement>(null);
  const refAudit = useRef<HTMLDivElement>(null);

  const scrollTo = (key: SectionKey) => {
    // Abre la sección antes de scrollear (para que exista altura)
    setOpen((prev) => ({ ...prev, [key]: true }));

    // Espera un tick para que React renderice la expansión
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

  // Si cambia de evaluación: reset a estado “sano”
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

  // ✅ Derivaciones seguras (sin romper)
  const analysis = selectedDetail?.analysis ?? {};
  const bucket = getBucket(selectedSummary?.aiFinalRecommendation);

  const aiScore = asNumber(
    (analysis as any)?.scores?.teachingSuitability ??
      (selectedSummary as any)?.aiTeachingSuitabilityScore ??
      0
  );

  const executiveText = safeString(
    (analysis as any)?.executiveSummary || (analysis as any)?.summary,
    ""
  );

  const strengths = pickArrayStrings(
    (analysis as any)?.strengths || (analysis as any)?.highlights
  );
  const risks = pickArrayStrings(
    (analysis as any)?.risks || (analysis as any)?.alerts
  );

  const actors = useMemo(() => {
    const raw = selectedDetail?.raw ?? {};
    const sum = selectedSummary ?? ({} as any);

    const leaderSrc =
      selectedDetail?.interview?.leader ||
      selectedDetail?.interview?.interviewer ||
      (raw as any)?.leader ||
      (sum as any)?.leader;

    const leader: ActorData = {
      label: "Líder (Entrevista)",
      ...(pickActorFromAny(leaderSrc) || { name: "No disponible" }),
      at: isoToEs((raw as any)?.createdAt || (sum as any)?.createdAt),
      status: null,
    };

    const coordSrc =
      (execSummary as any)?.coordinatorDecision?.decidedBy ||
      (raw as any)?.coordinator;

    const coord: ActorData = {
      label: "Coordinador",
      ...(pickActorFromAny(coordSrc) || { name: "No disponible" }),
      at: isoToEs((execSummary as any)?.coordinatorDecision?.decidedAt),
      status:
        ((execSummary as any)?.coordinatorDecision?.verdict as any) ||
        ((sum as any)?.coordinatorDecisionStatus as any) ||
        "PENDING",
    };

    return { leader, coord };
  }, [selectedDetail, selectedSummary, execSummary]);

  const auditVisible = useMemo(() => {
    const items = audit ?? [];
    if (auditExpanded) return items;
    return items.slice(0, 10);
  }, [audit, auditExpanded]);

  // ✅ Returns condicionales DESPUÉS de hooks
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

  const chipClass = (active: boolean) =>
    `${STYLES.chip} ${
      active
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
        : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10"
    }`;

  return (
    <div className="space-y-6">
      {/* 1) Header candidato */}
      <div className={STYLES.card}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={STYLES.label}>Candidato</p>
            <h4 className="text-white font-bold text-xl leading-tight truncate">
              {selectedSummary?.candidate?.fullName ?? "Sin nombre"}
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              {(selectedSummary?.candidate?.schoolNameSnapshot ?? "-") +
                " · " +
                (selectedSummary?.candidate?.programNameSnapshot ?? "-")}
            </p>
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
            text={`Coordinador: ${statusLabelEs(
              actors.coord.status ?? "PENDING"
            )}`}
            icon={User}
          />

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

        {/* Chips de navegación */}
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

          <button
            type="button"
            className={chipClass(open.AUDITORIA)}
            onClick={() => scrollTo("AUDITORIA")}
            title="Ir a Auditoría"
          >
            <ScrollText className="w-4 h-4" />
            Auditoría
          </button>
        </div>
      </div>

      {/* 2) Resumen ejecutivo IA (colapsable) */}
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

      {/* 3) Decisión del coordinador (colapsable) */}
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

      {/* 4) Trazabilidad (colapsable) */}
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

      {/* 5) Auditoría (colapsable + 10 items por defecto) */}
      <CollapsibleSection
        id="sec-auditoria"
        title="Auditoría"
        subtitle="Historial de eventos y trazas."
        icon={ScrollText}
        open={open.AUDITORIA}
        onToggle={() => setOpen((p) => ({ ...p, AUDITORIA: !p.AUDITORIA }))}
        innerRef={refAudit}
        right={
          <span className="text-xs text-neutral-500">
            {audit.length} items
          </span>
        }
      >
        {loadingAudit ? (
          <div className="py-4 text-center text-neutral-500 text-sm">
            Cargando trazas...
          </div>
        ) : audit.length ? (
          <>
            <div className="max-h-[420px] overflow-auto pr-2 scrollbar-pro">
              <AdminAuditTimeline events={auditVisible} />
            </div>

            {audit.length > 10 && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setAuditExpanded((v) => !v)}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest text-neutral-200"
                >
                  {auditExpanded ? "Ver menos" : "Ver todo"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center text-neutral-600 text-sm">
            Aún no hay actividad relevante.
          </div>
        )}
      </CollapsibleSection>
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
