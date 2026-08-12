export const getScoreDetails = (score: number) => {
  if (score >= 80)
    return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/25",
      glow: "shadow-emerald-500/20",
    };
  if (score >= 60)
    return {
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-500/25",
      glow: "shadow-amber-500/20",
    };
  return {
    color: "text-rose-400",
    bg: "bg-rose-500/15",
    border: "border-rose-500/25",
    glow: "shadow-rose-500/20",
  };
};

export const getRiskBadgeStyles = (level: string, isDark = true) => {
  const v = (level || "").toLowerCase();
  if (v.includes("bajo"))
    return isDark
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-emerald-50 text-emerald-700";
  if (v.includes("medio"))
    return isDark
      ? "bg-amber-500/15 text-amber-300"
      : "bg-amber-50 text-amber-700";
  if (v.includes("alto"))
    return isDark
      ? "bg-rose-500/15 text-rose-300"
      : "bg-rose-50 text-rose-700";
  return isDark
    ? "bg-white/[0.06] text-slate-300"
    : "bg-slate-100 text-slate-600";
};
