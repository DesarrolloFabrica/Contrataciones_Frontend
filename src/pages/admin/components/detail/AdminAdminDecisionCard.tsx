// src/pages/admin/components/detail/AdminAdminDecisionCard.tsx
import React from "react";
import { ShieldCheck } from "lucide-react";
import type { AdminFinalDecision, CoordinatorDecision } from "../../adminTypes";

type Props = {
  coordinatorDecision?: CoordinatorDecision | null;
  adminDecision?: AdminFinalDecision | null;
};

const getStatusLabel = (status?: string | null) => status ?? "PENDIENTE";

function statusBadge(status: string) {
  const s = (status || "").toUpperCase();

  if (s === "APROBADO") {
    return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
  }

  if (s === "RECHAZADO") {
    return "bg-rose-500/10 text-rose-300 border-rose-500/30";
  }

  return "bg-white/5 text-neutral-200 border-white/10";
}

const badgeBase =
  [
    "inline-flex items-center justify-center",
    "px-2.5 py-1",
    "rounded-xl border",
    "text-[11px] font-bold uppercase tracking-widest",
    "leading-none whitespace-nowrap",
    "shrink-0",
  ].join(" ");

const Row = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <span className="text-neutral-500 truncate">{label}</span>

      <span
        className={`${badgeBase} ${statusBadge(value)}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
};

const AdminAdminDecisionCard: React.FC<Props> = ({
  coordinatorDecision = null,
  adminDecision = null,
}) => {
  const coordStatus = getStatusLabel(coordinatorDecision?.status);
  const adminStatus = getStatusLabel(adminDecision?.status);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-cyan-300" />
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
          Decisión final
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <Row label="Coordinador" value={coordStatus} />
        <Row label="Admin" value={adminStatus} />
      </div>
    </div>
  );
};

export default AdminAdminDecisionCard;
