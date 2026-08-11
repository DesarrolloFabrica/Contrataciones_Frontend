import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/cn";

const roleLine: Record<string, string> = {
  admin: "Administrador",
  coordinator: "Coordinador",
  leader: "Líder",
};

const backendRoleLine: Record<string, string> = {
  ADMIN: "Administrador",
  COORDINADOR: "Coordinador",
  LIDER: "Líder",
};

type Props = {
  onLogout: () => void;
  onOpenHelp?: () => void;
};

export function UserAccountMenu({ onLogout, onOpenHelp }: Props) {
  const { user } = useAuth();
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
    roleLine[user.role] ?? backendRoleLine[user.backendRole] ?? user.email;
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
      className={cn(
        "w-10 h-10 shrink-0 rounded-full object-cover ring-2 ring-offset-2",
        isDark
          ? "ring-emerald-400/30 ring-offset-[#0a1518]"
          : "ring-emerald-500/20 ring-offset-white"
      )}
      onError={() => setImgError(true)}
    />
  ) : (
    <div
      className={cn(
        "w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-offset-2",
        isDark
          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25 ring-offset-[#0a1518]"
          : "bg-emerald-50 text-emerald-700 ring-emerald-500/20 ring-offset-white"
      )}
      aria-hidden
    >
      {initial}
    </div>
  );

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border py-2 pl-2 pr-3 transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
        open
          ? isDark
            ? "border-white/15 bg-white/[0.08] shadow-[0_10px_28px_-12px_rgba(0,0,0,0.55)]"
            : "border-slate-200 bg-white shadow-[0_10px_28px_-12px_rgba(15,23,42,0.14)]"
          : isDark
            ? "border-white/10 bg-white/[0.04] hover:border-white/15 hover:bg-white/[0.07]"
            : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm"
      )}
      >
        {avatar}
        <div className="hidden md:block min-w-0 text-left max-w-[180px] lg:max-w-[220px]">
          <p
            className={cn(
              "text-sm font-medium truncate leading-tight",
              isDark ? "text-white" : "text-slate-800"
            )}
          >
            {displayName}
          </p>
          <p className="text-[11px] truncate text-slate-400 leading-tight mt-0.5">
            {subtitle}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
            isDark ? "text-slate-400" : "text-slate-400"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-[calc(100%+8px)] w-72 rounded-2xl border shadow-xl overflow-hidden z-50",
            "animate-[fadeInUp_180ms_ease-out]",
            isDark
              ? "bg-[#091d22]/96 border-[#579689]/22 shadow-black/50 backdrop-blur-xl"
              : "bg-white border-slate-200/90 shadow-slate-200/60 backdrop-blur-xl"
          )}
        >
          <div
            className={cn(
              "px-4 py-4 border-b",
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-100 bg-slate-50/50"
            )}
          >
            <div className="flex items-center gap-3">
              {showImg ? (
                <img
                  src={user.googlePicture!.trim()}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center text-base font-semibold shrink-0",
                    isDark
                      ? "bg-[#58bea1]/12 text-[#72c4ae]"
                      : "bg-brand-50 text-brand-700"
                  )}
                >
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold truncate",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  {displayName}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            {onOpenHelp && (
              <button
                type="button"
                role="menuitem"
                onClick={handleOpenHelp}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isDark
                    ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    isDark ? "bg-[#58bea1]/10 text-[#72c4ae]" : "bg-brand-50 text-brand-600"
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                </span>
                Guía de uso
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                toggleTheme();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isDark
                  ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  isDark ? "bg-white/[0.06] text-slate-300" : "bg-slate-100 text-slate-600"
                )}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </span>
              {isDark ? "Modo claro" : "Modo oscuro"}
            </button>
          </div>

          <div
            className={cn(
              "p-1.5 border-t",
              isDark ? "border-white/[0.06]" : "border-slate-100"
            )}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isDark
                  ? "text-rose-300/90 hover:bg-rose-500/10 hover:text-rose-200"
                  : "text-rose-600 hover:bg-rose-50"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  isDark ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-500"
                )}
              >
                <LogOut className="w-4 h-4" />
              </span>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAccountMenu;
