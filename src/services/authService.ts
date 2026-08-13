import api from "./apiClient";

export type LoginResponseUser = {
  id: string;
  email: string;
  role: "ADMIN" | "COORDINADOR" | "LIDER";
  schoolId: string | null;
  fullName?: string;
  googlePicture?: string | null;
  productRole?: "ADMIN" | "INTERVIEWER";
  capabilities?: SelectionCapability[];
};

export type SelectionCapability =
  | "vacancy.read"
  | "vacancy.sync"
  | "process.read"
  | "process.read_all"
  | "process.manage"
  | "candidate.read"
  | "candidate.manage"
  | "application.manage"
  | "template.read"
  | "template.manage"
  | "template.publish"
  | "participant.read"
  | "participant.manage"
  | "interview.read"
  | "interview.assign"
  | "interview.execute"
  | "interview.read_all"
  | "intelligence.read"
  | "intelligence.generate"
  | "intelligence.regenerate"
  | "decision.read"
  | "decision.manage";

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
