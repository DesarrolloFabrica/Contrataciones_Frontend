import React from "react";
import { User } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { TextInput } from "./TextInput";
import { SelectInput } from "./SelectInput";
import { CandidateLookupPanel } from "./CandidateLookupPanel";
import { ExperienceSection } from "./ExperienceSection";
import { MIN_CC_LENGTH, MAX_CC_LENGTH } from "../constants";
import type { NormalizedSchool, TeacherCandidateSearchItemDto, InterviewFormChangeHandler } from "../types";
import type { InterviewData } from "../../../../types";

interface IdentitySectionProps {
  formData: InterviewData;
  isCedulaValid: boolean;
  normalizedSchools: NormalizedSchool[];
  availablePrograms: string[];
  schoolsLoading: boolean;
  isLeader: boolean;
  leaderSchoolId: string | null;
  isSearching: boolean;
  lookupError: string | null;
  candidateMatches: TeacherCandidateSearchItemDto[];
  selectedCandidateId: string | null;
  isCreatingCandidate: boolean;
  canCreateCandidate: boolean;
  missingScopeForCreate: boolean;
  onChange: InterviewFormChangeHandler;
  onPickCandidate: (c: TeacherCandidateSearchItemDto) => void;
  onCreateCandidate: () => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
  formData,
  isCedulaValid,
  normalizedSchools,
  availablePrograms,
  schoolsLoading,
  isLeader,
  leaderSchoolId,
  isSearching,
  lookupError,
  candidateMatches,
  selectedCandidateId,
  isCreatingCandidate,
  canCreateCandidate,
  missingScopeForCreate,
  onChange,
  onPickCandidate,
  onCreateCandidate,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <FormSection
      title="Identidad y Trayectoria"
      icon={<User className="w-6 h-6" />}
      step={1}
      subtitle="Recoge los datos básicos del candidato y su trayectoria profesional."
    >
      <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
        <div className="md:col-span-2">
          <FormField label="Cédula (CC)" name="documentNumber">
            <div className="relative">
              <input
                value={formData.documentNumber}
                onChange={onChange}
                name="documentNumber"
                placeholder="Ej. 1030123456"
                className={`rounded-xl px-4 py-3 outline-none ${
                  isDark ? "w-full bg-[#07090B] border border-white/[0.10] text-gray-200 text-sm rounded-xl px-4 py-3.5 outline-none transition-all duration-300 placeholder:text-gray-500 focus:bg-[#0F1216] focus:border-emerald-500/25 focus:ring-1 focus:ring-emerald-500/20 focus:shadow-[0_0_18px_-10px_rgba(16,185,129,0.14)] hover:border-white/[0.14] hover:bg-[#0C0F12]" : "w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3.5 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.20)] hover:border-slate-300"
                }`}
              />

              {formData.documentNumber?.trim() && !isCedulaValid && (
                <p className="mt-1 text-xs text-red-400">
                  La cédula debe tener entre {MIN_CC_LENGTH} y{" "}
                  {MAX_CC_LENGTH} números.
                </p>
              )}

              <div
                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                  isDark ? "text-white/35" : "text-slate-400"
                }`}
              >
                {isSearching ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>

            <CandidateLookupPanel
              isSearching={isSearching}
              lookupError={lookupError}
              candidateMatches={candidateMatches}
              selectedCandidateId={selectedCandidateId}
              onPickCandidate={onPickCandidate}
            />
          </FormField>
        </div>

        <div className="md:col-span-3">
          <FormField label="Nombre del Candidato" name="candidateName">
            <TextInput
              name="candidateName"
              value={formData.candidateName}
              onChange={onChange}
              placeholder="Ingrese nombre completo"
            />
          </FormField>
        </div>

        <div className="md:col-span-1">
          <FormField label="Edad" name="age">
            <TextInput
              name="age"
              value={formData.age}
              onChange={onChange}
              type="number"
              placeholder="Ej. 35"
            />
          </FormField>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Escuela o Coordinación" name="school">
          <SelectInput
            name="school"
            value={formData.school}
            onChange={onChange}
            options={normalizedSchools.map((s) => ({
              value: s.name,
              label: s.name,
            }))}
            placeholder={
              schoolsLoading
                ? "Cargando escuelas..."
                : "Seleccione una opción..."
            }
            disabled={schoolsLoading || (isLeader && !!leaderSchoolId)}
          />
        </FormField>

        <FormField label="Programa Académico" name="program">
          <SelectInput
            name="program"
            value={formData.program}
            onChange={onChange}
            options={availablePrograms.map((p) => ({
              value: p,
              label: p,
            }))}
            disabled={!formData.school || availablePrograms.length === 0}
            placeholder={
              !formData.school
                ? "Requiere seleccionar escuela"
                : availablePrograms.length === 0
                ? "No hay programas para esta escuela"
                : "Seleccione el programa..."
            }
          />
        </FormField>
      </div>

      {!selectedCandidateId && (
        <div className="space-y-2">
          {missingScopeForCreate &&
            (formData.documentNumber?.trim()?.length ?? 0) >= 3 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-2 text-xs text-white/60">
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Selecciona escuela y programa para poder crear el
                  candidato con IDs.
                </span>
              </div>
            )}

          {canCreateCandidate && (
            <div className="rounded-2xl border border-sky-500/35 bg-sky-950/15 px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sky-200/90 font-semibold">
                  {(
                    formData.candidateName || "Nuevo candidato"
                  ).toUpperCase()}
                </div>
                <div className="text-[11px] text-white/45 font-mono">
                  CC: {formData.documentNumber}
                </div>
                <div className="text-[11px] text-white/45 mt-1">
                  {formData.school} · {formData.program}
                </div>
              </div>

              <button
                type="button"
                onClick={onCreateCandidate}
                disabled={isCreatingCandidate}
                className="px-4 py-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-200 text-[11px] font-extrabold uppercase tracking-[0.22em] hover:bg-emerald-500/15 transition disabled:opacity-60 disabled:cursor-wait"
              >
                {isCreatingCandidate ? "Creando..." : "Crear candidato"}
              </button>
            </div>
          )}
        </div>
      )}

      <ExperienceSection
        formData={formData}
        onChange={onChange}
      />
    </FormSection>
  );
};

export default IdentitySection;
