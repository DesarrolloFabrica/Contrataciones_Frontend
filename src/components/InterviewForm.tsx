// src/components/InterviewForm.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
} from "lucide-react";
import { InterviewData } from "../types";
import { schools } from "../data/schools";
import {
  approvedExample,
  mediumExample,
  rejectedExample,
} from "../data/exampleData";

interface InterviewFormProps {
  onSubmit: (data: InterviewData) => void;
}

const initialFormData: InterviewData = {
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

// --- COMPONENTES VISUALES AVANZADOS ---

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> =
  React.memo(({ title, icon }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="relative group">
        <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
        <div className="relative p-3 rounded-2xl bg-[#0F0F0F] border border-white/10 text-emerald-400 shadow-xl">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-white tracking-tight">
          {title}
        </h3>
        <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500/50 to-transparent mt-2 rounded-full" />
      </div>
    </div>
  ));

const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = React.memo(({ title, icon, children }) => (
  <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.08] to-transparent transition-all duration-500 hover:from-emerald-500/30">
    <div className="relative bg-[#050505] p-6 md:p-10 rounded-3xl overflow-hidden h-full">
      {/* Efecto de luz ambiental en la esquina */}
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
      className="text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-emerald-400 transition-colors duration-300 ml-1"
    >
      {label}
    </label>
    {children}
  </div>
));

// Estilos base para inputs con efecto "Glass" y profundidad
const baseInputStyles =
  "w-full bg-[#0A0A0A] border border-white/5 text-gray-200 text-sm rounded-xl px-4 py-4 outline-none transition-all duration-300 placeholder:text-gray-700 focus:bg-[#0F0F0F] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 focus:shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)] hover:border-white/10 hover:bg-[#0F0F0F]";

const TextInput: React.FC<{
  name: keyof InterviewData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}> = ({ name, value, onChange, type = "text", placeholder }) => (
  <input
    type={type}
    id={name}
    name={name}
    value={value}
    onChange={onChange}
    className={baseInputStyles}
    placeholder={placeholder}
    required
    autoComplete="off"
  />
);

