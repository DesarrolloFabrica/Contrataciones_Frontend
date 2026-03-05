// src/components/InterviewForm.tsx
// ✅ Escuelas/programas desde backend (fallback a mock)
// ✅ Mantiene formData.school y formData.program como NOMBRES (no IDs)
// ✅ LÍDER: limita escuelas/programas a user.schoolId y auto-selecciona escuela
// ✅ Crear candidato: envía schoolId + programId (para que no queden NULL)
// ✅ UI: mover bloque “Crear candidato” debajo de Escuela/Programa
// ✅ FIX UI: no mostrar "Crear candidato" si ya hay candidato seleccionado/creado
// ✅ FIX race: invalida búsquedas en vuelo al seleccionar/crear

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
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
  Loader2,
  Search,
  Info,
} from "lucide-react";
import { InterviewData } from "../types";
import { schools as mockSchools } from "../data/schools";
import {
  approvedExample,
  mediumExample,
  rejectedExample,
} from "../data/exampleData";

import {
  createTeacherCandidate,
  searchTeacherCandidates,
  type TeacherCandidateSearchItemDto,
} from "../services/teachersService";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/apiClient";

interface InterviewFormProps {
  onSubmit: (data: InterviewData) => void;
}

const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ??
  "";

const apiUrl = (path: string) => {
  if (!API_BASE) return path;
  const base = API_BASE.replace(/\/+$/, "");
  return `${base}${path}`;
};

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


// ----------------------------
// Draft persistence (localStorage)
// ----------------------------
const DRAFT_VERSION = 1;

type InterviewDraft = {
  v: number;
  savedAt: number;
  formData: InterviewData;
 _extract?: never; // solo para evitar “any”
  selectedCandidateId: string | null;
};

// key por usuario + org para que no se mezclen drafts
const draftKey = (orgId: string, userId?: string) =>
  `leader:interviewDraft:v${DRAFT_VERSION}:${orgId}:${userId ?? "anon"}`;

function safeParseDraft(raw: string | null): InterviewDraft | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    if (!d || typeof d !== "object") return null;
    if (d.v !== DRAFT_VERSION) return null;
    if (!d.formData) return null;
    return d as InterviewDraft;
  } catch {
    return null;
  }
}



// ---------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------

