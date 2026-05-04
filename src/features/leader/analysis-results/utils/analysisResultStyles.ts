export const getScoreDetails = (score: number) => {
  if (score >= 80)
    return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/20",
    };
  if (score >= 60)
    return {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/20",
    };
  return {
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/20",
  };
};

export const getRiskBadgeStyles = (level: string) => {
  const v = (level || "").toLowerCase();
  if (v.includes("bajo"))
    return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (v.includes("medio"))
    return "bg-amber-500/10 text-amber-300 border-amber-500/20";
  if (v.includes("alto"))
    return "bg-rose-500/10 text-rose-300 border-rose-500/20";
  return "bg-white/[0.03] text-neutral-300 border-white/10";
};
