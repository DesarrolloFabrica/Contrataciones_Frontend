// src/pages/admin/AdminConsole.tsx
import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, Loader2, X, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AdminModeHeader, type AdminView } from "../../features/admin/components/AdminModeHeader";
import AdminScopeBar from "./components/AdminScopeBar";
import AdminHomeView from "./components/home/AdminHomeView";
import AdminEvaluationsPanel from "./components/evaluations/AdminEvaluationsPanel";
import AdminDetailPanel from "./components/evaluations/AdminDetailPanel";
import AdminUsersPanel from "./components/users/AdminUsersPanel";
import AnimatedBackground from "../../components/AnimatedBackground";

import AdminAuditTimelinePreview from "./components/audit/AdminAuditTimelinePreview";
import AdminAuditGlobalPanel from "./components/audit/AdminAuditGlobalPanel";

import { useAdminAudit } from "./hooks/useAdminAudit";
import { useAdminEvaluations } from "./hooks/useAdminEvaluations";
import { useAdminEvaluationDetail } from "./hooks/useAdminEvaluationDetail";

import AdminScopeWizard from "./components/scope/AdminScopeWizard";

import {
  listProgramsBySchool,
  listSchools,
  type ProgramOption,
  type SchoolOption,
} from "../../services/adminScopeService";
import AdminDashboardPanel from "./components/dashboard/AdminDashboardPanel";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

// ── Scope helpers ─────────────────────────────────────────────────────────────

const pickSchoolName = (ev: any) =>
  ev?.candidate?.schoolNameSnapshot ??
  ev?.candidate?.schoolName ??
  ev?.schoolNameSnapshot ??
  ev?.schoolName ??
  ev?.school ??
  "";

const pickSchoolId = (ev: any) =>
  ev?.candidate?.schoolIdSnapshot ??
  ev?.candidate?.schoolId ??
  ev?.schoolIdSnapshot ??
  ev?.schoolId ??
  null;

const pickProgramName = (ev: any) =>
  ev?.candidate?.programNameSnapshot ??
  ev?.candidate?.programName ??
  ev?.programNameSnapshot ??
  ev?.programName ??
  ev?.program ??
  "";

const pickProgramId = (ev: any) =>
  ev?.candidate?.programIdSnapshot ??
  ev?.candidate?.programId ??
  ev?.programIdSnapshot ??
  ev?.programId ??
  null;

const norm = (s: string) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// ─────────────────────────────────────────────────────────────────────────────

