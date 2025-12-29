import type { InterviewData } from "../../types";

// ✅ convierte el form del líder al payload que espera backend
export function mapInterviewToBackendPayload(data: InterviewData) {
  return {
    candidate: {
      fullName: data.candidateName,
      age: Number(data.age || 0),
      schoolName: data.school,
      programName: data.program,

      // ✅ clave: backend
      document_number: data.documentNumber,
    },

    // ... el resto de campos según tu backend actual
  };
}
