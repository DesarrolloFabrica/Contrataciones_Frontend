// src/pages/admin/AdminConsole.tsx
import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, Loader2, Users, FileText, ScrollText, X, SquareKanban, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminHeader from "./components/AdminHeader";
import AdminKpiGrid from "./components/evaluations/AdminKpiGrid";
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
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [view, setView] = useState<AdminView>("EVALUATIONS");
  const [showScopePicker, setShowScopePicker] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    [
      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors flex items-center gap-2",
      active
        ? isDark
          ? "bg-emerald-600 text-white border-emerald-500/40"
          : "bg-emerald-600 text-white border-emerald-500/60 shadow-[0_10px_25px_rgba(16,185,129,0.35)]"
        : isDark
          ? "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
          : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50",
    ].join(" ");

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

  // bloquear scroll del body cuando el modal de detalle está abierto
  React.useEffect(() => {
    if (!showDetailModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showDetailModal]);

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
    <div
      className={[
        "min-h-screen w-full font-sans relative overflow-x-hidden selection:bg-emerald-500/30",
        isDark ? "bg-[#020202] text-white" : "bg-gray-50 text-gray-900",
      ].join(" ")}
    >
      {/* Ambient bg */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
      )}

      <div className="relative z-10 mx-auto px-4 md:px-12 py-6 md:py-8">
        {/* Header + Tabs fijos en la parte superior (sin bloque opaco delante del fondo) */}
        <div className="sticky top-0 z-30 pb-4 mb-6">
          <div className="pt-2 md:pt-0 space-y-4">
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
          </div>
        </div>

        {/* Contenido debajo del header fijo */}
        <div className="space-y-8">

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
                {/* Encabezado común para métricas y sidebar */}
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p
                      className={[
                        "text-[11px] uppercase tracking-[0.22em]",
                        isDark ? "text-neutral-500" : "text-slate-500",
                      ].join(" ")}
                    >
                      Métricas del scope
                    </p>
                    <h3
                      className={[
                        "font-black text-lg",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      Resumen ejecutivo
                    </h3>
                    <p
                      className={[
                        "text-xs mt-1",
                        isDark ? "text-neutral-500" : "text-slate-600",
                      ].join(" ")}
                    >
                      {scopeLabel}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)] gap-6 items-start">
                  {/* Columna principal */}
                  <div className="space-y-6">
                    <AdminKpiGrid
                      metrics={admin.metrics}
                      recommendedPct={admin.recommendedPct}
                      highRiskPct={admin.highRiskPct}
                      scopeLabel={scopeLabel}
                    />

                    <AdminEvaluationsPanel
                      filteredEvaluations={admin.filteredEvaluations}
                      selectedId={detail.selectedId}
                      onSelect={handleOpenDetail}
                      selectedSchool={selectedSchoolName ?? ""}
                      selectedProgram={selectedProgramName ?? ""}
                      search={admin.search}
                      setSearch={admin.setSearch}
                    />
                  </div>

                  {/* Sidebar contextual */}
                  <aside className="space-y-4">
                    {/* Guía rápida / acciones */}
                    <div
                      className={[
                        "rounded-3xl border backdrop-blur-md p-5 space-y-3",
                        isDark
                          ? "border-white/10 bg-[#050505]/90 shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
                          : "border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.22em] font-bold",
                          isDark ? "text-neutral-500" : "text-slate-500",
                        ].join(" ")}
                      >
                        Guía rápida
                      </p>
                      <p
                        className={[
                          "text-sm font-semibold",
                          isDark ? "text-neutral-200" : "text-slate-900",
                        ].join(" ")}
                      >
                        Cómo leer este panel
                      </p>
                      <ul
                        className={[
                          "mt-2 space-y-2 text-xs list-disc list-inside",
                          isDark ? "text-neutral-400" : "text-slate-600",
                        ].join(" ")}
                      >
                        <li>
                          Usa los KPIs para tener un vistazo ejecutivo del volumen y riesgos.
                        </li>
                        <li>
                          Filtra por escuela / programa y después aplica búsqueda puntual.
                        </li>
                        <li>
                          Abre el detalle de una evaluación para ver el reporte completo IA +
                          decisión.
                        </li>
                      </ul>
                    </div>

                    {/* Scope actual */}
                    <div
                      className={[
                        "rounded-3xl border p-5 space-y-3",
                        isDark
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-emerald-100 bg-emerald-50",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.22em] font-bold",
                          isDark ? "text-emerald-300" : "text-emerald-700",
                        ].join(" ")}
                      >
                        Scope actual
                      </p>
                      <p
                        className={[
                          "text-xs leading-relaxed",
                          isDark ? "text-neutral-100" : "text-slate-700",
                        ].join(" ")}
                      >
                        {scopeLabel}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span
                          className={[
                            "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest",
                            isDark
                              ? "bg-black/30 border border-white/10 text-neutral-300"
                              : "bg-white border border-slate-200 text-slate-600",
                          ].join(" ")}
                        >
                          {selectedSchoolName ? "Escuela filtrada" : "Todas las escuelas"}
                        </span>
                        <span
                          className={[
                            "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest",
                            isDark
                              ? "bg-black/30 border border-white/10 text-neutral-300"
                              : "bg-white border border-slate-200 text-slate-600",
                          ].join(" ")}
                        >
                          {selectedProgramName ? "Programa filtrado" : "Todos los programas"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowScopePicker(true)}
                        className={[
                          "mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-colors border",
                          isDark
                            ? "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-100"
                            : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-[0_8px_22px_rgba(16,185,129,0.35)]",
                        ].join(" ")}
                      >
                        Ajustar scope
                      </button>
                    </div>

                    {/* Estado del sistema / atajos */}
                    <div
                      className={[
                        "rounded-3xl border p-5 space-y-3",
                        isDark
                          ? "border-white/10 bg-[#050505]/90"
                          : "border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.22em] font-bold",
                          isDark ? "text-neutral-500" : "text-slate-500",
                        ].join(" ")}
                      >
                        Atajos del panel
                      </p>
                      <div
                        className={[
                          "space-y-2 text-xs",
                          isDark ? "text-neutral-300" : "text-slate-700",
                        ].join(" ")}
                      >
                        <button
                          type="button"
                          onClick={() => handleSwitchView("USERS")}
                          className={[
                            "w-full text-left px-3 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-widest border",
                            isDark
                              ? "bg-white/5 hover:bg-white/10 border-white/10"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200",
                          ].join(" ")}
                        >
                          Ir a gestión de usuarios
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwitchView("DASHBOARD")}
                          className={[
                            "w-full text-left px-3 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-widest border",
                            isDark
                              ? "bg-white/5 hover:bg-white/10 border-white/10"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200",
                          ].join(" ")}
                        >
                          Ver dashboard global
                        </button>
                      </div>
                      <p
                        className={[
                          "text-[10px] pt-1",
                          isDark ? "text-neutral-500" : "text-slate-500",
                        ].join(" ")}
                      >
                        Tip: usa este panel como vista ejecutiva. El detalle completo está en cada
                        evaluación individual.
                      </p>
                    </div>
                  </aside>
                </div>
              </>
            )}
          </>
        )}

        {view === "USERS" && (
          <div className="max-w-7xl mx-auto w-full">
            <AdminUsersPanel
              scope={{
                selectedSchool: selectedSchoolName,
                selectedProgram: selectedProgramName,
              }}
            />
          </div>
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
      </div>

      {/* ✅ Modal: detalle de evaluación (vista completa) */}
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
                  ? "border-white/15 bg-[#161c22] shadow-[0_30px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "border-slate-300 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]",
              ].join(" ")}
            >
              {/* Header del modal */}
              <div
                className={[
                  "shrink-0 px-6 py-5 border-b flex items-center justify-between gap-4 backdrop-blur-sm",
                  isDark
                    ? "border-white/10 bg-[#1a2028]/90"
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
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.45)]",
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

              {/* Área de contenido con espacio para que no se vea pegado */}
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