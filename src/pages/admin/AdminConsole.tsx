// src/pages/admin/AdminConsole.tsx
import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, Loader2, Users, FileText, ScrollText, X, SquareKanban } from "lucide-react";
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

// ✅ DB scope
import {
  listProgramsBySchool,
  listSchools,
  type ProgramOption,
  type SchoolOption,
} from "../../services/adminScopeService";
import AdminDashboardPanel from "./components/dashboard/AdminDashboardPanel";

type AdminView = "EVALUATIONS" | "USERS" | "AUDIT" | "DASHBOARD";

/** ✅ Helpers: sacar IDs/Nombres de evaluaciones (para que el filtro matchee EXACTO con lo que usa el hook) */
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

const AdminConsole: React.FC = () => {
  const navigate = useNavigate();

  const [view, setView] = useState<AdminView>("EVALUATIONS");
  const [showScopePicker, setShowScopePicker] = useState(false);

  const admin = useAdminEvaluations();
  const detail = useAdminEvaluationDetail({ evaluations: admin.evaluations });

  // ✅ DB state para scope
  const [schoolsDb, setSchoolsDb] = useState<SchoolOption[]>([]);
  const [programsDb, setProgramsDb] = useState<ProgramOption[]>([]);
  const [scopeLoadingSchools, setScopeLoadingSchools] = useState(false);
  const [scopeLoadingPrograms, setScopeLoadingPrograms] = useState(false);
  const [scopeError, setScopeError] = useState<string | null>(null);

  // ✅ ids internos del scope wizard
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
   * ✅ FIX CLAVE:
   * El hook de evaluaciones normalmente filtra por "nombre" (string) que viene en las evaluaciones (snapshots),
   * NO por el nombre que viene de DB. Si hay cualquier diferencia (acentos, modalidad, espacios),
   * se te queda en 0 resultados.
   *
   * Entonces: derivamos el nombre "real" desde admin.evaluations usando los IDs seleccionados.
   */
  const selectedSchoolName = useMemo(() => {
    if (!selectedSchoolId) return null;

    // 1) match por ID en evaluaciones → devolvemos el nombre exacto del snapshot
    for (const e of admin.evaluations ?? []) {
      const sid = pickSchoolId(e);
      if (sid && String(sid) === String(selectedSchoolId)) {
        const n = String(pickSchoolName(e)).trim();
        if (n) return n;
      }
    }

    // 2) fallback DB name
    const dbName = schoolNameById.get(String(selectedSchoolId)) ?? "";
    if (!dbName) return null;

    // 3) fallback por nombre normalizado → devolvemos el nombre exacto de la evaluación (si existe)
    const target = norm(dbName);
    for (const e of admin.evaluations ?? []) {
      const n = String(pickSchoolName(e));
      if (n && norm(n) === target) return n.trim();
    }

    return dbName;
  }, [selectedSchoolId, admin.evaluations, schoolNameById]);

  const selectedProgramName = useMemo(() => {
    if (!selectedProgramId) return null;

    // 1) match por ID en evaluaciones → devolvemos nombre exacto snapshot
    for (const e of admin.evaluations ?? []) {
      const pid = pickProgramId(e);
      if (pid && String(pid) === String(selectedProgramId)) {
        const n = String(pickProgramName(e)).trim();
        if (n) return n;
      }
    }

    // 2) fallback DB name
    const dbName = programNameById.get(String(selectedProgramId)) ?? "";
    if (!dbName) return null;

    // 3) fallback por nombre normalizado
    const target = norm(dbName);
    for (const e of admin.evaluations ?? []) {
      const n = String(pickProgramName(e));
      if (n && norm(n) === target) return n.trim();
    }

    return dbName;
  }, [selectedProgramId, admin.evaluations, programNameById]);

  // ✅ sync: lo que usa el resto de tu UI (hooks/panels) (strings)
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

  // ✅ bloquear scroll del body cuando el modal está abierto
  React.useEffect(() => {
    if (!showScopePicker) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showScopePicker]);

  // ✅ load schools when opening scope picker (solo 1 vez)
  React.useEffect(() => {
    if (!showScopePicker) return;
    if ((schoolsDb ?? []).length > 0) return;

    let alive = true;
    setScopeLoadingSchools(true);
    setScopeError(null);

    listSchools()
      .then((rows) => {
        if (!alive) return;
        setSchoolsDb(rows ?? []);
      })
      .catch((e) => {
        if (!alive) return;
        setScopeError(e?.message ?? "Error cargando escuelas");
        setSchoolsDb([]);
      })
      .finally(() => {
        if (!alive) return;
        setScopeLoadingSchools(false);
      });

    return () => {
      alive = false;
    };
  }, [showScopePicker, schoolsDb?.length]);

  // ✅ load programs when selectedSchoolId changes
  React.useEffect(() => {
    let alive = true;
    setProgramsDb([]);
    setScopeError(null);

    if (!selectedSchoolId) return;

    setScopeLoadingPrograms(true);

    listProgramsBySchool(selectedSchoolId)
      .then((rows) => {
        if (!alive) return;
        setProgramsDb(rows ?? []);
      })
      .catch((e) => {
        if (!alive) return;
        setScopeError(e?.message ?? "Error cargando programas");
        setProgramsDb([]);
      })
      .finally(() => {
        if (!alive) return;
        setScopeLoadingPrograms(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedSchoolId]);

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
          selectedSchool={selectedSchoolName}
          selectedProgram={selectedProgramName}
          onChangeScope={() => setShowScopePicker(true)}
          onResetScope={() => {
            setSelectedSchoolId(null);
            setSelectedProgramId(null);
            admin.setSelectedSchool(null);
            admin.setSelectedProgram(null);
            admin.setSearch("");
            detail.clearSelection();
          }}
        />

        {/* Tabs */}
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
            className={tabBtn(view === "DASHBOARD")}
            onClick={() => handleSwitchView("DASHBOARD")}
          >
            <SquareKanban className="w-4 h-4" />
            Dashboard
          </button>
          
          {/* <button
            type="button"
            className={tabBtn(view === "AUDIT")}
            onClick={() => handleSwitchView("AUDIT")}
          >
            <ScrollText className="w-4 h-4" />
            Auditoría
          </button> */}
        </div>

        {/* VIEW: EVALUATIONS */}
        {view === "EVALUATIONS" && (
          <>
            {admin.loading && (
              <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-sm font-medium animate-pulse">Sincronizando evaluaciones...</p>
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
                  selectedSchool={selectedSchoolName}
                  setSelectedSchool={(schoolNameOrId) => {
                    // soporta que venga nombre (filtro) o id (si lo pasas así)
                    const byId = schoolNameById.get(String(schoolNameOrId));
                    const schoolId = byId
                      ? String(schoolNameOrId)
                      : (schoolsDb.find((s) => s.name === schoolNameOrId)?.id ?? null);

                    setSelectedSchoolId(schoolId);
                    setSelectedProgramId(null);

                    admin.setSelectedProgram(null);
                    admin.setSearch("");
                    detail.clearSelection();
                  }}
                  schoolOptions={admin.schoolOptions}
                  selectedProgram={selectedProgramName}
                  setSelectedProgram={(programNameOrId) => {
                    const byId = programNameById.get(String(programNameOrId));
                    const programId = byId
                      ? String(programNameOrId)
                      : (programsDb.find((p) => p.name === programNameOrId)?.id ?? null);

                    setSelectedProgramId(programId);
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
                      selectedSchool={selectedSchoolName ?? ""}
                      selectedProgram={selectedProgramName ?? ""}
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
            scope={{ selectedSchool: selectedSchoolName, selectedProgram: selectedProgramName }}
          />
        )}

        {view === "DASHBOARD" && (
        <AdminDashboardPanel
            scope={{
              orgId: (admin as any)?.orgId ?? null,
              selectedSchoolId,
              selectedProgramId,
            }}
          />
        )}

        {view === "AUDIT" && (
          <div className="space-y-6">
            <AdminAuditGlobalPanel
              selectedSchool={selectedSchoolName}
              selectedProgram={selectedProgramName}
            />
            <AdminAuditTimelinePreview />
          </div>
        )}
      </div>

      {/* ✅ Scope Wizard Modal Overlay */}
      {showScopePicker && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onCloseScope}
          />

          <div className="relative z-[81] w-full max-w-5xl">
            <div className="rounded-3xl border border-white/10 bg-[#0b0d0c]/95 shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[86vh] max-h-[86vh]">
              {/* Header fijo */}
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
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
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

              {/* Body + footer fijo */}
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
                      setSelectedSchoolId(null);
                      setSelectedProgramId(null);

                      admin.setSelectedSchool(null);
                      admin.setSelectedProgram(null);
                      admin.setSearch("");
                      detail.clearSelection();
                      setShowScopePicker(false);
                    }}
                  />
                </div>

                <div className="shrink-0 mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSchoolId(null);
                      setSelectedProgramId(null);

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