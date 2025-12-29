// src/pages/admin/components/scope/AdminScopeWizard.tsx
import React, { useMemo } from "react";
import {
  Building2,
  GraduationCap,
  Check,
  ChevronRight,
  Globe,
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../../types";
import {
  MOCK_SCHOOLS,
  MOCK_PROGRAMS_BY_SCHOOL,
} from "../../utils/adminMockScope"; // 👈 ajusta el path si te queda distinto

type Props = {
  evaluations: TeacherEvaluationSummary[];
  schoolOptions: string[];
  programOptions: string[];
  selectedSchool: string | null;
  selectedProgram: string | null;
  onSelectSchool: (s: string) => void;
  onSelectProgram: (p: string) => void;
  onBackToSchools?: () => void;
  onResetToGlobal?: () => void;
};

const pickSchool = (ev: any) =>
  ev?.candidate?.schoolNameSnapshot ??
  ev?.candidate?.schoolName ??
  ev?.schoolNameSnapshot ??
  ev?.schoolName ??
  ev?.school ??
  "";

const pickProgram = (ev: any) =>
  ev?.candidate?.programNameSnapshot ??
  ev?.candidate?.programName ??
  ev?.programNameSnapshot ??
  ev?.programName ??
  ev?.program ??
  "";

export default function AdminScopeWizard(props: Props) {
  const {
    evaluations,
    schoolOptions,
    programOptions,
    selectedSchool,
    selectedProgram,
    onSelectSchool,
    onSelectProgram,
    onBackToSchools,
    onResetToGlobal,
  } = props;

  const step: 1 | 2 = selectedSchool ? 2 : 1;

  // ✅ Fallback si aún no hay evaluaciones (o vienen vacías)
  const effectiveSchools =
    (schoolOptions ?? []).filter(Boolean).length > 0
      ? (schoolOptions ?? []).filter(Boolean)
      : MOCK_SCHOOLS.map((s) => s.name);

  const effectivePrograms =
    selectedSchool && (programOptions ?? []).filter(Boolean).length > 0
      ? (programOptions ?? []).filter(Boolean).map((p) => ({ name: p }))
      : selectedSchool
      ? (MOCK_PROGRAMS_BY_SCHOOL[selectedSchool] ?? []).map((p) => ({ name: p.name }))
      : [];

  // ✅ Conteos (ahora sí sirven, porque inyectaste school/program en evaluations)
  const schoolCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of evaluations ?? []) {
      const s = String(pickSchool(e)).trim() || "Sin escuela";
      map.set(s, (map.get(s) ?? 0) + 1);
    }
    return map;
  }, [evaluations]);

  const programCounts = useMemo(() => {
    const map = new Map<string, number>();
    if (!selectedSchool) return map;
    const target = selectedSchool.trim();

    for (const e of evaluations ?? []) {
      const s = String(pickSchool(e)).trim() || "Sin escuela";
      if (s !== target) continue;

      const p = String(pickProgram(e)).trim() || "Sin programa";
      map.set(p, (map.get(p) ?? 0) + 1);
    }
    return map;
  }, [evaluations, selectedSchool]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center pt-4">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
          <span className="text-emerald-300 font-black text-xl">✦</span>
        </div>

        <h2 className="mt-4 text-3xl font-black text-white">
          Cambiar <span className="text-emerald-400">Scope</span>
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Puedes trabajar en vista global o bajar a escuela / programa.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div
            className={[
              "px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-2",
              step === 1
                ? "bg-emerald-600 text-white border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
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
                ? "bg-emerald-600 text-white border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
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
      </div>

      <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-[#141414]/50">
          <h3 className="text-white font-black text-lg">
            {step === 1 ? "Selecciona una escuela" : "Selecciona un programa"}
          </h3>

          <p className="mt-1 text-xs text-neutral-500">
            {step === 1
              ? "Primero eliges escuela. Luego eliges programa."
              : "Escuela seleccionada: "}
            {step === 2 && (
              <span className="text-emerald-300 font-semibold">{selectedSchool}</span>
            )}
          </p>

          {step === 2 && (
            <button
              type="button"
              onClick={onBackToSchools}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 text-xs font-bold hover:bg-emerald-500/15 transition-colors"
            >
              ← Volver a Escuelas
            </button>
          )}
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {effectiveSchools.map((schoolName) => {
                const count = schoolCounts.get(schoolName) ?? 0;

                return (
                  <button
                    key={schoolName}
                    type="button"
                    onClick={() => onSelectSchool(schoolName)}
                    className="text-left rounded-2xl border border-emerald-500/15 bg-black/20 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white font-bold">{schoolName}</p>
                        <p className="text-xs text-emerald-300 mt-1">
                          {count} evaluaciones
                        </p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-emerald-300/70" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {effectivePrograms.map((p) => {
                const name = p.name;
                const active = selectedProgram === name;
                const count = programCounts.get(name) ?? 0;

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onSelectProgram(name)}
                    className={[
                      "text-left rounded-2xl border transition-all p-5",
                      active
                        ? "border-emerald-400/40 bg-emerald-600/30 shadow-[0_0_40px_rgba(16,185,129,0.18)]"
                        : "border-white/10 bg-black/20 hover:border-emerald-500/25 hover:bg-emerald-500/5",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white font-bold">{name}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {count} evaluaciones
                        </p>
                      </div>

                      <div className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center">
                        {active ? (
                          <Check className="w-4 h-4 text-emerald-300" />
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
        </div>
      </div>
    </div>
  );
}
