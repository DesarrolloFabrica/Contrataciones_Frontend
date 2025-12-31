import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, Loader2, Users, FileText, ScrollText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminHeader from "./components/AdminHeader";
import AdminKpiGrid from "./components/evaluations/AdminKpiGrid";
import AdminFiltersBar from "./components/evaluations/AdminFiltersBar";
import AdminEvaluationsPanel from "./components/evaluations/AdminEvaluationsPanel";
import AdminDetailPanel from "./components/evaluations/AdminDetailPanel";
import AdminUsersPanel from "./components/users/AdminUsersPanel";

// temporal
import AdminAuditTimelinePreview from "./components/audit/AdminAuditTimelinePreview";
import AdminAuditGlobalPanel from "./components/audit/AdminAuditGlobalPanel";

import { useAdminAudit } from "./hooks/useAdminAudit";
import { useAdminEvaluations } from "./hooks/useAdminEvaluations";
import { useAdminEvaluationDetail } from "./hooks/useAdminEvaluationDetail";

import AdminScopeWizard from "./components/scope/AdminScopeWizard";

type AdminView = "EVALUATIONS" | "USERS" | "AUDIT";

const AdminConsole: React.FC = () => {
  const navigate = useNavigate();

  const [view, setView] = useState<AdminView>("EVALUATIONS");
  const [showScopePicker, setShowScopePicker] = useState(false);

  const admin = useAdminEvaluations();
  const detail = useAdminEvaluationDetail({ evaluations: admin.evaluations });

  const hasSelection = useMemo(
    () => view === "EVALUATIONS" && !!detail.selectedId,
    [view, detail.selectedId]
  );

  const scopeLabel = useMemo(() => {
    const s = admin.selectedSchool;
    const p = admin.selectedProgram;
    if (!s && !p) return "Global (todas las escuelas · todos los programas)";
    if (s && !p) return `Escuela: ${s} · Todos los programas`;
    return `Escuela: ${s} · Programa: ${p}`;
  }, [admin.selectedSchool, admin.selectedProgram]);

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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("ADMIN_TOKEN");

    detail.clearSelection();

    try {
      navigate("/login", { replace: true });
    } catch {
      window.location.href = "/login";
    }
  }, [detail, navigate]);

  // Auditoría por evaluación seleccionada
  useAdminAudit(
    detail.selectedId
      ? { entityType: "EVALUATION", entityId: detail.selectedId }
      : undefined
  );

  // Close modal with Escape
  const onCloseScope = useCallback(() => setShowScopePicker(false), []);
  React.useEffect(() => {
    if (!showScopePicker) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowScopePicker(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showScopePicker]);

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans relative overflow-x-hidden selection:bg-emerald-500/30">
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-8">
        <AdminHeader
          hasSelection={hasSelection}
          onClearSelection={detail.clearSelection}
          onLogout={handleLogout}
          selectedSchool={admin.selectedSchool}
          selectedProgram={admin.selectedProgram}
          onChangeScope={() => setShowScopePicker(true)}
          onResetScope={() => {
            admin.setSelectedSchool(null);
            admin.setSelectedProgram(null);
            admin.setSearch("");
            detail.clearSelection();
          }}
        />

        {/* ✅ Tabs siempre visibles */}
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
          <button
            type="button"
            className={tabBtn(view === "AUDIT")}
            onClick={() => handleSwitchView("AUDIT")}
          >
            <ScrollText className="w-4 h-4" />
            Auditoría
          </button>
        </div>

        {/* VIEW: EVALUATIONS */}
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
                  scopeLabel={scopeLabel}
                />

                <AdminFiltersBar
                  search={admin.search}
                  setSearch={admin.setSearch}
                  selectedSchool={admin.selectedSchool}
                  setSelectedSchool={(s) => {
                    admin.setSelectedSchool(s);
                    admin.setSelectedProgram(null); // ✅ school cambia => programa null
                    admin.setSearch("");
                    detail.clearSelection();
                  }}
                  schoolOptions={admin.schoolOptions}
                  selectedProgram={admin.selectedProgram}
                  setSelectedProgram={(p) => {
                    admin.setSelectedProgram(p);
                    admin.setSearch("");
                    detail.clearSelection();
                  }}
                  programOptions={admin.programOptions}
                  resultsCount={admin.filteredEvaluations.length}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 space-y-6">
                    <AdminEvaluationsPanel
                      filteredEvaluations={admin.filteredEvaluations}
                      selectedId={detail.selectedId}
                      onSelect={detail.handleSelectEvaluation}
                      selectedSchool={admin.selectedSchool ?? ""}
                      selectedProgram={admin.selectedProgram ?? ""}
                    />
                  </div>

                  <div className="lg:col-span-7 space-y-6">
                    <AdminDetailPanel
                    selectedId={detail.selectedId}
                    selectedSummary={detail.selectedSummary}
                    loadingDetail={detail.loadingDetail}
                    selectedDetail={detail.selectedDetail}
                    onExportPdf={detail.exportPdf}
                    errorDetail={detail.errorDetail}
                  />
                  </div>
                </div>
              </>
            )}
          </>
        )}

              {view === "USERS" && (
                <AdminUsersPanel
                  scope={{ selectedSchool: admin.selectedSchool, selectedProgram: admin.selectedProgram }}
                />
              )}


          {view === "AUDIT" && (
            <div className="space-y-6">
              <AdminAuditGlobalPanel
                selectedSchool={admin.selectedSchool}
                selectedProgram={admin.selectedProgram}
              />
              <AdminAuditTimelinePreview />
            </div>
          )}
            </div>

      {/* ✅ Scope Wizard Modal Overlay */}
      {showScopePicker && (
        <div className="fixed inset-0 z-[80]">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onCloseScope}
          />

          {/* modal */}
          <div className="relative z-[81] max-w-5xl mx-auto px-4 py-10">
            <div className="rounded-3xl border border-white/10 bg-[#0b0d0c]/95 shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 font-bold">
                    Cambiar scope
                  </p>
                  <p className="text-sm text-neutral-300 mt-1">
                    El scope aplica a Evaluaciones, Usuarios y Auditoría.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onCloseScope}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  title="Cerrar"
                >
                  <X className="w-5 h-5 text-neutral-200" />
                </button>
              </div>

              <div className="p-5 md:p-6">
                <AdminScopeWizard
                  evaluations={admin.evaluations}
                  schoolOptions={admin.schoolOptions}
                  programOptions={admin.programOptions}
                  selectedSchool={admin.selectedSchool}
                  selectedProgram={admin.selectedProgram}
                  onSelectSchool={(s) => {
                    admin.setSelectedSchool(s);
                    admin.setSelectedProgram(null);
                    admin.setSearch("");
                    detail.clearSelection();
                  }}
                  onSelectProgram={(p) => {
                    admin.setSelectedProgram(p);
                    admin.setSearch("");
                    detail.clearSelection();
                    setShowScopePicker(false); // ✅ cerrar al elegir programa
                  }}
                  onBackToSchools={() => {
                    admin.setSelectedProgram(null);
                    admin.setSelectedSchool(null);
                    admin.setSearch("");
                    detail.clearSelection();
                  }}
                />

                <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      admin.setSelectedSchool(null);
                      admin.setSelectedProgram(null);
                      admin.setSearch("");
                      detail.clearSelection();
                      setShowScopePicker(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-xs font-bold uppercase tracking-widest text-emerald-200 hover:bg-emerald-500/10 transition"
                    title="Volver a vista global"
                  >
                    Volver a Global
                  </button>

                  <button
                    type="button"
                    onClick={onCloseScope}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-neutral-200 hover:bg-white/10 transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
