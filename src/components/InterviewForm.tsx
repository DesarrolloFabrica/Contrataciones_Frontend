// src/components/InterviewForm.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { InterviewData } from "../types";
import {
  approvedExampleProfile,
  mediumExampleProfile,
  rejectedExampleProfile,
  type InterviewExampleProfile,
} from "../data/exampleData";

import {
  createTeacherCandidate,
  searchTeacherCandidates,
  type TeacherCandidateSearchItemDto,
} from "../services/teachersService";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import {
  ORG_ID,
  initialFormData,
  draftKey,
  safeParseDraft,
  createInitialCandidateDocuments,
} from "../features/leader/interview-form/constants";

import type {
  InterviewFormProps,
  HiringContextDraft,
  CandidateDocumentsDraft,
} from "../features/leader/interview-form/types";

import { IdentitySection } from "../features/leader/interview-form/components/IdentitySection";
import { AvailabilitySection } from "../features/leader/interview-form/components/AvailabilitySection";
import { PedagogySection } from "../features/leader/interview-form/components/PedagogySection";
import { AiUsageSection } from "../features/leader/interview-form/components/AiUsageSection";
import { EthicsCasesSection } from "../features/leader/interview-form/components/EthicsCasesSection";
import { HiringContextSection } from "../features/leader/interview-form/components/HiringContextSection";
import { CandidateDocumentsSection } from "../features/leader/interview-form/components/CandidateDocumentsSection";
import { InterviewWizardShell } from "../features/leader/interview-form/components/InterviewWizardShell";
import {
  type WizardStep,
} from "../features/leader/interview-form/components/InterviewWizardStepper";
import { InterviewWizardNavigation } from "../features/leader/interview-form/components/InterviewWizardNavigation";
import { InterviewReviewStep } from "../features/leader/interview-form/components/InterviewReviewStep";
import type { CreateCandidateModalPayload } from "../features/leader/interview-form/components/CreateCandidateModal";

import { useInterviewDraft } from "../features/leader/interview-form/hooks/useInterviewDraft";
import { useLeaderSchoolPrograms } from "../features/leader/interview-form/hooks/useLeaderSchoolPrograms";
import { useCandidateLookup } from "../features/leader/interview-form/hooks/useCandidateLookup";
import { useCedulaValidation } from "../features/leader/interview-form/hooks/useCedulaValidation";

