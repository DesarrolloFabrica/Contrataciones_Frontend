import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import { formatDate } from "../vacancies/formatters";
import {
  computeCharlaProgress,
  formatAnswerDisplay,
  isAnswerEmpty,
  orderedSections,
  sectionIsComplete,
} from "./dynamicWizardSteps";
import type { SelectionInterview } from "./types";
import { interviewStatusLabel } from "./types";

type Props = {
  interview: SelectionInterview;
  answers: Record<string, unknown>;
  observations: string;
  readOnly: boolean;
  onObservationsChange: (value: string) => void;
  missingRequiredCount: number;
  onEditSection?: (sectionIndex: number) => void;
  intelligenceAccess?: React.ReactNode;
};

export function DynamicCharlaReviewStep({
  interview,
  answers,
  observations,
  readOnly,
  onObservationsChange,
  missingRequiredCount,
  onEditSection,
  intelligenceAccess,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sections = orderedSections(interview).map((section) => ({
    ...section,
    questions: [...(section.questions ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
  }));
  const progress = computeCharlaProgress(interview, answers);
  const vacancy = interview.application.selectionProcess.vacancyReference;

  return (
    <div className="min-w-0 space-y-4">
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <Panel isDark={isDark} title="Contexto">
          <Item label="Candidato" value={interview.application.candidate.fullName} />
          <Item label="Cargo" value={vacancy.positionName} />
          <Item label="Área" value={vacancy.areaName || "No informada"} />
          <Item
            label="Plantilla"
            value={`${interview.templateSnapshot.templateName} · v${interview.templateSnapshot.versionNumber}`}
          />
        </Panel>
        <Panel isDark={isDark} title="Estado de la charla">
          <Item label="Estado" value={interviewStatusLabel[interview.status]} />
          <Item label="Progreso" value={`${progress.answered} de ${progress.total} respondidas`} />
          <Item label="Obligatorias" value={`${progress.requiredAnswered} de ${progress.requiredTotal}`} />
          {interview.completedAt && <Item label="Finalizada" value={formatDate(interview.completedAt)} />}
        </Panel>
      </div>

      {sections.map((section, index) => {
        const complete = sectionIsComplete(section, answers);
        return (
          <Panel key={section.id} isDark={isDark} title={`Sección ${index + 1}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h5 className={cn("text-sm font-semibold", isDark ? "text-slate-100" : "text-slate-800")}>
                {section.title}
              </h5>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold",
                    complete
                      ? "text-emerald-600 dark:text-emerald-300"
                      : "text-amber-600 dark:text-amber-300",
                  )}
                >
                  {complete ? "Completa" : "Pendiente"}
                </span>
                {!readOnly && onEditSection && (
                  <button
                    type="button"
                    onClick={() => onEditSection(index)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                      isDark
                        ? "text-emerald-300 hover:bg-emerald-500/10"
                        : "text-emerald-700 hover:bg-emerald-50",
                    )}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {section.questions.map((question, qIndex) => {
                const value = answers[question.id];
                const pending = isAnswerEmpty(value);
                const display = formatAnswerDisplay(question, value);
                return (
                  <div
                    key={question.id}
                    className={cn(
                      "min-w-0 overflow-hidden rounded-lg border px-3 py-2.5",
                      isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white",
                    )}
                  >
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                      <p className={cn("min-w-0 break-words text-sm font-medium", isDark ? "text-slate-200" : "text-slate-800")}>
                        {qIndex + 1}. {question.prompt}
                        {question.required ? (
                          <span className={cn("ml-1", isDark ? "text-rose-300" : "text-rose-600")}>*</span>
                        ) : null}
                      </p>
                      {pending && (
                        <span className="shrink-0 text-[11px] font-semibold text-amber-600 dark:text-amber-300">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "mt-1.5 break-words whitespace-pre-wrap text-sm",
                        pending
                          ? isDark
                            ? "text-slate-500 italic"
                            : "text-slate-400 italic"
                          : isDark
                            ? "text-slate-300"
                            : "text-slate-700",
                      )}
                    >
                      {pending ? "Sin responder" : display}
                    </p>
                  </div>
                );
              })}
            </div>
          </Panel>
        );
      })}

      {missingRequiredCount > 0 && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            isDark
              ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
              : "border-amber-200 bg-amber-50 text-amber-800",
          )}
        >
          Faltan {missingRequiredCount} pregunta{missingRequiredCount === 1 ? "" : "s"} obligatoria
          {missingRequiredCount === 1 ? "" : "s"} antes de finalizar.
        </div>
      )}

      <Panel isDark={isDark} title="Observaciones generales">
        <textarea
          disabled={readOnly}
          rows={4}
          value={observations}
          onChange={(event) => onObservationsChange(event.target.value)}
          placeholder="Registra observaciones globales de la charla"
          className={cn(
            "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition",
            isDark
              ? "border-white/10 bg-[#132328] text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/15"
              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15",
            readOnly && "opacity-70",
          )}
        />
      </Panel>

      {intelligenceAccess}

      {!readOnly && (
        <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
          Al finalizar no podrás modificar las respuestas. El análisis IA, si aplica, es independiente de la
          decisión humana de selección.
        </p>
      )}
    </div>
  );
}

function Panel({
  isDark,
  title,
  children,
}: {
  isDark: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border p-4",
        isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-slate-50/50",
      )}
    >
      <h4
        className={cn(
          "mb-3 text-[11px] font-bold uppercase tracking-[0.14em]",
          isDark ? "text-emerald-300" : "text-emerald-700",
        )}
      >
        {title}
      </h4>
      <div className="min-w-0 space-y-3">{children}</div>
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
        {value && value.trim() ? value : "—"}
      </p>
    </div>
  );
}
