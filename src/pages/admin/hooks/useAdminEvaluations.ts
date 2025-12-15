// src/pages/admin/hooks/useAdminEvaluations.ts
import { useEffect, useMemo, useState } from "react";
import type { TeacherEvaluationSummary } from "../../../types";
import { listTeacherEvaluations } from "../../../services/teachersService";
import {
  buildSchoolOptions,
  computeMetrics,
  computeSchoolsSummary,
  filterEvaluations,
  pct,
} from "../utils/adminSelectors";

export function useAdminEvaluations() {
  const [evaluations, setEvaluations] = useState<TeacherEvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>("TODAS");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listTeacherEvaluations();
        setEvaluations(data);
      } catch (err) {
        console.error("Error al cargar evaluaciones (admin):", err);
        setError("No se pudo cargar la información global de evaluaciones. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const schoolOptions = useMemo(() => buildSchoolOptions(evaluations), [evaluations]);

  const filteredEvaluations = useMemo(
    () => filterEvaluations(evaluations, search, selectedSchool),
    [evaluations, search, selectedSchool]
  );

  const metrics = useMemo(() => computeMetrics(evaluations), [evaluations]);

  const schoolsSummary = useMemo(() => computeSchoolsSummary(evaluations), [evaluations]);

  const recommendedPct = useMemo(() => pct(metrics.recommended, metrics.total), [metrics]);
  const highRiskPct = useMemo(() => pct(metrics.notRecommended, metrics.total), [metrics]);

  return {
    // fetch
    evaluations,
    loading,
    error,

    // filters
    search,
    setSearch,
    selectedSchool,
    setSelectedSchool,
    schoolOptions,

    // derived
    filteredEvaluations,
    metrics,
    schoolsSummary,
    recommendedPct,
    highRiskPct,
  };
}
