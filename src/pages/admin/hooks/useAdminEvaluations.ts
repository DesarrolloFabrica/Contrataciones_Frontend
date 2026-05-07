import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TeacherEvaluationSummary } from "../../../types";
import { listTeacherEvaluations } from "../../../services/teachersService";
import { queryKeys } from "../../../services/queryKeys";

import {
  buildSchoolOptions,
  buildProgramOptions,
  computeMetrics,
  computeSchoolsSummary,
  filterEvaluations,
  pct,
} from "../utils/adminSelectors";

import { listSchools, listProgramsBySchool } from "../../../services/adminScopeService";

type ScopeLevel = "GLOBAL" | "SCHOOL" | "PROGRAM";

type PersistedScope = {
  search?: string;
  selectedSchool?: string | null;
  selectedProgram?: string | null;
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
  const initialScope = loadPersistedScope();

  const [search, setSearch] = useState(initialScope.search ?? "");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(
    initialScope.selectedSchool ?? null
  );
  const [selectedProgram, setSelectedProgram] = useState<string | null>(
    initialScope.selectedProgram ?? null
  );

  useEffect(() => {
    const t = setTimeout(() => {
      savePersistedScope({ selectedSchool, selectedProgram, search });
    }, 250);
    return () => clearTimeout(t);
  }, [selectedSchool, selectedProgram, search]);

  const { data: rawEvaluations = [], isLoading, error: queryError } = useQuery({
    queryKey: queryKeys.evaluations.list(),
    queryFn: listTeacherEvaluations,
  });

  const { data: schools = [] } = useQuery({
    queryKey: queryKeys.schools.list(),
    queryFn: listSchools,
    staleTime: 1000 * 60 * 10,
  });

  const schoolNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of schools ?? []) {
      if (s?.id) map.set(String(s.id), String(s.name ?? "").trim());
    }
    return map;
  }, [schools]);

  const evaluations = useMemo(() => {
    if (!rawEvaluations.length) return rawEvaluations as TeacherEvaluationSummary[];

    return rawEvaluations.map((e: any) => {
      const c = e?.candidate ?? null;
      if (!c) return e;

      const schoolId = String(c.schoolId ?? c.schoolIdSnapshot ?? "");
      const schoolName = schoolNameById.get(schoolId) ?? null;

      return {
        ...e,
        candidate: {
          ...c,
          schoolId: c.schoolId ?? null,
          programId: c.programId ?? null,
          schoolNameSnapshot: c.schoolNameSnapshot ?? schoolName,
          programNameSnapshot: c.programNameSnapshot,
          schoolName: c.schoolName ?? schoolName,
          programName: c.programName,
        },
      };
    }) as TeacherEvaluationSummary[];
  }, [rawEvaluations, schoolNameById]);

  const error = queryError
    ? "No se pudo cargar la información global de evaluaciones. Intenta de nuevo más tarde."
    : null;

  const scopeLevel: ScopeLevel = useMemo(() => {
    if (!selectedSchool) return "GLOBAL";
    if (!selectedProgram) return "SCHOOL";
    return "PROGRAM";
  }, [selectedSchool, selectedProgram]);

  const hasScope = scopeLevel !== "GLOBAL";

  const schoolOptions = useMemo(() => buildSchoolOptions(evaluations), [evaluations]);

  const programOptions = useMemo(() => {
    if (!selectedSchool) return [];
    return buildProgramOptions(evaluations, selectedSchool);
  }, [evaluations, selectedSchool]);

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
    loading: isLoading,
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
