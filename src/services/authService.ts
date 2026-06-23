import api from "./apiClient";

export type LoginResponseUser = {
  id: string;
  email: string;
  role: "ADMIN" | "COORDINADOR" | "LIDER";
  schoolId: string | null;
  fullName?: string;
  googlePicture?: string | null;
};

export type LoginResponse = {
  accessToken: string;
  user: LoginResponseUser;
};

export async function loginWithGoogle(accessToken: string): Promise<LoginResponse> {
  const resp = await api.post<LoginResponse>("/auth/google", { accessToken });
  const data = resp.data;

  if (!data?.accessToken || !data?.user) {
    throw new Error("Respuesta de Google login inválida");
  }

  return data;
}

export async function loginWithEmailOnly(email: string): Promise<LoginResponse> {
  const resp = await api.post<LoginResponse>("/auth/dev/email", { email });
  const data = resp.data;

  if (!data?.accessToken || !data?.user) {
    throw new Error("Respuesta de login por correo inválida");
  }

  return data;
}
