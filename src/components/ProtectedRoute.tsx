// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role, useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

/**
 * Rutas que requieren sesión y, opcionalmente, un rol concreto.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  // 1) No logueado → login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2) Validación de rol
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
