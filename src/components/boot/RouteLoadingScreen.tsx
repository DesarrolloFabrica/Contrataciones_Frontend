// src/components/boot/RouteLoadingScreen.tsx
// Pantalla de carga breve para validacion de sesion.

import React, { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { BootSplashContent } from "./BootSplashContent";
import { LoginBackground } from "../brand";

export const RouteLoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando"
      className={[
        "fixed inset-0 z-[100] flex h-[100dvh] max-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden overscroll-none px-4",
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
