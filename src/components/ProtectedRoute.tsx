// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role, useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

/**
 * Envuelve rutas que requieren login y/o rol específico.
 * - Mientras Auth se hidrata: muestra loader (o null)
 * - Si no hay usuario: redirige a /login
 * - Si el rol no está permitido: redirige a /
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isReady } = useAuth();
  const location = useLocation();

  // ✅ IMPORTANTÍSIMO: evita que en F5 redirija antes de hidratar el storage
  if (!isReady) {
    return (
      <div className="min-h-screen w-full bg-[#020202] flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/60">
          Cargando sesión…
        </div>
      </div>
    );
    // si prefieres “silencioso”: return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
