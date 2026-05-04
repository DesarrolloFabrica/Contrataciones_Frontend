// src/layouts/AppLayout.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/cn";
import ThemeToggle from "../components/ThemeToggle";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

type AppLayoutMode = "minimal" | "shell";

interface AppLayoutProps {
  children: React.ReactNode;
  mode?: AppLayoutMode;
}

type NavItemStatus = "active" | "internal-tab" | "internal-mode" | "future";

interface NavItem {
  label: string;
  href: string | null;
  status: NavItemStatus;
}

const navigationByRole: Record<string, NavItem[]> = {
  leader: [
    { label: "Nueva entrevista / evaluación", href: "/leader", status: "active" },
    { label: "Historial", href: "/leader", status: "internal-mode" },
    { label: "Perfil o configuración", href: null, status: "future" },
  ],
  coordinator: [
    { label: "Evaluaciones", href: "/coordinator", status: "active" },
    { label: "Candidatos / procesos", href: null, status: "future" },
    { label: "Decisiones", href: "/coordinator", status: "internal-tab" },
    { label: "Reportes", href: null, status: "future" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", status: "internal-tab" },
    { label: "Evaluaciones", href: "/admin", status: "active" },
    { label: "Usuarios", href: "/admin", status: "internal-tab" },
    { label: "Escuelas / programas", href: null, status: "future" },
    { label: "Auditoría", href: null, status: "future" },
  ],
};

const roleLabel: Record<string, string> = {
  leader: "Líder",
  coordinator: "Coordinador",
  admin: "Administrador",
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children, mode = "minimal" }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Si no hay usuario, renderizar directo (evita errores en rutas protegidas)
  if (!user) {
    return <>{children}</>;
  }

  // ===============================
  // MODO MINIMAL: solo wrapper neutro
  // ===============================
  if (mode === "minimal") {
    return (
      <div
        className={cn(
          "min-h-screen w-full font-sans",
          isDark ? "bg-[#020202] text-white" : "bg-gray-50 text-gray-900"
        )}
      >
        {children}
      </div>
    );
  }

  // ===============================
  // MODO SHELL: layout completo navegable
  // ===============================
  const navItems = navigationByRole[user.role] ?? [];

  return (
    <div
      className={cn(
        "min-h-screen w-full font-sans",
        isDark ? "bg-[#020202] text-white" : "bg-gray-50 text-gray-900"
      )}
    >
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "w-64 flex-shrink-0 border-r flex flex-col",
            isDark ? "bg-[#050505] border-white/5" : "bg-white border-slate-200"
          )}
        >
          {/* Perfil */}
          <div
            className={cn(
              "flex items-center gap-3 px-6 py-5 border-b",
              isDark ? "border-white/5" : "border-slate-200"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <Badge variant="default">
                {roleLabel[user.role] ?? user.role}
              </Badge>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isFuture = item.status === "future";
              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors",
                    isFuture
                      ? "text-neutral-400 cursor-not-allowed"
                      : isDark
                        ? "text-neutral-200 hover:bg-white/5"
                        : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <span>{item.label}</span>
                  {isFuture && (
                    <Badge variant="neutral">Próximamente</Badge>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div
            className={cn(
              "px-3 py-4 border-t flex items-center justify-between",
              isDark ? "border-white/5" : "border-slate-200"
            )}
          >
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Cerrar sesión
            </Button>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
