import { InterviewData } from "../../../types";

// helper para reconstruir InterviewData desde lo que devuelve el backend
export const mapFormToInterviewData = (detail: any): InterviewData => {
  const form = detail.formRawData;
  return {
    candidateName: form.candidate.fullName,
    age: form.candidate.age ? String(form.candidate.age) : "",
    school: form.candidate.schoolName,
    program: form.candidate.programName,
    careerSummary: form.candidate.careerSummary,
    previousExperience: form.candidate.teachingExperience,

    availabilityDetails: form.availability.scheduleDetails,
    acceptsCommittees: form.availability.acceptsCommittees,
    otherJobs: form.availability.otherJobsImpact,

    evaluationMethodology: form.classroomManagement.evaluationMethodology,
    failureRatePlan: form.classroomManagement.planIfHalfFail,
    apatheticStudentPlan: form.classroomManagement.handleApatheticStudent,

    aiToolsUsage: form.aiAttitude.usesAiHow,
    ethicalAiMeasures: form.aiAttitude.ethicalUseMeasures,
    aiPlagiarismPrevention: form.aiAttitude.handleAiPlagiarism,

    scenario29: form.coherenceCommitment.caseStudent2_9,
    scenarioCoverage: form.coherenceCommitment.emergencyProtocol,
    scenarioFeedback: form.coherenceCommitment.handleNegativeFeedback,
  };
};
