// src/pages/admin/components/detail/AdminAssignmentCard.tsx
import React from "react";
import { Users } from "lucide-react";
import type { AdminAssignment } from "../../adminTypes";

type Props = { assignment: AdminAssignment | null };

const AdminAssignmentCard: React.FC<Props> = ({ assignment }) => {
  const hasCoordinator = !!assignment?.coordinatorUserId;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-emerald-300" />
        <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
          Asignación
        </div>
      </div>

      {!assignment ? (
        <div className="text-sm text-neutral-500">
          Aún no hay asignación para esta evaluación.
        </div>
      ) : (
        <div className="text-sm text-neutral-300 space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <span className="text-neutral-500 min-w-0 truncate">
              Coordinador
            </span>

            <span
              className="text-white font-semibold shrink-0 max-w-[55%] truncate"
              title={hasCoordinator ? assignment.coordinatorUserId : "No asignado"}
            >
              {hasCoordinator ? assignment.coordinatorUserId : "No asignado"}
            </span>
          </div>

          <div className="text-[11px] text-neutral-500">
            {hasCoordinator
              ? "Esta evaluación está asignada y en seguimiento."
              : "Asigna un coordinador para iniciar el seguimiento."}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignmentCard;
