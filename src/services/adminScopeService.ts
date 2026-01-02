// src/services/adminScopeService.ts
import api from "./apiClient";

export type SchoolOption = { id: string; name: string };
export type ProgramOption = { id: string; name: string; schoolId: string };

export async function listSchools(): Promise<SchoolOption[]> {
  // ✅ según tu backend actual
  const { data } = await api.get("/schools");
  return (data ?? []) as SchoolOption[];
}

export async function listProgramsBySchool(schoolId: string): Promise<ProgramOption[]> {
  // ✅ tu controller es /programs?schoolId=...
  const { data } = await api.get("/programs", { params: { schoolId } });
  return (data ?? []) as ProgramOption[];
}
