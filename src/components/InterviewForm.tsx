// src/components/InterviewForm.tsx
// ✅ Ajustado: búsqueda por CC (autocomplete) + botón "Crear candidato" si no hay coincidencias.

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  User,
  Clock,
  Users,
  Bot,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  BrainCircuit,
  Loader2,
  Search,
} from "lucide-react";
import type { InterviewData } from "../types";
import { schools } from "../data/schools";
import { approvedExample, mediumExample, rejectedExample } from "../data/exampleData";

import {
  createTeacherCandidate,
  searchTeacherCandidates,
  type TeacherCandidateSearchItemDto,
} from "../services/teachersService";

interface InterviewFormProps {
  onSubmit: (data: InterviewData) => void;
}

const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

const initialFormData: InterviewData = {
  documentNumber: "",
  candidateName: "",
  age: "",
  school: "",
  program: "",
  careerSummary: "",
  previousExperience: "",
  availabilityDetails: "",
  acceptsCommittees: "Sí",
  otherJobs: "",
  evaluationMethodology: "",
  failureRatePlan: "",
  apatheticStudentPlan: "",
  aiToolsUsage: "",
  ethicalAiMeasures: "",
  aiPlagiarismPrevention: "",
  scenario29: "",
  scenarioCoverage: "",
  scenarioFeedback: "",
};

// ---------------------------------------------------------------------
// ✅ AJUSTE VISUAL (sin tocar lógica)
// Objetivo: que las tarjetas NO se mezclen con el fondo #020202.
// Aplicamos “Premium neutro”:
// - Tarjeta: grafito (#0B0D0F) con leve transparencia + blur
// - Borde/ring: blancos sutiles, verde solo como acento (hover/focus)
// - Glow interno: blanco MUY suave + emerald MUY suave (sin teñir toda la card)
// ---------------------------------------------------------------------

// --- COMPONENTES VISUALES AVANZADOS ---

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = React.memo(
  ({ title, icon }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="relative group">
        {/* Glow más neutro (menos “verde pintado”) */}
        <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-10 group-hover:opacity-18 transition-opacity duration-500" />
        <div className="relative p-3 rounded-2xl bg-[#0E1115] border border-white/10 text-emerald-400 shadow-lg">
          {icon}
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500/50 to-transparent mt-2 rounded-full" />
      </div>
    </div>
  )
);

const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = React.memo(({ title, icon, children }) => (
  <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.08] to-transparent transition-all duration-500 hover:from-emerald-500/30">
    <div className="relative bg-[#050505] p-6 md:p-10 rounded-3xl overflow-hidden h-full">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-700" />
      <SectionHeader title={title} icon={icon} />
      <div className="space-y-8 relative z-10">{children}</div>
    </div>
  </div>
));

const FormField: React.FC<{
  label: string;
  name: string;
  children: React.ReactNode;
}> = React.memo(({ label, name, children }) => (
  <div className="flex flex-col gap-3 group">
    <label
      htmlFor={name}
      className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400 group-focus-within:text-emerald-400 transition-colors duration-300 ml-1"
    >
      {label}
    </label>
    {children}
  </div>
));

const baseInputStyles =
  "w-full bg-[#07090B] border border-white/[0.10] text-gray-200 text-sm rounded-xl px-4 py-3.5 outline-none transition-all duration-300 placeholder:text-gray-500 focus:bg-[#0F1216] focus:border-emerald-500/25 focus:ring-1 focus:ring-emerald-500/20 focus:shadow-[0_0_18px_-10px_rgba(16,185,129,0.14)] hover:border-white/[0.14] hover:bg-[#0C0F12]";

const TextInput: React.FC<{
  name: keyof InterviewData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
}> = ({ name, value, onChange, type = "text", placeholder, required = true, inputMode, pattern }) => (
  <input
    type={type}
    id={name}
    name={name}
    value={value}
    onChange={onChange}
    className={baseInputStyles}
    placeholder={placeholder}
    required={required}
    autoComplete="off"
    inputMode={inputMode}
    pattern={pattern}
  />
);

const TextArea: React.FC<{
  name: keyof InterviewData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
}> = ({ name, value, onChange, rows = 3, placeholder }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`${baseInputStyles} resize-none leading-relaxed overflow-hidden min-h-[80px]`}
      placeholder={placeholder}
      required
    />
  );
};

const SelectInput: React.FC<{
  name: keyof InterviewData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}> = ({ name, value, onChange, options, disabled, placeholder }) => (
  <div className="relative group/select">
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`${baseInputStyles} appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10`}
      required
      disabled={disabled}
    >
      {placeholder && (
        <option value="" disabled className="text-gray-500">
          {placeholder}
        </option>
      )}

      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#1a1a1a] py-2">
          {opt.label}
        </option>
      ))}
    </select>

    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-600 group-focus-within/select:text-emerald-400 transition-colors">
      <ChevronDown className="w-4 h-4" />
    </div>
  </div>
);

