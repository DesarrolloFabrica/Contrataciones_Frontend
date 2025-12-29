// src/pages/coordinator/hooks/useCoordinatorEvaluations.ts
import { useEffect, useMemo, useState } from "react";
import {
  listCoordinatorCandidates,
  type CoordinatorCandidateGroup,
  type CoordinatorCandidatesStatusFilter,
} from "../../../services/teachersService";
import { DecisionFilter } from "../types";

/**
 * Hook del panel de Coordinación.
 * - Carga candidatos agrupados (backend) SOLO cuando hay scope (escuela + programa).
 * - El filtro de estado se aplica en backend (status).
 * - La búsqueda (search) también se aplica en backend.
 */
export function useCoordinatorEvaluations(params: {
  orgId: string | null;
  schoolId: string | null;
  programId: string | null;
}) {
  const { orgId, schoolId, programId } = params;

  // ✅ Ahora guardamos "grupos" (candidato + latest + interviewsCount)
  const [groups, setGroups] = useState<CoordinatorCandidateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("ALL");

  /**
   * Helpers
   */
  const mustChooseScope = useMemo(() => {
    return !orgId || !schoolId || !programId;
  }, [orgId, schoolId, programId]);

  // Mapeo DecisionFilter (front) -> status (backend)
  const statusForApi: CoordinatorCandidatesStatusFilter = useMemo(() => {
    // Tu DecisionFilter actual: "ALL" | "PENDING" | "APPROVED" | "REJECTED"
    // Coincide con el API que definimos, así que es 1:1.
    return decisionFilter as CoordinatorCandidatesStatusFilter;
  }, [decisionFilter]);

  /**
   * Carga desde backend cada vez que cambie:
   * - scope (org/school/program)
   * - decisionFilter (status)
   * - search
   */
  useEffect(() => {
    // Si no hay scope, reseteamos y no llamamos al backend
    if (mustChooseScope) {
      setGroups([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await listCoordinatorCandidates({
          orgId: orgId!,
          schoolId: schoolId!,
          programId: programId!,
          status: statusForApi, // ✅ filtro por estado en backend
          search: search.trim() ? search.trim() : undefined, // ✅ búsqueda en backend
        });

        if (!cancelled) {
          setGroups(data);
        }
      } catch (err) {
        console.error("Error al cargar candidatos (coordinador):", err);
        if (!cancelled) {
          setError("No se pudo cargar el historial de evaluaciones.");
          setGroups([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [mustChooseScope, orgId, schoolId, programId, statusForApi, search]);

  /**
   * Métricas (sobre lo que devuelve el backend para el scope actual)
   */
  const metrics = useMemo(() => {
    const total = groups.length;

    if (total === 0) return { total: 0, avgScore: 0 };

    const sumScore = groups.reduce((acc, g) => {
      const score = g.latest?.aiTeachingSuitabilityScore ?? 0;
      return acc + score;
    }, 0);

    return { total, avgScore: sumScore / total };
  }, [groups]);

  return {
    // ✅ datos
    groups,

    // ✅ estados UI
    loading,
    error,
    setError,

    // ✅ scope helper
    mustChooseScope,

    // ✅ filtros
    search,
    setSearch,

    decisionFilter,
    setDecisionFilter,

    // ✅ métricas
    metrics,
  };
}
