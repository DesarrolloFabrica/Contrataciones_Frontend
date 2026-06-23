import React from "react";
import { FileText, Users } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { UserAccountMenu } from "../../../components/UserAccountMenu";
import { AppLogo } from "../../../components/brand";
import { cn } from "../../../utils/cn";

type CoordinatorTab = "evaluations" | "users";

type Props = {
  mode: CoordinatorTab;
  onChangeMode: (m: CoordinatorTab) => void;
  onLogout: () => void;
  onOpenHelp?: () => void;
  statusLabel?: string;
};

const NAV_ITEMS: { id: CoordinatorTab; label: string; icon: typeof FileText }[] = [
  { id: "evaluations", label: "Evaluaciones", icon: FileText },
  { id: "users", label: "Usuarios", icon: Users },
];

function NavTabs({
  mode,
  onChangeMode,
  isDark,
  className,
}: {
  mode: CoordinatorTab;
  onChangeMode: (m: CoordinatorTab) => void;
  isDark: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label="Secciones principales"
      className={cn(
        "inline-flex p-1 rounded-xl border",
        isDark
          ? "bg-white/[0.03] border-white/10"
          : "bg-slate-100/70 border-slate-200/80",
        className
      )}
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChangeMode(id)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
              active
                ? "text-white"
                : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-500 hover:text-slate-800"
            )}
          >
            {active && (
              <span
                className={cn(
                  "absolute inset-0 rounded-lg shadow-sm",
                  isDark
                    ? "bg-gradient-to-r from-brand-600 to-brand-500 shadow-brand-500/20"
                    : "bg-gradient-to-r from-brand-500 to-brand-600 shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                )}
              />
            )}
            <Icon className="relative w-4 h-4 shrink-0" />
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function CoordinatorModeHeader({
  mode,
  onChangeMode,
  onLogout,
  onOpenHelp,
  statusLabel,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        isDark
          ? "bg-[#021A0F]/90 border-white/[0.06] backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
          : "bg-white/90 border-slate-200/70 backdrop-blur-xl shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-x-4 h-14 md:h-16">
          <div className="flex items-center gap-3 min-w-0">
            <AppLogo variant="navbar" />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm md:text-[15px] font-semibold tracking-tight truncate",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Contratación Académica CUN
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
                    isDark
                      ? "bg-brand-500/10 text-brand-400"
                      : "bg-brand-50 text-brand-700"
                  )}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-500" />
                  </span>
                  Sistema activo
                </span>
                {statusLabel && (
                  <span
                    className={cn(
                      "hidden sm:inline text-[10px] font-medium truncate",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}
                  >
                    {statusLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <NavTabs mode={mode} onChangeMode={onChangeMode} isDark={isDark} />
          </div>

          <div className="justify-self-end">
            <UserAccountMenu onLogout={onLogout} onOpenHelp={onOpenHelp} />
          </div>
        </div>

        <div className="md:hidden pb-3 -mt-1">
          <NavTabs
            mode={mode}
            onChangeMode={onChangeMode}
            isDark={isDark}
            className="w-full flex"
          />
        </div>
      </div>
    </header>
  );
}

export default CoordinatorModeHeader;
