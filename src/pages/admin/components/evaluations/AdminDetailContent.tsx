// src/pages/admin/components/AdminDetailContent.tsx
import React, { useMemo } from "react";
import {
  AlertCircle,
  LayoutDashboard,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Info,
} from "lucide-react";

import type { TeacherEvaluationSummary } from "../../../../types";
import type {
  AdminTab,
  AdminSystemMeta,
  AdminAssignment,
  AdminFinalDecision,
  CoordinatorDecision,
} from "../../adminTypes";
import { getBucket } from "../../utils/adminSelectors";

import { useAdminAudit } from "../../hooks/useAdminAudit";
import AdminAuditTimeline from "../audit/AdminAuditTimeline";

import AdminAdminDecisionCard from "../detail/AdminAdminDecisionCard";
import AdminAssignmentCard from "../detail/AdminAssignmentCard";
import AdminSystemMetaCard from "../detail/AdminSystemMetaCard";

const pillBase =
  "px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2";

function safeString(v: unknown, fallback = "-") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

function safeNullishString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function asNumber(v: unknown, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pickArrayStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, 8);
}

type Props = {
  selectedId: string | null;
  loadingDetail: boolean;
  hasDetail: boolean;

  selectedSummary: TeacherEvaluationSummary | null;
  selectedDetail: { analysis: any; interview: any; raw: any } | null;

  tab: AdminTab;
};

