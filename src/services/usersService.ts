// src/services/usersService.ts
import api from "./apiClient";

export type BackendRole = "ADMIN" | "COORDINADOR" | "LIDER";

export type BackendSchool = {
  id: string;
  name: string;
};

export type BackendUser = {
  id: string;
  email: string;
  fullName: string;
  role: BackendRole;

  schoolId: string | null;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
  school?: BackendSchool | null;
};

export type CreateBackendUserDto = {
  email: string;
  fullName: string;
  role: BackendRole;

  schoolId?: string | null;

  isActive?: boolean;
};

export type UpdateBackendUserDto = Partial<{
  email: string;
  fullName: string;
  role: BackendRole;
  schoolId: string | null;
  isActive: boolean;
}>;

export type CreateUserResponse = {
  ok?: boolean;
  user: BackendUser;
};

export const usersService = {
  async list(): Promise<BackendUser[]> {
    const { data } = await api.get<BackendUser[]>("/users");
    return data ?? [];
  },

  async create(dto: CreateBackendUserDto): Promise<CreateUserResponse> {
    const { data } = await api.post<CreateUserResponse>("/users/admin-create", dto);
    return data;
  },

  async update(userId: string, dto: UpdateBackendUserDto): Promise<BackendUser> {
    const { data } = await api.patch<BackendUser>(`/users/${userId}`, dto);
    return data;
  },

  async setActive(userId: string, isActive: boolean): Promise<BackendUser> {
    const { data } = await api.patch<BackendUser>(`/users/${userId}`, { isActive });
    return data;
  },
};
