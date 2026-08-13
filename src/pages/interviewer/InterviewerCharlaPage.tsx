import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LeaderAmbientDecor } from "../../features/leader/components/LeaderAmbientDecor";
import { LeaderModeHeader } from "../../features/leader/components/LeaderModeHeader";
import { LeaderWorkspaceSidebar } from "../../features/leader/components/LeaderWorkspaceSidebar";
import { DynamicInterviewForm } from "../../features/interviews/DynamicInterviewForm";
import { getInterview } from "../../features/interviews/interviewsApi";
import { interviewStatusLabel } from "../../features/interviews/types";

/**
 * Detalle de charla CHARLAS dentro del chrome visual del Panel del entrevistador.
 */
export default function InterviewerCharlaPage() {
  const { interviewId = "" } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const interviewQuery = useQuery({
    queryKey: ["charlas-interview", interviewId],
    queryFn: () => getInterview(interviewId),
    enabled: Boolean(interviewId),
  });

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/login";
  }, [logout]);

  const goLeader = useCallback(
    (mode: "analyze" | "history") => {
      navigate(mode === "history" ? "/leader?view=history" : "/leader");
    },
    [navigate],
  );

  const statusLabel = interviewQuery.data
    ? interviewStatusLabel[interviewQuery.data.status]
    : undefined;

  return (
    <div
      className={`relative flex h-[100dvh] w-full flex-col overflow-hidden font-sans ${
        isDark ? "bg-[#071214] text-white" : "bg-white text-slate-900"
      }`}
    >
      <div className="relative z-20 flex min-h-0 flex-1 flex-col overflow-hidden">
        <LeaderModeHeader
          mode="analyze"
          onChangeMode={goLeader}
          onLogout={handleLogout}
          statusLabel={statusLabel}
        />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <LeaderWorkspaceSidebar
            mode="analyze"
            currentStep={1}
            onChangeMode={goLeader}
            onSelectStep={() => undefined}
            onOpenHelp={() => undefined}
            counts={null}
          />

          <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <LeaderAmbientDecor />
            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full min-w-0 max-w-[1400px] px-3 py-4 sm:px-4 md:px-6 md:py-5">
                <div className="min-w-0 animate-[fadeInUp_400ms_ease-out]">
                  {interviewId ? (
                    <DynamicInterviewForm interviewId={interviewId} />
                  ) : (
                    <p className="text-sm text-slate-500">Charla no encontrada.</p>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
