// src/pages/admin/hooks/useAdminAudit.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminAuditEvent, AdminAuditEntityType } from "../adminTypes";
import { adminMockDb } from "../utils/adminMockDb";

type Opts = {
  entityType?: AdminAuditEntityType; // "USER" | "EVALUATION" | "SYSTEM"
  entityId?: string;                // si viene -> detalle; si NO viene -> global
};

const MAX_EVENTS = 50;

export const useAdminAudit = (opts?: Opts) => {
  const [audit, setAudit] = useState<AdminAuditEvent[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [errorAudit, setErrorAudit] = useState<string | null>(null);

  // ✅ key estable para recargar cuando cambie filtro (incluye GLOBAL)
  const key = useMemo(() => {
    const t = opts?.entityType ?? "ALL";
    const id = opts?.entityId ?? "GLOBAL";
    return `${t}:${id}`;
  }, [opts?.entityType, opts?.entityId]);

  const refreshAudit = useCallback(async () => {
    setLoadingAudit(true);
    setErrorAudit(null);

    try {
      let res: AdminAuditEvent[] = [];

      // ✅ Si hay entityId -> detalle por entidad
      if (opts?.entityId) {
        // si no mandan entityType, asumimos SYSTEM
        const type = opts.entityType ?? "SYSTEM";
        res = await adminMockDb.listAudit(type, opts.entityId);
      } else {
        // ✅ GLOBAL (con filtro opcional por entityType)
        res = await adminMockDb.listAuditGlobal(opts?.entityType);
      }

      const ordered = [...res]
        .sort((a, b) => (a.at < b.at ? 1 : -1))
        .slice(0, MAX_EVENTS);

      setAudit(ordered);
    } catch (e) {
      console.error("Admin: error cargando auditoría", e);
      setErrorAudit("No se pudo cargar el historial de auditoría.");
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
