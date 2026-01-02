// src/services/schoolsService.ts
import api from "./apiClient";

export type SchoolOption = {
  id: string;
  name: string;
};

function normalizeSchool(raw: any): SchoolOption | null {
  if (!raw) return null;

  const id = String(raw.id ?? raw.schoolId ?? raw._id ?? "").trim();
  const name = String(raw.name ?? raw.schoolName ?? raw.title ?? "").trim();

  if (!id) return null;
  return { id, name: name || id };
}

export const schoolsService = {
  async list(): Promise<SchoolOption[]> {
    // Endpoint típico en Nest: GET /schools
    const { data } = await api.get<any>("/schools");

    const arr = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    return arr.map(normalizeSchool).filter(Boolean) as SchoolOption[];
  },
};
