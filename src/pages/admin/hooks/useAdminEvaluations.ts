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
import { adminMockDb } from "../utils/adminMockDb";
import { applyMockScopeToEvaluations } from "../utils/adminMockScope";

type ScopeLevel = "GLOBAL" | "SCHOOL" | "PROGRAM";

export function useAdminEvaluations() {
  const [evaluations, setEvaluations] = useState<TeacherEvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialScope = adminMockDb.getAdminScope();

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
      adminMockDb.setAdminScope({ selectedSchool, selectedProgram, search });
    }, 250);
    return () => clearTimeout(t);
  }, [selectedSchool, selectedProgram, search]);

  // ✅ Cargar evaluaciones
  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await listTeacherEvaluations();

        // ✅ inyecta school/program mock si el backend aún no lo trae
        const withScope = applyMockScopeToEvaluations(data ?? []);

        if (!alive) return;
        setEvaluations(withScope);
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

  // ✅ Opciones para wizard
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
