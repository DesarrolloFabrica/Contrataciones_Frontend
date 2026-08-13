import type { Role } from "../../context/AuthContext";
import { getProductHome } from "../product/productApi";

export const BOOT_MIN_DURATION_MS = 500;
export const BOOT_MAX_DURATION_MS = 5000;
export const BOOT_EXIT_DURATION_MS = 250;

export type BootRole = Role;

export interface BootPrefetchTask {
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
}

/** El arranque solo precarga el destino real del producto; el legacy queda lazy. */
export function getBootPrefetchTasks(_role: BootRole): BootPrefetchTask[] {
  return [{ queryKey: ["charlas-product-home"], queryFn: getProductHome }];
}
