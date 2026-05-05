import { InterviewData } from "../../../types";

// helper para reconstruir InterviewData desde lo que devuelve el backend
export const mapFormToInterviewData = (detail: any): InterviewData => {
  const form = detail?.formRawData ?? {};
  const candidate = detail?.candidate ?? form?.candidate ?? {};
  const formCandidate = form?.candidate ?? {};
  const availability = form?.availability ?? {};
  const classroomManagement = form?.classroomManagement ?? {};
  const aiAttitude = form?.aiAttitude ?? {};
  const coherenceCommitment = form?.coherenceCommitment ?? {};

  return {
    candidateName: formCandidate.fullName ?? candidate.fullName ?? "",
    age: formCandidate.age ? String(formCandidate.age) : "",
    documentNumber:
      formCandidate.documentNumber ??
      formCandidate.document_number ??
      formCandidate.document ??
      candidate.documentNumber ??
      candidate.document_number ??
      "",
    school: formCandidate.schoolName ?? candidate.school?.name ?? "",
    program: formCandidate.programName ?? candidate.program?.name ?? "",
    candidateId: detail.candidateId ?? candidate.id ?? null,
    schoolId: formCandidate.schoolId ?? candidate.schoolId ?? null,
    programId: formCandidate.programId ?? candidate.programId ?? null,
    careerSummary: formCandidate.careerSummary ?? "",
    previousExperience: formCandidate.teachingExperience ?? "",

    availabilityDetails: availability.scheduleDetails ?? "",
    acceptsCommittees: availability.acceptsCommittees ?? "",
    otherJobs: availability.otherJobsImpact ?? "",

    evaluationMethodology: classroomManagement.evaluationMethodology ?? "",
    failureRatePlan: classroomManagement.planIfHalfFail ?? "",
    apatheticStudentPlan: classroomManagement.handleApatheticStudent ?? "",

    aiToolsUsage: aiAttitude.usesAiHow ?? "",
    ethicalAiMeasures: aiAttitude.ethicalUseMeasures ?? "",
    aiPlagiarismPrevention: aiAttitude.handleAiPlagiarism ?? "",

    scenario29: coherenceCommitment.caseStudent2_9 ?? "",
    scenarioCoverage: coherenceCommitment.emergencyProtocol ?? "",
    scenarioFeedback: coherenceCommitment.handleNegativeFeedback ?? "",
  };
};
