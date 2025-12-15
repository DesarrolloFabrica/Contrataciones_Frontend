// src/pages/admin/components/AdminDetailPanel.tsx
import React from "react";
import { Download, LayoutDashboard } from "lucide-react";
import type { AdminTab } from "../utils/adminTypes";
import AdminDetailTabs from "./AdminDetailTabs";
import AdminDetailContent from "./AdminDetailContent";
import type { TeacherEvaluationSummary } from "../../../types";

export default function AdminDetailPanel(props: {
  selectedId: string | null;
  selectedSummary: TeacherEvaluationSummary | null;

  loadingDetail: boolean;
  selectedDetail: { analysis: any; interview: any; raw: any } | null;

  tab: AdminTab;
  setTab: (t: AdminTab) => void;

  onExportPdf: () => void;
}) {
  const { selectedDetail, onExportPdf, tab, setTab } = props;

  return (
    <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[680px] lg:sticky lg:top-24">
      <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
            <LayoutDashboard size={16} className="text-emerald-400" />
            Detalle Ejecutivo
          </h3>
          <p className="text-[11px] text-neutral-500 mt-1">IA + decisiones + señales clave (solo frontend por ahora).</p>
        </div>

        {selectedDetail && (
          <button
            type="button"
            onClick={onExportPdf}
            className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        )}
      </div>

      <div className="px-6 pt-4">
        <AdminDetailTabs tab={tab} setTab={setTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <AdminDetailContent
          selectedId={props.selectedId}
          loadingDetail={props.loadingDetail}
          hasDetail={!!props.selectedDetail}
          selectedSummary={props.selectedSummary}
          selectedDetail={props.selectedDetail}
          tab={props.tab}
        />
      </div>
    </div>
  );
}
