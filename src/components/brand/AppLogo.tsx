import React from "react";
import { cn } from "../../utils/cn";

type LogoVariant = "icon" | "lockup" | "login" | "compact" | "hero" | "splash" | "navbar";
type LogoColor = "auto" | "full" | "mark";

interface AppLogoProps {
  variant?: LogoVariant;
  color?: LogoColor;
  bare?: boolean;
  className?: string;
}

const FULL_LOGO = "/LogoContratacion_Cun.png";
const MARK_LOGO = "/LogoContratacion_sintexto.png";

export const AppLogo: React.FC<AppLogoProps> = ({
  variant = "lockup",
  color = "auto",
  bare = false,
  className,
}) => {
  const src = color === "mark" ? MARK_LOGO : FULL_LOGO;

  if (variant === "icon") {
    return (
      <div
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl",
          "border border-brand-200 bg-white/90 shadow-[0_10px_28px_rgba(16,185,129,0.12)]",
          className,
        )}
      >
        <img src={MARK_LOGO} alt="Contratación Académica CUN" className="h-[72%] w-[72%] object-contain" />
      </div>
    );
  }

  if (variant === "navbar") {
    return (
      <div
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:h-10 md:w-10",
          "border border-brand-100/80 bg-brand-50/60 dark:border-[#579689]/25 dark:bg-[#102a30]/80",
          className,
        )}
      >
        <img src={MARK_LOGO} alt="Contratación Académica CUN" className="h-[78%] w-[78%] object-contain" />
      </div>
    );
  }

  if (variant === "login") {
    if (bare) {
      return (
        <div
          className={cn(
            "flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-white/80 bg-white/95 p-2",
            "shadow-[0_12px_36px_-14px_rgba(16,185,129,0.65)] dark:border-[#356e66] dark:bg-[#0b2025]/90 dark:shadow-[0_16px_38px_-18px_rgba(0,0,0,0.85)]",
            className,
          )}
        >
          <img src={FULL_LOGO} alt="Contratación Académica CUN" className="h-full w-full object-contain" />
        </div>
      );
    }

    return (
      <div className={cn("inline-flex", className)}>
        <div className="relative h-28 w-28 xl:h-32 xl:w-32">
          <div className="absolute -inset-2 rounded-[1.4rem] bg-brand-400/25 blur-xl dark:bg-brand-300/20" />
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.2rem] p-3",
              "border border-white/90 bg-white/95",
              "shadow-[0_18px_45px_-18px_rgba(5,150,105,0.55),0_2px_8px_rgba(15,23,42,0.08)]",
              "dark:border-[#356e66] dark:bg-[#0b2025]/90",
              "dark:shadow-[0_20px_50px_-18px_rgba(0,0,0,0.82),0_0_28px_rgba(62,145,125,0.08)]",
            )}
          >
            <img src={FULL_LOGO} alt="Contratación Académica CUN" className="h-full w-full object-contain" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "splash") {
    return (
      <img
        src={FULL_LOGO}
        alt="Contratación Académica CUN"
        className={cn(
          "h-[4.5rem] w-auto object-contain drop-shadow-[0_4px_14px_rgba(16,185,129,0.18)] sm:h-[5.25rem]",
          className,
        )}
      />
    );
  }

  if (variant === "hero") {
    return (
      <div className={cn("inline-flex", className)}>
        <div className="relative h-64 w-64 sm:h-72 sm:w-72 lg:h-80 lg:w-80">
          <div className="absolute -inset-3 rounded-3xl bg-brand-400/25 blur-2xl dark:bg-brand-400/45" />
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center rounded-3xl",
              "border border-white/60 bg-white/35 backdrop-blur-2xl",
              "shadow-[0_20px_60px_rgba(16,185,129,0.14),inset_0_1px_0_rgba(255,255,255,0.65)]",
              "dark:border-white/25 dark:bg-white/[0.12] dark:shadow-[0_20px_60px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.22),0_0_80px_-15px_rgba(16,185,129,0.35)]",
            )}
          >
            <img
              src={src}
              alt="Contratación Académica CUN"
              className="h-full w-full object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_6px_24px_rgba(0,0,0,0.60),0_0_18px_rgba(255,255,255,0.20)]"
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-200 bg-white/90 shadow-sm">
          <img src={MARK_LOGO} alt="Contratación Académica CUN" className="h-6 w-6 object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-200 bg-white/90 shadow-sm">
        <img src={MARK_LOGO} alt="Contratación Académica CUN" className="h-6 w-6 object-contain" />
      </div>
      <span className="text-sm font-black tracking-tight text-slate-950 dark:text-white">
        Contratación Académica CUN
      </span>
    </div>
  );
};

export default AppLogo;
