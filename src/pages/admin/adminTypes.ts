// src/pages/admin/utils/adminTypes.ts
import type {
  AnalysisResult,
  InterviewData,
  TeacherEvaluationSummary,
} from "../../types";

export type RiskBucket =
  | "RECOMENDADA"
  | "PRECAUCION"
  | "NO_RECOMENDAR"
  | "DESCONOCIDO";

export type AdminTab =
  | "RESUMEN"
  | "IA"
  | "COORDINADOR"
  | "AUDITORIA"
  | "TECNICO";

export interface AdminMetrics {
  total: number;
  avgScore: number;
  recommended: number;
  caution: number;
  notRecommended: number;
}

export interface SchoolSummary {
  schoolName: string;
  total: number;
  avgScore: number;
  recommended: number;
  notRecommended: number;
}

export type AdminDetailState = {
  selectedId: string | null;
  loadingDetail: boolean;
  selectedDetail: {
    analysis: AnalysisResult;
    interview: InterviewData;
    raw: any;
  } | null;
};

export type AdminListState = {
  evaluations: TeacherEvaluationSummary[];
  loading: boolean;
  error: string | null;

  search: string;
  setSearch: (v: string) => void;

  selectedSchool: string;
  setSelectedSchool: (v: string) => void;
};


// -------------------------
// USERS (Admin -> Coordinadores)
// -------------------------

export type AdminUserRole = "ADMIN" | "COORDINATOR" | "LEADER";

export type AdminUserStatus = "ACTIVE" | "INACTIVE";

export interface AdminUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  cedula?: string | null;

  role: AdminUserRole;
  status: AdminUserStatus;

  mustChangePassword: boolean;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface CreateAdminUserDto {
  name: string;
  lastName: string;
  email: string;
  cedula?: string | null;

  role: AdminUserRole; // en tu caso: "COORDINATOR"
  mustChangePassword: boolean;

  // UX:
  generatePassword: boolean;
  password?: string; // si generatePassword=false, puede venir aquí
}

export interface UpdateAdminUserDto {
  name?: string;
  lastName?: string;
  cedula?: string | null;
  role?: AdminUserRole;
  status?: AdminUserStatus;
  mustChangePassword?: boolean;
}

export interface ResetPasswordResult {
  userId: string;
  temporaryPassword: string;
}