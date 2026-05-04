import { useMemo } from "react";
import { MIN_CC_LENGTH, MAX_CC_LENGTH } from "../constants";

interface UseCedulaValidationReturn {
  isCedulaValid: boolean;
  normalizedValue: string;
}

export function useCedulaValidation(
  documentNumber: string,
): UseCedulaValidationReturn {
  const normalizedValue = useMemo(
    () => documentNumber.replace(/\D+/g, ""),
    [documentNumber],
  );

  const isCedulaValid = useMemo(() => {
    const cc = documentNumber.trim();
    if (!cc) return false;
    if (cc.length < MIN_CC_LENGTH) return false;
    if (cc.length > MAX_CC_LENGTH) return false;
    if (!/^\d+$/.test(cc)) return false;
    return true;
  }, [documentNumber]);

  return { isCedulaValid, normalizedValue };
}
