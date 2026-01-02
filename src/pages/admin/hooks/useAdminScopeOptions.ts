import { useEffect, useState } from "react";
import {
  listSchools,
  listProgramsBySchool,
  type SchoolOption,
  type ProgramOption,
} from "../../../services/adminScopeService";

export function useAdminScopeOptions(selectedSchoolId: string | null) {
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoadingSchools(true);
    setError(null);

    listSchools()
      .then((rows) => alive && setSchools(rows))
      .catch((e) => alive && setError(e?.message ?? "Error cargando escuelas"))
      .finally(() => alive && setLoadingSchools(false));

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setPrograms([]);
    if (!selectedSchoolId) return;

    setLoadingPrograms(true);
    setError(null);

    listProgramsBySchool(selectedSchoolId)
      .then((rows) => alive && setPrograms(rows))
      .catch((e) => alive && setError(e?.message ?? "Error cargando programas"))
      .finally(() => alive && setLoadingPrograms(false));

    return () => {
      alive = false;
    };
  }, [selectedSchoolId]);

  return { schools, programs, loadingSchools, loadingPrograms, error };
}
