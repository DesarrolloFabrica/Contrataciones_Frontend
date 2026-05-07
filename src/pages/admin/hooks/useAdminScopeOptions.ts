import { useQuery } from "@tanstack/react-query";
import {
  listSchools,
  listProgramsBySchool,
  type SchoolOption,
  type ProgramOption,
} from "../../../services/adminScopeService";
import { queryKeys } from "../../../services/queryKeys";

export function useAdminScopeOptions(selectedSchoolId: string | null) {
  const { data: schools = [], isLoading: loadingSchools, error: schoolsError } = useQuery<SchoolOption[]>({
    queryKey: queryKeys.schools.list(),
    queryFn: listSchools,
    staleTime: 1000 * 60 * 10,
  });

  const { data: programs = [], isLoading: loadingPrograms, error: programsError } = useQuery<ProgramOption[]>({
    queryKey: queryKeys.schools.programs(selectedSchoolId ?? ""),
    queryFn: () => listProgramsBySchool(selectedSchoolId!),
    enabled: !!selectedSchoolId,
    staleTime: 1000 * 60 * 10,
  });

  const error = (schoolsError as Error)?.message ?? (programsError as Error)?.message ?? null;

  return { schools, programs, loadingSchools, loadingPrograms, error };
}
