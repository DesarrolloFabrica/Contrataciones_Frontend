// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role, useAuth } from "../context/AuthContext";
import type { SelectionCapability } from "../services/authService";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  requiredCapability?: SelectionCapability;
  requiredProductRole?: "ADMIN" | "INTERVIEWER";
}

/**
 * Rutas que requieren sesión y, opcionalmente, un rol concreto.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, requiredCapability, requiredProductRole }) => {
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

  if (requiredCapability && !user.capabilities.includes(requiredCapability)) {
    return <Navigate to="/charlas/unauthorized" state={{ from: location }} replace />;
  }

  if (requiredProductRole && user.productRole !== requiredProductRole) {
    return <Navigate to="/charlas/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
