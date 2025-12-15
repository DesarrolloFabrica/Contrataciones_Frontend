// src/pages/admin/components/AdminDetailContent.tsx
import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  LayoutDashboard,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../types";
import type { AdminTab } from "../utils/adminTypes";
import { getBucket } from "../utils/adminSelectors";
import AdminExecutivePanel from "./AdminExecutivePanel";
import {
  getExecutiveSummary,
  updateAdminDecision,
  type TeacherExecutiveSummary as ExecSummary,
} from "../../../services/teachersService";

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

export default function AdminDetailContent(props: {
  selectedId: string | null;
  loadingDetail: boolean;
  hasDetail: boolean;

  selectedSummary: TeacherEvaluationSummary | null;
  selectedDetail: { analysis: any; interview: any; raw: any } | null;

  tab: AdminTab;
}) {
  const {
    selectedId,
    loadingDetail,
    hasDetail,
    selectedSummary,
    selectedDetail,
    tab,
  } = props;

  // --- resumen ejecutivo desde backend ---
  const [execSummary, setExecSummary] = useState<ExecSummary | null>(null);
  const [execLoading, setExecLoading] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  // --- edición ADMIN (decisión final) ---
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

    const load = async () => {
      try {
        setExecLoading(true);
        setExecError(null);
        const data = await getExecutiveSummary(selectedId);
        setExecSummary(data);
        setAdminComment(data.adminDecision?.notes ?? "");
      } catch (err) {
        console.error("Error al cargar resumen ejecutivo:", err);
        setExecError("No se pudo cargar el resumen ejecutivo.");
      } finally {
        setExecLoading(false);
      }
    };

    load();
  }, [selectedId]);

  const handleAdminDecision = async (
    status: "APPROVED" | "REJECTED"
  ) => {
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

  if (!selectedId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-4">
        <div className="p-4 bg-white/5 rounded-full">
          <LayoutDashboard size={32} className="opacity-50" />
        </div>
        <p className="text-sm text-center max-w-xs">
          Selecciona una evaluación de la lista para abrir el detalle ejecutivo.
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

  // header candidate
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

  const currentCoordStatus =
    execSummary?.coordinatorDecision?.verdict ??
    selectedSummary?.coordinatorDecisionStatus ??
    "PENDING";

  const currentAdminStatus =
    execSummary?.adminDecision?.verdict ?? "PENDING";

  return (
    <div className="space-y-4">
      {/* CABECERA CANDIDATO + RECOMENDACIÓN IA */}
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
              {(selectedSummary?.aiTeachingSuitabilityScore ?? 0).toFixed(0)}
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

          {currentCoordStatus && (
            <span
              className={`${pillBase} border-white/10 bg-white/5 text-neutral-200 normal-case`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Coordinador:
              <b className="ml-1">{statusLabelEs(currentCoordStatus)}</b>
            </span>
          )}

          <span
            className={`${pillBase} border-cyan-500/30 bg-cyan-500/10 text-cyan-200 normal-case`}
          >
            <Shield className="w-4 h-4" />
            Admin:
            <b className="ml-1">{statusLabelEs(currentAdminStatus)}</b>
          </span>
        </div>
      </div>

      {/* TAB: RESUMEN */}
      {tab === "RESUMEN" && (
        <AdminExecutivePanel
          loading={execLoading}
          error={execError}
          summary={execSummary}
        />
      )}

      {/* TAB: COORDINADOR (solo lectura) */}
      {tab === "COORDINADOR" && (
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
                  {new Date(
                    execSummary.coordinatorDecision.decidedAt
                  ).toLocaleString("es-CO")}
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
      )}

      {/* TAB: ADMIN (acción final) */}
      {tab === "ADMIN" && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
          <h5 className="text-sm font-bold text-white uppercase tracking-widest">
            Decisión Admin
          </h5>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Define la decisión final de contratación basándote en el análisis de
            IA y la recomendación del coordinador.
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
                  {new Date(
                    execSummary.adminDecision.decidedAt
                  ).toLocaleString("es-CO")}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-widest text-neutral-500">
                Acción admin
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Confirma si el candidato pasa a contratación o se cierra el
                proceso.
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
            {adminError && (
              <p className="text-xs text-rose-400 mt-1">{adminError}</p>
            )}
            {adminSaving && (
              <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Guardando decisión del admin...
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB: AUDITORIA (si se reactiva) */}
      {tab === "AUDITORIA" && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
          <h5 className="text-sm font-bold text-white uppercase tracking-widest">
            Auditoría (UI lista)
          </h5>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Aquí va el timeline completo (cuando conectes backend).
          </p>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs text-neutral-400">
              Placeholder: conectar a endpoint de auditoría y renderizar
              eventos.
            </p>
          </div>
        </div>
      )}

      {/* TAB: TECNICO (si se reactiva) */}
      {tab === "TECNICO" && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
          <h5 className="text-sm font-bold text-white uppercase tracking-widest">
            Técnico
          </h5>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Metadata técnica (ids, flags, payloads).
          </p>

          <div className="border border-white/10 rounded-xl bg-black/30 p-3">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-2">
              Raw response (debug)
            </p>
            <pre className="text-[11px] text-neutral-300 overflow-auto max-h-48 whitespace-pre-wrap">
              {JSON.stringify(selectedDetail.raw, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
