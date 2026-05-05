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
        <div className="mx-auto h-14 w-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
          <span className="text-cyan-300 font-black text-xl">✦</span>
        </div>

        <h2 className="mt-4 text-3xl font-black text-white">
          Cambiar <span className="text-cyan-400">Scope</span>
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Puedes trabajar en vista global o bajar a escuela / programa.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div
            className={[
              "px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-2",
              step === 1
                ? "bg-cyan-600 text-white border-cyan-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                : "bg-white/5 text-gray-300 border-white/10",
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
                ? "bg-cyan-600 text-white border-cyan-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                : "bg-white/5 text-gray-300 border-white/10",
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-neutral-200 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition"
            >
              <Globe className="w-4 h-4" />
              Volver a Vista Global
            </button>
          </div>
        )}

        {(loadingSchools || loadingPrograms) && (
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
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
      <div className="mt-6 bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="flex-none p-6 border-b border-white/5 bg-[#141414]/50">
          <h3 className="text-white font-black text-lg">
            {step === 1 ? "Selecciona una escuela" : "Selecciona un programa"}
          </h3>

          <p className="mt-1 text-xs text-neutral-500">
            {step === 1 ? "Primero eliges escuela. Luego eliges programa." : "Escuela seleccionada: "}
            {step === 2 && (
              <span className="text-cyan-300 font-semibold">{selectedSchoolName}</span>
            )}
          </p>

          {step === 2 && (
            <button
              type="button"
              onClick={onBackToSchools}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-200 text-xs font-bold hover:bg-cyan-500/15 transition-colors"
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
                <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-neutral-400">
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
                        className="text-left rounded-2xl border border-cyan-500/15 bg-black/20 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white font-bold">{s.name}</p>
                            <p className="text-xs text-cyan-300 mt-1">{count} evaluaciones</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-cyan-300/70" />
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
                <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-neutral-400">
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
                            ? "border-cyan-400/40 bg-cyan-600/30 shadow-[0_0_40px_rgba(16,185,129,0.18)]"
                            : "border-white/10 bg-black/20 hover:border-cyan-500/25 hover:bg-cyan-500/5",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white font-bold">{p.name}</p>
                            <p className="text-xs text-neutral-400 mt-1">{count} evaluaciones</p>
                          </div>

                          <div className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center">
                            {active ? (
                              <Check className="w-4 h-4 text-cyan-300" />
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
