// src/components/InterviewForm.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { InterviewData } from "../types";
import {
  approvedExample,
  mediumExample,
  rejectedExample,
} from "../data/exampleData";

import {
  createTeacherCandidate,
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

import { InterviewFormHeader } from "../features/leader/interview-form/components/InterviewFormHeader";
import { ExampleProfilesToolbar } from "../features/leader/interview-form/components/ExampleProfilesToolbar";
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

import { useInterviewDraft } from "../features/leader/interview-form/hooks/useInterviewDraft";
import { useLeaderSchoolPrograms } from "../features/leader/interview-form/hooks/useLeaderSchoolPrograms";
import { useCandidateLookup } from "../features/leader/interview-form/hooks/useCandidateLookup";
import { useCedulaValidation } from "../features/leader/interview-form/hooks/useCedulaValidation";

const InterviewForm: React.FC<InterviewFormProps> = ({ onSubmit, onStepChange }) => {
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
  const { normalizedSchools, schoolsLoading } = useLeaderSchoolPrograms(
    isLeader,
    leaderSchoolId,
    user,
  );

  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);

  const selectedSchool = useMemo(
    () => normalizedSchools.find((s) => s.name === formData.school) ?? null,
    [normalizedSchools, formData.school],
  );

  const selectedProgramObj = useMemo(() => {
    if (!selectedSchool || !formData.program) return null;
    return (selectedSchool.programs.find((p) => p.name === formData.program) ?? null);
  }, [selectedSchool, formData.program]);

  const resolvedSchoolId = useMemo(() => {
    if (isLeader && leaderSchoolId) return leaderSchoolId;
    return selectedSchool?.id ?? null;
  }, [isLeader, leaderSchoolId, selectedSchool?.id]);

  const resolvedProgramId = useMemo(() => {
    return selectedProgramObj?.id ?? null;
  }, [selectedProgramObj?.id]);

  // LÍDER: auto-selecciona escuela por schoolId
  useEffect(() => {
    if (!isLeader || !leaderSchoolId) return;
    if (schoolsLoading) return;

    const s = normalizedSchools.find((x) => String(x.id ?? "") === leaderSchoolId);
    if (!s) return;

    setFormData((prev) => {
      if (prev.school?.trim()) return prev;
      return { ...prev, school: s.name, program: "" };
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
        setFormData((prev) => ({ ...prev, program: "" }));
      }
    } else {
      setAvailablePrograms([]);
      if (formData.program) setFormData((prev) => ({ ...prev, program: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.school, normalizedSchools]);

  // ── Cédula validation ──
  const { isCedulaValid } = useCedulaValidation(formData.documentNumber);

  // ── Candidate lookup ──
  const { candidateMatches, isSearching, lookupError, resetSearch, setLookupError } =
    useCandidateLookup(ORG_ID, formData.documentNumber);

  // Clear selected candidate when document changes
  useEffect(() => {
    setSelectedCandidateId(null);
  }, [formData.documentNumber]);

  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const handleHiringContextChange = useCallback((updated: HiringContextDraft) => {
    setHiringContext(updated);
  }, []);

  const handleCandidateDocumentsChange = useCallback((updated: CandidateDocumentsDraft) => {
    setCandidateDocuments(updated);
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
        setFormData((prev) => ({ ...prev, school: value, program: "" } as InterviewData));
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value } as InterviewData));
    },
    [],
  );

  const handlePickCandidate = useCallback(
    (c: TeacherCandidateSearchItemDto) => {
      resetSearch();

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
      setLookupError("Selecciona escuela y programa antes de crear el candidato.");
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
        schoolId: resolvedSchoolId,
        programId: resolvedProgramId,
      });

      resetSearch();
      setSelectedCandidateId(created.id);

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
  }, [formData, resolvedSchoolId, resolvedProgramId, resetSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCedulaValid) return;

    clearDraft();

    onSubmit({
      ...(formData as any),
      candidateId: selectedCandidateId,
      schoolId: resolvedSchoolId,
      programId: resolvedProgramId,
      hiringContext,
      candidateDocuments,
    } as any);
  };

  const loadExample = (example: InterviewData) => {
    resetSearch();

    setSelectedCandidateId(null);

    setCandidateDocuments(createInitialCandidateDocuments());

    setFormData((prev) => {
      const next = { ...example };
      if (isLeader && leaderSchoolId) {
        const s = normalizedSchools.find((x) => String(x.id ?? "") === leaderSchoolId);
        if (s) next.school = s.name;
      }
      return next;
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    resetSearch();

    setSelectedCandidateId(null);

    setHiringContext({ ...initialHiringContext });

    setCandidateDocuments(createInitialCandidateDocuments());

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
    setCurrentStep((prev) => (prev < 5 ? ((prev + 1) as WizardStep) : prev));
  }, []);

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
          onChange={handleChange}
          onPickCandidate={handlePickCandidate}
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
        <InterviewFormHeader />

        <ExampleProfilesToolbar
          onLoadApproved={() => loadExample(approvedExample)}
          onLoadMedium={() => loadExample(mediumExample)}
          onLoadRejected={() => loadExample(rejectedExample)}
        />

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
