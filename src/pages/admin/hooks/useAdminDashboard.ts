// src/pages/admin/hooks/useAdminDashboard.ts
import { useEffect, useMemo, useState } from "react";
import {
  adminDashboardService,
  type DashboardResponse,
} from "../../../services/adminDashboardService";

type Props = {
  orgId?: string | null;
  schoolId?: string | null;
  programId?: string | null;
  from: string; // ISO
  to: string;   // ISO
};

export function useAdminDashboard(props: Props) {
  const { orgId, schoolId, programId, from, to } = props;

  const key = useMemo(
    () =>
      JSON.stringify({
        orgId: orgId ?? null,
        schoolId: schoolId ?? null,
        programId: programId ?? null,
        from,
        to,
      }),
    [orgId, schoolId, programId, from, to]
  );

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    adminDashboardService
      .getDashboard({ orgId, schoolId, programId, from, to })
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((e) => {
        if (!alive) return;
        setData(null);
        setError(e?.message ?? "Error cargando dashboard");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [key]);

  return { data, loading, error };
}