type SectionHeaderProps = {
  title: string;
  icon: React.ReactNode;
  step: number;
  subtitle?: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = React.memo(
  ({ title, icon, step, subtitle }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
      <div className="flex items-start gap-4 mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
          <div
            className={[
              "relative flex items-center justify-center h-12 w-12 rounded-2xl border shadow-[0_0_32px_rgba(16,185,129,0.35)]",
              isDark
                ? "bg-gradient-to-br from-emerald-500/25 via-emerald-500/12 to-transparent border-emerald-400/50 text-emerald-300"
                : "bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-emerald-200 text-emerald-600",
            ].join(" ")}
          >
            {icon}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span
              className={[
                "inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold",
                isDark
                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {step}
            </span>
            <h3
              className={[
                "text-xl md:text-2xl font-semibold tracking-tight",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {title}
            </h3>
          </div>
          {subtitle && (
            <p
              className={`text-xs md:text-sm max-w-xl ${
                isDark ? "text-gray-400" : "text-slate-600"
              }`}
            >
              {subtitle}
            </p>
          )}
          <div
            className={[
              "h-px w-20 mt-3 rounded-full bg-gradient-to-r from-emerald-500/60 via-emerald-400/10 to-transparent",
              !isDark ? "opacity-70" : "",
            ].join(" ")}
          />
        </div>
      </div>
    );
  }
);

type FormSectionProps = {
  title: string;
  icon: React.ReactNode;
  step: number;
  subtitle?: string;
  children: React.ReactNode;
};

const FormSection: React.FC<FormSectionProps> = React.memo(
  ({ title, icon, step, subtitle, children }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
      <section
        className={[
          "relative group rounded-3xl overflow-hidden border",
          isDark
            ? "bg-white/[0.03] backdrop-blur-2xl border-white/10 shadow-[0_22px_80px_rgba(0,0,0,0.75)]"
            : "bg-white border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.10)]",
        ].join(" ")}
      >
        {/* franja superior sutil */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400/60 via-emerald-200/40 to-cyan-400/60" />

        {/* acento diagonal muy suave (solo en oscuro para no ensuciar el fondo claro) */}
        {isDark && (
          <div className="pointer-events-none absolute -top-24 right-0 w-56 h-40 bg-emerald-500/8 blur-3xl" />
        )}

        <div
          className={[
            "relative p-6 md:p-8 lg:p-10",
            isDark
              ? "bg-gradient-to-br from-[#05070b] via-[#070b11] to-[#05070b]"
              : "bg-gradient-to-br from-white via-slate-50 to-slate-50",
          ].join(" ")}
        >
          <SectionHeader
            title={title}
            icon={icon}
            step={step}
            subtitle={subtitle}
          />
          <div className="space-y-8 relative z-10">{children}</div>
        </div>
      </section>
    );
  }
);

const FormField: React.FC<{
  label: string;
  name: string;
  children: React.ReactNode;
}> = React.memo(({ label, name, children }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col gap-3 group">
      <label
        htmlFor={name}
        className={`text-xs font-bold uppercase tracking-[0.14em] ml-1 transition-colors duration-300 group-focus-within:text-emerald-500 ${
          isDark ? "text-gray-100" : "text-slate-700"
        }`}
      >
        {label}
      </label>
      {children}
    </div>
  );
});

const darkInputStyles =
  "w-full bg-[#07090B] border border-white/[0.10] text-gray-200 text-sm rounded-xl px-4 py-3.5 outline-none transition-all duration-300 placeholder:text-gray-500 focus:bg-[#0F1216] focus:border-emerald-500/25 focus:ring-1 focus:ring-emerald-500/20 focus:shadow-[0_0_18px_-10px_rgba(16,185,129,0.14)] hover:border-white/[0.14] hover:bg-[#0C0F12]";

const lightInputStyles =
  "w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3.5 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.20)] hover:border-slate-300";

const TextInput: React.FC<{
  name: keyof InterviewData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
}> = ({
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  inputMode,
  pattern,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={isDark ? darkInputStyles : lightInputStyles}
      placeholder={placeholder}
      required={required}
      autoComplete="off"
      inputMode={inputMode}
      pattern={pattern}
    />
  );
};

const TextArea: React.FC<{
  name: keyof InterviewData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
}> = ({ name, value, onChange, rows = 3, placeholder }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
      className={`${
        isDark ? darkInputStyles : lightInputStyles
      } resize-none leading-relaxed overflow-hidden min-h-[80px]`}
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
}> = ({ name, value, onChange, options, disabled, placeholder }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative group/select">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`${
          isDark ? darkInputStyles : lightInputStyles
        } appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10`}
        required
        disabled={disabled}
      >
        {placeholder && (
          <option
            value=""
            disabled
            className={isDark ? "text-gray-500" : "text-slate-400"}
          >
            {placeholder}
          </option>
        )}

        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className={isDark ? "bg-[#1a1a1a] py-2" : "bg-white py-2"}
          >
            {opt.label}
          </option>
        ))}
      </select>

      <div
        className={`absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none transition-colors ${
          isDark ? "text-gray-600 group-focus-within/select:text-emerald-400" : "text-slate-400 group-focus-within/select:text-emerald-500"
        }`}
      >
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

type RemoteSchool = {
  id?: string;
  name: string;
  programs?: Array<{ id?: string; name: string }>;
};

type NormalizedSchool = {
  id?: string;
  name: string;
  programs: Array<{ id?: string; name: string }>;
};

// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------

const InterviewForm: React.FC<InterviewFormProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // role + schoolId (robusto)
  const roleRaw =
    (user as any)?.role ??
    (user as any)?.user?.role ??
    (user as any)?.profile?.role ??
    (user as any)?.payload?.role ??
    "";
  const role = String(roleRaw ?? "")
    .trim()
    .toUpperCase();

  const leaderSchoolIdRaw =
    (user as any)?.schoolId ??
    (user as any)?.user?.schoolId ??
    (user as any)?.profile?.schoolId ??
    (user as any)?.payload?.schoolId ??
    null;

  const leaderSchoolId = leaderSchoolIdRaw ? String(leaderSchoolIdRaw) : null;
  const isLeader = role === "LIDER" || role === "LEADER";


  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);


  const userIdForDraft =
  (user as any)?.id ??
  (user as any)?.user?.id ??
  (user as any)?.profile?.id ??
  undefined;

const [formData, setFormData] = useState<InterviewData>(() => {
  if (typeof window === "undefined") return initialFormData;
  const d = safeParseDraft(localStorage.getItem(draftKey(ORG_ID, userIdForDraft)));
  return d?.formData ?? initialFormData;
});

const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(() => {
  if (typeof window === "undefined") return null;
  const d = safeParseDraft(localStorage.getItem(draftKey(ORG_ID, userIdForDraft)));
  return d?.selectedCandidateId ?? null;
});


  const [remoteSchools, setRemoteSchools] = useState<RemoteSchool[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  const normalizedSchools: NormalizedSchool[] = useMemo(() => {
    const fromRemote: NormalizedSchool[] =
      (remoteSchools ?? [])
        .filter((s) => !!s?.name)
        .map((s) => ({
          id: s.id,
          name: s.name,
          programs: (s.programs ?? [])
            .filter((p) => !!p?.name)
            .map((p) => ({ id: p.id, name: p.name })),
        })) ?? [];

    if (fromRemote.length > 0) return fromRemote;

    // fallback a mock (sin ids)
    return (mockSchools ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      programs: Array.isArray(s.programs)
        ? s.programs.map((p: any) =>
            typeof p === "string"
              ? { id: undefined, name: p }
              : { id: p?.id, name: p?.name }
          )
        : [],
    }));
  }, [remoteSchools]);

  const selectedSchool = useMemo(
    () => normalizedSchools.find((s) => s.name === formData.school) ?? null,
    [normalizedSchools, formData.school]
  );

  const selectedProgramObj = useMemo(() => {
    if (!selectedSchool || !formData.program) return null;
    return (
      selectedSchool.programs.find((p) => p.name === formData.program) ?? null
    );
  }, [selectedSchool, formData.program]);

  // IDs usados para crear candidato
  const resolvedSchoolId = useMemo(() => {
    if (isLeader && leaderSchoolId) return leaderSchoolId;
    return selectedSchool?.id ?? null;
  }, [isLeader, leaderSchoolId, selectedSchool?.id]);

  const resolvedProgramId = useMemo(() => {
    return selectedProgramObj?.id ?? null;
  }, [selectedProgramObj?.id]);

  // Candidate lookup
  const [candidateMatches, setCandidateMatches] = useState<
    TeacherCandidateSearchItemDto[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);



  const saveTimer = useRef<number | null>(null);

useEffect(() => {
  if (typeof window === "undefined") return;

  // debounce
  if (saveTimer.current) window.clearTimeout(saveTimer.current);

  saveTimer.current = window.setTimeout(() => {
    const payload: InterviewDraft = {
      v: DRAFT_VERSION,
      savedAt: Date.now(),
      formData,
      selectedCandidateId,
    };
    localStorage.setItem(
      draftKey(ORG_ID, userIdForDraft),
      JSON.stringify(payload)
    );
  }, 250);

  return () => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
  };
}, [formData, selectedCandidateId, userIdForDraft]);



  const searchSeq = useRef(0);

  // =============================
  // ✅ Reglas de validación Cédula
  // =============================

  // Longitud típica en Colombia (ajústalo si tu negocio pide EXACTO)
  const MIN_CC_LENGTH = 6;
  const MAX_CC_LENGTH = 11;

  // ✅ Valida cédula: obligatoria, rango de longitud y solo números
  const isCedulaValid = useMemo(() => {
    // formData.documentNumber debe existir en tu estado del formulario
    // Si tu campo se llama distinto, cámbialo aquí y en el input
    const cc = (formData.documentNumber ?? "").trim();

    // Reglas:
    // 1) no vacío
    // 2) longitud entre min y max
    // 3) solo dígitos
    if (!cc) return false;
    if (cc.length < MIN_CC_LENGTH) return false;
    if (cc.length > MAX_CC_LENGTH) return false;
    if (!/^\d+$/.test(cc)) return false;

    return true;
  }, [formData.documentNumber]);

  // cargar escuelas + programas
  useEffect(() => {
    let alive = true;

    const loadSchools = async () => {
      setSchoolsLoading(true);
      try {
        const { data } = await api.get<RemoteSchool[]>("/schools", {
          params: { includePrograms: "true" },
        });

        let rows = Array.isArray(data) ? data : [];

        // ✅ LÍDER: restringe a su escuela
        if (isLeader && leaderSchoolId) {
          rows = rows.filter((s) => String(s.id ?? "") === leaderSchoolId);
        }

        if (!alive) return;
        setRemoteSchools(rows);
      } catch {
        if (!alive) return;
        setRemoteSchools([]); // fallback a mock
      } finally {
        if (!alive) return;
        setSchoolsLoading(false);
      }
    };

    loadSchools();
    return () => {
      alive = false;
    };
  }, [user, isLeader, leaderSchoolId]);

  // ✅ LÍDER: auto-selecciona escuela por schoolId (y la deja fija)
  useEffect(() => {
    if (!isLeader || !leaderSchoolId) return;
    if (schoolsLoading) return;

    const s = normalizedSchools.find(
      (x) => String(x.id ?? "") === leaderSchoolId
    );
    if (!s) return;

    setFormData((prev) => {
      // si ya venía del draft (o ya lo eligió), no lo pises
      if (prev.school?.trim()) return prev;

      return { ...prev, school: s.name, program: "" };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeader, leaderSchoolId, schoolsLoading, normalizedSchools]);

  // programas dependientes de escuela
  useEffect(() => {
    if (formData.school) {
      const s = normalizedSchools.find((x) => x.name === formData.school);
      const progs = (s?.programs ?? []).map((p) => p.name);
      setAvailablePrograms(progs);

      if (formData.program && !progs.includes(formData.program)) {
        setFormData((prev) => ({ ...prev, program: "" }));
      }
    } else {
      setAvailablePrograms([]);
      if (formData.program) setFormData((prev) => ({ ...prev, program: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.school, normalizedSchools]);

  // búsqueda debounced por CC
  useEffect(() => {
    const cc = (formData.documentNumber ?? "").trim();

    setSelectedCandidateId(null);

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
        const rows = await searchTeacherCandidates({
          orgId: ORG_ID,
          q: cc,
          limit: 8,
        });
        if (mySeq !== searchSeq.current) return;
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

      // ✅ si cambia escuela, resetea programa
      if (name === "school") {
        setFormData(
          (prev) => ({ ...prev, school: value, program: "" } as InterviewData)
        );
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value } as InterviewData));
    },
    []
  );

  const handlePickCandidate = useCallback(
    (c: TeacherCandidateSearchItemDto) => {
      searchSeq.current += 1;
      setIsSearching(false);

      setSelectedCandidateId(c.id);

      setFormData((prev) => ({
        ...prev,
        documentNumber: String(c.documentNumber ?? prev.documentNumber ?? ""),
        candidateName: c.fullName ?? prev.candidateName,
        age:
          typeof c.age === "number" && !Number.isNaN(c.age)
            ? String(c.age)
            : prev.age,

        // ✅ si quieres autocompletar al seleccionar:
        ...(c.schoolName ? { school: c.schoolName } : {}),
        ...(c.programName ? { program: c.programName } : {}),
      }));

      setCandidateMatches([]);
      setLookupError(null);
    },
    []
  );

  // ✅ crear candidato solo si:
  // - no hay candidato seleccionado
  // - CC ok y sin matches
  // - escuelaId y programId resueltos (para no guardar NULL)
  const canCreateCandidate =
    !selectedCandidateId &&
    !!formData.documentNumber?.trim() &&
    formData.documentNumber.trim().length >= 3 &&
    !isSearching &&
    (candidateMatches?.length ?? 0) === 0 &&
    !!resolvedSchoolId &&
    !!resolvedProgramId;

  const missingScopeForCreate = !resolvedSchoolId || !resolvedProgramId;

  const handleCreateCandidate = useCallback(async () => {
    const documentNumber = formData.documentNumber.trim();
    const fullName = (formData.candidateName ?? "").trim();

    if (!documentNumber || documentNumber.length < 3) return;

    if (!fullName) {
      setLookupError("Escribe el nombre del candidato para crearlo.");
      return;
    }

    if (!resolvedSchoolId || !resolvedProgramId) {
      setLookupError(
        "Selecciona escuela y programa antes de crear el candidato."
      );
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
        schoolId: resolvedSchoolId, // ✅ NEW
        programId: resolvedProgramId, // ✅ NEW
      });

      searchSeq.current += 1;
      setIsSearching(false);

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
  }, [formData, resolvedSchoolId, resolvedProgramId]);

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!isCedulaValid) return;

  localStorage.removeItem(draftKey(ORG_ID, userIdForDraft));

  onSubmit({ ...(formData as any), candidateId: selectedCandidateId } as any);
};


  const loadExample = (example: InterviewData) => {
    searchSeq.current += 1;
    setIsSearching(false);

    setSelectedCandidateId(null);
    setCandidateMatches([]);
    setLookupError(null);

    // si es líder, respetamos su escuela fija
    setFormData((prev) => {
      const next = { ...example };
      if (isLeader && leaderSchoolId) {
        const s = normalizedSchools.find(
          (x) => String(x.id ?? "") === leaderSchoolId
        );
        if (s) next.school = s.name;
      }
      return next;
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
  searchSeq.current += 1;
  setIsSearching(false);

  setSelectedCandidateId(null);
  setCandidateMatches([]);
  setLookupError(null);

  localStorage.removeItem(draftKey(ORG_ID, userIdForDraft));

  setFormData((prev) => {
    const next = { ...initialFormData };
    if (isLeader && leaderSchoolId) {
      const s = normalizedSchools.find((x) => String(x.id ?? "") === leaderSchoolId);
      if (s) next.school = s.name;
    }
    return next;
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
};


  return (
    <div className="w-full">
      {/* Fondo decorativo global del formulario. Usamos z negativo para que nunca tape otras secciones. */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        {isDark ? (
          <>
            <div
              className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen animate-pulse"
              style={{ animationDuration: "8s" }}
            />
            <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] mix-blend-screen" />
          </>
        ) : (
          <>
            {/* Fondo muy limpio en modo claro para no “lavar” el contenido */}
            <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-16">
        <header className="text-center space-y-6">
          <div
            className={[
              "inline-flex items-center gap-2.5 px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-widest backdrop-blur-md",
              isDark
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                : "border-[#00B894]/30 bg-[#E6FFF7] text-[#006B57] shadow-[0_0_18px_rgba(0,184,148,0.20)]",
            ].join(" ")}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Sistema Inteligente</span>
          </div>

          <div className="relative space-y-4 max-w-3xl mx-auto">
            <h2
              className={[
                "text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              Evaluación de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B894] to-[#06b6d4]">
                Talento Docente
              </span>
            </h2>
            <p
              className={`text-base md:text-lg font-light leading-relaxed ${
                isDark ? "text-gray-400" : "text-slate-600"
              }`}
            >
              Utiliza nuestra IA para analizar la coherencia pedagógica, ética y
              técnica de los candidatos en tiempo real.
            </p>
          </div>
        </header>

        <div className="sticky top-4 z-50 flex justify-center">
          <div
            className={[
              "backdrop-blur-xl p-1.5 rounded-2xl border flex flex-wrap justify-center gap-1",
              isDark
                ? "bg-[#0A0A0A]/90 border-white/10 shadow-2xl"
                : "bg-white border-slate-200 shadow-[0_14px_40px_rgba(15,23,42,0.16)]",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => loadExample(approvedExample)}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Perfil Aprobado</span>
            </button>
            <div className="w-px h-6 bg-white/5 self-center mx-1"></div>
            <button
              type="button"
              onClick={() => loadExample(mediumExample)}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
            >
              <AlertCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Perfil Medio</span>
            </button>
            <div className="w-px h-6 bg-white/5 self-center mx-1"></div>
            <button
              type="button"
              onClick={() => loadExample(rejectedExample)}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
            >
              <XCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Perfil Rechazado</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <FormSection
            title="Identidad y Trayectoria"
            icon={<User className="w-6 h-6" />}
            step={1}
            subtitle="Recoge los datos básicos del candidato y su trayectoria profesional."
          >
            {/* CC + Nombre + Edad */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
              <div className="md:col-span-2">
                <FormField label="Cédula (CC)" name="documentNumber">
                  <div className="relative">
                    <input
                      // ✅ el valor correcto
                      value={formData.documentNumber}
                      // ✅ usa tu handleChange porque ya limpia a solo dígitos
                      onChange={handleChange}
                      name="documentNumber"
                      placeholder="Ej. 1030123456"
                      className={`rounded-xl px-4 py-3 outline-none ${
                        isDark ? darkInputStyles : lightInputStyles
                      }`}
                    />

                    {/* ✅ Mensaje si está mal */}
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
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* RESULTADOS */}
                  <div className="mt-3 space-y-2">
                    {lookupError && (
                      <div className="rounded-xl border border-rose-500/25 bg-rose-950/30 px-4 py-3 text-xs text-rose-200">
                        {lookupError}
                      </div>
                    )}

                    {candidateMatches.length > 0 && (
                      <div
                        className={`rounded-2xl overflow-hidden border ${
                          isDark
                            ? "border-emerald-500/25 bg-[#061015]"
                            : "border-emerald-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
                        }`}
                      >
                        <div
                          className={`px-4 py-3 border-b text-[11px] font-extrabold uppercase tracking-[0.22em] ${
                            isDark
                              ? "border-white/10 text-emerald-200/80"
                              : "border-emerald-100 text-emerald-700"
                          }`}
                        >
                          Coincidencias por cédula
                        </div>

                        <div
                          className={`divide-y ${
                            isDark ? "divide-white/10" : "divide-slate-100"
                          }`}
                        >
                          {candidateMatches.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handlePickCandidate(c)}
                              className={`w-full text-left px-4 py-3 transition ${
                                isDark
                                  ? "hover:bg-white/[0.04]"
                                  : "hover:bg-emerald-50/60"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div
                                    className={`text-sm font-semibold ${
                                      isDark
                                        ? "text-white/85"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {c.fullName}
                                  </div>
                                  <div
                                    className={`text-[11px] font-mono ${
                                      isDark
                                        ? "text-white/45"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    CC: {c.documentNumber ?? "—"}
                                    {typeof c.age === "number"
                                      ? ` · ${c.age} años`
                                      : ""}
                                  </div>
                                </div>

                                <div
                                  className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${
                                    isDark
                                      ? "text-emerald-300/80"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  Seleccionar
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCandidateId && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600/80">
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
                  <TextInput
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    type="number"
                    placeholder="Ej. 35"
                  />
                </FormField>
              </div>
            </div>

            {/* Escuela + Programa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Escuela o Coordinación" name="school">
                <SelectInput
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  options={normalizedSchools.map((s) => ({
                    value: s.name,
                    label: s.name,
                  }))}
                  placeholder={
                    schoolsLoading
                      ? "Cargando escuelas..."
                      : "Seleccione una opción..."
                  }
                  disabled={schoolsLoading || (isLeader && !!leaderSchoolId)} // ✅ líder no cambia
                />
              </FormField>

              <FormField label="Programa Académico" name="program">
                <SelectInput
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
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

            {/* ✅ CREAR CANDIDATO (MOVIDO ABAJO DE ESCUELA/PROGRAMA) */}
            {!selectedCandidateId && (
              <div className="space-y-2">
                {missingScopeForCreate &&
                  (formData.documentNumber?.trim()?.length ?? 0) >= 3 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-2 text-xs text-white/60">
                      <Info className="w-4 h-4 text-white/40" />
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
                      onClick={handleCreateCandidate}
                      disabled={isCreatingCandidate}
                      className="px-4 py-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-200 text-[11px] font-extrabold uppercase tracking-[0.22em] hover:bg-emerald-500/15 transition disabled:opacity-60 disabled:cursor-wait"
                    >
                      {isCreatingCandidate ? "Creando..." : "Crear candidato"}
                    </button>
                  </div>
                )}
              </div>
            )}

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

          <FormSection
            title="Disponibilidad y Compromiso"
            icon={<Clock className="w-6 h-6" />}
            step={2}
            subtitle="Define la compatibilidad horaria y los posibles conflictos de interés."
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
                      { value: "Sí", label: "Totalmente disponible" },
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

          <FormSection
            title="Estrategia Pedagógica"
            icon={<Users className="w-6 h-6" />}
            step={3}
            subtitle="Explora cómo el candidato enseña, evalúa y maneja retos en el aula."
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

          <FormSection
            title="Integración de Inteligencia Artificial"
            icon={<Bot className="w-6 h-6" />}
            step={4}
            subtitle="Analiza su relación con la IA y las medidas éticas que aplica."
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
              <FormField label="Ética y IA en el Aula" name="ethicalAiMeasures">
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

          <FormSection
            title="Casos Éticos y Resolución de Conflictos"
            icon={<ShieldCheck className="w-6 h-6" />}
            step={5}
            subtitle="Profundiza en su criterio frente a dilemas éticos y situaciones sensibles."
          >
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 pb-10 border-t border-white/5">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400 hover:text-white hover:bg-white/8 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15"
            >
              <RotateCcw className="w-4 h-4" /> Resetear
            </button>

            <button
              type="submit"
              disabled={!isCedulaValid} // ✅ bloquea si cédula inválida
              className={`inline-flex items-center justify-center rounded-full px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] transition
                ${
                  !isCedulaValid
                    ? isDark
                      ? "bg-white/5 text-white/40 border border-white/15 cursor-not-allowed shadow-none"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 text-black hover:brightness-110 shadow-[0_12px_30px_rgba(45,212,191,0.35)]"
                }`}
            >
              Ejecutar Análisis IA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewForm;