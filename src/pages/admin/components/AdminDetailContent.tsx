// src/pages/admin/components/AdminDetailContent.tsx
import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  LayoutDashboard,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../types";
import type { AdminTab } from "../utils/adminTypes";
import { getBucket } from "../utils/adminSelectors";
import AdminExecutivePanel from "./AdminExecutivePanel";
import {
  getExecutiveSummary,
  updateCoordinatorDecision,
  type TeacherExecutiveSummary as ExecSummary,
} from "../../../services/teachersService";

const pillBase =
  "px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2";

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

  // --- estado para el resumen ejecutivo (nuevo endpoint) ---
  const [execSummary, setExecSummary] = useState<ExecSummary | null>(null);
  const [execLoading, setExecLoading] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  // --- estado para la edición del coordinador ---
  const [coordComment, setCoordComment] = useState("");
  const [coordSaving, setCoordSaving] = useState(false);
  const [coordError, setCoordError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setExecSummary(null);
      setExecError(null);
      setExecLoading(false);
      setCoordComment("");
      setCoordError(null);
      return;
    }

    const load = async () => {
      try {
        setExecLoading(true);
        setExecError(null);
        const data = await getExecutiveSummary(selectedId);
        setExecSummary(data);
        setCoordComment(data.coordinatorDecision?.notes ?? "");
      } catch (err) {
        console.error("Error al cargar resumen ejecutivo:", err);
        setExecError("No se pudo cargar el resumen ejecutivo.");
      } finally {
        setExecLoading(false);
      }
    };

    load();
  }, [selectedId]);

  const handleCoordinatorDecision = async (
    status: "APPROVED" | "REJECTED"
  ) => {
    if (!selectedId) return;

    try {
      setCoordSaving(true);
      setCoordError(null);

      const updated = await updateCoordinatorDecision(selectedId, {
        status,
        comment: coordComment || undefined,
      });

      // refrescamos estado local con respuesta del backend
      setExecSummary(updated);
      setCoordComment(updated.coordinatorDecision?.notes ?? "");
    } catch (err) {
      console.error("Error al actualizar decisión del coordinador:", err);
      setCoordError("No se pudo guardar la decisión. Intenta de nuevo.");
    } finally {
      setCoordSaving(false);
    }
  };

  if (!selectedId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-4">
        <div className="p-4 bg-white/5 rounded-full">
          <LayoutDashboard size={32} className="opacity-50" />
        </div>
        <p className="text-sm text-center max-w-xs">
          Selecciona una evaluación de la lista para abrir el detalle
          ejecutivo.
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
              {(selectedSummary?.aiTeachingSuitabilityScore ?? 0).toFixed(0)}
              <span className="text-sm text-neutral-600">/100</span>
            </p>
            <p className="text-[11px] mt-1 text-neutral-500">
              {selectedSummary?.createdAt
                ? new Date(
                    selectedSummary.createdAt
                  ).toLocaleString("es-CO")
                : ""}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`${pillBase} ${badgeCls} normal-case`}>
            {icon}
            {selectedSummary?.aiFinalRecommendation ??
              "Sin recomendación IA"}
          </span>

          {currentCoordStatus && (
            <span
              className={`${pillBase} border-white/10 bg-white/5 text-neutral-200 normal-case`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Decisión coordinador:
              <b className="ml-1">{String(currentCoordStatus)}</b>
            </span>
          )}
        </div>
      </div>

      {/* TAB: RESUMEN → usa AdminExecutivePanel */}
      {tab === "RESUMEN" && (
        <AdminExecutivePanel
          // si tu AdminExecutivePanel ya no carga solo, pásale esto:
          // selectedEvaluation={selectedSummary ?? null}
          // y/o props de execSummary si lo hiciste "tonto"
          selectedEvaluation={selectedSummary ?? null}
        />
      )}

      {/* TAB: IA */}
      {tab === "IA" && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
          <h5 className="text-sm font-bold text-white uppercase tracking-widest">
            Contenido IA (alto nivel)
          </h5>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Este espacio está listo para renderizar tus secciones del JSON IA
            (riesgos, fortalezas, alertas).
          </p>

          <div className="border border-white/10 rounded-xl bg-black/30 p-3">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-2">
              Debug quick peek
            </p>
            <pre className="text-[11px] text-neutral-300 overflow-auto max-h-48 whitespace-pre-wrap">
              {JSON.stringify(selectedDetail.analysis, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* TAB: COORDINADOR */}
      {tab === "COORDINADOR" && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
          <h5 className="text-sm font-bold text-white uppercase tracking-widest">
            Coordinador
          </h5>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Registra la decisión del coordinador con una breve justificación.
            Esta decisión alimenta la aprobación final del admin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-widest text-neutral-500">
                Estado actual
              </p>
              <p className="text-base font-bold text-white mt-1">
                {String(currentCoordStatus ?? "PENDING")}
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
                Acción coordinador
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Confirma si recomiendas continuar con el proceso o no.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={coordSaving}
                  onClick={() => handleCoordinatorDecision("APPROVED")}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-widest bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Aprobar candidato
                </button>
                <button
                  type="button"
                  disabled={coordSaving}
                  onClick={() => handleCoordinatorDecision("REJECTED")}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-widest bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  No recomendar
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500">
              Comentarios del coordinador
            </p>
            <textarea
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
              placeholder="Describe brevemente tu justificación (máx. 2000 caracteres)."
              value={coordComment}
              onChange={(e) => setCoordComment(e.target.value)}
              disabled={coordSaving}
            />
            {coordError && (
              <p className="text-xs text-rose-400 mt-1">{coordError}</p>
            )}
            {coordSaving && (
              <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Guardando decisión del coordinador...
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB: AUDITORIA */}
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

      {/* TAB: TECNICO */}
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
