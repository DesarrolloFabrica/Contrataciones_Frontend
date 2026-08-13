import api from "../../services/apiClient";
import type { ProcessAccessContext, ProductHome, ProductProcessSummary } from "./types";

export async function getProductHome() {
  const { data } = await api.get<ProductHome>("/selection/product/home");
  return data;
}

export async function getProductProcessSummary(processId: string) {
  const { data } = await api.get<ProductProcessSummary>(
    `/selection/product/processes/${processId}/summary`,
  );
  return data;
}

export async function getProcessAccess(processId: string) {
  const { data } = await api.get<ProcessAccessContext>(
    `/selection/access/processes/${processId}`,
  );
  return data;
}
