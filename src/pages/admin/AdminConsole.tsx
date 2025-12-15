// src/pages/admin/AdminConsole.tsx
import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import AdminHeader from "./components/AdminHeader";
import AdminKpiGrid from "./components/AdminKpiGrid";
import AdminFiltersBar from "./components/AdminFiltersBar";
import AdminSchoolsPanel from "./components/AdminSchoolsPanel";
import AdminEvaluationsPanel from "./components/AdminEvaluationsPanel";
import AdminDetailPanel from "./components/AdminDetailPanel";

import { useAdminEvaluations } from "./hooks/useAdminEvaluations";
import { useAdminEvaluationDetail } from "./hooks/useAdminEvaluationDetail";

const AdminConsole: React.FC = () => {
  const admin = useAdminEvaluations();
  const detail = useAdminEvaluationDetail({ evaluations: admin.evaluations });

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans relative overflow-x-hidden selection:bg-emerald-500/30">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-10">
        <AdminHeader hasSelection={!!detail.selectedId} onClearSelection={detail.clearSelection} />

        {admin.loading && (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-sm font-medium animate-pulse">Sincronizando métricas globales...</p>
          </div>
        )}

        {!admin.loading && admin.error && (
          <div className="flex flex-col items-center justify-center py-20 text-red-400 gap-4 bg-red-500/5 rounded-3xl border border-red-500/10">
            <AlertCircle className="w-10 h-10" />
            <p className="text-sm text-center max-w-md">{admin.error}</p>
          </div>
        )}

        {!admin.loading && !admin.error && (
          <>
            <AdminKpiGrid
              metrics={admin.metrics}
              recommendedPct={admin.recommendedPct}
              highRiskPct={admin.highRiskPct}
            />

            <AdminFiltersBar
              search={admin.search}
              setSearch={admin.setSearch}
              selectedSchool={admin.selectedSchool}
              setSelectedSchool={admin.setSelectedSchool}
              schoolOptions={admin.schoolOptions}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <AdminSchoolsPanel schoolsSummary={admin.schoolsSummary} />
              </div>

              <div className="lg:col-span-4">
                <AdminEvaluationsPanel
                  filteredEvaluations={admin.filteredEvaluations}
                  selectedId={detail.selectedId}
                  onSelect={detail.handleSelectEvaluation}
                />
              </div>

              <div className="lg:col-span-4">
                <AdminDetailPanel
                  selectedId={detail.selectedId}
                  selectedSummary={detail.selectedSummary}
                  loadingDetail={detail.loadingDetail}
                  selectedDetail={detail.selectedDetail}
                  tab={detail.tab}
                  setTab={detail.setTab}
                  onExportPdf={detail.exportPdf}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminConsole;
