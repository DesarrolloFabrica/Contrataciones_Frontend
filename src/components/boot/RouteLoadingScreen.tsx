// src/components/boot/RouteLoadingScreen.tsx
// Pantalla de carga breve para validacion de sesion.

import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { BootSplashContent } from "./BootSplashContent";

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
        isDark
          ? "bg-[radial-gradient(ellipse_at_20%_0%,#064E3B_0%,#022C22_50%,#011A12_100%)]"
          : "bg-[radial-gradient(ellipse_at_18%_0%,#ECFDF5_0%,#ffffff_55%,#F0FDF4_100%)]",
      ].join(" ")}
    >
      <BootSplashContent animate={false} />
    </div>
  );
};

export default RouteLoadingScreen;
