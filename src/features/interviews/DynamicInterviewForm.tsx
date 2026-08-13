import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { InterviewWizardShell } from "../leader/interview-form/components/InterviewWizardShell";
import { SectionHeader } from "../leader/interview-form/components/SectionHeader";
import { getProcessAccess } from "../product/productApi";
import { apiErrorMessage } from "../vacancies/formatters";
import { CharlaContextHeader } from "./CharlaContextHeader";
import { DynamicCharlaReviewStep } from "./DynamicCharlaReviewStep";
import { DynamicQuestionField } from "./DynamicQuestionField";
import { DynamicWizardNavigation } from "./DynamicWizardNavigation";
import { DynamicWizardStepper } from "./DynamicWizardStepper";
import { ReviewIntelligenceLink } from "./ReviewIntelligenceLink";
import {
  buildDynamicWizardSteps,
  computeCharlaProgress,
  findFirstInvalidStepIndex,
  invalidAnsweredQuestions,
  isQuestionTypeValid,
  missingRequiredQuestions,
  sectionIsComplete,
} from "./dynamicWizardSteps";
import { useCharlaAutosave } from "./hooks/useCharlaAutosave";
import { completeInterview, getInterview, startInterview } from "./interviewsApi";
import type { SelectionInterview } from "./types";

type Props = {
  interviewId: string;
};

