import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/cn";

type Props = {
  onLogout: () => void;
  onOpenHelp?: () => void;
};

export function UserAccountMenu({ onLogout, onOpenHelp }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  if (!user) return null;

  const displayName =
    user.name && user.name.trim() ? user.name.trim() : user.email;

  const initial = (
    displayName.charAt(0) ||
    user.email.charAt(0) ||
    "?"
  ).toUpperCase();

  const subtitle =
    user.productRole === "ADMIN" ? "Administrador CHARLAS" : "Entrevistador";
  const showImg = Boolean(user.googlePicture?.trim() && !imgError);

  const handleLogout = () => {
    close();
    onLogout();
  };

  const handleOpenHelp = () => {
    close();
    onOpenHelp?.();
  };

  const avatar = showImg ? (
    <img
      src={user.googlePicture!.trim()}
      alt=""
      className="h-8 w-8 shrink-0 rounded-full object-cover"
      onError={() => setImgError(true)}
    />
  ) : (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        isDark
          ? "bg-emerald-500/20 text-emerald-300"
          : "bg-emerald-50 text-emerald-700",
      )}
      aria-hidden
    >
      {initial}
    </div>
  );

  const itemClass = cn(
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
    isDark
      ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  );

  return (
    <div ref={menuRef} className="relative z-[80]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={displayName}
        className={cn(
          "flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          open
            ? isDark
              ? "bg-white/[0.08]"
              : "bg-slate-100"
            : isDark
              ? "hover:bg-white/[0.06]"
              : "hover:bg-slate-100/90",
        )}
      >
        {avatar}
        <div className="hidden min-w-0 max-w-[140px] text-left xl:block xl:max-w-[160px]">
          <p
            className={cn(
              "truncate text-[13px] font-medium leading-tight",
              isDark ? "text-white" : "text-slate-800",
            )}
            title={displayName}
          >
            {displayName}
          </p>
          <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-400">
            {subtitle}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "mr-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-[calc(100%+8px)] z-[90] w-[240px] overflow-hidden rounded-xl",
            "animate-[fadeInUp_160ms_ease-out]",
            isDark
              ? "bg-[#101e23] shadow-[0_18px_48px_-16px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.06)]"
              : "bg-white shadow-[0_16px_40px_-14px_rgba(15,23,42,0.28),0_0_0_1px_rgba(15,23,42,0.06)]",
          )}
        >
          <div className="px-3.5 pb-2.5 pt-3">
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.12em]",
                isDark ? "text-slate-500" : "text-slate-400",
              )}
            >
              Cuenta
            </p>
            <p
              className={cn(
                "mt-1.5 truncate text-[12px] leading-snug",
                isDark ? "text-slate-300" : "text-slate-600",
              )}
              title={user.email}
            >
              {user.email}
            </p>
          </div>

          <div
            className={cn(
              "mx-2.5 h-px",
              isDark ? "bg-white/[0.06]" : "bg-slate-100",
            )}
          />

          <div className="p-1.5">
            {user.capabilities.includes("vacancy.read") && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  navigate("/charlas");
                }}
                className={itemClass}
              >
                <BriefcaseBusiness
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isDark ? "text-emerald-400" : "text-emerald-600",
                  )}
                />
                Ir a CHARLAS
              </button>
            )}
            {onOpenHelp && (
              <button
                type="button"
                role="menuitem"
                onClick={handleOpenHelp}
                className={itemClass}
              >
                <BookOpen
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isDark ? "text-emerald-400" : "text-emerald-600",
                  )}
                />
                Guía de uso
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => toggleTheme()}
              className={itemClass}
            >
              {isDark ? (
                <Sun className="h-4 w-4 shrink-0 text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 shrink-0 text-slate-500" />
              )}
              {isDark ? "Modo claro" : "Modo oscuro"}
            </button>
          </div>

          <div
            className={cn(
              "mx-2.5 h-px",
              isDark ? "bg-white/[0.06]" : "bg-slate-100",
            )}
          />

          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                isDark
                  ? "text-rose-300/90 hover:bg-rose-500/10 hover:text-rose-200"
                  : "text-rose-600 hover:bg-rose-50",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAccountMenu;
