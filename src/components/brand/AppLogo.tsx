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
          "relative w-10 h-10 rounded-xl flex items-center justify-center",
          "bg-white/90 border border-brand-200 shadow-[0_10px_28px_rgba(16,185,129,0.12)]",
          className
        )}
      >
        <img
          src={MARK_LOGO}
          alt="Contratación Académica CUN"
          className="h-[72%] w-[72%] object-contain"
        />
      </div>
    );
  }

  if (variant === "navbar") {
    return (
      <div
        className={cn(
          "relative shrink-0 flex items-center justify-center rounded-lg",
          "h-9 w-9 md:h-10 md:w-10",
          "bg-brand-50/60 border border-brand-100/80",
          "dark:bg-white/[0.05] dark:border-white/[0.08]",
          className
        )}
      >
        <img
          src={MARK_LOGO}
          alt="Contratación Académica CUN"
          className="h-[78%] w-[78%] object-contain"
        />
      </div>
    );
  }

  if (variant === "login") {
    if (bare) {
      return (
        <img
          src={FULL_LOGO}
          alt="Contratación Académica CUN"
          className={cn(
            "h-20 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.12)] sm:h-24",
            "dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.55),0_0_32px_rgba(255,255,255,0.22)]",
            className
          )}
        />
      );
    }
    return (
      <div className={cn("inline-flex", className)}>
        <div className="relative w-32 h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40">
          <div className="absolute -inset-1.5 rounded-xl bg-brand-400/20 blur-lg dark:bg-white/15" />
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center rounded-xl p-3.5",
              "border border-brand-200/70 bg-white",
              "shadow-[0_8px_28px_rgba(16,185,129,0.12),0_2px_6px_rgba(15,23,42,0.05)]",
              "dark:border-white/20 dark:bg-white/[0.96]",
              "dark:shadow-[0_10px_36px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)]"
            )}
          >
            <img
              src={FULL_LOGO}
              alt="Contratación Académica CUN"
              className="h-full w-full object-contain"
            />
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
          "h-[4.5rem] w-auto object-contain sm:h-[5.25rem]",
          "drop-shadow-[0_4px_14px_rgba(16,185,129,0.18)]",
          className
        )}
      />
    );
  }

  if (variant === "hero") {
    return (
      <div className={cn("inline-flex", className)}>
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
          <div className="absolute -inset-3 rounded-3xl bg-brand-400/25 blur-2xl dark:bg-brand-400/45" />
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center rounded-3xl",
              "border border-white/60 bg-white/35 backdrop-blur-2xl",
              "shadow-[0_20px_60px_rgba(16,185,129,0.14),inset_0_1px_0_rgba(255,255,255,0.65)]",
              "dark:border-white/25 dark:bg-white/[0.12] dark:shadow-[0_20px_60px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.22),0_0_80px_-15px_rgba(16,185,129,0.35)]"
            )}
          >
            <img
              src={FULL_LOGO}
              alt="Contratacion Academica CUN"
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
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/90 border border-brand-200 shadow-sm">
          <img src={MARK_LOGO} alt="Contratación Académica CUN" className="w-6 h-6 object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/90 border border-brand-200 shadow-sm">
        <img src={MARK_LOGO} alt="Contratación Académica CUN" className="w-6 h-6 object-contain" />
      </div>
      <span className="font-black text-sm tracking-tight text-slate-950 dark:text-white">
        Contratación Académica CUN
      </span>
    </div>
  );
};

export default AppLogo;
