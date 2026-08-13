import type { TemplateQuestion, TemplateSection } from "../templates/types";
import type { SelectionInterview } from "./types";

export type DynamicWizardStep =
  | { kind: "section"; section: TemplateSection; sectionIndex: number }
  | { kind: "review" };

export function isAnswerEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

export function orderedSections(interview: SelectionInterview | undefined): TemplateSection[] {
  const sections = interview?.templateSnapshot?.sections ?? [];
  return [...sections].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function buildDynamicWizardSteps(interview: SelectionInterview | undefined): DynamicWizardStep[] {
  const sections = orderedSections(interview).map((section, sectionIndex) => ({
    kind: "section" as const,
    section: {
      ...section,
      questions: [...(section.questions ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    },
    sectionIndex,
  }));
  return [...sections, { kind: "review" }];
}

export function allQuestions(interview: SelectionInterview | undefined): TemplateQuestion[] {
  return orderedSections(interview).flatMap((section) =>
    [...(section.questions ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
  );
}

export function questionOptions(question: TemplateQuestion): string[] {
  return Array.isArray(question.configuration?.options)
    ? question.configuration.options.map(String)
    : [];
}

export function isQuestionAnswered(question: TemplateQuestion, value: unknown): boolean {
  return !isAnswerEmpty(value);
}

/** Valor legible para el paso Revisión (sin IDs ni metadatos internos). */
export function formatAnswerDisplay(question: TemplateQuestion, value: unknown): string {
  if (isAnswerEmpty(value)) return "";
  switch (question.type) {
    case "BOOLEAN":
      return value === true ? "Sí" : value === false ? "No" : String(value);
    case "MULTI_SELECT":
      return Array.isArray(value) ? value.map(String).join(", ") : String(value);
    case "NUMBER":
    case "SCALE":
      return String(value);
    case "SHORT_TEXT":
    case "LONG_TEXT":
    case "SINGLE_SELECT":
      return String(value);
    default:
      return String(value);
  }
}

export function isQuestionTypeValid(question: TemplateQuestion, value: unknown): boolean {
  if (isAnswerEmpty(value)) return true;
  switch (question.type) {
    case "SHORT_TEXT":
    case "LONG_TEXT":
      return typeof value === "string";
    case "NUMBER":
      return typeof value === "number" && Number.isFinite(value);
    case "BOOLEAN":
      return typeof value === "boolean";
    case "SINGLE_SELECT":
      return typeof value === "string" && questionOptions(question).includes(value);
    case "MULTI_SELECT":
      return (
        Array.isArray(value) &&
        value.every((item) => typeof item === "string" && questionOptions(question).includes(item)) &&
        new Set(value).size === value.length
      );
    case "SCALE": {
      if (typeof value !== "number" || !Number.isFinite(value)) return false;
      const min = Number(question.configuration.min);
      const max = Number(question.configuration.max);
      const step = Number(question.configuration.step ?? 1);
      if (value < min || value > max) return false;
      return Math.abs((value - min) / step - Math.round((value - min) / step)) <= 1e-9;
    }
    default:
      return true;
  }
}

export function missingRequiredQuestions(
  interview: SelectionInterview | undefined,
  answers: Record<string, unknown>,
): TemplateQuestion[] {
  return allQuestions(interview).filter(
    (question) => question.required && isAnswerEmpty(answers[question.id]),
  );
}

export function invalidAnsweredQuestions(
  interview: SelectionInterview | undefined,
  answers: Record<string, unknown>,
): TemplateQuestion[] {
  return allQuestions(interview).filter(
    (question) => !isAnswerEmpty(answers[question.id]) && !isQuestionTypeValid(question, answers[question.id]),
  );
}

export function computeCharlaProgress(
  interview: SelectionInterview | undefined,
  answers: Record<string, unknown>,
) {
  const questions = allQuestions(interview);
  const required = questions.filter((question) => question.required);
  const answered = questions.filter((question) => isQuestionAnswered(question, answers[question.id]));
  const requiredAnswered = required.filter((question) => isQuestionAnswered(question, answers[question.id]));
  const missingRequired = required.length - requiredAnswered.length;
  return {
    total: questions.length,
    answered: answered.length,
    requiredTotal: required.length,
    requiredAnswered: requiredAnswered.length,
    missingRequired,
    percent: questions.length ? Math.round((answered.length / questions.length) * 100) : 0,
  };
}

export function sectionIsComplete(
  section: TemplateSection,
  answers: Record<string, unknown>,
): boolean {
  const required = (section.questions ?? []).filter((question) => question.required);
  if (!required.length) {
    return (section.questions ?? []).every((question) => isQuestionAnswered(question, answers[question.id]));
  }
  return required.every((question) => isQuestionAnswered(question, answers[question.id]));
}

export function findFirstInvalidStepIndex(
  steps: DynamicWizardStep[],
  answers: Record<string, unknown>,
): number {
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    if (step.kind !== "section") continue;
    const bad = (step.section.questions ?? []).some(
      (question) =>
        (question.required && isAnswerEmpty(answers[question.id])) ||
        (!isAnswerEmpty(answers[question.id]) && !isQuestionTypeValid(question, answers[question.id])),
    );
    if (bad) return index;
  }
  return Math.max(0, steps.length - 1);
}
