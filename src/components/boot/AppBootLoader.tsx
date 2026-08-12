// src/components/boot/AppBootLoader.tsx
// Splash post-login: precarga de datos antes de mostrar el panel.

import React, { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { BootSplashContent } from "./BootSplashContent";
import { LoginBackground } from "../brand";

interface AppBootLoaderProps {
  exiting: boolean;
}

export const AppBootLoader: React.FC<AppBootLoaderProps> = ({ exiting }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Evita scroll del dashboard montado detrás del overlay.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label="Cargando"
      className={[
        "fixed inset-0 z-[100] flex h-[100dvh] max-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden overscroll-none px-5",
        "transition-opacity duration-500 ease-in-out motion-reduce:duration-0",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
        isDark ? "bg-[#061419] text-white" : "bg-white text-slate-950",
      ].join(" ")}
    >
      <LoginBackground />
      <div className="relative z-10">
        <BootSplashContent complete={exiting} />
      </div>
    </div>
  );
};

export default AppBootLoader;
