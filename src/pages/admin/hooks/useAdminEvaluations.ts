// src/pages/admin/hooks/useAdminEvaluations.ts
import { useEffect, useMemo, useState } from "react";
import type { TeacherEvaluationSummary } from "../../../types";
import { listTeacherEvaluations } from "../../../services/teachersService";

import {
  buildSchoolOptions,
  buildProgramOptions,
  computeMetrics,
  computeSchoolsSummary,
  filterEvaluations,
  pct,
} from "../utils/adminSelectors";

// ✅ DB scope (para resolver nombres por ID)
import { listSchools, listProgramsBySchool } from "../../../services/adminScopeService";

type ScopeLevel = "GLOBAL" | "SCHOOL" | "PROGRAM";

type PersistedScope = {
  search?: string;
  selectedSchool?: string | null;   // string (nombre) - como lo usa tu filtro actual
  selectedProgram?: string | null;  // string (nombre)
};

const LS_KEY = "ADMIN_SCOPE_V1";

function loadPersistedScope(): PersistedScope {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function savePersistedScope(next: PersistedScope) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function uniq(arr: Array<string | null | undefined>) {
  return Array.from(new Set(arr.filter(Boolean) as string[]));
}

export function useAdminEvaluations() {
  const [evaluations, setEvaluations] = useState<TeacherEvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialScope = loadPersistedScope();

  const [search, setSearch] = useState(initialScope.search ?? "");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(
    initialScope.selectedSchool ?? null
  );
  const [selectedProgram, setSelectedProgram] = useState<string | null>(
    initialScope.selectedProgram ?? null
  );

  // ✅ Persistir cambios del scope (debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      savePersistedScope({ selectedSchool, selectedProgram, search });
    }, 250);
    return () => clearTimeout(t);
  }, [selectedSchool, selectedProgram, search]);

  // ✅ Cargar evaluaciones + enriquecer nombres de escuela/programa desde DB
  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const raw = (await listTeacherEvaluations()) ?? [];

        // 1) Recolectar IDs presentes
        const schoolIds = uniq(
          raw.map((e: any) => e?.candidate?.schoolId ?? e?.candidate?.schoolIdSnapshot ?? null)
        );
        const programIds = uniq(
          raw.map((e: any) => e?.candidate?.programId ?? e?.candidate?.programIdSnapshot ?? null)
        );

        // 2) Traer escuelas y construir map
        const schools = await listSchools().catch(() => []);
        const schoolNameById = new Map<string, string>();
        for (const s of schools ?? []) {
          if (s?.id) schoolNameById.set(String(s.id), String(s.name ?? "").trim());
        }

        // 3) Traer programas por cada escuela que aparezca en las evaluaciones
        //    (evita tener que crear un endpoint global de programas)
        const programNameById = new Map<string, string>();
        await Promise.all(
          (schoolIds ?? []).map(async (sid) => {
            const rows = await listProgramsBySchool(sid).catch(() => []);
            for (const p of rows ?? []) {
              if (p?.id) programNameById.set(String(p.id), String(p.name ?? "").trim());
            }
          })
        );

        // 4) Inyectar nombres en candidate.*Snapshot (para que el filtro/selector no cambie)
        const enriched = raw.map((e: any) => {
          const c = e?.candidate ?? null;
          if (!c) return e;

          const schoolId = String(c.schoolId ?? c.schoolIdSnapshot ?? "");
          const programId = String(c.programId ?? c.programIdSnapshot ?? "");

          const schoolName = schoolNameById.get(schoolId) ?? null;
          const programName = programNameById.get(programId) ?? null;

          return {
            ...e,
            candidate: {
              ...c,
              // ✅ conserva IDs
              schoolId: c.schoolId ?? null,
              programId: c.programId ?? null,

              // ✅ nombres (snapshots) para UI actual
              schoolNameSnapshot: c.schoolNameSnapshot ?? schoolName,
              programNameSnapshot: c.programNameSnapshot ?? programName,

              // opcional: también en llaves "schoolName/programName" por si algún componente las usa
              schoolName: c.schoolName ?? schoolName,
              programName: c.programName ?? programName,
            },
          };
        });

        if (!alive) return;
        setEvaluations(enriched as TeacherEvaluationSummary[]);
      } catch (err) {
        if (!alive) return;
        console.error("Error al cargar evaluaciones (admin):", err);
        setEvaluations([]);
        setError(
          "No se pudo cargar la información global de evaluaciones. Intenta de nuevo más tarde."
        );
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ Scope levels
  const scopeLevel: ScopeLevel = useMemo(() => {
    if (!selectedSchool) return "GLOBAL";
    if (!selectedProgram) return "SCHOOL";
    return "PROGRAM";
  }, [selectedSchool, selectedProgram]);

  const hasScope = scopeLevel !== "GLOBAL";

  // ✅ Opciones para wizard (se derivan de evaluaciones ya enriquecidas)
  const schoolOptions = useMemo(() => buildSchoolOptions(evaluations), [evaluations]);

  const programOptions = useMemo(() => {
    if (!selectedSchool) return [];
    return buildProgramOptions(evaluations, selectedSchool);
  }, [evaluations, selectedSchool]);

  // ✅ Si cambias escuela, resetea programa si ya no existe
  useEffect(() => {
    if (!selectedSchool) {
      if (selectedProgram !== null) setSelectedProgram(null);
      return;
    }
    if (!selectedProgram) return;

    const stillExists = programOptions.includes(selectedProgram);
    if (!stillExists) setSelectedProgram(null);
  }, [selectedSchool, selectedProgram, programOptions]);

  const filteredEvaluations = useMemo(() => {
    return filterEvaluations(evaluations, search, selectedSchool, selectedProgram);
  }, [evaluations, search, selectedSchool, selectedProgram]);

  const metrics = useMemo(() => computeMetrics(filteredEvaluations), [filteredEvaluations]);

  const schoolsSummary = useMemo(() => computeSchoolsSummary(evaluations), [evaluations]);

  const recommendedPct = useMemo(() => pct(metrics.recommended, metrics.total), [metrics]);
  const highRiskPct = useMemo(() => pct(metrics.notRecommended, metrics.total), [metrics]);

  return {
    evaluations,
    loading,
    error,

    search,
    setSearch,
    selectedSchool,
    setSelectedSchool,
    selectedProgram,
    setSelectedProgram,
    scopeLevel,
    hasScope,

    schoolOptions,
    programOptions,

    filteredEvaluations,
    metrics,
    schoolsSummary,
    recommendedPct,
    highRiskPct,
  };
}
