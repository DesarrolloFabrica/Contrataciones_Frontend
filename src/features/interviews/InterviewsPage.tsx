import { Navigate } from "react-router-dom";

/**
 * La bandeja de mis charlas converge en el Panel del entrevistador (`/leader`).
 * Se conserva este módulo para imports/historial; la ruta redirige en App.tsx.
 */
export function InterviewsPage() {
  return <Navigate to="/leader" replace />;
}
