import { useState, useEffect, useMemo } from "react";
import api from "../../../../services/apiClient";
import { schools as mockSchools } from "../../../../data/schools";
import type { RemoteSchool, NormalizedSchool } from "../types";

interface UseLeaderSchoolProgramsReturn {
  normalizedSchools: NormalizedSchool[];
  schoolsLoading: boolean;
}

export function useLeaderSchoolPrograms(
  isLeader: boolean,
  leaderSchoolId: string | null,
  user: any,
): UseLeaderSchoolProgramsReturn {
  const [remoteSchools, setRemoteSchools] = useState<RemoteSchool[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  const normalizedSchools: NormalizedSchool[] = useMemo(() => {
    const fromRemote: NormalizedSchool[] =
      (remoteSchools ?? [])
        .filter((s) => !!s?.name)
        .map((s) => ({
          id: s.id,
          name: s.name,
          programs: (s.programs ?? [])
            .filter((p) => !!p?.name)
            .map((p) => ({ id: p.id, name: p.name })),
        })) ?? [];

    if (fromRemote.length > 0) return fromRemote;

    return (mockSchools ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      programs: Array.isArray(s.programs)
        ? s.programs.map((p: any) =>
            typeof p === "string"
              ? { id: undefined, name: p }
              : { id: p?.id, name: p?.name },
          )
        : [],
    }));
  }, [remoteSchools]);

  useEffect(() => {
    let alive = true;

    const loadSchools = async () => {
      setSchoolsLoading(true);
      try {
        const { data } = await api.get<RemoteSchool[]>("/schools", {
          params: { includePrograms: "true" },
        });

        let rows = Array.isArray(data) ? data : [];

        if (isLeader && leaderSchoolId) {
          rows = rows.filter((s) => String(s.id ?? "") === leaderSchoolId);
        }

        if (!alive) return;
        setRemoteSchools(rows);
      } catch {
        if (!alive) return;
        setRemoteSchools([]);
      } finally {
        if (!alive) return;
        setSchoolsLoading(false);
      }
    };

    loadSchools();
    return () => {
      alive = false;
    };
  }, [user, isLeader, leaderSchoolId]);

  return { normalizedSchools, schoolsLoading };
}
