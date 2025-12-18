// src/pages/admin/components/AdminExecutivePanel.tsx
import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { TeacherExecutiveSummary } from "../../../services/teachersService";

interface Props {
  loading: boolean;
  error: string | null;
  summary: TeacherExecutiveSummary | null;
}

const AdminExecutivePanel: React.FC<Props> = ({ loading, error, summary }) => {
  // estados básicos
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
        <span>Cargando resumen ejecutivo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center gap-2 text-sm text-rose-300">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (!summary) {
    // ya hay una tarjeta arriba diciendo "Selecciona una evaluación",
    // aquí solo dejamos un placeholder suave
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-500">
        Sin resumen ejecutivo disponible para esta evaluación.
      </div>
    );
  }

  const renderStatusBadge = () => {
    const base =
      "mt-1 inline-flex items-center px-3 py-1 rounded-full text-[11px] border";

    let style = " border-white/15 text-neutral-300 bg-white/5";
    if (summary.finalStatus === "APPROVED") {
      style = " border-emerald-500/40 text-emerald-300 bg-emerald-500/10";
    } else if (summary.finalStatus === "REJECTED") {
      style = " border-rose-500/40 text-rose-300 bg-rose-500/10";
    }

    const label =
      summary.finalStatus === "APPROVED"
        ? "APROBADO"
        : summary.finalStatus === "REJECTED"
        ? "NO APROBADO"
        : "PENDIENTE";

    return <div className={base + style}>{label}</div>;
  };

  return (
    <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Título + copy fijo del panel */}
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-sm">
          <h4 className="text-xs font-bold uppercase tracking-[0.18em]">
            Resumen Ejecutivo
          </h4>
          <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
            Este panel consolida score, recomendación IA y decisiones humanas
            para revisión final. Aquí luego conectas aprobación final admin y
            trazabilidad.
          </p>
        </div>

        <div className="text-right">
          <div className="text-neutral-500 text-[11px] uppercase tracking-widest">
            Score IA
          </div>
          <div className="text-2xl font-bold">
            {summary.aiScore ?? "--"}
            <span className="text-xs text-neutral-500"> /100</span>
          </div>
          <div className="mt-2">{renderStatusBadge()}</div>
        </div>
      </div>

      {/* Bloque de textos IA / humano (si los tienes en el tipo) */}
      <div className="grid grid-cols-1 gap-3 text-sm text-neutral-300">
        {summary.aiRecommendationText && (
          <div className="rounded-xl bg-black/30 border border-white/10 p-3">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">
              Recomendación IA
            </p>
            <p className="text-sm leading-relaxed">
              {summary.aiRecommendationText}
            </p>
          </div>
        )}

        {summary.coordinatorDecisionText && (
          <div className="rounded-xl bg-black/30 border border-white/10 p-3">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">
              Decisión coordinador
            </p>
            <p className="text-sm leading-relaxed">
              {summary.coordinatorDecisionText}
            </p>
          </div>
        )}

        {summary.adminDecisionText && (
          <div className="rounded-xl bg-black/30 border border-white/10 p-3">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">
              Decisión admin
            </p>
            <p className="text-sm leading-relaxed">
              {summary.adminDecisionText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExecutivePanel;
