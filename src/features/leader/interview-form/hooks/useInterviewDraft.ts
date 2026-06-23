import { useEffect, useRef, useCallback } from "react";
import { draftKey, safeParseDraft, DRAFT_VERSION } from "../constants";
import type { InterviewDraft, HiringContextDraft, CandidateDocumentsDraft } from "../types";
import type { InterviewData } from "../../../../types";

interface UseInterviewDraftReturn {
  loadDraft: () => {
    formData: InterviewData | null;
    selectedCandidateId: string | null;
    hiringContext: HiringContextDraft | null;
    candidateDocuments: CandidateDocumentsDraft | null;
    currentStep: number | null;
    maxReachedStep: number | null;
  };
  clearDraft: () => void;
}

export function useInterviewDraft(
  orgId: string,
  userId: string | undefined,
  formData: InterviewData,
  selectedCandidateId: string | null,
  hiringContext?: HiringContextDraft,
  candidateDocuments?: CandidateDocumentsDraft,
  currentStep?: number,
  maxReachedStep?: number,
): UseInterviewDraftReturn {
  const saveTimer = useRef<number | null>(null);

  const loadDraft = useCallback((): {
    formData: InterviewData | null;
    selectedCandidateId: string | null;
    hiringContext: HiringContextDraft | null;
    candidateDocuments: CandidateDocumentsDraft | null;
    currentStep: number | null;
    maxReachedStep: number | null;
  } => {
    if (typeof window === "undefined") {
      return {
        formData: null,
        selectedCandidateId: null,
        hiringContext: null,
        candidateDocuments: null,
        currentStep: null,
        maxReachedStep: null,
      };
    }
    const d = safeParseDraft(localStorage.getItem(draftKey(orgId, userId)));
    return {
      formData: d?.formData ?? null,
      selectedCandidateId: d?.selectedCandidateId ?? null,
      hiringContext: d?.hiringContext ?? null,
      candidateDocuments: d?.candidateDocuments ?? null,
      currentStep: d?.currentStep ?? null,
      maxReachedStep: d?.maxReachedStep ?? null,
    };
  }, [orgId, userId]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey(orgId, userId));
  }, [orgId, userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(() => {
      const payload: InterviewDraft = {
        v: DRAFT_VERSION,
        savedAt: Date.now(),
        formData,
        selectedCandidateId,
      };
      if (hiringContext !== undefined) {
        payload.hiringContext = hiringContext;
      }
      if (candidateDocuments !== undefined) {
        payload.candidateDocuments = {
          items: candidateDocuments.items.map((item) => ({
            ...item,
            file: null,
            fileName: item.fileName ?? "",
          })),
        };
      }
      if (currentStep !== undefined) {
        payload.currentStep = currentStep;
      }
      if (maxReachedStep !== undefined) {
        payload.maxReachedStep = maxReachedStep;
      }
      localStorage.setItem(draftKey(orgId, userId), JSON.stringify(payload));
    }, 250);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [formData, selectedCandidateId, userId, orgId, hiringContext, candidateDocuments, currentStep, maxReachedStep]);

  return { loadDraft, clearDraft };
}
