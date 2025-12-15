import { useEffect, useMemo, useState } from "react";
import { TeacherEvaluationSummary } from "../../../types";
import { listTeacherEvaluations } from "../../../services/teachersService";
import { DecisionFilter, LocalDecision } from "../types";

export function useCoordinatorEvaluations() {
  const [evaluations, setEvaluations] = useState<TeacherEvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("ALL");

  // mapa local id -> decisión (para que la lista y los filtros funcionen visualmente)
  const [localDecisions, setLocalDecisions] = useState<Record<string, LocalDecision>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listTeacherEvaluations();
        setEvaluations(data);
      } catch (err) {
        console.error("Error al cargar evaluaciones (coordinador):", err);
        setError("No se pudo cargar el historial de evaluaciones.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredEvaluations = useMemo(() => {
    let base = evaluations;

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
          (ev.coordinatorDecisionStatus as LocalDecision | undefined) ??
          "PENDIENTE";
        return status === decisionFilter;
      });
    }

    return base;
  }, [evaluations, search, decisionFilter, localDecisions]);

  const metrics = useMemo(() => {
    if (evaluations.length === 0) return { total: 0, avgScore: 0 };
    const total = evaluations.length;
    const sumScore = evaluations.reduce((acc, ev) => acc + (ev.aiTeachingSuitabilityScore || 0), 0);
    return { total, avgScore: sumScore / total };
  }, [evaluations]);

  return {
    evaluations,
    loading,
    error,
    setError,

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
