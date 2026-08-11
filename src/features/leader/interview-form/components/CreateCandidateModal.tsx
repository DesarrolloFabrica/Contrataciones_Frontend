import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import type { InterviewData } from "../../../../types";
import { darkInputStyles, lightInputStyles } from "../constants";
import type { NormalizedSchool } from "../types";
import { FormField } from "./FormField";
import { cn } from "../../../../utils/cn";

export type CreateCandidateModalPayload = {
  documentNumber: string;
  fullName: string;
  age: number | null;
  email: string | null;
  phone: string | null;
  schoolId: string;
  schoolName: string;
  programId: string;
  programName: string;
  careerSummary: string;
  previousExperience: string;
};

interface CreateCandidateModalProps {
  open: boolean;
  formData: InterviewData;
  normalizedSchools: NormalizedSchool[];
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (payload: CreateCandidateModalPayload) => void;
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  name,
  isDark,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  name: string;
  isDark: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const inputClass = isDark ? darkInputStyles : lightInputStyles;

  const syncHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 88)}px`;
  }, []);

  useEffect(() => {
    syncHeight();
  }, [value, syncHeight]);

  return (
    <textarea
      ref={ref}
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className={cn(
        inputClass,
        "resize-none overflow-hidden leading-relaxed"
      )}
    />
  );
}

export const CreateCandidateModal: React.FC<CreateCandidateModalProps> = ({
  open,
  formData,
  normalizedSchools,
  isSaving,
  error,
  onClose,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const inputClass = isDark ? darkInputStyles : lightInputStyles;

  const [documentNumber, setDocumentNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [programName, setProgramName] = useState("");
  const [careerSummary, setCareerSummary] = useState("");
  const [previousExperience, setPreviousExperience] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDocumentNumber(formData.documentNumber ?? "");
    setFullName(formData.candidateName ?? "");
    setAge(formData.age ?? "");
    setEmail("");
    setPhone("");
    setSchoolName(formData.school ?? "");
    setProgramName(formData.program ?? "");
    setCareerSummary(formData.careerSummary ?? "");
    setPreviousExperience(formData.previousExperience ?? "");
    setLocalError(null);
  }, [formData, open]);

  const selectedSchool = useMemo(
    () => normalizedSchools.find((school) => school.name === schoolName) ?? null,
    [normalizedSchools, schoolName],
  );

  const selectedProgram = useMemo(
    () => selectedSchool?.programs.find((program) => program.name === programName) ?? null,
    [programName, selectedSchool],
  );

  if (!open) return null;

  const submit = () => {
    const ageNumber = Number(age);
    const parsedAge = Number.isFinite(ageNumber) && ageNumber > 0 ? ageNumber : null;
    if (!documentNumber.trim()) {
      setLocalError("La cédula es obligatoria.");
      return;
    }
    if (!fullName.trim()) {
      setLocalError("El nombre del candidato es obligatorio.");
      return;
    }
    if (!selectedSchool?.id || !selectedProgram?.id) {
      setLocalError("Selecciona escuela/coordinación y programa con IDs válidos del backend.");
      return;
    }

    onConfirm({
      documentNumber: documentNumber.trim(),
      fullName: fullName.trim(),
      age: parsedAge,
      email: email.trim() || null,
      phone: phone.trim() || null,
      schoolId: selectedSchool.id,
      schoolName: selectedSchool.name,
      programId: selectedProgram.id,
      programName: selectedProgram.name,
      careerSummary: careerSummary.trim(),
      previousExperience: previousExperience.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-candidate-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <div
        className={cn(
          "relative flex w-full max-w-3xl max-h-[min(92vh,860px)] flex-col overflow-hidden rounded-2xl border shadow-2xl",
          isDark
            ? "border-[#579689]/20 bg-[#091d22] text-white shadow-black/50"
            : "border-slate-200 bg-white text-slate-900 shadow-slate-300/40"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 sm:py-5",
            isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-slate-100 bg-slate-50/60"
          )}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isDark ? "bg-brand-500/15 text-brand-400" : "bg-brand-50 text-brand-600"
              )}
            >
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.16em]",
                  isDark ? "text-brand-400" : "text-brand-600"
                )}
              >
                Crear candidato
              </p>
              <h3
                id="create-candidate-title"
                className="mt-0.5 text-lg font-semibold tracking-tight sm:text-xl"
              >
                Confirma los datos antes de guardar
              </h3>
              <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                El candidato quedará registrado y seleccionado para continuar el análisis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "shrink-0 rounded-lg border p-2 transition-colors",
              isDark
                ? "border-white/10 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                : "border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — único scroll del modal si hace falta */}
        <div className="modal-scroll flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          <div className="space-y-6">
            <section>
              <h4
                className={cn(
                  "mb-3 text-xs font-semibold uppercase tracking-[0.14em]",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                Datos personales
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Cédula" name="modal-documentNumber">
                  <input
                    id="modal-documentNumber"
                    className={inputClass}
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value.replace(/\D+/g, ""))}
                    placeholder="Ej. 1030123456"
                  />
                </FormField>
                <FormField label="Nombre completo" name="modal-fullName">
                  <input
                    id="modal-fullName"
                    className={inputClass}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nombre del candidato"
                  />
                </FormField>
                <FormField label="Edad" name="modal-age">
                  <input
                    id="modal-age"
                    className={inputClass}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ej. 35"
                    type="number"
                  />
                </FormField>
                <FormField label="Correo (opcional)" name="modal-email">
                  <input
                    id="modal-email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    type="email"
                  />
                </FormField>
                <FormField label="Teléfono (opcional)" name="modal-phone">
                  <input
                    id="modal-phone"
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 3001234567"
                  />
                </FormField>
              </div>
            </section>

            <section>
              <h4
                className={cn(
                  "mb-3 text-xs font-semibold uppercase tracking-[0.14em]",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                Contexto académico
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Escuela o coordinación" name="modal-school">
                  <select
                    id="modal-school"
                    className={cn(inputClass, "cursor-pointer")}
                    value={schoolName}
                    onChange={(e) => {
                      setSchoolName(e.target.value);
                      setProgramName("");
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {normalizedSchools.map((school) => (
                      <option key={school.id ?? school.name} value={school.name}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Programa académico" name="modal-program">
                  <select
                    id="modal-program"
                    className={cn(inputClass, "cursor-pointer")}
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    disabled={!selectedSchool}
                  >
                    <option value="">Seleccionar...</option>
                    {(selectedSchool?.programs ?? []).map((program) => (
                      <option key={program.id ?? program.name} value={program.name}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </section>

            <section>
              <h4
                className={cn(
                  "mb-3 text-xs font-semibold uppercase tracking-[0.14em]",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                Trayectoria profesional
              </h4>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FormField label="Resumen profesional" name="modal-careerSummary">
                  <AutoTextarea
                    name="modal-careerSummary"
                    value={careerSummary}
                    onChange={setCareerSummary}
                    placeholder="Resumen de formación y experiencia..."
                    isDark={isDark}
                  />
                </FormField>
                <FormField label="Experiencia docente" name="modal-previousExperience">
                  <AutoTextarea
                    name="modal-previousExperience"
                    value={previousExperience}
                    onChange={setPreviousExperience}
                    placeholder="Cursos, instituciones, años de experiencia..."
                    isDark={isDark}
                  />
                </FormField>
              </div>
            </section>
          </div>
        </div>

        {(localError || error) && (
          <div
            className={cn(
              "shrink-0 mx-5 mb-0 rounded-xl border px-4 py-3 text-sm sm:mx-6",
              isDark
                ? "border-red-400/30 bg-red-500/10 text-red-200"
                : "border-red-200 bg-red-50 text-red-700"
            )}
          >
            {localError || error}
          </div>
        )}

        {/* Footer */}
        <div
          className={cn(
            "flex shrink-0 flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6",
            isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-slate-100 bg-slate-50/60"
          )}
        >
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors",
              isDark
                ? "border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
            )}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isSaving}
            className={cn(
              "rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-wait disabled:opacity-60",
              isDark
                ? "bg-brand-500 hover:bg-brand-400 shadow-[0_0_20px_-6px_rgba(16,185,129,0.5)]"
                : "bg-brand-600 hover:bg-brand-700 shadow-sm"
            )}
          >
            {isSaving ? "Guardando..." : "Guardar candidato"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCandidateModal;
