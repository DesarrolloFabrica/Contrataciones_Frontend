export function detectVerdictKind(finalVerdict?: string, overallScore?: number) {
  const t = String(finalVerdict ?? "")
    .toLowerCase()
    .trim();

  const negative =
    /(rechaz|no\s*recom|no\s*aprob|no\s*contrat|no\s*apto|descart|no\s*contin)/i.test(
      t,
    );

  const positive =
    /(recom|aprob|contrat|apto|id[oó]neo|favorable|proceder|continuar)/i.test(
      t,
    );

  if (negative) return "REJECTED";
  if (positive) return "APPROVED";

  const s = Number(overallScore ?? 0);
  if (s >= 70) return "APPROVED";
  if (s <= 50) return "REJECTED";
  return "NEUTRAL";
}
