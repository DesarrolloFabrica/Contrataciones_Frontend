// src/components/boot/RouteLoadingScreen.tsx
// Pantalla de carga breve para validacion de sesion.

import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { BootSplashContent } from "./BootSplashContent";
import { LoginBackground } from "../brand";

export const RouteLoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando"
      className={[
        "flex min-h-screen flex-col items-center justify-center px-4",
        isDark ? "bg-[#061419] text-white" : "bg-white text-slate-950",
      ].join(" ")}
    >
      <LoginBackground />
      <div className="relative z-10">
        <BootSplashContent animate={false} />
      </div>
    </div>
  );
};

export default RouteLoadingScreen;
