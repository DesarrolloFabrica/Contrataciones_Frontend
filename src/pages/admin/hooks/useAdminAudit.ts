import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminAuditEvent, AdminAuditEntityType } from "../adminTypes";
import { adminMockDb } from "../utils/adminMockDb";

type Opts = {
  entityType?: AdminAuditEntityType; // "USER" | "EVALUATION" | "SYSTEM"
  entityId?: string; // si viene -> detalle; si NO viene -> global

  // scope (null/undefined = global)
  schoolName?: string;
  programName?: string;
};

const MAX_EVENTS = 50;

const norm = (v: any) => String(v ?? "").trim().toLowerCase();

const isAllToken = (v?: string) => {
  const t = norm(v);
  return (
    !t ||
    t === "todas" ||
    t === "todos" ||
    t === "all" ||
    t === "global" ||
    t === "all_schools" ||
    t === "all_programs"
  );
};

// Intenta inferir school/program desde meta (mock-friendly)
function metaSchool(ev: AdminAuditEvent): string {
  const m: any = (ev as any)?.meta ?? {};
  return (
    m.schoolName ??
    m.school ??
    m.schoolNameSnapshot ??
    m?.candidate?.schoolNameSnapshot ??
    m?.candidate?.schoolName ??
    ""
  );
}

function metaProgram(ev: AdminAuditEvent): string {
  const m: any = (ev as any)?.meta ?? {};
  return (
    m.programName ??
    m.program ??
    m.programNameSnapshot ??
    m?.candidate?.programNameSnapshot ??
    m?.candidate?.programName ??
    ""
  );
}

export const useAdminAudit = (opts?: Opts) => {
  const [audit, setAudit] = useState<AdminAuditEvent[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [errorAudit, setErrorAudit] = useState<string | null>(null);

  // ✅ key estable para recargar cuando cambie filtro/scope
  const key = useMemo(() => {
    const t = opts?.entityType ?? "ALL";
    const id = opts?.entityId ?? "GLOBAL";
    const s = opts?.schoolName ?? "ALL_SCHOOLS";
    const p = opts?.programName ?? "ALL_PROGRAMS";
    return `${t}:${id}:${s}:${p}`;
  }, [opts?.entityType, opts?.entityId, opts?.schoolName, opts?.programName]);

  const refreshAudit = useCallback(async () => {
    setLoadingAudit(true);
    setErrorAudit(null);

    try {
      let res: AdminAuditEvent[] = [];

      if (opts?.entityId) {
        const type = opts.entityType ?? "SYSTEM";
        res = await adminMockDb.listAudit(type, opts.entityId);
      } else {
        // ✅ Si entityType es undefined => debe significar "ALL"
        res = await adminMockDb.listAuditGlobal(opts?.entityType);
      }

      // ✅ Scope filter (best-effort usando meta)
      const sNeed = !isAllToken(opts?.schoolName) ? norm(opts?.schoolName) : null;
      const pNeed = !isAllToken(opts?.programName) ? norm(opts?.programName) : null;

      let filtered = [...res];

      // Filtra school si aplica
      if (sNeed) {
        filtered = filtered.filter((ev) => {
          const s = norm(metaSchool(ev));
          // si no hay school en meta, no lo filtro (para no vaciar en mock)
          return !s || s === sNeed;
        });
      }

      // Filtra program si aplica (independiente de school)
      if (pNeed) {
        filtered = filtered.filter((ev) => {
          const p = norm(metaProgram(ev));
          return !p || p === pNeed;
        });
      }

      const ordered = filtered
        .sort((a, b) => {
          // at puede ser ISO string: orden descendente
          const ta = new Date(a.at).getTime();
          const tb = new Date(b.at).getTime();
          return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
        })
        .slice(0, MAX_EVENTS);

      setAudit(ordered);
    } catch (e) {
      console.error("Admin: error cargando auditoría", e);
      setErrorAudit("No se pudo cargar el historial de auditoría.");
      setAudit([]);
    } finally {
      setLoadingAudit(false);
    }
  }, [opts?.entityType, opts?.entityId, opts?.schoolName, opts?.programName]);

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