const InterviewForm: React.FC<InterviewFormProps> = ({
  onSubmit,
  onStepChange,
  examplePreset = null,
  onExampleApplied,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const roleRaw =
    (user as any)?.role ??
    (user as any)?.user?.role ??
    (user as any)?.profile?.role ??
    (user as any)?.payload?.role ??
    "";
  const role = String(roleRaw ?? "").trim().toUpperCase();

  const leaderSchoolIdRaw =
    (user as any)?.schoolId ??
    (user as any)?.user?.schoolId ??
    (user as any)?.profile?.schoolId ??
    (user as any)?.payload?.schoolId ??
    null;

  const leaderSchoolId = leaderSchoolIdRaw ? String(leaderSchoolIdRaw) : null;
  const isLeader = role === "LIDER" || role === "LEADER";

  const userIdForDraft =
    (user as any)?.id ??
    (user as any)?.user?.id ??
    (user as any)?.profile?.id ??
    undefined;

  // ── Draft ──
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

  const initialHiringContext: HiringContextDraft = {
    hiringRequestId: null,
    contextMode: "MANUAL",
    selectedVacancyLabel: "",
    coordination: "",
    targetRole: "",
    processType: "",
    requestingArea: "",
    needDescription: "",
    priority: "",
  };

  const [hiringContext, setHiringContext] = useState<HiringContextDraft>(() => {
    if (typeof window === "undefined") return initialHiringContext;
    const d = safeParseDraft(localStorage.getItem(draftKey(ORG_ID, userIdForDraft)));
    return d?.hiringContext ?? initialHiringContext;
  });

  const [candidateDocuments, setCandidateDocuments] = useState<CandidateDocumentsDraft>(() => {
    if (typeof window === "undefined") return createInitialCandidateDocuments();
    const d = safeParseDraft(localStorage.getItem(draftKey(ORG_ID, userIdForDraft)));
    return d?.candidateDocuments ?? createInitialCandidateDocuments();
  });

  const { clearDraft } = useInterviewDraft(
    ORG_ID,
    userIdForDraft,
    formData,
    selectedCandidateId,
    hiringContext,
    candidateDocuments,
  );

  // ── Schools / Programs ──
  const { normalizedSchools, schoolsLoading, schoolsLoadError } = useLeaderSchoolPrograms(
    isLeader,
    leaderSchoolId,
    user,
  );

  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);

  const selectedSchool = useMemo(
    () =>
      normalizedSchools.find((s) => s.id === formData.schoolId) ??
      normalizedSchools.find((s) => s.name === formData.school) ??
      null,
    [normalizedSchools, formData.school, formData.schoolId],
  );

  const selectedProgramObj = useMemo(() => {
    if (!selectedSchool || !formData.program) return null;
    return (
      selectedSchool.programs.find((p) => p.id === formData.programId) ??
      selectedSchool.programs.find((p) => p.name === formData.program) ??
      null
    );
  }, [selectedSchool, formData.program, formData.programId]);

  const resolvedSchoolId = useMemo(() => {
    return formData.schoolId ?? selectedSchool?.id ?? (isLeader && leaderSchoolId ? leaderSchoolId : null);
  }, [formData.schoolId, isLeader, leaderSchoolId, selectedSchool?.id]);

  const resolvedProgramId = useMemo(() => {
    return formData.programId ?? selectedProgramObj?.id ?? null;
  }, [formData.programId, selectedProgramObj?.id]);

  // LÍDER: auto-selecciona escuela por schoolId
  useEffect(() => {
    if (!isLeader || !leaderSchoolId) return;
    if (schoolsLoading) return;

    const s = normalizedSchools.find((x) => x.id === leaderSchoolId);
    if (!s) return;

    setFormData((prev) => {
      if (prev.school?.trim()) return prev;
      return { ...prev, school: s.name, schoolId: s.id, program: "", programId: null };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeader, leaderSchoolId, schoolsLoading, normalizedSchools]);

  // Programas dependientes de escuela
  useEffect(() => {
    if (formData.school) {
      const s = normalizedSchools.find((x) => x.name === formData.school);
      const progs = (s?.programs ?? []).map((p) => p.name);
      setAvailablePrograms(progs);

      if (formData.program && !progs.includes(formData.program)) {
        setFormData((prev) => ({ ...prev, program: "", programId: null }));
      }
    } else {
      setAvailablePrograms([]);
      if (formData.program) setFormData((prev) => ({ ...prev, program: "", programId: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.school, normalizedSchools]);

  // ── Cédula validation ──
  const { isCedulaValid } = useCedulaValidation(formData.documentNumber);

  // ── Candidate lookup ──
  const { candidateMatches, isSearching, lookupError, resetSearch, setLookupError } =
    useCandidateLookup(ORG_ID, formData.documentNumber);

  const exactCandidateMatch = useMemo(() => {
    const documentNumber = formData.documentNumber.trim();
    if (!documentNumber) return null;
    return candidateMatches.find(
      (candidate) => String(candidate.documentNumber ?? "").trim() === documentNumber,
    ) ?? null;
  }, [candidateMatches, formData.documentNumber]);

  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [candidateStatus, setCandidateStatus] = useState<string | null>("Busca el candidato por cédula.");
  const [isCreateCandidateModalOpen, setIsCreateCandidateModalOpen] = useState(false);
  const [createCandidateError, setCreateCandidateError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Clear selected candidate when document changes
  useEffect(() => {
    setSelectedCandidateId(null);
    setCandidateStatus(
      formData.documentNumber.trim().length >= 3
        ? "Buscando candidato por cédula..."
        : "Busca el candidato por cédula.",
    );
  }, [formData.documentNumber]);

  useEffect(() => {
    const documentNumber = formData.documentNumber.trim();
    if (selectedCandidateId || isSearching || documentNumber.length < 3) return;

    if (exactCandidateMatch) {
      setSelectedCandidateId(exactCandidateMatch.id);
      setCandidateStatus("Candidato encontrado.");
      setIdentityError(null);
      setFormData((prev) => ({
        ...prev,
        documentNumber: String(exactCandidateMatch.documentNumber ?? prev.documentNumber ?? ""),
        candidateName: exactCandidateMatch.fullName ?? prev.candidateName,
        age: typeof exactCandidateMatch.age === "number" && !Number.isNaN(exactCandidateMatch.age) ? String(exactCandidateMatch.age) : prev.age,
        ...(exactCandidateMatch.schoolName ? { school: exactCandidateMatch.schoolName } : {}),
        ...(exactCandidateMatch.programName ? { program: exactCandidateMatch.programName } : {}),
      }));
      return;
    }

    if (!exactCandidateMatch) {
      setCandidateStatus("Candidato no encontrado. Crea el candidato para continuar.");
    }
  }, [candidateMatches.length, exactCandidateMatch, formData.documentNumber, isSearching, selectedCandidateId]);

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const handleHiringContextChange = useCallback((updated: HiringContextDraft) => {
    setHiringContext(updated);
  }, []);

  const handleCandidateDocumentsChange = useCallback((updated: CandidateDocumentsDraft) => {
    setCandidateDocuments(updated);
    setResumeError(null);
  }, []);

  // ── Handlers ──
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;

      if (name === "documentNumber") {
        const onlyDigits = value.replace(/\D+/g, "");
        setFormData((prev) => ({ ...prev, documentNumber: onlyDigits }));
        return;
      }

      if (name === "school") {
        setIdentityError(null);
        const nextSchool = normalizedSchools.find((school) => school.name === value) ?? null;
        setFormData((prev) => ({
          ...prev,
          school: nextSchool?.name ?? "",
          schoolId: nextSchool?.id ?? null,
          program: "",
          programId: null,
        } as InterviewData));
        return;
      }

      if (name === "program") {
        setIdentityError(null);
        const school =
          normalizedSchools.find((item) => item.id === formData.schoolId) ??
          normalizedSchools.find((item) => item.name === formData.school) ??
          null;
        const nextProgram = school?.programs.find((program) => program.name === value) ?? null;
        setFormData((prev) => ({
          ...prev,
          program: nextProgram?.name ?? "",
          programId: nextProgram?.id ?? null,
        } as InterviewData));
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value } as InterviewData));
    },
    [formData.school, formData.schoolId, normalizedSchools],
  );

  const handlePickCandidate = useCallback(
    (c: TeacherCandidateSearchItemDto) => {
      resetSearch();
      setIdentityError(null);
      setCandidateStatus("Candidato encontrado.");

      setSelectedCandidateId(c.id);

      setFormData((prev) => ({
        ...prev,
        documentNumber: String(c.documentNumber ?? prev.documentNumber ?? ""),
        candidateName: c.fullName ?? prev.candidateName,
        age: typeof c.age === "number" && !Number.isNaN(c.age) ? String(c.age) : prev.age,
        ...(c.schoolName ? { school: c.schoolName } : {}),
        ...(c.programName ? { program: c.programName } : {}),
      }));
    },
    [resetSearch],
  );

  const canCreateCandidate =
    !selectedCandidateId &&
    !!formData.documentNumber?.trim() &&
    formData.documentNumber.trim().length >= 3 &&
    !isSearching &&
    !exactCandidateMatch &&
    !!resolvedSchoolId &&
    !!resolvedProgramId;

  const missingScopeForCreate = !resolvedSchoolId || !resolvedProgramId;

  const handleOpenCreateCandidate = useCallback(() => {
    if (!resolvedSchoolId || !resolvedProgramId) {
      setIdentityError("Selecciona escuela/coordinación y programa académico antes de crear el candidato.");
      return;
    }
    setCreateCandidateError(null);
    setIsCreateCandidateModalOpen(true);
  }, [resolvedProgramId, resolvedSchoolId]);

  const handleCloseCreateCandidate = useCallback(() => {
    if (isCreatingCandidate) return;
    setIsCreateCandidateModalOpen(false);
    setCreateCandidateError(null);
  }, [isCreatingCandidate]);

  const handleCreateCandidate = useCallback(async (payload: CreateCandidateModalPayload) => {
    const documentNumber = payload.documentNumber.trim();
    const fullName = payload.fullName.trim();

    if (!documentNumber || documentNumber.length < 3) return;

    if (!fullName) {
      setCreateCandidateError("Escribe el nombre del candidato para crearlo.");
      return;
    }

    if (!payload.schoolId || !payload.programId) {
      setCreateCandidateError("Selecciona escuela y programa antes de crear el candidato.");
      return;
    }

    setIsCreatingCandidate(true);
    setCreateCandidateError(null);

    try {
      const created = await createTeacherCandidate({
        orgId: ORG_ID,
        documentNumber,
        fullName,
        age: payload.age,
        email: payload.email,
        phone: payload.phone,
        schoolId: payload.schoolId,
        programId: payload.programId,
      });

      resetSearch();
      setSelectedCandidateId(created.id);
      setIsCreateCandidateModalOpen(false);
      setCandidateStatus("Candidato creado correctamente.");
      setIdentityError(null);

      setFormData((prev) => ({
        ...prev,
        documentNumber,
        candidateName: fullName,
        age: payload.age ? String(payload.age) : prev.age,
        school: payload.schoolName,
        program: payload.programName,
        careerSummary: payload.careerSummary || prev.careerSummary,
        previousExperience: payload.previousExperience || prev.previousExperience,
      }));
    } catch (e: any) {
      if (e?.response?.status === 409) {
        const again = await searchTeacherCandidates({ orgId: ORG_ID, q: documentNumber, limit: 8 });
        const existing = again.find(
          (candidate) => String(candidate.documentNumber ?? "").trim() === documentNumber,
        ) ?? again[0];
        if (existing?.id) {
          setSelectedCandidateId(existing.id);
          setIsCreateCandidateModalOpen(false);
          setCandidateStatus("Candidato ya existía, se reutiliza.");
          setIdentityError(null);
          setFormData((prev) => ({
            ...prev,
            documentNumber: String(existing.documentNumber ?? documentNumber),
            candidateName: existing.fullName ?? fullName,
            age: typeof existing.age === "number" && !Number.isNaN(existing.age) ? String(existing.age) : prev.age,
            ...(existing.schoolName ? { school: existing.schoolName } : {}),
            ...(existing.programName ? { program: existing.programName } : {}),
          }));
          return;
        }
      }
      setCreateCandidateError(e?.response?.data?.message ?? e?.message ?? "No se pudo crear el candidato.");
    } finally {
      setIsCreatingCandidate(false);
    }
  }, [resetSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCedulaValid) return;

    if (!selectedCandidateId) {
      setIdentityError("Busca o crea el candidato antes de ejecutar el análisis.");
      setCandidateStatus("Candidato no seleccionado.");
      setCurrentStep(3);
      return;
    }

    const resumeItem = candidateDocuments.items.find((item) => item.id === "resume");
    if (!resumeItem?.file) {
      setResumeError("La hoja de vida es el documento principal y es obligatoria.");
      setCurrentStep(2);
      return;
    }

    clearDraft();

    onSubmit({
      ...(formData as any),
      candidateId: selectedCandidateId,
      schoolId: resolvedSchoolId,
      programId: resolvedProgramId,
      hiringRequestId: hiringContext.hiringRequestId ?? null,
      hiringContext,
      candidateDocuments,
    } as any);
  };

  const loadExample = (example: InterviewExampleProfile) => {
    resetSearch();

    setSelectedCandidateId(null);

    const leaderSchool =
      isLeader && leaderSchoolId
        ? normalizedSchools.find((x) => String(x.id ?? "") === leaderSchoolId) ?? null
        : null;

    setHiringContext({
      ...example.hiringContext,
      ...(leaderSchool ? { requestingArea: leaderSchool.name } : {}),
    });

    setCandidateDocuments({
      items: example.candidateDocuments.items.map((item) => ({ ...item })),
    });

    setFormData((prev) => {
      const next = { ...example.formData };
      if (leaderSchool) {
        next.school = leaderSchool.name;
        const leaderPrograms = leaderSchool.programs.map((program) => program.name);
        if (!leaderPrograms.includes(next.program)) {
          next.program = leaderPrograms[0] ?? "";
        }
      }
      return next;
    });

    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!examplePreset) return;

    if (examplePreset === "approved") {
      loadExample(approvedExampleProfile);
    } else if (examplePreset === "medium") {
      loadExample(mediumExampleProfile);
    } else {
      loadExample(rejectedExampleProfile);
    }

    onExampleApplied?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examplePreset]);

  const resetForm = () => {
    resetSearch();

    setSelectedCandidateId(null);

    setHiringContext({ ...initialHiringContext });

    setCandidateDocuments(createInitialCandidateDocuments());
    setResumeError(null);
    setIdentityError(null);
    setCandidateStatus("Busca el candidato por cédula.");
    setIsCreateCandidateModalOpen(false);
    setCreateCandidateError(null);

    clearDraft();

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

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === 3) {
      if (!formData.school?.trim() || !formData.program?.trim()) {
        setIdentityError("Debes seleccionar escuela/coordinación y programa académico para continuar.");
        return;
      }
      if (!resolvedSchoolId || !resolvedProgramId) {
        setIdentityError("La escuela y el programa deben estar vinculados a IDs válidos del backend.");
        return;
      }
      if (!selectedCandidateId) {
        setIdentityError("Busca o crea el candidato antes de continuar.");
        setCandidateStatus("Candidato no seleccionado.");
        return;
      }
      setIdentityError(null);
    }
    setCurrentStep((prev) => (prev < 5 ? ((prev + 1) as WizardStep) : prev));
  }, [currentStep, formData.program, formData.school, resolvedProgramId, resolvedSchoolId, selectedCandidateId]);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <HiringContextSection
          hiringContext={hiringContext}
          onChange={handleHiringContextChange}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <CandidateDocumentsSection
          candidateDocuments={candidateDocuments}
          onChange={handleCandidateDocumentsChange}
          resumeError={resumeError}
        />
      );
    }

    if (currentStep === 3) {
      return (
        <IdentitySection
          formData={formData}
          isCedulaValid={isCedulaValid}
          normalizedSchools={normalizedSchools}
          availablePrograms={availablePrograms}
          schoolsLoading={schoolsLoading}
          isLeader={isLeader}
          leaderSchoolId={leaderSchoolId}
          isSearching={isSearching}
          lookupError={lookupError}
          candidateMatches={candidateMatches}
          selectedCandidateId={selectedCandidateId}
          isCreatingCandidate={isCreatingCandidate}
          canCreateCandidate={canCreateCandidate}
          missingScopeForCreate={missingScopeForCreate}
          identityError={identityError}
          schoolsLoadError={schoolsLoadError}
          candidateStatus={candidateStatus}
          isCreateCandidateModalOpen={isCreateCandidateModalOpen}
          createCandidateError={createCandidateError}
          onChange={handleChange}
          onPickCandidate={handlePickCandidate}
          onOpenCreateCandidate={handleOpenCreateCandidate}
          onCloseCreateCandidate={handleCloseCreateCandidate}
          onCreateCandidate={handleCreateCandidate}
        />
      );
    }

    if (currentStep === 4) {
      return (
        <div className="space-y-6">
          <AvailabilitySection formData={formData} onChange={handleChange} />
          <div className={`border-t pt-6 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <PedagogySection formData={formData} onChange={handleChange} />
          </div>
          <div className={`border-t pt-6 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <AiUsageSection formData={formData} onChange={handleChange} />
          </div>
          <div className={`border-t pt-6 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <EthicsCasesSection formData={formData} onChange={handleChange} />
          </div>
        </div>
      );
    }

    return (
      <InterviewReviewStep
        formData={formData}
        hiringContext={hiringContext}
        candidateDocuments={candidateDocuments}
        selectedCandidateId={selectedCandidateId}
      />
    );
  };


  return (
    <div className="w-full">
      <div className="relative z-10 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InterviewWizardShell
            currentStep={currentStep}
            onStepClick={goToStep}
            navigation={(
              <InterviewWizardNavigation
                currentStep={currentStep}
                isCedulaValid={isCedulaValid}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}
          >
            {renderStepContent()}
          </InterviewWizardShell>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={resetForm}
              className={[
                "rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition",
                isDark
                  ? "text-white/60 border border-white/15 hover:bg-white/[0.04]"
                  : "text-slate-600 border border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              Resetear formulario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewForm;
