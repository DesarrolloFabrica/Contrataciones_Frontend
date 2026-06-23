// src/components/boot/AppBootLoader.tsx
// Splash post-login: precarga de datos antes de mostrar el panel.

import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { BootSplashContent } from "./BootSplashContent";

interface AppBootLoaderProps {
  exiting: boolean;
}

export const AppBootLoader: React.FC<AppBootLoaderProps> = ({ exiting }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label="Cargando"
      className={[
        "fixed inset-0 z-[100] flex flex-col items-center justify-center px-5",
        "transition-opacity duration-500 ease-in-out motion-reduce:duration-0",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
        isDark
          ? "bg-[radial-gradient(ellipse_at_20%_0%,#064E3B_0%,#022C22_50%,#011A12_100%)]"
          : "bg-[radial-gradient(ellipse_at_18%_0%,#ECFDF5_0%,#ffffff_55%,#F0FDF4_100%)]",
      ].join(" ")}
    >
      <BootSplashContent />
    </div>
  );
};

export default AppBootLoader;
