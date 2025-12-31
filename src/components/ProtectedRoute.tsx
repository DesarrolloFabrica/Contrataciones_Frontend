// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role, useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

/**
 * Envuelve rutas que requieren login y/o rol específico.
 * - Si no hay usuario → /login
 * - Si mustResetPassword = true → /change-password (excepto si ya estás ahí)
 * - Si el rol no está permitido → /
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isOnChangePassword = location.pathname === "/change-password";

  // 1) No logueado → login (guardamos a dónde iba)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2) Forzar cambio de contraseña si aplica
  const needsReset = user.mustResetPassword === true;

  if (needsReset && !isOnChangePassword) {
    return (
      <Navigate
        to="/change-password"
        replace
        state={{
          from: location, // para volver luego si quieres
          email: user.email, // útil para mostrarlo en ChangePasswordPage
        }}
      />
    );
  }

  // 3) Validación de rol
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
