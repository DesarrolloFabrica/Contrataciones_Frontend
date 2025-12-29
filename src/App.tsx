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
  

const App: React.FC = () => {
  const { user } = useAuth();

  // Ruta raíz: decide a dónde mandar según si hay usuario
  const HomeRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;

    if (user.role === "leader") return <Navigate to="/leader" replace />;
    if (user.role === "coordinator") return <Navigate to="/coordinator" replace />;

    return <Navigate to="/admin" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas por rol */}
      <Route element={<ProtectedRoute allowedRoles={["leader"]} />}>
        <Route path="/leader" element={<LeaderConsole />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
        <Route path="/coordinator" element={<CoordinatorConsole />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminConsole />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
