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
import CoordinatorEvaluationDetailPage from "./pages/coordinator/CoordinatorEvaluationDetailPage";
import { AppLayout } from "./layouts";

/**
 * Redirect base según rol.
 * - Sin user → /login
 * - Con user → consola correspondiente al rol
 */
const HomeRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const role = (user.role || "").toLowerCase();

  if (role === "leader" || role === "lider")
    return <Navigate to="/leader" replace />;
  if (role === "coordinator" || role === "coordinador")
    return <Navigate to="/coordinator" replace />;

  return <Navigate to="/admin" replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protegidas por rol */}
      <Route element={<ProtectedRoute allowedRoles={["leader"]} />}>
        <Route
          path="/leader"
          element={
            <AppLayout mode="minimal">
              <LeaderConsole />
            </AppLayout>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
        <Route
          path="/coordinator"
          element={
            <AppLayout mode="minimal">
              <CoordinatorConsole />
            </AppLayout>
          }
        />

        <Route
          path="/coordinator/evaluations/:evaluationId"
          element={
            <AppLayout mode="minimal">
              <CoordinatorEvaluationDetailPage />
            </AppLayout>
          }
        />

        <Route
          path="/coordinator/evaluations/:evaluationId/report"
          element={
            <AppLayout mode="minimal">
              <CoordinatorEvaluationReport />
            </AppLayout>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route
          path="/admin"
          element={
            <AppLayout mode="minimal">
              <AdminConsole />
            </AppLayout>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
