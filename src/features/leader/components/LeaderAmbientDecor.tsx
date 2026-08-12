import React from "react";
import { useTheme } from "../../../context/ThemeContext";

/**
 * Fondo del área principal.
 * - Oscuro: fondolider como atmósfera neon (funciona bien).
 * - Claro: canvas institucional claro; la foto se usa solo como textura muy suave.
 */
export function LeaderAmbientDecor() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isDark) {
    return (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[#071214]" />
        <img
          src="/fondolider.png"
          alt=""
          className="absolute left-1/2 top-1/2 h-full w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-[center_35%] opacity-50 saturate-[0.7] brightness-[0.62]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,18,20,0.4)_0%,rgba(7,24,28,0.55)_55%,rgba(5,16,18,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(16,185,129,0.12),transparent_55%)]" />
      </div>
    );
  }

  // Modo claro: sutil pero perceptible detrás de las tarjetas
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#eef3f5]" />

      <img
        src="/fondolider.png"
        alt=""
        className="absolute left-1/2 top-1/2 h-full w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-[center_40%] opacity-[0.26] saturate-[0.4] brightness-[1.28] contrast-[0.95]"
      />

      {/* Lavado ligero: deja entrever la ciudad sin ensuciar el UI */}
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.72)_0%,rgba(248,250,252,0.58)_40%,rgba(236,253,245,0.52)_72%,rgba(241,245,249,0.68)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_10%,rgba(16,185,129,0.1),transparent_42%),radial-gradient(ellipse_at_15%_85%,rgba(255,255,255,0.35),transparent_50%)]" />

      <div className="absolute -right-16 top-16 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />
      <div className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-sky-200/18 blur-3xl" />

      <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:44px_44px]" />
    </div>
  );
}

export default LeaderAmbientDecor;
