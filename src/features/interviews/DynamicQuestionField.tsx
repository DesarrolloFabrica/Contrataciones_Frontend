import type { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FormField } from "../leader/interview-form/components/FormField";
import { SelectInput } from "../leader/interview-form/components/SelectInput";
import { TextArea } from "../leader/interview-form/components/TextArea";
import { TextInput } from "../leader/interview-form/components/TextInput";
import { cn } from "../../utils/cn";
import type { TemplateQuestion } from "../templates/types";
import { questionOptions } from "./dynamicWizardSteps";

type Props = {
  question: TemplateQuestion;
  number: number;
  value: unknown;
  readOnly: boolean;
  invalid?: boolean;
  onChange: (value: unknown) => void;
};

export function DynamicQuestionField({
  question,
  number,
  value,
  readOnly,
  invalid = false,
  onChange,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const inputId = `charla-q-${question.id}`;
  const options = questionOptions(question);
  const label = (
    <>
      {number}. {question.prompt}
      {question.required ? <span className={cn("ml-1", isDark ? "text-rose-300" : "text-rose-600")}>*</span> : null}
    </>
  );

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        invalid
          ? isDark
            ? "border-rose-400/40 bg-rose-500/10"
            : "border-rose-300 bg-rose-50"
          : isDark
            ? "border-white/[0.06] bg-white/[0.02]"
            : "border-slate-200 bg-slate-50/40",
      )}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        {question.competency && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700",
            )}
          >
            {question.competency}
          </span>
        )}
      </div>

      <FormField label={typeof label === "string" ? label : `${number}. ${question.prompt}${question.required ? " *" : ""}`} name={inputId}>
        {question.helpText && (
          <p className={cn("-mt-1 mb-2 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{question.helpText}</p>
        )}

        {question.type === "LONG_TEXT" ? (
          <TextArea
            name={inputId}
            rows={4}
            disabled={readOnly}
            value={String(value ?? "")}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Escribe la respuesta…"
          />
        ) : question.type === "SHORT_TEXT" ? (
          <TextInput
            name={inputId}
            disabled={readOnly}
            required={false}
            value={String(value ?? "")}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Respuesta corta"
          />
        ) : question.type === "NUMBER" ? (
          <TextInput
            name={inputId}
            type="number"
            disabled={readOnly}
            required={false}
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(event) =>
              onChange(event.target.value === "" ? null : Number(event.target.value))
            }
          />
        ) : question.type === "BOOLEAN" ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label={`${number}. ${question.prompt}`}>
            <Choice active={value === true} disabled={readOnly} isDark={isDark} onClick={() => onChange(true)}>
              Sí
            </Choice>
            <Choice active={value === false} disabled={readOnly} isDark={isDark} onClick={() => onChange(false)}>
              No
            </Choice>
          </div>
        ) : question.type === "SINGLE_SELECT" ? (
          <SelectInput
            name={inputId}
            disabled={readOnly}
            value={String(value ?? "")}
            placeholder="Selecciona…"
            onChange={(event) => onChange(event.target.value)}
            options={options.map((option) => ({ value: option, label: option }))}
          />
        ) : question.type === "MULTI_SELECT" ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label={`${number}. ${question.prompt}`}>
            {options.map((option) => {
              const selected = Array.isArray(value) && value.includes(option);
              return (
                <Choice
                  key={option}
                  active={selected}
                  disabled={readOnly}
                  isDark={isDark}
                  onClick={() =>
                    onChange(
                      selected
                        ? (value as string[]).filter((item) => item !== option)
                        : [...(Array.isArray(value) ? value : []), option],
                    )
                  }
                >
                  {option}
                </Choice>
              );
            })}
          </div>
        ) : question.type === "SCALE" ? (
          <div className="space-y-2">
            <input
              id={inputId}
              className="w-full accent-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              disabled={readOnly}
              type="range"
              min={Number(question.configuration.min)}
              max={Number(question.configuration.max)}
              step={Number(question.configuration.step ?? 1)}
              value={Number(value ?? question.configuration.min)}
              aria-label={`${number}. ${question.prompt}`}
              aria-valuemin={Number(question.configuration.min)}
              aria-valuemax={Number(question.configuration.max)}
              aria-valuenow={Number(value ?? question.configuration.min)}
              onChange={(event) => onChange(Number(event.target.value))}
            />
            <div className={cn("flex justify-between text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
              <span>{String(question.configuration.minLabel ?? question.configuration.min)}</span>
              <strong className="text-emerald-600 dark:text-emerald-300">
                {value === undefined || value === null ? "Sin responder" : String(value)}
              </strong>
              <span>{String(question.configuration.maxLabel ?? question.configuration.max)}</span>
            </div>
          </div>
        ) : (
          <TextInput
            name={inputId}
            disabled={readOnly}
            required={false}
            value={String(value ?? "")}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </FormField>
    </div>
  );
}

function Choice({
  children,
  active,
  disabled,
  isDark,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  disabled: boolean;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3.5 py-2 text-sm font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        active
          ? isDark
            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
            : "border-emerald-300 bg-emerald-50 text-emerald-800"
          : isDark
            ? "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {children}
    </button>
  );
}
