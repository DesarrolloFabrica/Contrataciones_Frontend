import React from "react";
import { useTheme } from "../../../context/ThemeContext";

/** Fondo decorativo sutil para el área de trabajo del líder */
export function LeaderAmbientDecor() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={[
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_0%_0%,rgba(16,185,129,0.14),transparent_42%),radial-gradient(ellipse_at_100%_10%,rgba(45,212,191,0.08),transparent_36%),linear-gradient(180deg,#071214_0%,#0a181c_48%,#071214_100%)]"
            : "bg-[radial-gradient(ellipse_at_0%_0%,rgba(16,185,129,0.10),transparent_40%),radial-gradient(ellipse_at_100%_0%,rgba(148,163,184,0.12),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]",
        ].join(" ")}
      />

      <div
        className={[
          "absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl",
          isDark ? "bg-emerald-500/10" : "bg-emerald-400/15",
        ].join(" ")}
      />
      <div
        className={[
          "absolute -right-16 top-40 h-80 w-80 rounded-full blur-3xl",
          isDark ? "bg-teal-400/8" : "bg-cyan-200/30",
        ].join(" ")}
      />
      <div
        className={[
          "absolute bottom-0 left-1/3 h-64 w-64 rounded-full blur-3xl",
          isDark ? "bg-emerald-600/8" : "bg-emerald-200/25",
        ].join(" ")}
      />

      <div
        className={[
          "absolute inset-0 opacity-[0.35]",
          isDark
            ? "[background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]"
            : "[background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px]",
        ].join(" ")}
      />

      <div
        className={[
          "absolute right-10 top-24 h-28 w-28 rounded-full border",
          isDark ? "border-emerald-400/10" : "border-emerald-500/15",
        ].join(" ")}
      />
      <div
        className={[
          "absolute right-16 top-32 h-16 w-16 rounded-full border",
          isDark ? "border-emerald-400/15" : "border-emerald-500/20",
        ].join(" ")}
      />
      <span
        className={[
          "absolute right-[4.75rem] top-[7.75rem] h-1.5 w-1.5 rounded-full",
          isDark ? "bg-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.55)]" : "bg-emerald-500/60",
        ].join(" ")}
      />
    </div>
  );
}

export default LeaderAmbientDecor;
