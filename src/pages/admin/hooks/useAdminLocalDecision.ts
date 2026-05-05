import { useCallback, useEffect, useState } from "react";
import { getExecutiveSummary, updateAdminDecision } from "../../../services/teachersService";

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
    let alive = true;
    if (!evaluationId) {
      setDecision(null);
      return;
    }

    getExecutiveSummary(evaluationId)
      .then((summary: any) => {
        if (!alive) return;
        const verdict = String(summary?.adminDecision?.verdict ?? "PENDING").toUpperCase();
        const status: DecisionStatus =
          verdict === "APPROVED" ? "APROBADO" : verdict === "REJECTED" ? "RECHAZADO" : "PENDIENTE";
        const note = String(summary?.adminDecision?.notes ?? "");
        const timestamp = summary?.adminDecision?.decidedAt ?? new Date().toISOString();
        const next: StoredDecision = { evaluationId, status, note, timestamp };
        saveDecision(next);
        setDecision(next);
      })
      .catch(() => {
        if (!alive) return;
        setDecision(loadDecision(evaluationId));
      });

    return () => {
      alive = false;
    };
  }, [evaluationId]);

  const setStatus = useCallback(
    async (status: DecisionStatus, note: string) => {
      if (!evaluationId) return;

      const stored: StoredDecision = {
        evaluationId,
        status,
        note,
        timestamp: new Date().toISOString(),
      };

      const backendStatus =
        status === "APROBADO" ? "APPROVED" : status === "RECHAZADO" ? "REJECTED" : "PENDING";
      await updateAdminDecision(evaluationId, { status: backendStatus, comment: note });
      saveDecision(stored);
      setDecision(stored);
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