const AdminConsole: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [view, setView] = useState<AdminView>("HOME");
  const [showScopePicker, setShowScopePicker] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const admin = useAdminEvaluations();
  const detail = useAdminEvaluationDetail({ evaluations: admin.evaluations });

  // DB scope state
  const [schoolsDb, setSchoolsDb] = useState<SchoolOption[]>([]);
  const [programsDb, setProgramsDb] = useState<ProgramOption[]>([]);
  const [scopeLoadingSchools, setScopeLoadingSchools] = useState(false);
  const [scopeLoadingPrograms, setScopeLoadingPrograms] = useState(false);
  const [scopeError, setScopeError] = useState<string | null>(null);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const schoolNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of schoolsDb ?? []) m.set(String(s.id), String(s.name));
    return m;
  }, [schoolsDb]);

  const programNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of programsDb ?? []) m.set(String(p.id), String(p.name));
    return m;
  }, [programsDb]);

  /**
   * Derive school name from evaluation snapshots (not from DB) to ensure
   * exact match with what the filter hook expects.
   */
  const selectedSchoolName = useMemo(() => {
    if (!selectedSchoolId) return null;
    for (const e of admin.evaluations ?? []) {
      const sid = pickSchoolId(e);
      if (sid && String(sid) === String(selectedSchoolId)) {
        const n = String(pickSchoolName(e)).trim();
        if (n) return n;
      }
    }
    const dbName = schoolNameById.get(String(selectedSchoolId)) ?? "";
    if (!dbName) return null;
    const target = norm(dbName);
    for (const e of admin.evaluations ?? []) {
      const n = String(pickSchoolName(e));
      if (n && norm(n) === target) return n.trim();
    }
    return dbName;
  }, [selectedSchoolId, admin.evaluations, schoolNameById]);

  const selectedProgramName = useMemo(() => {
    if (!selectedProgramId) return null;
    for (const e of admin.evaluations ?? []) {
      const pid = pickProgramId(e);
      if (pid && String(pid) === String(selectedProgramId)) {
        const n = String(pickProgramName(e)).trim();
        if (n) return n;
      }
    }
    const dbName = programNameById.get(String(selectedProgramId)) ?? "";
    if (!dbName) return null;
    const target = norm(dbName);
    for (const e of admin.evaluations ?? []) {
      const n = String(pickProgramName(e));
      if (n && norm(n) === target) return n.trim();
    }
    return dbName;
  }, [selectedProgramId, admin.evaluations, programNameById]);

  // Sync scope strings into the evaluations hook
  React.useEffect(() => {
    admin.setSelectedSchool(selectedSchoolName);
  }, [selectedSchoolName]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    admin.setSelectedProgram(selectedProgramName);
  }, [selectedProgramName]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasSelection = useMemo(
    () => view === "EVALUATIONS" && !!detail.selectedId,
    [view, detail.selectedId]
  );

  const scopeLabel = useMemo(() => {
    const s = selectedSchoolName;
    const p = selectedProgramName;
    if (!s && !p) return "Global (todas las escuelas · todos los programas)";
    if (s && !p) return `Escuela: ${s} · Todos los programas`;
    return `Escuela: ${s} · Programa: ${p}`;
  }, [selectedSchoolName, selectedProgramName]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const handleSwitchView = useCallback(
    (next: AdminView) => {
      setView(next);
      if (next !== "EVALUATIONS") {
        detail.clearSelection();
        setShowDetailModal(false);
      }
    },
    [detail]
  );

  // ── Detail modal ────────────────────────────────────────────────────────────

  const handleOpenDetail = useCallback(
    (id: string) => {
      detail.handleSelectEvaluation(id);
      setShowDetailModal(true);
    },
    [detail]
  );

  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────

  const handleLogout = useCallback(() => {
    detail.clearSelection();
    logout();
    navigate("/login", { replace: true });
  }, [detail, logout, navigate]);

  // ── Audit hook (per selected evaluation) ───────────────────────────────────

  useAdminAudit(
    detail.selectedId
      ? { entityType: "EVALUATION", entityId: detail.selectedId }
      : undefined
  );

  // ── Keyboard + scroll locks ─────────────────────────────────────────────────

  const onCloseScope = useCallback(() => setShowScopePicker(false), []);

  React.useEffect(() => {
    if (!showScopePicker) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowScopePicker(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showScopePicker]);

  React.useEffect(() => {
    if (!showDetailModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [showDetailModal]);

  React.useEffect(() => {
    if (!showScopePicker) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [showScopePicker]);

  // ── Load schools when scope picker opens ────────────────────────────────────

  React.useEffect(() => {
    if (!showScopePicker) return;
    if ((schoolsDb ?? []).length > 0) return;
    let alive = true;
    setScopeLoadingSchools(true);
    setScopeError(null);
    listSchools()
      .then((rows) => { if (alive) setSchoolsDb(rows ?? []); })
      .catch((e) => { if (alive) { setScopeError(e?.message ?? "Error cargando escuelas"); setSchoolsDb([]); } })
      .finally(() => { if (alive) setScopeLoadingSchools(false); });
    return () => { alive = false; };
  }, [showScopePicker, schoolsDb?.length]);

  // ── Load programs when school changes ───────────────────────────────────────

  React.useEffect(() => {
    let alive = true;
    setProgramsDb([]);
    setScopeError(null);
    if (!selectedSchoolId) return;
    setScopeLoadingPrograms(true);
    listProgramsBySchool(selectedSchoolId)
      .then((rows) => { if (alive) setProgramsDb(rows ?? []); })
      .catch((e) => { if (alive) { setScopeError(e?.message ?? "Error cargando programas"); setProgramsDb([]); } })
      .finally(() => { if (alive) setScopeLoadingPrograms(false); });
    return () => { alive = false; };
  }, [selectedSchoolId]);

  // ── Scope reset helper ──────────────────────────────────────────────────────

  const resetScope = useCallback(() => {
    setSelectedSchoolId(null);
    setSelectedProgramId(null);
    admin.setSelectedSchool(null);
    admin.setSelectedProgram(null);
    admin.setSearch("");
    detail.clearSelection();
  }, [admin, detail]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={[
        "min-h-screen w-full font-sans overflow-x-hidden flex flex-col",
        isDark ? "bg-[#061419] text-slate-100" : "bg-[#F4F7FB] text-slate-900",
      ].join(" ")}
    >
      <AdminModeHeader
        mode={view}
        onChangeMode={handleSwitchView}
        onLogout={handleLogout}
        statusLabel={admin.loading ? "Sincronizando..." : "Listo"}
      />

      <main className="flex-1 relative z-10 w-full">
        <AnimatedBackground />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 relative z-10 space-y-6">
          {/* ANALYTICS view: ScopeBar aparece en el contenido, no en el navbar */}
          {view === "ANALYTICS" && (
            <AdminScopeBar
              selectedSchool={selectedSchoolName}
              selectedProgram={selectedProgramName}
              onChangeScope={() => setShowScopePicker(true)}
              onResetScope={resetScope}
            />
          )}

          {/* Content */}
          <div className="space-y-6 relative">
            {view === "EVALUATIONS" && (
              <div
                className={[
                  "pointer-events-none absolute -inset-x-4 -top-6 h-72 rounded-3xl",
                  isDark
                    ? "bg-[radial-gradient(ellipse_at_50%_10%,rgba(2,6,23,0.28),rgba(2,6,23,0.56))]"
                    : "bg-[radial-gradient(ellipse_at_50%_10%,rgba(255,255,255,0.4),rgba(241,245,249,0.72))]",
                ].join(" ")}
              />
            )}
            <div className="relative z-10">

              {/* ── HOME ── */}
              {view === "HOME" && (
                <div className="animate-[fadeInUp_400ms_ease-out]">
                  <AdminHomeView
                    metrics={admin.metrics}
                    evaluations={admin.evaluations}
                    scopeLabel={scopeLabel}
                    recommendedPct={admin.recommendedPct}
                    loading={admin.loading}
                    onNavigate={handleSwitchView}
                  />
                </div>
              )}

              {/* ── EVALUATIONS ── */}
              {view === "EVALUATIONS" && (
                <div className="animate-[fadeInUp_400ms_ease-out]">
                  {admin.loading && (
                    <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
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
                    <AdminEvaluationsPanel
                      evaluations={admin.evaluations}
                      schools={admin.allSchools}
                      selectedId={detail.selectedId}
                      onSelect={handleOpenDetail}
                      metrics={admin.metrics}
                    />
                  )}
                </div>
              )}

              {/* ── USERS ── */}
              {view === "USERS" && (
                <div className="animate-[fadeInUp_400ms_ease-out]">
                  <AdminUsersPanel
                    scope={{
                      selectedSchool: selectedSchoolName,
                      selectedProgram: selectedProgramName,
                    }}
                  />
                </div>
              )}

              {/* ── ANALYTICS (formerly DASHBOARD) ── */}
              {view === "ANALYTICS" && (
                <div className="animate-[fadeInUp_400ms_ease-out]">
                  <AdminDashboardPanel
                    scope={{
                      orgId: (admin as any)?.orgId ?? null,
                      selectedSchoolId,
                      selectedProgramId,
                    }}
                  />
                </div>
              )}

              {/* ── AUDIT ── */}
              {view === "AUDIT" && (
                <div className="space-y-6 animate-[fadeInUp_400ms_ease-out]">
                  <AdminAuditGlobalPanel
                    selectedSchool={selectedSchoolName}
                    selectedProgram={selectedProgramName}
                  />
                  <AdminAuditTimelinePreview />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center border-t border-white/5 mt-auto">
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          Sistema de Evaluación Docente · CUN © {new Date().getFullYear()}
        </p>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Modal: evaluation detail ── */}
      {showDetailModal && view === "EVALUATIONS" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseDetail}
          />
          <div className="relative z-[71] w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div
              className={[
                "rounded-[28px] overflow-hidden flex flex-col max-h-[90vh] border",
                isDark
                  ? "border-[#579689]/25 bg-[#0d252b] shadow-[0_30px_80px_rgba(0,4,8,0.68),0_0_0_1px_rgba(255,255,255,0.035)]"
                  : "border-slate-300 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]",
              ].join(" ")}
            >
              <div
                className={[
                  "shrink-0 px-6 py-5 border-b flex items-center justify-between gap-4 backdrop-blur-sm",
                  isDark
                    ? "border-[#579689]/20 bg-[#102c32]/92"
                    : "border-slate-200 bg-slate-50",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <h2
                    className={[
                      "text-lg font-bold tracking-tight",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    Detalle de evaluación
                  </h2>
                  <p
                    className={[
                      "text-xs mt-1",
                      isDark ? "text-neutral-400" : "text-slate-600",
                    ].join(" ")}
                  >
                    Vista completa de la ficha de evaluación seleccionada.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {detail.selectedDetail && (
                    <button
                      type="button"
                      onClick={detail.exportPdf}
                      className={[
                        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg",
                        isDark
                          ? "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/30"
                          : "bg-brand-600 hover:bg-brand-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.45)]",
                      ].join(" ")}
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    className={[
                      "p-2.5 rounded-xl border transition shrink-0",
                      isDark
                        ? "border-white/15 bg-white/10 hover:bg-white/15 text-neutral-200"
                        : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600",
                    ].join(" ")}
                    title="Cerrar detalle"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pt-8 px-6 pb-6 bg-transparent">
                <AdminDetailPanel
                  hideHeader
                  selectedId={detail.selectedId}
                  selectedSummary={detail.selectedSummary}
                  loadingDetail={detail.loadingDetail}
                  selectedDetail={detail.selectedDetail}
                  onExportPdf={detail.exportPdf}
                  errorDetail={detail.errorDetail}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: scope picker ── */}
      {showScopePicker && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onCloseScope}
          />
          <div className="relative z-[81] w-full max-w-5xl">
            <div className="rounded-3xl border border-[#579689]/25 bg-[#091d22]/96 shadow-[0_30px_120px_rgba(0,4,8,0.85)] overflow-hidden flex flex-col h-[86vh] max-h-[86vh]">
              <div className="p-5 md:p-6 border-b border-white/10 flex items-start justify-between shrink-0">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 font-bold">
                    Cambiar scope
                  </p>
                  <p className="text-sm text-neutral-300 mt-1">
                    El scope aplica a Evaluaciones, Usuarios y Auditoría.
                  </p>
                  {(scopeLoadingSchools || scopeLoadingPrograms) && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                      Cargando opciones desde la base de datos...
                    </div>
                  )}
                  {scopeError && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-300">
                      <AlertCircle className="w-4 h-4" />
                      {scopeError}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onCloseScope}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition shrink-0"
                  title="Cerrar"
                >
                  <X className="w-5 h-5 text-neutral-200" />
                </button>
              </div>

              <div className="flex-1 min-h-0 p-5 md:p-6 overflow-hidden flex flex-col">
                <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-scope">
                  <AdminScopeWizard
                    evaluations={admin.evaluations}
                    schools={schoolsDb}
                    programs={programsDb}
                    selectedSchoolId={selectedSchoolId}
                    selectedProgramId={selectedProgramId}
                    loadingSchools={scopeLoadingSchools}
                    loadingPrograms={scopeLoadingPrograms}
                    error={scopeError}
                    onSelectSchool={(schoolId) => {
                      setSelectedSchoolId(schoolId);
                      setSelectedProgramId(null);
                      admin.setSearch("");
                      detail.clearSelection();
                    }}
                    onSelectProgram={(programId) => {
                      setSelectedProgramId(programId);
                      admin.setSearch("");
                      detail.clearSelection();
                      setShowScopePicker(false);
                    }}
                    onBackToSchools={() => {
                      setSelectedProgramId(null);
                      setSelectedSchoolId(null);
                      admin.setSearch("");
                      detail.clearSelection();
                    }}
                    onResetToGlobal={() => {
                      resetScope();
                      setShowScopePicker(false);
                    }}
                  />
                </div>

                <div className="shrink-0 mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetScope();
                      setShowScopePicker(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-brand-500/15 bg-brand-500/5 text-xs font-bold uppercase tracking-widest text-brand-200 hover:bg-brand-500/10 transition"
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
