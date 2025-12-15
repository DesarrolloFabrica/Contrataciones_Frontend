// src/pages/admin/hooks/useAdminAudit.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminAuditEvent } from "../adminTypes";
import { adminMockDb } from "../utils/adminMockDb";

type Opts = {
  entityType?: "USER" | "EVALUATION" | "SYSTEM";
  entityId?: string;
};

const MAX_EVENTS = 50; // ✅ límite razonable para UI

export const useAdminAudit = (opts?: Opts) => {
  const [audit, setAudit] = useState<AdminAuditEvent[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [errorAudit, setErrorAudit] = useState<string | null>(null);

  // ✅ key estable para saber cuándo recargar
  const key = useMemo(() => {
    if (!opts?.entityType || !opts?.entityId) return null;
    return `${opts.entityType}:${opts.entityId}`;
  }, [opts?.entityType, opts?.entityId]);

  const refreshAudit = useCallback(async () => {
    if (!opts?.entityType || !opts?.entityId) {
      setAudit([]);
      return;
    }

    setLoadingAudit(true);
    setErrorAudit(null);

    try {
      const res = await adminMockDb.listAudit(
        opts.entityType,
        opts.entityId
      );

      // ✅ Orden descendente + límite
      const ordered = [...res]
        .sort((a, b) => (a.at < b.at ? 1 : -1))
        .slice(0, MAX_EVENTS);

      setAudit(ordered);
    } catch (e) {
      console.error("Admin: error cargando historial", e);
      setErrorAudit("No se pudo cargar el historial de cambios.");
      setAudit([]);
    } finally {
      setLoadingAudit(false);
    }
  }, [opts?.entityType, opts?.entityId]);

  useEffect(() => {
    refreshAudit();
  }, [key, refreshAudit]);

  return {
    audit,
    loadingAudit,
    errorAudit,
    refreshAudit,
  };
};
