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

  mustResetPassword?: boolean;

  // opcionales (por si tu backend los manda)
  createdAt?: string;
  updatedAt?: string;
  school?: BackendSchool | null;
};

export type CreateBackendUserDto = {
  email: string;
  fullName: string;
  role: BackendRole;

  schoolId?: string | null;

  mustResetPassword?: boolean;

  // si el backend genera password
  generatePassword?: boolean;

  // si quieres enviar una password manual
  password?: string;

  isActive?: boolean;
};

export type UpdateBackendUserDto = Partial<{
  email: string;
  fullName: string;
  role: BackendRole;
  schoolId: string | null;
  mustResetPassword: boolean;
  isActive: boolean;
}>;

export type CreateUserResponse = {
  user: BackendUser;

  // según como lo retorne tu backend (dejamos variantes)
  password?: { temporaryPassword?: string };
  temporaryPassword?: string;
  generatedPassword?: string;
};

export type ResetPasswordResponse = {
  temporaryPassword?: string;
  generatedPassword?: string;
};

export const usersService = {
  // ✅ LISTA
  async list(): Promise<BackendUser[]> {
    const { data } = await api.get<BackendUser[]>("/users");
    return data ?? [];
  },

  // ✅ CREAR
  async create(dto: CreateBackendUserDto): Promise<CreateUserResponse> {
    const { data } = await api.post<CreateUserResponse>("/users", dto);
    return data;
  },

  // ✅ ACTUALIZAR
  async update(userId: string, dto: UpdateBackendUserDto): Promise<BackendUser> {
    const { data } = await api.patch<BackendUser>(`/users/${userId}`, dto);
    return data;
  },

  // ✅ ACTIVAR / DESACTIVAR (lo hacemos con PATCH /users/:id)
  async setActive(userId: string, isActive: boolean): Promise<BackendUser> {
    const { data } = await api.patch<BackendUser>(`/users/${userId}`, { isActive });
    return data;
  },

  // ✅ RESET PASSWORD
  async resetPassword(userId: string): Promise<ResetPasswordResponse> {
    const { data } = await api.post<ResetPasswordResponse>(
      `/users/${userId}/reset-password`
    );
    return data;
  },
};
