// src/services/mappers/mapInterviewToTeacherForm.ts
import type { InterviewData, TeacherForm } from "../../types";

/**
 * Convierte el formulario legacy (InterviewData) al payload moderno (TeacherForm)
 * listo para enviarse al backend.
 */
export function mapInterviewToTeacherForm(data: InterviewData): TeacherForm {
  return {
    candidate: {
      // ✅ backend espera snake_case
      documentNumber: (data.documentNumber ?? "").trim(),

      fullName: (data.candidateName ?? "").trim(),
      age: Number(data.age || 0),
      schoolId: data.schoolId ?? null,
      schoolName: data.school,
      programId: data.programId ?? null,
      programName: data.program,
      careerSummary: data.careerSummary,
      teachingExperience: data.previousExperience,
    } as any,

    availability: {
      scheduleDetails: data.availabilityDetails,
      acceptsCommittees: data.acceptsCommittees,
      otherJobsImpact: data.otherJobs,
    },

    classroomManagement: {
      evaluationMethodology: data.evaluationMethodology,
      planIfHalfFail: data.failureRatePlan,
      handleApatheticStudent: data.apatheticStudentPlan,
    },

    aiAttitude: {
      usesAiHow: data.aiToolsUsage,
      ethicalUseMeasures: data.ethicalAiMeasures,
      handleAiPlagiarism: data.aiPlagiarismPrevention,
    },

    coherenceCommitment: {
      caseStudent2_9: data.scenario29,
      emergencyProtocol: data.scenarioCoverage,
      handleNegativeFeedback: data.scenarioFeedback,
    },
  };
}
