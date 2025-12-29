// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role, useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

/**
 * Envuelve rutas que requieren login y/o rol específico.
 * Si no hay usuario → redirige a /login
 * Si el rol no está permitido → redirige a / (root)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
