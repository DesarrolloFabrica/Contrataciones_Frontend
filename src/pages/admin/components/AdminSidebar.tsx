// src/pages/admin/components/AdminSidebar.tsx
import React from "react";
import { Home, FileText, Users, BarChart3, ScrollText } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

export type AdminView = "HOME" | "EVALUATIONS" | "USERS" | "ANALYTICS" | "AUDIT";

type NavItem = {
  id: AdminView;
  label: string;
  description: string;
  icon: React.ReactNode;
  hidden?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "HOME",
    label: "Inicio",
    description: "Panel principal",
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "EVALUATIONS",
    label: "Evaluaciones",
    description: "Lista y detalle",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "USERS",
    label: "Usuarios",
    description: "Gestión de roles",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "ANALYTICS",
    label: "Analítica",
    description: "Dashboard global",
    icon: <BarChart3 className="w-5 h-5" />,
    hidden: true,
  },
  {
    id: "AUDIT",
    label: "Auditoría",
    description: "Trazabilidad",
    icon: <ScrollText className="w-5 h-5" />,
    hidden: true,
  },
];

type Props = {
  view: AdminView;
  onNavigate: (view: AdminView) => void;
};

export default function AdminSidebar({ view, onNavigate }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside
      className={[
        "fixed left-0 top-0 h-full z-20 flex flex-col",
        "w-16 xl:w-60",
        isDark
          ? "bg-[#080909]/96 border-r border-white/[0.07] backdrop-blur-xl"
          : "bg-white/96 border-r border-slate-200 backdrop-blur-xl shadow-[4px_0_24px_rgba(15,23,42,0.07)]",
      ].join(" ")}
    >
      {/* Brand */}
      <div
        className={[
          "h-[72px] flex items-center px-3 xl:px-5 border-b shrink-0",
          isDark ? "border-white/[0.07]" : "border-slate-100",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center shrink-0">
            <span className="text-cyan-400 font-black text-sm select-none">A</span>
          </div>
          <div className="hidden xl:block min-w-0">
            <p
              className={[
                "text-xs font-black uppercase tracking-[0.18em] truncate",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              Admin Console
            </p>
            <p
              className={[
                "text-[10px] truncate mt-0.5",
                isDark ? "text-neutral-400" : "text-slate-600",
              ].join(" ")}
            >
              Centro de gestión
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 xl:px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter(item => !item.hidden).map((item) => {
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={[
                "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all group",
                isActive
                  ? isDark
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
                    : "bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-sm"
                  : isDark
                    ? "border border-transparent text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                    : "border border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
            >
              <span
                className={[
                  "shrink-0 transition-colors",
                  isActive
                    ? isDark
                      ? "text-cyan-400"
                      : "text-cyan-600"
                    : isDark
                      ? "text-neutral-400 group-hover:text-neutral-200"
                      : "text-slate-500 group-hover:text-slate-800",
                ].join(" ")}
              >
                {item.icon}
              </span>

              <div className="hidden xl:block min-w-0 flex-1">
                <p
                  className={[
                    "text-xs font-bold truncate",
                    isActive
                      ? isDark
                        ? "text-cyan-200"
                        : "text-cyan-800"
                      : "",
                  ].join(" ")}
                >
                  {item.label}
                </p>
                <p
                  className={[
                    "text-[10px] truncate mt-0.5",
                    isDark ? "text-neutral-500" : "text-slate-600",
                  ].join(" ")}
                >
                  {item.description}
                </p>
              </div>

              {isActive && (
                <span
                  className={[
                    "ml-auto hidden xl:flex w-1.5 h-1.5 rounded-full shrink-0",
                    isDark ? "bg-cyan-400" : "bg-cyan-500",
                  ].join(" ")}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={[
          "px-3 xl:px-5 py-4 border-t",
          isDark ? "border-white/[0.07]" : "border-slate-100",
        ].join(" ")}
      >
        <p
          className={[
            "hidden xl:block text-[10px] uppercase tracking-widest",
            isDark ? "text-neutral-500" : "text-slate-500",
          ].join(" ")}
        >
          Panel Admin · v2
        </p>
      </div>
    </aside>
  );
}
