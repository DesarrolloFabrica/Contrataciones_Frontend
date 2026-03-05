// src/pages/admin/components/evaluations/AdminDetailPanel.tsx
import React from "react";
import { Download, LayoutDashboard, AlertCircle } from "lucide-react";
import AdminDetailContent from "./AdminDetailContent";
import type { TeacherEvaluationSummary } from "../../../../types";

type Props = {
  hideHeader?: boolean;
  selectedId: string | null;
  selectedSummary: TeacherEvaluationSummary | null;
  loadingDetail: boolean;
  selectedDetail: { analysis: any; interview: any; raw: any } | null;
  onExportPdf: () => void;
  errorDetail?: string | null;
};

export default function AdminDetailPanel({
  hideHeader = false,
  selectedId,
  selectedSummary,
  loadingDetail,
  selectedDetail,
  onExportPdf,
  errorDetail,
}: Props) {
  const canExport = !!selectedDetail;

  return (
    <section
      className={
        hideHeader
          ? "rounded-2xl overflow-visible"
          : "bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden"
      }
    >
      {!hideHeader && (
        <>
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
                <LayoutDashboard size={16} className="text-emerald-400" />
                Ficha de evaluación
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1">
                Vista ejecutiva: IA + decisión coordinador + trazabilidad.
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
        </>
      )}

      {/* Error banner */}
      {errorDetail && (
        <div className="mx-6 mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-300 mt-0.5" />
          <p className="text-xs text-rose-200">{errorDetail}</p>
        </div>
      )}

      {/* Content */}
      <div className={hideHeader ? "px-0 pb-0 pt-0" : "px-6 pb-6 pt-4"}>
        <AdminDetailContent
          selectedId={selectedId}
          loadingDetail={loadingDetail}
          hasDetail={!!selectedDetail}
          selectedSummary={selectedSummary}
          selectedDetail={selectedDetail}
        />
      </div>
    </section>
  );
}
