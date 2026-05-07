import apiClient from "./apiClient";

export type AreaOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
};

export const areasService = {
  async list(): Promise<AreaOption[]> {
    const { data } = await apiClient.get<AreaOption[]>("/areas");
    return Array.isArray(data) ? data : [];
  },
};
