import { useQuery } from "@tanstack/react-query";
import {
  adminDashboardService,
  type DashboardResponse,
} from "../../../services/adminDashboardService";
import { queryKeys } from "../../../services/queryKeys";

type Props = {
  orgId?: string | null;
  schoolId?: string | null;
  programId?: string | null;
  from: string;
  to: string;
};

export function useAdminDashboard(props: Props) {
  const { orgId, schoolId, programId, from, to } = props;

  const { data, isLoading, error } = useQuery<DashboardResponse | null>({
    queryKey: queryKeys.dashboard.detail({ orgId, schoolId, programId, from, to }),
    queryFn: () => adminDashboardService.getDashboard({ orgId, schoolId, programId, from, to }),
  });

  const errorMsg = error ? (error as Error)?.message ?? "Error cargando dashboard" : null;

  return { data, loading: isLoading, error: errorMsg };
}
