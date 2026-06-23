// src/features/boot/appBootConfig.ts
// Tiempos del splash + tareas de prefetch por rol (calentamiento de cache del dashboard).

import type { Role } from "../../context/AuthContext";
import { queryKeys } from "../../services/queryKeys";
import { listTeacherEvaluations } from "../../services/teachersService";
import { listSchools } from "../../services/adminScopeService";
import { usersService } from "../../services/usersService";

/** Duracion minima visible del splash (evita parpadeo). */
export const BOOT_MIN_DURATION_MS = 1400;

/** Timeout duro: a los 5s cerramos el splash aunque falten datos (modo degraded). */
export const BOOT_MAX_DURATION_MS = 5000;

/** Duracion del fade de salida antes de mostrar la app. */
export const BOOT_EXIT_DURATION_MS = 500;

export type BootRole = Role;

export interface BootPrefetchTask {
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
}

/**
 * Tareas de prefetch por rol. Calientan la cache de React Query con los
 * datos que el dashboard del rol consume al montar.
 *
 * - admin / coordinator: evaluaciones + escuelas + usuarios
 *   (calientan las claves que usan useAdminEvaluations/useCoordinatorEvaluations,
 *    useAdminScopeOptions, useAdminUsers/useCoordinatorUsers).
 * - leader: solo escuelas (LeaderConsole hace lookup de escuela/programa lazy).
 */
export function getBootPrefetchTasks(role: BootRole): BootPrefetchTask[] {
  const tasks: BootPrefetchTask[] = [
    { queryKey: queryKeys.schools.list(), queryFn: listSchools },
  ];

  if (role === "admin" || role === "coordinator") {
    tasks.push(
      { queryKey: queryKeys.evaluations.list(), queryFn: listTeacherEvaluations },
      { queryKey: queryKeys.users.list(), queryFn: () => usersService.list() }
    );
  }

  return tasks;
}
