// src/features/boot/waitForBootReady.ts
// Dispara el prefetch de las tareas del rol y espera a que el boot este listo.
//
// Reglas (replican el comportamiento del splash de Producto):
//   ready = (han pasado al menos BOOT_MIN_DURATION_MS) Y
//           (todas las queries terminaron O se alcanzo BOOT_MAX_DURATION_MS)
//
// Si se sale por timeout, degraded = true (la app continua cargando datos en background).

import type { QueryClient } from "@tanstack/react-query";
import {
  BOOT_MIN_DURATION_MS,
  BOOT_MAX_DURATION_MS,
  getBootPrefetchTasks,
  type BootRole,
} from "./appBootConfig";

const POLL_INTERVAL_MS = 80;

export interface BootReadyResult {
  degraded: boolean;
}

export function waitForBootReady({
  role,
  queryClient,
}: {
  role: BootRole;
  queryClient: QueryClient;
}): Promise<BootReadyResult> {
  const tasks = getBootPrefetchTasks(role);
  const settled: boolean[] = tasks.map(() => false);

  // Dispara todos los prefetches en paralelo (best-effort: un fallo no bloquea a los demas).
  tasks.forEach((task, i) => {
    queryClient
      .prefetchQuery({ queryKey: task.queryKey, queryFn: task.queryFn })
      .catch(() => {
        // prefetch es best-effort; los errores se manejan en el dashboard
      })
      .finally(() => {
        settled[i] = true;
      });
  });

  return new Promise<BootReadyResult>((resolve) => {
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const allDone = settled.every(Boolean);

      if (elapsed >= BOOT_MIN_DURATION_MS && allDone) {
        resolve({ degraded: false });
        return;
      }

      if (elapsed >= BOOT_MAX_DURATION_MS) {
        resolve({ degraded: true });
        return;
      }

      setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
  });
}
