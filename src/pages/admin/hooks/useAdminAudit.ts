import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AdminAuditEvent, AdminAuditEntityType } from "../adminTypes";
import { listAuditEvents } from "../../../services/auditEventsService";
import { queryKeys } from "../../../services/queryKeys";

type Opts = {
  entityType?: AdminAuditEntityType;
  entityId?: string;
  schoolName?: string;
  programName?: string;

  initialLimit?: number;
  pageSize?: number;
};

const DEFAULT_INITIAL = 50;
const DEFAULT_PAGE = 25;

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

function metaSchool(ev: any): string {
  const m: any = ev?.meta ?? {};
  return (
    m.schoolName ??
    m.school ??
    m.schoolNameSnapshot ??
    m?.candidate?.schoolNameSnapshot ??
    m?.candidate?.schoolName ??
    ""
  );
}

function metaProgram(ev: any): string {
  const m: any = ev?.meta ?? {};
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
  const [limit, setLimit] = useState(opts?.initialLimit ?? DEFAULT_INITIAL);

  const { data: all = [], isLoading: loadingAudit, error: queryError, refetch: refetchAudit } = useQuery<AdminAuditEvent[]>({
    queryKey: queryKeys.audit.list({
      entityType: opts?.entityType,
      entityId: opts?.entityId,
    }),
    queryFn: async () => {
      const res = await listAuditEvents({
        entityType: opts?.entityType,
        entityId: opts?.entityId,
        limit: 500,
      });

      const sNeed =
        opts?.schoolName && !isAllToken(opts.schoolName) ? norm(opts.schoolName) : null;
      const pNeed =
        opts?.programName && !isAllToken(opts.programName) ? norm(opts.programName) : null;

      let filtered = [...res];

      if (sNeed) {
        filtered = filtered.filter((ev) => {
          const s = norm(metaSchool(ev));
          return !s || s === sNeed;
        });
      }

      if (pNeed) {
        filtered = filtered.filter((ev) => {
          const p = norm(metaProgram(ev));
          return !p || p === pNeed;
        });
      }

      const ordered = filtered.sort((a, b) => {
        const ta = new Date(a.at).getTime();
        const tb = new Date(b.at).getTime();
        return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
      });

      return ordered;
    },
  });

  const errorAudit = queryError ? "No se pudo cargar el historial de auditoría." : null;

  const visible = useMemo(() => all.slice(0, limit), [all, limit]);
  const hasMore = visible.length < all.length;

  const refreshAudit = useCallback(async () => {
    await refetchAudit();
  }, [refetchAudit]);

  const loadMore = useCallback(() => {
    const step = opts?.pageSize ?? DEFAULT_PAGE;
    setLimit((l) => Math.min(all.length || Number.POSITIVE_INFINITY, l + step));
  }, [all.length, opts?.pageSize]);

  return {
    audit: visible,
    loadingAudit,
    errorAudit,
    refreshAudit,
    hasMore,
    loadMore,
    total: all.length,
    showing: visible.length,
  };
};
