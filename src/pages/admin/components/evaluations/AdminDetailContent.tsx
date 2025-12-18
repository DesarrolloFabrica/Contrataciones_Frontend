// src/pages/admin/components/AdminDetailContent.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  LayoutDashboard,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Info,
} from "lucide-react";

import type { TeacherEvaluationSummary } from "../../../../types";
import type { AdminTab, AdminSystemMeta } from "../../adminTypes";
import { getBucket } from "../../utils/adminSelectors";

import { useAdminAudit } from "../../hooks/useAdminAudit";
import AdminAuditTimeline from "../audit/AdminAuditTimeline";

import AdminSystemMetaCard from "../detail/AdminSystemMetaCard";

// ✅ Servicios (como en el anterior)
import {
  getExecutiveSummary,
  updateAdminDecision,
  type TeacherExecutiveSummary as ExecSummary,
} from "../../../../services/teachersService";

const pillBase =
  "px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2";

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
  // ✅ Conexión actual (audit)
  const { audit, loadingAudit } = useAdminAudit({
    entityType: "EVALUATION",
    entityId: selectedId ?? undefined,
  });

  // ✅ Conexiones anteriores (exec summary + admin decision)
  const [execSummary, setExecSummary] = useState<ExecSummary | null>(null);
  const [execLoading, setExecLoading] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  const [adminComment, setAdminComment] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setExecSummary(null);
      setExecError(null);
      setExecLoading(false);
      setAdminComment("");
      setAdminError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setExecLoading(true);
        setExecError(null);
        const data = await getExecutiveSummary(selectedId);
        if (cancelled) return;

        setExecSummary(data);
        setAdminComment(data.adminDecision?.notes ?? "");
      } catch (err) {
        console.error("Error al cargar resumen ejecutivo:", err);
        if (!cancelled) setExecError("No se pudo cargar el resumen ejecutivo.");
      } finally {
        if (!cancelled) setExecLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleAdminDecision = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedId) return;

    try {
      setAdminSaving(true);
      setAdminError(null);

      const updated = await updateAdminDecision(selectedId, {
        status,
        comment: adminComment || undefined,
      });

      setExecSummary(updated);
      setAdminComment(updated.adminDecision?.notes ?? "");
    } catch (err) {
      console.error("Error al actualizar decisión del admin:", err);
      setAdminError("No se pudo guardar la decisión. Intenta de nuevo.");
    } finally {
      setAdminSaving(false);
    }
  };

  // ✅ Normalización segura del análisis (UI actual)
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

  const aiScore = asNumber(
    ai?.scores?.teachingSuitability ??
      ai?.teachingSuitabilityScore ??
      selectedSummary?.aiTeachingSuitabilityScore ??
      execSummary?.aiScore ??
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

  const currentCoordStatus =
    execSummary?.coordinatorDecision?.verdict ??
    (selectedSummary as any)?.coordinatorDecisionStatus ??
    "PENDING";

  const currentAdminStatus = execSummary?.adminDecision?.verdict ?? "PENDING";

  const systemMeta: AdminSystemMeta | null = {
    evaluationId: selectedId,
    model: safeNullishString(ai?.meta?.model ?? ai?.model),
    promptVersion: safeNullishString(ai?.meta?.promptVersion ?? ai?.promptVersion),
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
              {(selectedSummary?.candidate?.schoolNameSnapshot ?? "Sin escuela") +
                " · " +
                (selectedSummary?.candidate?.programNameSnapshot ?? "Sin programa")}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">
              Score
            </p>
            <p className="text-2xl font-black text-white">
              {(selectedSummary?.aiTeachingSuitabilityScore ?? aiScore ?? 0).toFixed(0)}
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

          <span
            className={`${pillBase} border-white/10 bg-white/5 text-neutral-200 normal-case`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Coordinador:
            <b className="ml-1">{statusLabelEs(currentCoordStatus)}</b>
          </span>

          <span
            className={`${pillBase} border-cyan-500/30 bg-cyan-500/10 text-cyan-200 normal-case`}
          >
            <Shield className="w-4 h-4" />
            Admin:
            <b className="ml-1">{statusLabelEs(currentAdminStatus)}</b>
          </span>

          {execLoading && (
            <span className={`${pillBase} border-white/10 bg-white/5 text-neutral-400 normal-case`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando resumen ejecutivo...
            </span>
          )}
          {execError && (
            <span className={`${pillBase} border-rose-500/30 bg-rose-500/10 text-rose-200 normal-case`}>
              <AlertCircle className="w-4 h-4" />
              {execError}
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

      {/* TAB: COORDINADOR (lectura) + Auditoría (actual) */}
      {tab === "COORDINADOR" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
            <h5 className="text-sm font-bold text-white uppercase tracking-widest">
              Coordinador
            </h5>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Estado y comentarios registrados por el coordinador de programa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-[11px] uppercase tracking-widest text-neutral-500">
                  Estado coordinador
                </p>
                <p className="text-base font-bold text-white mt-1">
                  {statusLabelEs(currentCoordStatus ?? "PENDING")}
                </p>
                {execSummary?.coordinatorDecision?.decidedAt && (
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Última actualización:{" "}
                    {new Date(execSummary.coordinatorDecision.decidedAt).toLocaleString("es-CO")}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-[11px] uppercase tracking-widest text-neutral-500">
                  Rol coordinador
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Aquí solo se visualiza lo decidido por el coordinador. La
                  decisión final se toma desde la pestaña Admin.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2">
              <p className="text-[11px] uppercase tracking-widest text-neutral-500">
                Comentarios del coordinador
              </p>
              <textarea
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600"
                value={execSummary?.coordinatorDecision?.notes ?? ""}
                readOnly
              />
            </div>
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
              <div className="max-h-[280px] overflow-y-auto pr-2">
                <AdminAuditTimeline events={audit} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ADMIN (acción final) */}
      {tab === "ADMIN" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
            <h5 className="text-sm font-bold text-white uppercase tracking-widest">
              Decisión Admin
            </h5>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Define la decisión final basándote en IA y la recomendación del coordinador.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-[11px] uppercase tracking-widest text-neutral-500">
                  Estado actual (admin)
                </p>
                <p className="text-base font-bold text-white mt-1">
                  {statusLabelEs(currentAdminStatus ?? "PENDING")}
                </p>
                {execSummary?.adminDecision?.decidedAt && (
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Última actualización:{" "}
                    {new Date(execSummary.adminDecision.decidedAt).toLocaleString("es-CO")}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-[11px] uppercase tracking-widest text-neutral-500">
                  Acción admin
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Confirma si el candidato pasa a contratación o se cierra el proceso.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={adminSaving}
                    onClick={() => handleAdminDecision("APPROVED")}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-widest bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Aprobar contratación
                  </button>
                  <button
                    type="button"
                    disabled={adminSaving}
                    onClick={() => handleAdminDecision("REJECTED")}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-widest bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    No aprobar
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2">
              <p className="text-[11px] uppercase tracking-widest text-neutral-500">
                Comentarios del admin
              </p>
              <textarea
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/60"
                placeholder="Describe la justificación final (máx. 2000 caracteres)."
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                disabled={adminSaving}
              />
              {adminError && <p className="text-xs text-rose-400 mt-1">{adminError}</p>}
              {adminSaving && (
                <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Guardando decisión del admin...
                </p>
              )}
            </div>
          </div>

          {/* Auditoría también visible aquí (opcional pero útil) */}
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
    </div>
  );
}