// TextArea con auto-resize (sin scroll interno)
const TextArea: React.FC<{
  name: keyof InterviewData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
}> = ({ name, value, onChange, rows = 3, placeholder }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  // Auto-ajuste de altura cada vez que cambia el contenido
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
        <option value="" className="text-gray-500">
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          className="bg-[#1a1a1a] py-2"
        >
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

  useEffect(() => {
    if (formData.school) {
      const selectedSchool = schools.find(
        (s) => s.name === formData.school
      );
      setAvailablePrograms(selectedSchool ? selectedSchool.programs : []);
      if (
        selectedSchool &&
        !selectedSchool.programs.includes(formData.program)
      ) {
        setFormData((prev) => ({ ...prev, program: "" }));
      }
    } else {
      setAvailablePrograms([]);
    }
  }, [formData.school, formData.program]);

  const handleChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
        | React.ChangeEvent<HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const loadExample = (example: InterviewData) => {
    setFormData(example);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    // Fondo global con texturas y luces ambientales
    <div className="min-h-screen w-f bg-[#020202] text-gray-200 selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      {/* Luces de Fondo (Blobs) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-16">
        {/* Header Hero */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
            <BrainCircuit className="w-4 h-4" />
            <span>Sistema Inteligente</span>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1]">
              Evaluación de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Talento Docente
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-400 font-light leading-relaxed">
              Utiliza nuestra IA para analizar la coherencia pedagógica,
              ética y técnica de los candidatos en tiempo real.
            </p>
          </div>
        </header>

        {/* Barra de Herramientas (Ejemplos) */}
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
          {/* Section: Basic Info */}
          <FormSection
            title="Identidad y Trayectoria"
            icon={<User className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-3">
                <FormField
                  label="Nombre del Candidato"
                  name="candidateName"
                >
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
                  <TextInput
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    type="number"
                    placeholder="00"
                  />
                </FormField>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                label="Escuela o Coordinación"
                name="school"
              >
                <SelectInput
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  options={schools.map((s) => ({
                    value: s.name,
                    label: s.name,
                  }))}
                  placeholder="Seleccione una opción..."
                />
              </FormField>
              <FormField
                label="Programa Académico"
                name="program"
              >
                <SelectInput
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  options={availablePrograms.map((p) => ({
                    value: p,
                    label: p,
                  }))}
                  disabled={!formData.school}
                  placeholder={
                    formData.school
                      ? "Seleccione el programa..."
                      : "Requiere seleccionar escuela"
                  }
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                label="Resumen Profesional"
                name="careerSummary"
              >
                <TextArea
                  name="careerSummary"
                  value={formData.careerSummary}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describa la trayectoria y aspiraciones del candidato..."
                />
              </FormField>
              <FormField
                label="Experiencia Docente"
                name="previousExperience"
              >
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

          {/* Section 1: Disponibilidad */}
          <FormSection
            title="Disponibilidad y Compromiso"
            icon={<Clock className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <FormField
                  label="Horario Disponible"
                  name="availabilityDetails"
                >
                  <TextInput
                    name="availabilityDetails"
                    value={formData.availabilityDetails}
                    onChange={handleChange}
                    placeholder="Ej. Lunes a Viernes (18:00 - 22:00)"
                  />
                </FormField>
              </div>
              <div className="md:col-span-1">
                <FormField
                  label="Disposición a Comités"
                  name="acceptsCommittees"
                >
                  <SelectInput
                    name="acceptsCommittees"
                    value={formData.acceptsCommittees}
                    onChange={handleChange}
                    options={[
                      {
                        value: "Sí",
                        label: "Totalmente disponible",
                      },
                      { value: "No", label: "No disponible" },
                      { value: "Depende", label: "Condicionado" },
                    ]}
                  />
                </FormField>
              </div>
            </div>
            <FormField
              label="Conflictos de Interés / Otros Empleos"
              name="otherJobs"
            >
              <TextArea
                name="otherJobs"
                value={formData.otherJobs}
                onChange={handleChange}
                rows={2}
                placeholder="Detalle otros compromisos laborales actuales..."
              />
            </FormField>
          </FormSection>

          {/* Section 2: Manejo Aula */}
          <FormSection
            title="Estrategia Pedagógica"
            icon={<Users className="w-6 h-6" />}
          >
            <FormField
              label="Metodología de Evaluación"
              name="evaluationMethodology"
            >
              <TextArea
                name="evaluationMethodology"
                value={formData.evaluationMethodology}
                onChange={handleChange}
                placeholder="Describa instrumentos, rúbricas y criterios de evaluación..."
              />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                label="Plan de Retención (Alto Fracaso)"
                name="failureRatePlan"
              >
                <TextArea
                  name="failureRatePlan"
                  value={formData.failureRatePlan}
                  onChange={handleChange}
                  placeholder="Estrategia ante un 50% de reprobación..."
                />
              </FormField>
              <FormField
                label="Manejo de Estudiantes Difíciles"
                name="apatheticStudentPlan"
              >
                <TextArea
                  name="apatheticStudentPlan"
                  value={formData.apatheticStudentPlan}
                  onChange={handleChange}
                  placeholder="Caso: Estudiante brillante pero apático..."
                />
              </FormField>
            </div>
          </FormSection>

          {/* Section 3: IA */}
          <FormSection
            title="Integración de Inteligencia Artificial"
            icon={<Bot className="w-6 h-6" />}
          >
            <FormField
              label="Uso Actual de Herramientas IA"
              name="aiToolsUsage"
            >
              <TextArea
                name="aiToolsUsage"
                value={formData.aiToolsUsage}
                onChange={handleChange}
                rows={2}
                placeholder="Herramientas utilizadas (ChatGPT, Midjourney, etc.) y su aplicación..."
              />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                label="Ética y IA en el Aula"
                name="ethicalAiMeasures"
              >
                <TextArea
                  name="ethicalAiMeasures"
                  value={formData.ethicalAiMeasures}
                  onChange={handleChange}
                  placeholder="¿Cómo fomenta el uso responsable?"
                />
              </FormField>
              <FormField
                label="Detección y Manejo de Plagio IA"
                name="aiPlagiarismPrevention"
              >
                <TextArea
                  name="aiPlagiarismPrevention"
                  value={formData.aiPlagiarismPrevention}
                  onChange={handleChange}
                  placeholder="Protocolos de verificación académica..."
                />
              </FormField>
            </div>
          </FormSection>

          {/* Section 4: Coherencia */}
          <FormSection
            title="Casos Éticos y Resolución de Conflictos"
            icon={<ShieldCheck className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FormField
                label="Caso: Nota Límite (2.9)"
                name="scenario29"
              >
                <TextArea
                  name="scenario29"
                  value={formData.scenario29}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Reacción ante solicitud de ayuda para aprobar..."
                />
              </FormField>
              <FormField
                label="Caso: Ausencia Inesperada"
                name="scenarioCoverage"
              >
                <TextArea
                  name="scenarioCoverage"
                  value={formData.scenarioCoverage}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Protocolo de comunicación y reposición..."
                />
              </FormField>
              <FormField
                label="Caso: Feedback Negativo"
                name="scenarioFeedback"
              >
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

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 pb-8 border-t border-white/5">
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-4 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Resetear
            </button>

            <button
              type="submit"
              className="relative group px-12 py-5 bg-emerald-600 rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-transform hover:scale-[1.02] hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3 text-white font-black text-sm uppercase tracking-widest">
                <Sparkles className="w-5 h-5 animate-pulse" />
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