// --- Componente Principal ---

const InterviewForm: React.FC<InterviewFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<InterviewData>(initialFormData);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);

  // ✅ Candidate lookup por CC
  const [candidateMatches, setCandidateMatches] = useState<TeacherCandidateSearchItemDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);

  const searchSeq = useRef(0);

  useEffect(() => {
    if (formData.school) {
      const selectedSchool = schools.find((s) => s.name === formData.school);
      setAvailablePrograms(selectedSchool ? selectedSchool.programs : []);
      if (selectedSchool && !selectedSchool.programs.includes(formData.program)) {
        setFormData((prev) => ({ ...prev, program: "" }));
      }
    } else {
      setAvailablePrograms([]);
    }
  }, [formData.school, formData.program]);

  // ✅ búsqueda debounced por CC
  useEffect(() => {
    const cc = (formData.documentNumber ?? "").trim();

    // si cambia CC, invalidamos selección
    setSelectedCandidateId(null);

    // UX: no buscar hasta tener mínimo 3 dígitos
    if (!cc || cc.length < 3) {
      setCandidateMatches([]);
      setLookupError(null);
      setIsSearching(false);
      return;
    }

    const mySeq = ++searchSeq.current;
    setIsSearching(true);
    setLookupError(null);

    const t = window.setTimeout(async () => {
      try {
        const rows = await searchTeacherCandidates({ orgId: ORG_ID, q: cc, limit: 8 });
        if (mySeq !== searchSeq.current) return; // evita respuestas viejas
        setCandidateMatches(rows ?? []);
      } catch (e: any) {
        if (mySeq !== searchSeq.current) return;
        setCandidateMatches([]);
        setLookupError(e?.message ?? "No se pudo buscar candidatos.");
      } finally {
        if (mySeq === searchSeq.current) setIsSearching(false);
      }
    }, 280);

    return () => window.clearTimeout(t);
  }, [formData.documentNumber]);

  const handleChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
        | React.ChangeEvent<HTMLSelectElement>
    ) => {
      const { name, value } = e.target;

      if (name === "documentNumber") {
        const onlyDigits = value.replace(/\D+/g, "");
        setFormData((prev) => ({ ...prev, documentNumber: onlyDigits }));
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value } as InterviewData));
    },
    []
  );

  const handlePickCandidate = useCallback((c: TeacherCandidateSearchItemDto) => {
    setSelectedCandidateId(c.id);

    // rellena datos básicos (sin tocar school/program del form)
    setFormData((prev) => ({
      ...prev,
      documentNumber: String(c.documentNumber ?? prev.documentNumber ?? ""),
      candidateName: c.fullName ?? prev.candidateName,
      age: typeof c.age === "number" && !Number.isNaN(c.age) ? String(c.age) : prev.age,
    }));

    setCandidateMatches([]); // cierra lista
    setLookupError(null);
  }, []);

  const canCreateCandidate =
    !!formData.documentNumber?.trim() &&
    formData.documentNumber.trim().length >= 3 &&
    !isSearching &&
    (candidateMatches?.length ?? 0) === 0;

  const handleCreateCandidate = useCallback(async () => {
    if (!canCreateCandidate) return;

    const documentNumber = formData.documentNumber.trim();
    const fullName = (formData.candidateName ?? "").trim();

    if (!fullName) {
      setLookupError("Escribe el nombre del candidato para crearlo.");
      return;
    }

    setIsCreatingCandidate(true);
    setLookupError(null);

    try {
      const ageNum = Number(formData.age);
      const age = Number.isFinite(ageNum) && ageNum > 0 ? ageNum : null;

      const created = await createTeacherCandidate({
        orgId: ORG_ID,
        documentNumber,
        fullName,
        age,
      });

      setSelectedCandidateId(created.id);
      setCandidateMatches([]);

      setFormData((prev) => ({
        ...prev,
        documentNumber,
        candidateName: fullName,
      }));
    } catch (e: any) {
      setLookupError(e?.message ?? "No se pudo crear el candidato.");
    } finally {
      setIsCreatingCandidate(false);
    }
  }, [canCreateCandidate, formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ si tu InterviewData NO trae candidateId tipado, lo enviamos como campo extra (no rompe UI)
    onSubmit({ ...(formData as any), candidateId: selectedCandidateId } as any);
  };

  const loadExample = (example: InterviewData) => {
    setSelectedCandidateId(null);
    setCandidateMatches([]);
    setLookupError(null);
    setFormData(example);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setSelectedCandidateId(null);
    setCandidateMatches([]);
    setLookupError(null);
    setFormData(initialFormData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full bg-[#020202] text-gray-200 selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-16">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
            <BrainCircuit className="w-4 h-4" />
            <span>Sistema Inteligente</span>
          </div>

          <div className="relative space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1]">
              Evaluación de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Talento Docente
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-400 font-light leading-relaxed">
              Utiliza nuestra IA para analizar la coherencia pedagógica, ética y técnica de los
              candidatos en tiempo real.
            </p>
          </div>
        </header>

        <div className="sticky top-4 z-50 flex justify-center">
          <div className="bg-[#0A0A0A]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl flex flex-wrap justify-center gap-1">
            <button
              type="button"
              onClick={() => loadExample(approvedExample)}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Perfil Aprobado</span>
            </button>
            <div className="w-px h-6 bg-white/5 self-center mx-1"></div>
            <button
              type="button"
              onClick={() => loadExample(mediumExample)}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              <AlertCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Perfil Medio</span>
            </button>
            <div className="w-px h-6 bg-white/5 self-center mx-1"></div>
            <button
              type="button"
              onClick={() => loadExample(rejectedExample)}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <XCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Perfil Rechazado</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <FormSection title="Identidad y Trayectoria" icon={<User className="w-6 h-6" />}>
            {/* ✅ CC + Nombre + Edad */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
              <div className="md:col-span-2">
                <FormField label="Cédula (CC)" name="documentNumber">
                  <div className="relative">
                    <TextInput
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleChange}
                      placeholder="Ej. 1030123456"
                      inputMode="numeric"
                      pattern="[0-9]+"
                    />

                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/35">
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* ✅ RESULTADOS / CREAR */}
                  <div className="mt-3 space-y-2">
                    {lookupError && (
                      <div className="rounded-xl border border-rose-500/25 bg-rose-950/30 px-4 py-3 text-xs text-rose-200">
                        {lookupError}
                      </div>
                    )}

                    {candidateMatches.length > 0 && (
                      <div className="rounded-2xl border border-emerald-500/25 bg-[#061015] overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10 text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-200/80">
                          Coincidencias por cédula
                        </div>

                        <div className="divide-y divide-white/10">
                          {candidateMatches.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handlePickCandidate(c)}
                              className="w-full text-left px-4 py-3 hover:bg-white/[0.04] transition"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm text-white/85 font-semibold">{c.fullName}</div>
                                  <div className="text-[11px] text-white/45 font-mono">
                                    CC: {c.documentNumber ?? "—"}
                                    {typeof c.age === "number" ? ` · ${c.age} años` : ""}
                                  </div>
                                </div>

                                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-300/80">
                                  Seleccionar
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {canCreateCandidate && (
                      <div className="rounded-2xl border border-sky-500/35 bg-sky-950/15 px-4 py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sky-200/90 font-semibold">
                            {(formData.candidateName || "Nuevo candidato").toUpperCase()}
                          </div>
                          <div className="text-[11px] text-white/45 font-mono">CC: {formData.documentNumber}</div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCreateCandidate}
                          disabled={isCreatingCandidate}
                          className="px-4 py-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-200 text-[11px] font-extrabold uppercase tracking-[0.22em] hover:bg-emerald-500/15 transition disabled:opacity-60 disabled:cursor-wait"
                        >
                          {isCreatingCandidate ? "Creando..." : "Crear candidato"}
                        </button>
                      </div>
                    )}

                    {selectedCandidateId && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200/80">
                        Candidato seleccionado
                      </div>
                    )}
                  </div>
                </FormField>
              </div>

              <div className="md:col-span-3">
                <FormField label="Nombre del Candidato" name="candidateName">
                  <TextInput
                    name="candidateName"
                    value={formData.candidateName}
                    onChange={handleChange}
                    placeholder="Ingrese nombre completo"
                  />
                </FormField>
              </div>

              <div className="md:col-span-1">
                <FormField label="Edad" name="age">
                  <TextInput name="age" value={formData.age} onChange={handleChange} type="number" placeholder="Ej. 35" />
                </FormField>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Escuela o Coordinación" name="school">
                <SelectInput
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  options={schools.map((s) => ({ value: s.name, label: s.name }))}
                  placeholder="Seleccione una opción..."
                />
              </FormField>
              <FormField label="Programa Académico" name="program">
                <SelectInput
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  options={availablePrograms.map((p) => ({ value: p, label: p }))}
                  disabled={!formData.school}
                  placeholder={formData.school ? "Seleccione el programa..." : "Requiere seleccionar escuela"}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Resumen Profesional" name="careerSummary">
                <TextArea
                  name="careerSummary"
                  value={formData.careerSummary}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describa la trayectoria y aspiraciones del candidato..."
                />
              </FormField>
              <FormField label="Experiencia Docente" name="previousExperience">
                <TextArea
                  name="previousExperience"
                  value={formData.previousExperience}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Instituciones previas, materias impartidas y logros..."
                />
              </FormField>
            </div>
          </FormSection>

          {/* Resto del formulario (sin cambios) */}
          <FormSection title="Disponibilidad y Compromiso" icon={<Clock className="w-6 h-6" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <FormField label="Horario Disponible" name="availabilityDetails">
                  <TextInput
                    name="availabilityDetails"
                    value={formData.availabilityDetails}
                    onChange={handleChange}
                    placeholder="Ej. Lunes a Viernes (18:00 - 22:00)"
                  />
                </FormField>
              </div>

              <div className="md:col-span-1">
                <FormField label="Disposición a Comités" name="acceptsCommittees">
                  <SelectInput
                    name="acceptsCommittees"
                    value={formData.acceptsCommittees}
                    onChange={handleChange}
                    options={[
                      { value: "Sí", label: "Totalmente disponible" },
                      { value: "No", label: "No disponible" },
                      { value: "Depende", label: "Condicionado" },
                    ]}
                  />
                </FormField>
              </div>
            </div>

            <FormField label="Conflictos de Interés / Otros Empleos" name="otherJobs">
              <TextArea
                name="otherJobs"
                value={formData.otherJobs}
                onChange={handleChange}
                rows={2}
                placeholder="Detalle otros compromisos laborales actuales..."
              />
            </FormField>
          </FormSection>

          <FormSection title="Estrategia Pedagógica" icon={<Users className="w-6 h-6" />}>
            <FormField label="Metodología de Evaluación" name="evaluationMethodology">
              <TextArea
                name="evaluationMethodology"
                value={formData.evaluationMethodology}
                onChange={handleChange}
                placeholder="Describa instrumentos, rúbricas y criterios de evaluación..."
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Plan de Retención (Alto Fracaso)" name="failureRatePlan">
                <TextArea
                  name="failureRatePlan"
                  value={formData.failureRatePlan}
                  onChange={handleChange}
                  placeholder="Estrategia ante un 50% de reprobación..."
                />
              </FormField>
              <FormField label="Manejo de Estudiantes Difíciles" name="apatheticStudentPlan">
                <TextArea
                  name="apatheticStudentPlan"
                  value={formData.apatheticStudentPlan}
                  onChange={handleChange}
                  placeholder="Caso: Estudiante brillante pero apático..."
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Integración de Inteligencia Artificial" icon={<Bot className="w-6 h-6" />}>
            <FormField label="Uso Actual de Herramientas IA" name="aiToolsUsage">
              <TextArea
                name="aiToolsUsage"
                value={formData.aiToolsUsage}
                onChange={handleChange}
                rows={2}
                placeholder="Herramientas utilizadas (ChatGPT, Midjourney, etc.) y su aplicación..."
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Ética y IA en el Aula" name="ethicalAiMeasures">
                <TextArea
                  name="ethicalAiMeasures"
                  value={formData.ethicalAiMeasures}
                  onChange={handleChange}
                  placeholder="¿Cómo fomenta el uso responsable?"
                />
              </FormField>
              <FormField label="Detección y Manejo de Plagio IA" name="aiPlagiarismPrevention">
                <TextArea
                  name="aiPlagiarismPrevention"
                  value={formData.aiPlagiarismPrevention}
                  onChange={handleChange}
                  placeholder="Protocolos de verificación académica..."
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Casos Éticos y Resolución de Conflictos" icon={<ShieldCheck className="w-6 h-6" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FormField label="Caso: Nota Límite (2.9)" name="scenario29">
                <TextArea
                  name="scenario29"
                  value={formData.scenario29}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Reacción ante solicitud de ayuda para aprobar..."
                />
              </FormField>

              <FormField label="Caso: Ausencia Inesperada" name="scenarioCoverage">
                <TextArea
                  name="scenarioCoverage"
                  value={formData.scenarioCoverage}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Protocolo de comunicación y reposición..."
                />
              </FormField>

              <FormField label="Caso: Feedback Negativo" name="scenarioFeedback">
                <TextArea
                  name="scenarioFeedback"
                  value={formData.scenarioFeedback}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Manejo de críticas metodológicas..."
                />
              </FormField>
            </div>
          </FormSection>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 pb-8 border-t border-white/5">
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-4 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15"
            >
              <RotateCcw className="w-4 h-4" /> Resetear
            </button>

            <button
              type="submit"
              className="relative group px-12 py-5 bg-emerald-600 rounded-2xl overflow-hidden shadow-[0_0_36px_-12px_rgba(16,185,129,0.45)] transition-transform hover:scale-[1.02] hover:shadow-[0_0_52px_-14px_rgba(16,185,129,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3 text-white font-black text-sm uppercase tracking-widest">
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                <span>Ejecutar Análisis IA</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewForm;