export function DynamicInterviewForm({ interviewId }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const interviewQuery = useQuery({
    queryKey: ["charlas-interview", interviewId],
    queryFn: () => getInterview(interviewId),
    enabled: Boolean(interviewId),
  });

  const interview = interviewQuery.data;
  const processId = interview?.application.selectionProcess.id;
  const access = useQuery({
    queryKey: ["charlas-process-access", processId],
    queryFn: () => getProcessAccess(processId!),
    enabled: Boolean(processId),
  });

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [observations, setObservations] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [highlightInvalid, setHighlightInvalid] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const hydratedId = useRef<string | null>(null);

  useEffect(() => {
    if (interview && hydratedId.current !== interview.id) {
      setAnswers(Object.fromEntries((interview.answers ?? []).map((answer) => [answer.questionId, answer.value])));
      setObservations(interview.generalObservations ?? "");
      hydratedId.current = interview.id;
      setStepIndex(0);
      setMaxReached(0);
      setHighlightInvalid(false);
    }
  }, [interview]);

  const updateCached = (data: SelectionInterview) => {
    queryClient.setQueryData(["charlas-interview", interviewId], data);
  };

  const canExecute = Boolean(user && interview && interview.interviewerUserId === user.id);
  const readOnly =
    !interview ||
    interview.status === "COMPLETED" ||
    interview.status === "CANCELLED" ||
    !canExecute;
  const autosaveEnabled = Boolean(interview && interview.status === "IN_PROGRESS" && canExecute);

  const autosave = useCharlaAutosave({
    interviewId,
    enabled: autosaveEnabled,
    answers,
    observations,
    onSaved: updateCached,
  });

  const steps = useMemo(() => buildDynamicWizardSteps(interview), [interview]);
  const currentStep = steps[Math.min(stepIndex, Math.max(steps.length - 1, 0))];
  const progress = computeCharlaProgress(interview, answers);
  const missingRequired = missingRequiredQuestions(interview, answers);
  const invalidAnswers = invalidAnsweredQuestions(interview, answers);

  const completedSectionIndexes = useMemo(() => {
    if (!interview) return [];
    return steps
      .filter((step) => step.kind === "section")
      .filter((step) => sectionIsComplete(step.section, answers))
      .map((step) => step.sectionIndex);
  }, [steps, answers, interview]);

  const goToStep = (index: number) => {
    const next = Math.max(0, Math.min(index, steps.length - 1));
    setStepIndex(next);
    setMaxReached((current) => Math.max(current, next));
  };

  const markAnswer = (questionId: string, value: unknown) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    autosave.markDirty();
    setActionError(null);
  };

  const markObservations = (value: string) => {
    setObservations(value);
    autosave.markDirty();
  };

  const start = useMutation({
    mutationFn: () => startInterview(interviewId),
    onSuccess: (data) => {
      updateCached(data);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["charlas-interviews"] });
    },
    onError: (error) => setActionError(apiErrorMessage(error)),
  });

  const finish = useMutation({
    mutationFn: async () => {
      const ok = await autosave.flush();
      if (!ok && autosaveEnabled) {
        throw new Error(autosave.errorMessage || "No se pudo guardar antes de finalizar.");
      }
      return completeInterview(interviewId);
    },
    onSuccess: (data) => {
      updateCached(data);
      setHighlightInvalid(false);
      setActionError(null);
      setConfirmCompleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["charlas-interviews"] });
    },
    onError: (error: unknown) => {
      const axiosData = (error as { response?: { data?: { missingQuestionIds?: string[]; message?: string | string[] } } })
        ?.response?.data;
      const missingIds = axiosData?.missingQuestionIds;
      if (missingIds?.length) {
        setHighlightInvalid(true);
        goToStep(findFirstInvalidStepIndex(steps, answers));
      }
      setConfirmCompleteOpen(false);
      setActionError(apiErrorMessage(error));
    },
  });

  const handleFinish = () => {
    if (missingRequired.length || invalidAnswers.length) {
      setHighlightInvalid(true);
      goToStep(findFirstInvalidStepIndex(steps, answers));
      setActionError(
        missingRequired.length
          ? `Faltan ${missingRequired.length} pregunta(s) obligatoria(s).`
          : "Hay respuestas con formato inválido.",
      );
      return;
    }
    setConfirmCompleteOpen(true);
  };

  if (interviewQuery.isLoading) {
    return (
      <StateBox isDark={isDark}>
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <p className="mt-3 text-sm">Cargando charla…</p>
      </StateBox>
    );
  }

  if (!interview || interviewQuery.isError) {
    return (
      <StateBox isDark={isDark} error>
        <p className="text-sm font-semibold">No pudimos abrir la charla</p>
        <p className="mt-1 text-xs">{apiErrorMessage(interviewQuery.error)}</p>
        <button
          type="button"
          className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => navigate("/leader")}
        >
          Volver a mis charlas
        </button>
      </StateBox>
    );
  }

  if (interview.status === "ASSIGNED" && canExecute) {
    return (
      <div className="space-y-4">
        <CharlaContextHeader
          interview={interview}
          answers={answers}
          autosaveStatus="idle"
        />
        <StateBox isDark={isDark}>
          <p className="text-sm font-semibold">Charla asignada</p>
          <p className="mt-1 max-w-md text-xs opacity-80">
            Inicia la charla para habilitar el formulario dinámico, el guardado seguro y la navegación por
            secciones de la plantilla.
          </p>
          {actionError && <p className="mt-3 text-sm text-rose-500">{actionError}</p>}
          <button
            type="button"
            disabled={start.isPending}
            onClick={() => start.mutate()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.8)]"
          >
            <Play className="h-4 w-4" />
            {start.isPending ? "Iniciando…" : "Iniciar charla"}
          </button>
        </StateBox>
      </div>
    );
  }

  if (interview.status === "ASSIGNED" && !canExecute) {
    return (
      <div className="space-y-4">
        <CharlaContextHeader interview={interview} answers={answers} autosaveStatus="idle" />
        <StateBox isDark={isDark}>
          <p className="text-sm font-semibold">Charla pendiente de inicio</p>
          <p className="mt-1 text-xs opacity-80">Solo el entrevistador asignado puede iniciar esta charla.</p>
          <button type="button" className="mt-4 text-sm font-semibold text-emerald-600" onClick={() => navigate("/leader")}>
            Volver a mis charlas
          </button>
        </StateBox>
      </div>
    );
  }

  const sectionLabel =
    currentStep?.kind === "section"
      ? `Sección ${currentStep.sectionIndex + 1} de ${Math.max(steps.length - 1, 1)}`
      : "Revisión";

  const canReadIntelligence = access.data?.effectiveCapabilities.includes("intelligence.read") ?? false;

  const headerAutosaveStatus = interview.status === "IN_PROGRESS" ? autosave.status : "idle";

  return (
    <div className="min-w-0 space-y-4">
      <CharlaContextHeader
        interview={interview}
        answers={answers}
        autosaveStatus={headerAutosaveStatus}
        sectionLabel={sectionLabel}
      />

      {(actionError || (interview.status === "IN_PROGRESS" && autosave.status === "error")) && (
        <div
          className={
            isDark
              ? "rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
              : "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          }
        >
          {actionError || autosave.errorMessage || "Error al guardar"}
        </div>
      )}

      <InterviewWizardShell
        navigation={
          <DynamicWizardNavigation
            isFirstStep={stepIndex === 0}
            isReviewStep={currentStep?.kind === "review"}
            canExecute={canExecute && interview.status === "IN_PROGRESS"}
            readOnly={readOnly || interview.status !== "IN_PROGRESS"}
            finishing={finish.isPending}
            onBack={() => goToStep(stepIndex - 1)}
            onNext={() => goToStep(stepIndex + 1)}
            onFinish={handleFinish}
            onBackToInbox={() => navigate("/leader")}
          />
        }
        headerStepper={
          <DynamicWizardStepper
            steps={steps}
            currentStepIndex={stepIndex}
            maxReachedStepIndex={maxReached}
            completedSectionIndexes={completedSectionIndexes}
            onStepClick={goToStep}
          />
        }
      >
        {currentStep?.kind === "section" && (
          <div className="space-y-4">
            <SectionHeader
              title={currentStep.section.title}
              subtitle={currentStep.section.description || undefined}
              step={currentStep.sectionIndex + 1}
              icon={<ClipboardList className="h-4 w-4" />}
            />
            <div className="space-y-3">
              {currentStep.section.questions.map((question, index) => {
                const invalid =
                  highlightInvalid &&
                  ((question.required && missingRequired.some((item) => item.id === question.id)) ||
                    !isQuestionTypeValid(question, answers[question.id]));
                return (
                  <DynamicQuestionField
                    key={question.id}
                    question={question}
                    number={index + 1}
                    value={answers[question.id]}
                    readOnly={readOnly || interview.status !== "IN_PROGRESS"}
                    invalid={invalid}
                    onChange={(value) => markAnswer(question.id, value)}
                  />
                );
              })}
            </div>
            {progress.missingRequired > 0 && (
              <p className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
                Puedes continuar entre secciones con borradores incompletos. Las obligatorias se validan al
                finalizar.
              </p>
            )}
          </div>
        )}

        {currentStep?.kind === "review" && (
          <DynamicCharlaReviewStep
            interview={interview}
            answers={answers}
            observations={observations}
            readOnly={readOnly || interview.status !== "IN_PROGRESS"}
            onObservationsChange={markObservations}
            missingRequiredCount={missingRequired.length}
            onEditSection={goToStep}
            intelligenceAccess={
              interview.status === "COMPLETED" && canReadIntelligence ? (
                <ReviewIntelligenceLink interviewId={interviewId} />
              ) : null
            }
          />
        )}
      </InterviewWizardShell>

      <Modal
        open={confirmCompleteOpen}
        onClose={() => !finish.isPending && setConfirmCompleteOpen(false)}
        title="Finalizar charla"
        description="Se finalizará la charla y quedará en solo lectura. Esta acción requiere tu confirmación explícita."
        className="max-w-lg"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={finish.isPending}
              onClick={() => setConfirmCompleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button loading={finish.isPending} onClick={() => finish.mutate()}>
              Confirmar finalización
            </Button>
          </>
        }
      >
        <p className={isDark ? "text-sm text-slate-300" : "text-sm text-slate-600"}>
          Después de confirmar no podrás modificar las respuestas de esta charla.
        </p>
      </Modal>
    </div>
  );
}

function StateBox({
  children,
  isDark,
  error = false,
}: {
  children: React.ReactNode;
  isDark: boolean;
  error?: boolean;
}) {
  return (
    <div
      className={
        error
          ? isDark
            ? "flex flex-col items-center rounded-2xl border border-rose-400/20 bg-rose-500/10 px-6 py-12 text-center"
            : "flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center"
          : isDark
            ? "flex flex-col items-center rounded-2xl border border-white/10 bg-[#0e1c20]/80 px-6 py-12 text-center text-slate-300"
            : "flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-600"
      }
    >
      {children}
    </div>
  );
}
