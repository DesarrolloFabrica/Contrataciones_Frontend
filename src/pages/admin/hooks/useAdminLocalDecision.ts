import { useCallback, useEffect, useState } from "react";
import { adminMockDb } from "../utils/adminMockDb";

type DecisionStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

type StoredDecision = {
  evaluationId: string;
  status: DecisionStatus;
  note: string;
  timestamp: string;
};

const LS_PREFIX = "ADMIN_LOCAL_DECISION_";

function loadDecision(evaluationId: string): StoredDecision | null {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${evaluationId}`);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDecision;
  } catch {
    return null;
  }
}

function saveDecision(decision: StoredDecision) {
  try {
    localStorage.setItem(`${LS_PREFIX}${decision.evaluationId}`, JSON.stringify(decision));
  } catch {
    // ignore
  }
}

function removeDecision(evaluationId: string) {
  try {
    localStorage.removeItem(`${LS_PREFIX}${evaluationId}`);
  } catch {
    // ignore
  }
}

export function useAdminLocalDecision(evaluationId: string | null) {
  const [decision, setDecision] = useState<StoredDecision | null>(null);

  useEffect(() => {
    if (!evaluationId) {
      setDecision(null);
      return;
    }
    setDecision(loadDecision(evaluationId));
  }, [evaluationId]);

  const setStatus = useCallback(
    (status: DecisionStatus, note: string) => {
      if (!evaluationId) return;

      const stored: StoredDecision = {
        evaluationId,
        status,
        note,
        timestamp: new Date().toISOString(),
      };

      saveDecision(stored);
      setDecision(stored);

      adminMockDb.logEvent({
        entityType: "EVALUATION",
        entityId: evaluationId,
        action: "ADMIN_DECISION_SAVED",
        actorUserId: "u-admin-1",
        actorRole: "ADMIN",
        at: new Date().toISOString(),
        meta: { status, note },
      });
    },
    [evaluationId]
  );

  const clearDecision = useCallback(() => {
    if (!evaluationId) return;
    removeDecision(evaluationId);
    setDecision(null);
  }, [evaluationId]);

  return {
    decision,
    setStatus,
    clearDecision,
    status: decision?.status ?? "PENDIENTE",
    note: decision?.note ?? "",
  };
}
