// src/services/adminDashboardService.ts
import api from "./apiClient";

export type DashboardQuery = {
  from: string; // ISO
  to: string;   // ISO
  orgId?: string | null;
  schoolId?: string | null;
  programId?: string | null;
};

export type DashboardResponse = {
  kpis: {
    totalCandidates: number;
    evaluatedCandidates: number;
    noEvalCandidates: number;
    approved: number;
    rejected: number;
    pending: number;
    acceptanceRate: number; // 0..1
    totalEvaluations: number;
  };

  bySchool: Array<{
    schoolId: string;
    schoolName: string;
    candidates: number;
    approved: number;
    rejected: number;
    pending: number;
    noEval: number;
    acceptanceRate: number; // 0..1
    share: number; // 0..1
  }>;

  evaluationsSeries: Array<{
    bucket: string; // ISO
    evaluations: number;
  }>;

  score: {
    avg: number | null;
    median: number | null;
    min: number | null;
    max: number | null;
    count: number;
  };

  timeToDecision: {
    avgHours: number | null;
    medianHours: number | null;
    decided: number;
  };

  topPrograms: {
    byVolume: Array<{ programId: string; name: string; candidates: number }>;
    byAcceptance: Array<{
      programId: string;
      name: string;
      decided: number;
      approved: number;
      acceptanceRate: number;
    }>;
  };
};

function cleanId(v?: string | null) {
  const s = String(v ?? "").trim();
  return s.length ? s : undefined;
}

export const adminDashboardService = {
  async getDashboard(q: DashboardQuery): Promise<DashboardResponse> {
    const from = String(q.from ?? "").trim();
    const to = String(q.to ?? "").trim();

    if (!from || !to) {
      throw new Error("adminDashboardService.getDashboard: 'from' and 'to' are required (ISO).");
    }

    const params: Record<string, string> = {
      from,
      to,
    };

    const orgId = cleanId(q.orgId);
    const schoolId = cleanId(q.schoolId);
    const programId = cleanId(q.programId);

    if (orgId) params.orgId = orgId;
    if (schoolId) params.schoolId = schoolId;
    if (programId) params.programId = programId;

    const { data } = await api.get<DashboardResponse>("/admin/dashboard", { params });

    // backend ya retorna el shape final; solo validación mínima defensiva
    if (!data || !data.kpis) {
      throw new Error("adminDashboardService.getDashboard: invalid response");
    }

    return data;
  },
};
