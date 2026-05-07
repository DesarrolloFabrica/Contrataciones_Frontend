import apiClient from "./apiClient";

export type HiringRequestStatus = "OPEN" | "PAUSED" | "CLOSED";
export type HiringRequestExternalSource = "MANUAL" | "INTERNAL" | "ORBIT";

export type HiringRequestItem = {
  id: string;
  title: string;
  positionName: string;
  roleName?: string | null;
  profile: string;
  area?: string | null;
  coordination?: string | null;
  priority?: string | null;
  description: string;
  schoolId?: string | null;
  programId?: string | null;
  areaId?: string | null;
  status: HiringRequestStatus;
  externalSource?: HiringRequestExternalSource;
  externalId?: string | null;
};

export type CreateManualHiringRequestPayload = {
  positionName: string;
  roleName?: string | null;
  profile: string;
  area?: string | null;
  coordination?: string | null;
  priority?: string | null;
  schoolId?: string | null;
  programId?: string | null;
  areaId?: string | null;
  description: string;
  status?: HiringRequestStatus;
  externalSource?: HiringRequestExternalSource;
};

export async function listOpenHiringRequestsMine() {
  const { data } = await apiClient.get<HiringRequestItem[]>("/hiring-requests", {
    params: { status: "OPEN", scope: "mine" },
  });
  return Array.isArray(data) ? data : [];
}

export async function createManualHiringRequest(payload: CreateManualHiringRequestPayload) {
  const { data } = await apiClient.post<HiringRequestItem>("/hiring-requests", {
    ...payload,
    title: payload.positionName,
    externalSource: payload.externalSource ?? "MANUAL",
  });
  return data;
}
