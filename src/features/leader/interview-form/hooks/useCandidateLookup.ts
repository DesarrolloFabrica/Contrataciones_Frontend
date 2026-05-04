import { useState, useEffect, useRef, useCallback } from "react";
import { searchTeacherCandidates, type TeacherCandidateSearchItemDto } from "../../../../services/teachersService";

interface UseCandidateLookupReturn {
  candidateMatches: TeacherCandidateSearchItemDto[];
  isSearching: boolean;
  lookupError: string | null;
  resetSearch: () => void;
  setLookupError: (error: string | null) => void;
}

export function useCandidateLookup(
  orgId: string,
  documentNumber: string,
): UseCandidateLookupReturn {
  const [candidateMatches, setCandidateMatches] = useState<
    TeacherCandidateSearchItemDto[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const searchSeq = useRef(0);

  const resetSearch = useCallback(() => {
    searchSeq.current += 1;
    setCandidateMatches([]);
    setLookupError(null);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const cc = documentNumber.trim();

    if (!cc || cc.length < 3) {
      setCandidateMatches([]);
      setLookupError(null);
      setIsSearching(false);
      return;
    }

    const mySeq = ++searchSeq.current;
    setIsSearching(true);
    setLookupError(null);

    const t = window.setTimeout(async () => {
      try {
        const rows = await searchTeacherCandidates({
          orgId,
          q: cc,
          limit: 8,
        });
        if (mySeq !== searchSeq.current) return;
        setCandidateMatches(rows ?? []);
      } catch (e: any) {
        if (mySeq !== searchSeq.current) return;
        setCandidateMatches([]);
        setLookupError(
          e?.message ?? "No se pudo buscar candidatos.",
        );
      } finally {
        if (mySeq === searchSeq.current) setIsSearching(false);
      }
    }, 280);

    return () => window.clearTimeout(t);
  }, [documentNumber, orgId]);

  return { candidateMatches, isSearching, lookupError, resetSearch, setLookupError };
}
