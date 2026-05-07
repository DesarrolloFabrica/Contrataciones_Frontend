import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../services/apiClient";
import type { RemoteSchool, NormalizedSchool } from "../types";
import { queryKeys } from "../../../../services/queryKeys";

interface UseLeaderSchoolProgramsReturn {
  normalizedSchools: NormalizedSchool[];
  schoolsLoading: boolean;
  schoolsLoadError: string | null;
}

export function useLeaderSchoolPrograms(
  isLeader: boolean,
  leaderSchoolId: string | null,
  _user: any,
): UseLeaderSchoolProgramsReturn {
  const { data: remoteSchools = [], isLoading: schoolsLoading, error: queryError } = useQuery<RemoteSchool[]>({
    queryKey: queryKeys.schools.schoolsWithPrograms(),
    queryFn: async () => {
      const { data } = await api.get<RemoteSchool[] | { items?: RemoteSchool[] }>("/schools", {
        params: { includePrograms: "true" },
      });

      let rows = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

      if (isLeader && leaderSchoolId) {
        rows = rows.filter((s) => s.id === leaderSchoolId);
      }

      return rows;
    },
    staleTime: 1000 * 60 * 10,
  });

  const normalizedSchools: NormalizedSchool[] = useMemo(() => {
    return (remoteSchools ?? [])
      .filter((s) => !!s?.id && !!s?.name)
      .map((s) => ({
        id: s.id,
        name: s.name,
        programs: (s.programs ?? [])
          .filter((p) => !!p?.id && !!p?.name)
          .map((p) => ({ id: p.id, name: p.name })),
      }));
  }, [remoteSchools]);

  let schoolsLoadError: string | null = null;
  if (queryError) {
    schoolsLoadError = "No se pudo cargar el catálogo oficial de escuelas/programas. Verifica tu conexión e intenta de nuevo.";
  } else if (remoteSchools.length === 0 && !schoolsLoading) {
    if (isLeader && !leaderSchoolId) {
      schoolsLoadError =
        "Tu usuario no tiene escuela asignada. Contacta al administrador para que te asigne una escuela.";
    } else {
      schoolsLoadError =
        "No hay escuelas disponibles en el catálogo. Contacta al administrador.";
    }
  }

  return { normalizedSchools, schoolsLoading, schoolsLoadError };
}
