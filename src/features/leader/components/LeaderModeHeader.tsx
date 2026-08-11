import React from "react";
import { History, MessageSquareText } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { UserAccountMenu } from "../../../components/UserAccountMenu";
import { AppLogo } from "../../../components/brand";
import { cn } from "../../../utils/cn";

type ViewMode = "analyze" | "history";

type Props = {
  mode: ViewMode;
  onChangeMode: (m: ViewMode) => void;
  onLogout: () => void;
  onOpenHelp?: () => void;
  statusLabel?: string;
};

const NAV_ITEMS: { id: ViewMode; label: string; icon: typeof MessageSquareText }[] = [
  { id: "analyze", label: "Entrevista", icon: MessageSquareText },
  { id: "history", label: "Historial", icon: History },
];

function NavTabs({
  mode,
  onChangeMode,
  isDark,
  className,
}: {
  mode: ViewMode;
  onChangeMode: (m: ViewMode) => void;
  isDark: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label="Secciones principales"
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border p-1.5",
        isDark
          ? "border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "border-slate-200/90 bg-slate-100/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
        className,
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
              "relative flex flex-1 items-center justify-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 md:flex-none md:min-w-[132px]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
              active
                ? "text-white"
                : isDark
                  ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                  : "text-slate-500 hover:bg-white/80 hover:text-slate-800",
            )}
          >
            {active && (
              <span
                className={cn(
                  "absolute inset-0 rounded-xl",
                  isDark
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.65)]"
                    : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_8px_18px_-8px_rgba(16,185,129,0.55)]",
                )}
              />
            )}
            <Icon className="relative h-[18px] w-[18px] shrink-0" strokeWidth={2.1} />
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function LeaderModeHeader({
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
        "sticky top-0 z-50 w-full border-b backdrop-blur-2xl transition-colors duration-300",
        isDark
          ? "border-white/10 bg-[#0a1518]/85 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)]"
          : "border-slate-200/80 bg-white/85 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.25)]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          isDark
            ? "bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
            : "bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent",
        )}
      />

      <div className="w-full px-5 md:px-7 xl:px-8">
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-5 py-3.5 md:grid-cols-[1fr_auto_1fr] md:py-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <AppLogo
              variant="navbar"
              className="!h-11 !w-11 rounded-xl border-emerald-500/20 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.55)] md:!h-12 md:!w-12"
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-[15px] font-bold tracking-tight md:text-base",
                  isDark ? "text-white" : "text-slate-900",
                )}
              >
                Contratación Académica CUN
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    isDark
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-emerald-50 text-emerald-700",
                  )}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Sistema activo
                </span>
                {statusLabel && (
                  <span
                    className={cn(
                      "hidden rounded-full border px-2.5 py-1 text-[11px] font-medium sm:inline-flex",
                      isDark
                        ? "border-white/10 bg-white/[0.03] text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-600",
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

          <div className="justify-self-end">
            <UserAccountMenu onLogout={onLogout} onOpenHelp={onOpenHelp} />
          </div>
        </div>

        <div className="pb-3.5 md:hidden">
          <NavTabs
            mode={mode}
            onChangeMode={onChangeMode}
            isDark={isDark}
            className="flex w-full"
          />
        </div>
      </div>

      <div
        className={cn(
          "h-[2px] w-full",
          isDark
            ? "bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent"
            : "bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent",
        )}
      />
    </header>
  );
}

export default LeaderModeHeader;
