// src/pages/admin/components/scope/AdminScopeWizard.tsx
import React, { useMemo } from "react";
import {
  Building2,
  GraduationCap,
  Check,
  ChevronRight,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../../types";
import { useTheme } from "../../../../context/ThemeContext";

type SchoolOption = { id: string; name: string };
type ProgramOption = { id: string; name: string; schoolId: string };

type Props = {
  evaluations: TeacherEvaluationSummary[];

  schools: SchoolOption[];
  programs: ProgramOption[];

  selectedSchoolId: string | null;
  selectedProgramId: string | null;

  onSelectSchool: (schoolId: string) => void;
  onSelectProgram: (programId: string) => void;

  onBackToSchools?: () => void;
  onResetToGlobal?: () => void;

  loadingSchools?: boolean;
  loadingPrograms?: boolean;
  error?: string | null;
};

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

export default function AdminScopeWizard({
  evaluations,
  schools,
  programs,
  selectedSchoolId,
  selectedProgramId,
  onSelectSchool,
  onSelectProgram,
  onBackToSchools,
  onResetToGlobal,
  loadingSchools,
  loadingPrograms,
  error,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const step: 1 | 2 = selectedSchoolId ? 2 : 1;

  const schoolNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of schools ?? []) m.set(String(s.id), String(s.name));
    return m;
  }, [schools]);

  const selectedSchoolName = selectedSchoolId
    ? schoolNameById.get(String(selectedSchoolId)) ?? String(selectedSchoolId)
    : null;

  const programsForSelectedSchool = useMemo(() => {
    if (!selectedSchoolId) return [];
    return (programs ?? []).filter(
      (p) => String(p.schoolId) === String(selectedSchoolId)
    );
  }, [programs, selectedSchoolId]);

  const schoolCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of evaluations ?? []) {
      const sid = pickSchoolId(e);
      const key = sid ? String(sid) : String(pickSchoolName(e)).trim() || "Sin escuela";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [evaluations]);

  const programCounts = useMemo(() => {
    const map = new Map<string, number>();
    if (!selectedSchoolId) return map;

    const selId = String(selectedSchoolId);
    const selName = String(selectedSchoolName ?? "").trim();

    for (const e of evaluations ?? []) {
      const sid = pickSchoolId(e);

      const matchSchool = sid
        ? String(sid) === selId
        : String(pickSchoolName(e)).trim() === selName;

      if (!matchSchool) continue;

      const pid = pickProgramId(e);
      const key = pid ? String(pid) : String(pickProgramName(e)).trim() || "Sin programa";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [evaluations, selectedSchoolId, selectedSchoolName]);

  return (
    // ✅ IMPORTANTE: el wizard ahora es “h-full flex”, para que el modal tenga tamaño fijo
    <div className="h-full flex flex-col">
      {/* Hero */}
      <div className="flex-none text-center pt-4">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
          <span className="text-brand-300 font-black text-xl">✦</span>
        </div>

        <h2 className={`mt-4 text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
          Cambiar <span className="text-brand-400">Scope</span>
        </h2>

        <p className={`mt-2 text-sm ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
          Puedes trabajar en vista global o bajar a escuela / programa.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div
            className={[
              "px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-2",
              step === 1
                ? "bg-brand-600 text-white border-brand-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                : isDark ? "bg-[#102a30] text-slate-300 border-[#579689]/18" : "bg-slate-100 text-slate-600 border-slate-200",
            ].join(" ")}
          >
            {step > 1 ? <Check className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            1. Escuela
          </div>

          <ChevronRight className="w-4 h-4 text-neutral-600" />

          <div
            className={[
              "px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-2",
              step === 2
                ? "bg-brand-600 text-white border-brand-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                : isDark ? "bg-[#102a30] text-slate-300 border-[#579689]/18" : "bg-slate-100 text-slate-600 border-slate-200",
            ].join(" ")}
          >
            <GraduationCap className="w-4 h-4" />
            2. Programa
          </div>
        </div>

        {onResetToGlobal && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={onResetToGlobal}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition ${isDark ? "border-[#579689]/18 bg-[#102a30] text-neutral-200 hover:bg-[#15343a]" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              <Globe className="w-4 h-4" />
              Volver a Vista Global
            </button>
          </div>
        )}

        {(loadingSchools || loadingPrograms) && (
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            Cargando opciones...
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Panel */}
      <div className={`mt-6 rounded-3xl border overflow-hidden flex-1 min-h-0 flex flex-col ${isDark ? "bg-[#091d22] border-[#579689]/20" : "bg-white border-slate-200"}`}>
        <div className={`flex-none p-6 border-b ${isDark ? "border-[#579689]/14 bg-[#0b232a]/75" : "border-slate-200 bg-slate-50"}`}>
          <h3 className={`font-black text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
            {step === 1 ? "Selecciona una escuela" : "Selecciona un programa"}
          </h3>

          <p className="mt-1 text-xs text-neutral-500">
            {step === 1 ? "Primero eliges escuela. Luego eliges programa." : "Escuela seleccionada: "}
            {step === 2 && (
              <span className="text-brand-300 font-semibold">{selectedSchoolName}</span>
            )}
          </p>

          {step === 2 && (
            <button
              type="button"
              onClick={onBackToSchools}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-200 text-xs font-bold hover:bg-brand-500/15 transition-colors"
            >
              ← Volver a Escuelas
            </button>
          )}
        </div>

        {/* ✅ único scroll (interno) */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto pr-3 scrollbar-scope">
          {step === 1 && (
            <>
              {(schools ?? []).length === 0 ? (
                <div className={`rounded-2xl border p-8 text-center ${isDark ? "border-[#579689]/18 bg-[#07171c]/60 text-neutral-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                  {loadingSchools ? "Cargando escuelas..." : "No hay escuelas para mostrar."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(schools ?? []).map((s) => {
                    const count =
                      schoolCounts.get(String(s.id)) ??
                      schoolCounts.get(String(s.name)) ??
                      0;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onSelectSchool(s.id)}
                        className={`text-left rounded-2xl border transition-all p-5 ${isDark ? "border-[#579689]/18 bg-[#07171c]/60 hover:border-[#58bea1]/35 hover:bg-[#102a30]" : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{s.name}</p>
                            <p className="text-xs text-brand-300 mt-1">{count} evaluaciones</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-brand-300/70" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {programsForSelectedSchool.length === 0 ? (
                <div className={`rounded-2xl border p-8 text-center ${isDark ? "border-[#579689]/18 bg-[#07171c]/60 text-neutral-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                  {loadingPrograms ? "Cargando programas..." : "No hay programas para esta escuela."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programsForSelectedSchool.map((p) => {
                    const active = selectedProgramId === p.id;
                    const count =
                      programCounts.get(String(p.id)) ??
                      programCounts.get(String(p.name)) ??
                      0;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelectProgram(p.id)}
                        className={[
                          "text-left rounded-2xl border transition-all p-5",
                          active
                            ? "border-brand-400/40 bg-brand-600/30 shadow-[0_0_40px_rgba(16,185,129,0.18)]"
                            : isDark
                              ? "border-[#579689]/18 bg-[#07171c]/60 hover:border-[#58bea1]/35 hover:bg-[#102a30]"
                              : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{p.name}</p>
                            <p className="text-xs text-neutral-400 mt-1">{count} evaluaciones</p>
                          </div>

                          <div className={`h-7 w-7 rounded-full border flex items-center justify-center ${isDark ? "border-[#579689]/18" : "border-slate-200"}`}>
                            {active ? (
                              <Check className="w-4 h-4 text-brand-300" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-white/15" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
