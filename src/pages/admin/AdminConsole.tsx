// src/pages/admin/AdminConsole.tsx
import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, Loader2, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminHeader from "./components/AdminHeader";
import AdminKpiGrid from "./components/evaluations/AdminKpiGrid";
import AdminFiltersBar from "./components/evaluations/AdminFiltersBar";
import AdminSchoolsPanel from "./components/evaluations/AdminSchoolsPanel";
import AdminEvaluationsPanel from "./components/evaluations/AdminEvaluationsPanel";
import AdminDetailPanel from "./components/evaluations/AdminDetailPanel";

import AdminUsersPanel from "./components/users/AdminUsersPanel";

import { useAdminEvaluations } from "./hooks/useAdminEvaluations";
import { useAdminEvaluationDetail } from "./hooks/useAdminEvaluationDetail";

type AdminView = "EVALUATIONS" | "USERS";

const AdminConsole: React.FC = () => {
  const navigate = useNavigate();

  const [view, setView] = useState<AdminView>("EVALUATIONS");

  const admin = useAdminEvaluations();
  const detail = useAdminEvaluationDetail({ evaluations: admin.evaluations });

  const hasSelection = useMemo(
    () => view === "EVALUATIONS" && !!detail.selectedId,
    [view, detail.selectedId]
  );

  const tabBtn = (active: boolean) =>
    `px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors flex items-center gap-2 ${
      active
        ? "bg-emerald-600 text-white border-emerald-500/40"
        : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
    }`;

  const handleSwitchView = useCallback(
    (next: AdminView) => {
      setView(next);
      if (next !== "EVALUATIONS") detail.clearSelection();
    },
    [detail]
  );

  // ✅ Logout (soluciona el missing prop)
  const handleLogout = useCallback(() => {
    // Ajusta estos keys a los que realmente uses (deja varios por compatibilidad)
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("ADMIN_TOKEN");

    // Limpia selección para evitar estados raros
    detail.clearSelection();

    // Navega al login
    try {
      navigate("/login", { replace: true });
    } catch {
      window.location.href = "/login";
    }
  }, [detail, navigate]);

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans relative overflow-x-hidden selection:bg-emerald-500/30">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-8">
        <AdminHeader
          hasSelection={hasSelection}
          onClearSelection={detail.clearSelection}
          onLogout={handleLogout} // ✅ FIX
        />

        {/* Tabs Admin */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={tabBtn(view === "EVALUATIONS")}
            onClick={() => handleSwitchView("EVALUATIONS")}
          >
            <FileText className="w-4 h-4" />
            Evaluaciones
          </button>

          <button
            type="button"
            className={tabBtn(view === "USERS")}
            onClick={() => handleSwitchView("USERS")}
          >
            <Users className="w-4 h-4" />
            Usuarios
          </button>
        </div>

        {/* VISTA: EVALUACIONES */}
        {view === "EVALUATIONS" && (
          <>
            {admin.loading && (
              <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-sm font-medium animate-pulse">
                  Sincronizando evaluaciones...
                </p>
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* IZQUIERDA */}
                  <div className="lg:col-span-4 space-y-6">
                    <AdminSchoolsPanel schoolsSummary={admin.schoolsSummary} />

                    <AdminEvaluationsPanel
                      filteredEvaluations={admin.filteredEvaluations}
                      selectedId={detail.selectedId}
                      onSelect={detail.handleSelectEvaluation}
                    />
                  </div>

                  {/* DERECHA */}
                  <div className="lg:col-span-8">
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
          </>
        )}

        {/* VISTA: USUARIOS */}
        {view === "USERS" && <AdminUsersPanel />}
      </div>
    </div>
  );
};

export default AdminConsole;
