// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Consolas por rol
import LeaderConsole from "./pages/leader/LeaderConsole";
import CoordinatorConsole from "./pages/coordinator/CoordinatorConsole";
import AdminConsole from "./pages/admin/AdminConsole";

import LoginPage from "./pages/Login/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

import CoordinatorEvaluationReport from "./pages/coordinator/CoordinatorEvaluationReport";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";

const App: React.FC = () => {
  const { user } = useAuth();

  const HomeRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;

    // ✅ CLAVE: si debe resetear, lo mandamos a change-password
    if (user.mustResetPassword) return <Navigate to="/change-password" replace />;

    // ✅ CLAVE: normaliza role por si viene "ADMIN" o "admin"
    const role = (user.role || "").toLowerCase();

    if (role === "leader" || role === "lider") return <Navigate to="/leader" replace />;
    if (role === "coordinator" || role === "coordinador") return <Navigate to="/coordinator" replace />;

    return <Navigate to="/admin" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ✅ Change password debe ser accesible estando logueado */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "coordinator", "leader"]} />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Rutas protegidas por rol */}
      <Route element={<ProtectedRoute allowedRoles={["leader"]} />}>
        <Route path="/leader" element={<LeaderConsole />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
        <Route path="/coordinator" element={<CoordinatorConsole />} />

        <Route
          path="/coordinator/evaluations/:evaluationId"
          element={<CoordinatorEvaluationReport />}
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminConsole />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
