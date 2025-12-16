// src/pages/admin/components/AdminDetailPanel.tsx
import React from "react";
import { Download, LayoutDashboard } from "lucide-react";
import type { AdminTab } from "../../adminTypes";
import AdminDetailTabs from "./AdminDetailTabs";
import AdminDetailContent from "./AdminDetailContent";
import type { TeacherEvaluationSummary } from "../../../../types";

type Props = {
  selectedId: string | null;
  selectedSummary: TeacherEvaluationSummary | null;

  loadingDetail: boolean;
  selectedDetail: { analysis: any; interview: any; raw: any } | null;

  tab: AdminTab;
  setTab: (t: AdminTab) => void;

  onExportPdf: () => void;
};

export default function AdminDetailPanel({
  selectedId,
  selectedSummary,
  loadingDetail,
  selectedDetail,
  tab,
  setTab,
  onExportPdf,
}: Props) {
  const canExport = !!selectedDetail;

  return (
    <section
      className="
        bg-[#0f1110]
        rounded-3xl
        border border-white/10
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
            <LayoutDashboard size={16} className="text-emerald-400" />
            Detalle de evaluación
          </h3>
          <p className="text-[11px] text-neutral-500 mt-1">
            Recomendación IA, señales clave y seguimiento de decisiones.
          </p>
        </div>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={!canExport}
          className={[
            "px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors",
            canExport
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-white/5 text-neutral-500 cursor-not-allowed border border-white/10",
          ].join(" ")}
          title={canExport ? "Exportar PDF" : "Selecciona una evaluación para exportar"}
        >
          <Download className="w-4 h-4" />
          PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <AdminDetailTabs tab={tab} setTab={setTab} />
      </div>

      {/* Content */}
      {/* ✅ SIN overflow-y-auto: ahora el único scroll es el de la página */}
      <div className="px-6 pb-6 pt-4">
        <AdminDetailContent
          selectedId={selectedId}
          loadingDetail={loadingDetail}
          hasDetail={!!selectedDetail}
          selectedSummary={selectedSummary}
          selectedDetail={selectedDetail}
          tab={tab}
        />
      </div>
    </section>
  );
}
