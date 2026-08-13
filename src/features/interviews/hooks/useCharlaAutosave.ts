import { useCallback, useEffect, useRef, useState } from "react";
import { apiErrorMessage } from "../../vacancies/formatters";
import { saveInterview } from "../interviewsApi";
import type { SelectionInterview } from "../types";

export type AutosaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type Options = {
  interviewId: string;
  enabled: boolean;
  answers: Record<string, unknown>;
  observations: string;
  onSaved: (interview: SelectionInterview) => void;
  debounceMs?: number;
};

export function useCharlaAutosave({
  interviewId,
  enabled,
  answers,
  observations,
  onSaved,
  debounceMs = 1400,
}: Options) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const revision = useRef(0);
  const latest = useRef({ answers, observations });
  const onSavedRef = useRef(onSaved);

  useEffect(() => {
    latest.current = { answers, observations };
  }, [answers, observations]);

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      setErrorMessage(null);
    }
  }, [enabled]);

  const persist = useCallback(async (rev: number) => {
    const payload = latest.current;
    setStatus("saving");
    setErrorMessage(null);
    try {
      const data = await saveInterview(
        interviewId,
        Object.entries(payload.answers).map(([questionId, value]) => ({ questionId, value })),
        payload.observations,
      );
      if (revision.current === rev) {
        setStatus("saved");
        onSavedRef.current(data);
      }
      return data;
    } catch (error) {
      if (revision.current === rev) {
        setStatus("error");
        setErrorMessage(apiErrorMessage(error));
      }
      return null;
    }
  }, [interviewId]);

  const markDirty = useCallback(() => {
    if (!enabled) return;
    revision.current += 1;
    setStatus("dirty");
  }, [enabled]);

  useEffect(() => {
    if (!enabled || status !== "dirty") return;
    const rev = revision.current;
    const timer = window.setTimeout(() => {
      void persist(rev);
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [enabled, status, answers, observations, debounceMs, persist]);

  const flush = useCallback(async () => {
    if (!enabled) return true;
    revision.current += 1;
    const rev = revision.current;
    const result = await persist(rev);
    return Boolean(result);
  }, [enabled, persist]);

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, markDirty, flush, resetStatus, setStatus };
}
