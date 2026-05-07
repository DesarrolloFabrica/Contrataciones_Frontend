import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import type { InterviewData } from "../../../../types";
import { darkInputStyles, lightInputStyles } from "../constants";
import type { NormalizedSchool } from "../types";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className={`w-full max-w-4xl rounded-3xl border shadow-2xl ${isDark ? "border-cyan-400/20 bg-[#071019] text-white" : "border-slate-200 bg-white text-slate-900"}`}>
        <div className={`flex items-start justify-between gap-4 border-b px-6 py-5 ${isDark ? "border-white/10" : "border-slate-100"}`}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">Crear candidato</p>
            <h3 className="mt-1 text-xl font-black">Confirma los datos antes de guardar</h3>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              El candidato se creará en backend y quedará seleccionado para continuar.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
          <input className={inputClass} value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value.replace(/\D+/g, ""))} placeholder="Cédula" />
          <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre completo" />
          <input className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Edad" type="number" />
          <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo opcional" type="email" />
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono opcional" />
          <select className={`${inputClass} cursor-pointer`} value={schoolName} onChange={(e) => { setSchoolName(e.target.value); setProgramName(""); }}>
            <option value="">Escuela o coordinación</option>
            {normalizedSchools.map((school) => (
              <option key={school.id ?? school.name} value={school.name}>{school.name}</option>
            ))}
          </select>
          <select className={`${inputClass} cursor-pointer`} value={programName} onChange={(e) => setProgramName(e.target.value)} disabled={!selectedSchool}>
            <option value="">Programa académico</option>
            {(selectedSchool?.programs ?? []).map((program) => (
              <option key={program.id ?? program.name} value={program.name}>{program.name}</option>
            ))}
          </select>
          <div />
          <textarea className={`${inputClass} min-h-[96px] resize-none md:col-span-1`} value={careerSummary} onChange={(e) => setCareerSummary(e.target.value)} placeholder="Resumen profesional" />
          <textarea className={`${inputClass} min-h-[96px] resize-none md:col-span-1`} value={previousExperience} onChange={(e) => setPreviousExperience(e.target.value)} placeholder="Experiencia docente" />
        </div>

        {(localError || error) && (
          <div className="mx-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {localError || error}
          </div>
        )}

        <div className={`flex justify-end gap-3 border-t px-6 py-5 ${isDark ? "border-white/10" : "border-slate-100"}`}>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 hover:text-white">
            Cancelar
          </button>
          <button type="button" onClick={submit} disabled={isSaving} className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_0_24px_-6px_rgba(6,182,212,0.6)] transition hover:brightness-110 disabled:opacity-60">
            {isSaving ? "Guardando..." : "Guardar candidato"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCandidateModal;
