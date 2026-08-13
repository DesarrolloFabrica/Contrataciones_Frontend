import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { RouteLoadingScreen } from "./components/boot/RouteLoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { CharlasLayout } from "./features/vacancies/CharlasLayout";
import { AppLayout } from "./layouts";

const LoginPage = lazy(() => import("./pages/Login/LoginPage"));
const LeaderConsole = lazy(() => import("./pages/leader/LeaderConsole"));
const CoordinatorConsole = lazy(() => import("./pages/coordinator/CoordinatorConsole"));
const AdminConsole = lazy(() => import("./pages/admin/AdminConsole"));
const CoordinatorEvaluationReport = lazy(() => import("./pages/coordinator/CoordinatorEvaluationReport"));
const CoordinatorEvaluationDetailPage = lazy(() => import("./pages/coordinator/CoordinatorEvaluationDetailPage"));
const CharlasHomePage = lazy(() => import("./features/product/CharlasHomePage").then((module) => ({ default: module.CharlasHomePage })));
const AdminOperationsPage = lazy(() => import("./features/product/AdminOperationsPage").then((module) => ({ default: module.AdminOperationsPage })));
const VacanciesPage = lazy(() => import("./features/vacancies/VacanciesPage").then((module) => ({ default: module.VacanciesPage })));
const VacancyWorkspacePage = lazy(() => import("./features/vacancies/VacancyWorkspacePage").then((module) => ({ default: module.VacancyWorkspacePage })));
const TemplatesPage = lazy(() => import("./features/templates/TemplatesPage").then((module) => ({ default: module.TemplatesPage })));
const TemplateDetailPage = lazy(() => import("./features/templates/TemplateDetailPage").then((module) => ({ default: module.TemplateDetailPage })));
const InterviewerCharlaPage = lazy(() => import("./pages/interviewer/InterviewerCharlaPage"));
const InterviewerAnalysisPage = lazy(() => import("./pages/interviewer/InterviewerAnalysisPage"));
const CandidateIntelligencePage = lazy(() => import("./features/intelligence/CandidateIntelligencePage").then((module) => ({ default: module.CandidateIntelligencePage })));
const ProcessComparisonPage = lazy(() => import("./features/intelligence/ProcessComparisonPage").then((module) => ({ default: module.ProcessComparisonPage })));

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? "/charlas" : "/login"} replace />;
}

function CharlasPage({ children }: { children: React.ReactNode }) {
  return <CharlasLayout>{children}</CharlasLayout>;
}

function LegacyInterviewDetailRedirect() {
  const { interviewId = "" } = useParams();
  return <Navigate to={`/interviews/${interviewId}`} replace />;
}

function UnauthorizedPage() {
  return (
    <CharlasPage>
      <section role="alert" className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
        <h1 className="text-xl font-semibold">No tienes acceso a esta sección</h1>
        <p className="mt-2 text-sm">Tus permisos de CHARLAS dependen del rol de producto y de tu responsabilidad dentro de cada proceso.</p>
        <a href="/charlas" className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Volver al inicio</a>
      </section>
    </CharlasPage>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/charlas" element={<CharlasPage><CharlasHomePage /></CharlasPage>} />
          <Route path="/charlas/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredCapability="vacancy.read" />}>
          <Route path="/charlas/vacancies" element={<CharlasPage><VacanciesPage /></CharlasPage>} />
          <Route path="/charlas/vacancies/:vacancyId" element={<CharlasPage><VacancyWorkspacePage /></CharlasPage>} />
        </Route>
        <Route element={<ProtectedRoute requiredCapability="template.read" />}>
          <Route path="/charlas/templates" element={<CharlasPage><TemplatesPage /></CharlasPage>} />
          <Route path="/charlas/templates/:templateId" element={<CharlasPage><TemplateDetailPage /></CharlasPage>} />
        </Route>
        <Route element={<ProtectedRoute requiredCapability="interview.read" />}>
          <Route path="/charlas/interviews" element={<Navigate to="/leader" replace />} />
          <Route path="/charlas/interviews/:interviewId" element={<LegacyInterviewDetailRedirect />} />
          <Route path="/interviews/:interviewId" element={<AppLayout mode="minimal"><InterviewerCharlaPage /></AppLayout>} />
          <Route path="/interviews/:interviewId/analysis" element={<AppLayout mode="minimal"><InterviewerAnalysisPage /></AppLayout>} />
          <Route path="/leader" element={<AppLayout mode="minimal"><LeaderConsole /></AppLayout>} />
        </Route>
        <Route element={<ProtectedRoute requiredCapability="process.read" />}>
          <Route path="/charlas/applications/:applicationId/intelligence" element={<CharlasPage><CandidateIntelligencePage /></CharlasPage>} />
          <Route path="/charlas/processes/:processId/comparison" element={<CharlasPage><ProcessComparisonPage /></CharlasPage>} />
        </Route>
        <Route element={<ProtectedRoute requiredProductRole="ADMIN" />}>
          <Route path="/charlas/admin" element={<CharlasPage><AdminOperationsPage /></CharlasPage>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
          <Route path="/coordinator" element={<AppLayout mode="minimal"><CoordinatorConsole /></AppLayout>} />
          <Route path="/coordinator/evaluations/:evaluationId" element={<AppLayout mode="minimal"><CoordinatorEvaluationDetailPage /></AppLayout>} />
          <Route path="/coordinator/evaluations/:evaluationId/report" element={<AppLayout mode="minimal"><CoordinatorEvaluationReport /></AppLayout>} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AppLayout mode="minimal"><AdminConsole /></AppLayout>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
