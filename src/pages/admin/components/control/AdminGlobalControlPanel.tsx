import React, { useMemo } from "react";
import {
  BarChart3,
  Brain,
  Users,
  ScrollText,
  ShieldCheck,
  Gavel,
  Activity,
  Clock,
} from "lucide-react";
import type { TeacherEvaluationSummary } from "../../../../types";
import type { AdminMetrics } from "../../adminTypes";
import { computeDecisionMetrics } from "../../utils/adminSelectors";
import { useTheme } from "../../../../context/ThemeContext";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { useAdminAudit } from "../../hooks/useAdminAudit";

type Props = {
  evaluations: TeacherEvaluationSummary[];
  metrics: AdminMetrics;
};

const labelCls =
  "text-[10px] uppercase tracking-[0.22em] font-bold";

export default function AdminGlobalControlPanel({
  evaluations,
  metrics,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { filteredUsers: users, loading: usersLoading } = useAdminUsers({
    selectedSchool: null,
    selectedProgram: null,
  });

  const { audit, loadingAudit } = useAdminAudit({ initialLimit: 5 });

  const decisionMetrics = useMemo(
    () => computeDecisionMetrics(evaluations),
    [evaluations]
  );

  const activeUsers = useMemo(
    () => users.filter((u: any) => u.status === "ACTIVE").length,
    [users]
  );

  const lastAudit = useMemo(() => (audit.length > 0 ? audit[0] : null), [audit]);

  const shellCls = isDark
    ? "bg-[#0f1110] border border-white/10 rounded-3xl"
    : "bg-white border border-slate-200 rounded-3xl shadow-sm";

  const cardCls = isDark
    ? "bg-white/[0.04] border border-white/10 rounded-2xl"
    : "bg-slate-50 border border-slate-200 rounded-2xl";

  const valueCls = isDark
    ? "text-white text-lg font-black"
    : "text-slate-900 text-lg font-black";

  const labelClsDark = isDark
    ? "text-neutral-400"
    : "text-slate-600";

  return (
    <div className={shellCls}>
      <div className="p-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-cyan-300" />
        </div>
        <div>
          <h3 className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            Control Global
          </h3>
          <p className={`text-[11px] ${labelClsDark}`}>
            Supervisión ejecutiva del sistema
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className={cardCls}>
          <div className="p-4 space-y-2">
            <div className={`${labelCls} ${labelClsDark}`}>Evaluaciones</div>
            <div className={`${valueCls} flex items-center gap-2`}>
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              {metrics.total}
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="p-4 space-y-2">
            <div className={`${labelCls} ${labelClsDark}`}>Promedio IA</div>
            <div className={`${valueCls} flex items-center gap-2`}>
              <Brain className="w-4 h-4 text-cyan-400" />
              {metrics.avgScore.toFixed(1)}
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="p-4 space-y-2">
            <div className={`${labelCls} ${labelClsDark}`}>Pend. Coordinador</div>
            <div className={`${valueCls} flex items-center gap-2`}>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              {decisionMetrics.coordinator.pending}
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="p-4 space-y-2">
            <div className={`${labelCls} ${labelClsDark}`}>Pend. Admin</div>
            <div className={`${valueCls} flex items-center gap-2`}>
              <Gavel className="w-4 h-4 text-rose-400" />
              {decisionMetrics.admin.pending}
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="p-4 space-y-2">
            <div className={`${labelCls} ${labelClsDark}`}>Usuarios activos</div>
            <div className={`${valueCls} flex items-center gap-2`}>
              <Users className="w-4 h-4 text-blue-400" />
              {usersLoading ? "…" : activeUsers}
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="p-4 space-y-2">
            <div className={`${labelCls} ${labelClsDark}`}>Últ. auditoría</div>
            <div className={`${valueCls} flex items-center gap-2 text-sm`}>
              <ScrollText className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate">
                {loadingAudit
                  ? "…"
                  : lastAudit
                    ? new Date(lastAudit.at).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
              </span>
            </div>
            {lastAudit && (
              <p className={`text-[10px] truncate ${isDark ? "text-neutral-500" : "text-slate-400"}`}>
                {lastAudit.action.replace(/_/g, " ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
