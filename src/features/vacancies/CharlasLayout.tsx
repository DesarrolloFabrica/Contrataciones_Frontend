import {
  BriefcaseBusiness,
  ClipboardList,
  DatabaseZap,
  Home,
  MessageSquareText,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserAccountMenu } from "../../components/UserAccountMenu";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  visible: boolean;
  end?: boolean;
};

export function CharlasLayout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const items: NavItem[] = [
    { to: "/charlas", label: "Inicio", icon: <Home className="h-4 w-4" />, visible: true, end: true },
    { to: "/charlas/vacancies", label: "Procesos", icon: <DatabaseZap className="h-4 w-4" />, visible: Boolean(user?.capabilities.includes("vacancy.read")) },
    { to: "/charlas/interviews", label: "Mis charlas", icon: <MessageSquareText className="h-4 w-4" />, visible: Boolean(user?.capabilities.includes("interview.read")) },
    { to: "/charlas/templates", label: "Plantillas", icon: <ClipboardList className="h-4 w-4" />, visible: Boolean(user?.capabilities.includes("template.read")) },
    { to: "/charlas/admin", label: "Administración", icon: <Settings className="h-4 w-4" />, visible: user?.productRole === "ADMIN" },
  ];
  const legacyEnabled = import.meta.env.VITE_ENABLE_LEGACY_ACCESS === "true";
  const legacyPath = user?.role === "admin" ? "/admin" : user?.role === "coordinator" ? "/coordinator" : "/leader";

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 dark:bg-[#061419] dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b app-header-surface">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/charlas" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <strong className="block text-sm tracking-[0.16em]">CHARLAS</strong>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">Selección institucional</span>
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Navegación principal de CHARLAS">
            {items.filter((item) => item.visible).map((item) => <DesktopItem key={item.to} item={item} />)}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {legacyEnabled && (
              <Link to={legacyPath} className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-white/5 lg:block">
                Sistema anterior (legacy)
              </Link>
            )}
            <UserAccountMenu onLogout={logout} />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-200 px-3 py-2 md:hidden dark:border-white/5" aria-label="Navegación móvil de CHARLAS">
          {items.filter((item) => item.visible).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                isActive ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5",
              )}
            >
              {item.icon}{item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main-content" className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function DesktopItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
        isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5",
      )}
    >
      {item.icon}{item.label}
    </NavLink>
  );
}
