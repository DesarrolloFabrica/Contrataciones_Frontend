import { Navigate, useParams } from "react-router-dom";
import { DynamicInterviewForm } from "./DynamicInterviewForm";

/**
 * Alias temporal: la experiencia canónica vive en `/interviews/:interviewId`.
 * Se conserva el export para no romper imports; App redirige la ruta antigua.
 */
export function InterviewDetailPage() {
  const { interviewId = "" } = useParams();
  if (!interviewId) return <Navigate to="/leader" replace />;
  return <DynamicInterviewForm interviewId={interviewId} />;
}
