import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TeacherEvaluationSummary } from "../../../types";
import { listTeacherEvaluations } from "../../../services/teachersService";
import { queryKeys } from "../../../services/queryKeys";
import type { LocalDecision, DecisionFilter } from "../types";

export function useCoordinatorEvaluations() {
  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("ALL");
  const [localDecisions, setLocalDecisions] = useState<Record<string, LocalDecision>>({});

  const { data: evaluations = [], isLoading, error: queryError } = useQuery<TeacherEvaluationSummary[]>({
    queryKey: queryKeys.evaluations.list(),
    queryFn: listTeacherEvaluations,
  });

  const error = queryError ? "No se pudo cargar el historial de evaluaciones." : null;

  const filteredEvaluations = useMemo(() => {
    let base = [...evaluations];

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter((ev) => {
        const name = ev.candidate?.fullName?.toLowerCase() ?? "";
        const school = ev.candidate?.schoolNameSnapshot?.toLowerCase() ?? "";
        const program = ev.candidate?.programNameSnapshot?.toLowerCase() ?? "";
        return name.includes(q) || school.includes(q) || program.includes(q);
      });
    }

    if (decisionFilter !== "ALL") {
      base = base.filter((ev) => {
        const status =
          localDecisions[ev.id] ??
          ((ev.coordinatorDecisionStatus as LocalDecision | undefined) ?? "PENDIENTE");
        return status === decisionFilter;
      });
    }

    return base;
  }, [evaluations, search, decisionFilter, localDecisions]);

  const metrics = useMemo(() => {
    if (evaluations.length === 0) return { total: 0, avgScore: 0 };
    const total = evaluations.length;
    const sumScore = evaluations.reduce(
      (acc, ev) => acc + (ev.aiTeachingSuitabilityScore || 0),
      0
    );
    return { total, avgScore: sumScore / total };
  }, [evaluations]);

  return {
    evaluations,
    loading: isLoading,
    error,

    search,
    setSearch,

    decisionFilter,
    setDecisionFilter,

    localDecisions,
    setLocalDecisions,

    filteredEvaluations,
    metrics,
  };
}
