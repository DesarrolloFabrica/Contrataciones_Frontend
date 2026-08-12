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
        "inline-flex rounded-xl p-1",
        isDark ? "bg-white/[0.04]" : "bg-slate-100/80",
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
                    ? "bg-gradient-to-r from-[#178b70] to-[#12645f] shadow-[0_6px_18px_-10px_rgba(44,143,119,0.55)]"
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
          ? "bg-[#071a20]/92 border-white/[0.06] backdrop-blur-xl"
          : "bg-white/90 border-slate-200/70 backdrop-blur-xl shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      )}
    >
      <div className="mx-auto max-w-[1560px] px-5 md:px-8">
        <div className="grid h-14 grid-cols-[1fr_auto] items-center gap-x-5 md:h-[3.75rem] md:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 items-center gap-3">
            <AppLogo variant="navbar" />
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-sm font-semibold tracking-tight md:text-[15px]",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Contratación Académica CUN
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    isDark
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-brand-50 text-brand-700"
                  )}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
                  </span>
                  Sistema activo
                </span>
                {statusLabel && (
                  <span
                    className={cn(
                      "hidden truncate text-[10px] font-medium sm:inline",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}
                  >
                    {statusLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden justify-center md:flex">
            <NavTabs mode={mode} onChangeMode={onChangeMode} isDark={isDark} />
          </div>

          <div className="justify-self-end pl-2">
            <UserAccountMenu onLogout={onLogout} onOpenHelp={onOpenHelp} />
          </div>
        </div>

        <div className="-mt-1 pb-3 md:hidden">
          <NavTabs
            mode={mode}
            onChangeMode={onChangeMode}
            isDark={isDark}
            className="flex w-full"
          />
        </div>
      </div>
    </header>
  );
}

export default CoordinatorModeHeader;
