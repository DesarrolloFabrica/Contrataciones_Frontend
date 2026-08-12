import type { InterviewData, TeacherForm } from "../../../types";

export const toBackendTeacherForm = (form: TeacherForm) => {
  return {
    ...form,
    candidate: {
      ...form.candidate,
      document_number: form.candidate.documentNumber?.trim() || "",
    },
  };
};

/** Tolera formRawData incompleto (p. ej. seeds mock) sin romper el detalle. */
export const mapFormToInterviewData = (form: Partial<TeacherForm> | any): InterviewData => {
  const candidate = form?.candidate ?? {};
  const availability = form?.availability ?? {};
  const classroomManagement = form?.classroomManagement ?? {};
  const aiAttitude = form?.aiAttitude ?? {};
  const coherenceCommitment = form?.coherenceCommitment ?? {};
  const answers = form?.answers ?? {};

  return {
    documentNumber:
      candidate.documentNumber ??
      candidate.document_number ??
      "",
    candidateName: candidate.fullName ?? "",
    age: candidate.age != null && candidate.age !== "" ? String(candidate.age) : "",
    school: candidate.schoolName ?? candidate.school ?? "",
    program: candidate.programName ?? candidate.program ?? "",
    careerSummary:
      candidate.careerSummary ??
      answers.careerSummary ??
      "",
    previousExperience:
      candidate.teachingExperience ??
      answers.previousExperience ??
      "",

    availabilityDetails:
      availability.scheduleDetails ??
      answers.availabilityDetails ??
      "",
    acceptsCommittees:
      (availability.acceptsCommittees ??
        answers.acceptsCommittees ??
        "Depende") as InterviewData["acceptsCommittees"],
    otherJobs:
      availability.otherJobsImpact ??
      answers.otherJobs ??
      "",

    evaluationMethodology:
      classroomManagement.evaluationMethodology ??
      answers.evaluationMethodology ??
      "",
    failureRatePlan:
      classroomManagement.planIfHalfFail ??
      answers.failureRatePlan ??
      "",
    apatheticStudentPlan:
      classroomManagement.handleApatheticStudent ??
      answers.apatheticStudentPlan ??
      "",

    aiToolsUsage: aiAttitude.usesAiHow ?? answers.aiToolsUsage ?? "",
    ethicalAiMeasures:
      aiAttitude.ethicalUseMeasures ?? answers.ethicalAiMeasures ?? "",
    aiPlagiarismPrevention:
      aiAttitude.handleAiPlagiarism ?? answers.aiPlagiarismPrevention ?? "",

    scenario29:
      coherenceCommitment.caseStudent2_9 ?? answers.scenario29 ?? "",
    scenarioCoverage:
      coherenceCommitment.emergencyProtocol ?? answers.scenarioCoverage ?? "",
    scenarioFeedback:
      coherenceCommitment.handleNegativeFeedback ?? answers.scenarioFeedback ?? "",
  };
};