export default function AdminDetailContent({
  selectedId,
  loadingDetail,
  hasDetail,
  selectedSummary,
  selectedDetail,
  tab,
}: Props) {
  // ✅ Audit hook siempre (para mostrar historial dentro del flujo)
  const { audit, loadingAudit } = useAdminAudit({
    entityType: "EVALUATION",
    entityId: selectedId ?? undefined,
  });

  // ✅ Normalización segura del análisis
  const analysis = selectedDetail?.analysis;
  const ai = analysis ?? {};

  const strengths = useMemo(() => {
    return pickArrayStrings(
      ai?.strengths ??
        ai?.strengthsList ??
        ai?.positiveSignals ??
        ai?.highlights
    );
  }, [analysis]);

  const risks = useMemo(() => {
    return pickArrayStrings(
      ai?.risks ?? ai?.riskSignals ?? ai?.alerts ?? ai?.redFlags ?? ai?.concerns
    );
  }, [analysis]);

  // ---- Estados base
  if (!selectedId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-4">
        <div className="p-4 bg-white/5 rounded-full">
          <LayoutDashboard size={32} className="opacity-50" />
        </div>
        <p className="text-sm text-center max-w-xs">
          Selecciona una evaluación para ver su detalle.
        </p>
      </div>
    );
  }

  if (loadingDetail) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-sm">Cargando detalle...</p>
      </div>
    );
  }

  if (!hasDetail || !selectedDetail) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-3">
        <AlertCircle className="w-8 h-8 text-rose-400" />
        <p className="text-sm text-center max-w-xs">
          No se pudo cargar el detalle de esta evaluación.
        </p>
      </div>
    );
  }

  // --- Derivados (con detail)
  const bucket = getBucket(selectedSummary?.aiFinalRecommendation);

  const badgeCls =
    bucket === "RECOMENDADA"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : bucket === "PRECAUCION"
      ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
      : bucket === "NO_RECOMENDAR"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
      : "border-white/10 bg-white/5 text-neutral-300";

  const icon =
    bucket === "RECOMENDADA" ? (
      <ShieldCheck className="w-4 h-4" />
    ) : bucket === "NO_RECOMENDAR" ? (
      <ShieldAlert className="w-4 h-4" />
    ) : (
      <AlertCircle className="w-4 h-4" />
    );

  const coordinatorDecisionStatus = (selectedSummary as any)
    ?.coordinatorDecisionStatus;

  const aiScore = asNumber(
    ai?.scores?.teachingSuitability ??
      ai?.teachingSuitabilityScore ??
      selectedSummary?.aiTeachingSuitabilityScore ??
      0,
    0
  );

  const executiveSummary = safeString(
    ai?.executiveSummary ??
      ai?.summary ??
      ai?.analysisExecutive ??
      ai?.finalSummary,
    ""
  );

  // ✅ Por ahora: mock (pero sin decirle “mock” al admin)
  const assignment: AdminAssignment | null = null;
  const coordinatorDecision: CoordinatorDecision | null = null;
  const adminDecision: AdminFinalDecision | null = null;

  const systemMeta: AdminSystemMeta | null = {
    evaluationId: selectedId,
    model: safeNullishString(ai?.meta?.model ?? ai?.model),
    promptVersion: safeNullishString(
      ai?.meta?.promptVersion ?? ai?.promptVersion
    ),
    requestId: safeNullishString(ai?.meta?.requestId ?? ai?.requestId),
    createdAt: safeNullishString(selectedSummary?.createdAt),
    updatedAt: safeNullishString((selectedSummary as any)?.updatedAt),
  };

  return (
    <div className="space-y-4">
      {/* Header candidato */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">
              Candidato
            </p>
            <h4 className="text-white font-bold text-lg leading-tight truncate">
              {selectedSummary?.candidate?.fullName ?? "Sin nombre"}
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              {(selectedSummary?.candidate?.schoolNameSnapshot ??
                "Sin escuela") +
                " · " +
                (selectedSummary?.candidate?.programNameSnapshot ??
                  "Sin programa")}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">
              Score
            </p>
            <p className="text-2xl font-black text-white">
              {(
                selectedSummary?.aiTeachingSuitabilityScore ??
                aiScore ??
                0
              ).toFixed(0)}
              <span className="text-sm text-neutral-600">/100</span>
            </p>
            <p className="text-[11px] mt-1 text-neutral-500">
              {selectedSummary?.createdAt
                ? new Date(selectedSummary.createdAt).toLocaleString("es-CO")
                : ""}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`${pillBase} ${badgeCls} normal-case`}>
            {icon}
            {selectedSummary?.aiFinalRecommendation ?? "Sin recomendación IA"}
          </span>

          {coordinatorDecisionStatus && (
            <span
              className={`${pillBase} border-white/10 bg-white/5 text-neutral-200 normal-case`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Decisión coordinador:{" "}
              <b className="ml-1">{safeString(coordinatorDecisionStatus)}</b>
            </span>
          )}
        </div>
      </div>

      {/* TAB: RESUMEN */}
      {tab === "RESUMEN" && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
          <h5 className="text-sm font-bold text-white uppercase tracking-widest">
            Resumen ejecutivo
          </h5>

          <p className="text-sm text-neutral-300 leading-relaxed">
            {executiveSummary?.length
              ? executiveSummary
              : "Aún no hay resumen ejecutivo disponible."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-2">
                Fortalezas
              </p>
              {strengths.length ? (
                <ul className="text-sm text-neutral-300 space-y-1">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-500">Sin datos</p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-2">
                Riesgos / alertas
              </p>
              {risks.length ? (
                <ul className="text-sm text-neutral-300 space-y-1">
                  {risks.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-rose-400">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-500">Sin datos</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: IA */}
      {tab === "IA" && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
          <h5 className="text-sm font-bold text-white uppercase tracking-widest">
            IA
          </h5>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-300 mt-0.5" />
              <p className="text-sm text-neutral-300 leading-relaxed">
                Aquí se mostrarán secciones interpretables del análisis (cuando
                el mapping esté completo).
              </p>
            </div>
          </div>

          <details className="rounded-xl border border-white/10 bg-black/30 p-3">
            <summary className="cursor-pointer text-[11px] uppercase tracking-widest text-neutral-400">
              Ver JSON (para soporte)
            </summary>
            <pre className="mt-3 text-[11px] text-neutral-300 overflow-auto max-h-64 whitespace-pre-wrap">
              {JSON.stringify(selectedDetail.analysis, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* TAB: COORDINADOR (lo convertimos en “Decisiones + Historial” sin cambiar el enum) */}
      {tab === "COORDINADOR" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
            <h5 className="text-sm font-bold text-white uppercase tracking-widest">
              Decisiones y seguimiento
            </h5>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Asignación, decisión del coordinador, decisión final y registro de
              cambios.
            </p>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
            <AdminAssignmentCard assignment={assignment} />
            <AdminAdminDecisionCard
              adminDecision={adminDecision}
              coordinatorDecision={coordinatorDecision}
            />
          </div>

          {loadingAudit ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-400">
              Cargando historial...
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <h6 className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold">
                  Historial de cambios
                </h6>
                <span className="text-[11px] text-neutral-500">
                  {audit.length} eventos
                </span>
              </div>

              {/* 👇 ESTE ES EL FIX: evita que el panel se alargue infinito */}
              <div className="max-h-[280px] overflow-y-auto pr-2">
                <AdminAuditTimeline events={audit} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: TECNICO */}
      {tab === "TECNICO" && (
        <div className="space-y-3">
          <AdminSystemMetaCard meta={systemMeta} />

          <details className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <summary className="cursor-pointer text-[11px] uppercase tracking-widest text-neutral-400">
              Ver respuesta cruda (soporte)
            </summary>
            <pre className="mt-3 text-[11px] text-neutral-300 overflow-auto max-h-64 whitespace-pre-wrap">
              {JSON.stringify(selectedDetail.raw, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* ✅ IMPORTANTE: quitamos el bloque tab === "AUDITORIA" para no duplicar/estresar al admin */}
    </div>
  );
}
