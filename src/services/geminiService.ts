// src/services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import {
  InterviewData,
  AnalysisResult,
  TeacherAiResult,
} from "../types";

// Tomar la API key desde Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// ⚠️ IMPORTANTE: ya NO lanzamos error aquí
if (!apiKey) {
  console.warn(
    "⚠️ VITE_GEMINI_API_KEY no está configurada. La IA del frontend estará deshabilitada en este entorno."
  );
}

// Si hay key, creamos el cliente. Si no, lo dejamos en null.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallRiskLevel: {
      type: Type.STRING,
      description:
        "Nivel de riesgo general del candidato ('Bajo', 'Medio', 'Alto').",
      enum: ["Bajo", "Medio", "Alto"],
    },
    overallScore: {
      type: Type.NUMBER,
      description:
        "Puntaje numérico global del 0 al 100, donde 100 es el mejor.",
    },
    executiveSummary: {
      type: Type.STRING,
      description:
        "Resumen ejecutivo conciso del perfil del candidato, sus fortalezas y debilidades clave.",
    },
    categoryAnalyses: {
      type: Type.ARRAY,
      description: "Análisis detallado por cada una de las cuatro categorías.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description:
              "Nombre de la categoría analizada (ej: 'Disponibilidad y Condiciones', 'Manejo de Aula', 'Actitud Frente a la IA', 'Coherencia y Compromiso').",
          },
          score: {
            type: Type.NUMBER,
            description: "Puntaje de 0 a 100 para esta categoría.",
          },
          reporteAnalitico: {
            type: Type.STRING,
            description:
              "Reporte detallado que justifica el puntaje. Debe incluir un análisis comparativo con datos o estadísticas simuladas para dar contexto.",
          },
          oportunidades: {
            type: Type.STRING,
            description:
              "Describe las principales fortalezas u oportunidades que el candidato presenta en esta área.",
          },
          recomendaciones: {
            type: Type.STRING,
            description:
              "Proporciona una recomendación específica para validar o mejorar en esta categoría.",
          },
          observacionesCorregidas: {
            type: Type.STRING,
            description:
              "Texto original del usuario para esta categoría, pero corregido gramaticalmente y ortográficamente.",
          },
        },
        required: [
          "category",
          "score",
          "reporteAnalitico",
          "oportunidades",
          "recomendaciones",
          "observacionesCorregidas",
        ],
      },
    },
    mitigationRecommendations: {
      type: Type.ARRAY,
      description:
        "Lista de recomendaciones generales para mitigar los riesgos identificados. Si el riesgo es Bajo, puede estar vacío.",
      items: { type: Type.STRING },
    },
    resignationRiskWindow: {
      type: Type.STRING,
      description:
        "Ventana de tiempo estimada en la que el candidato podría renunciar.",
    },
    temporalRiskFactors: {
      type: Type.ARRAY,
      description:
        "Lista de los factores de riesgo específicos que justifican la ventana de renuncia estimada.",
      items: { type: Type.STRING },
    },
    finalVerdict: {
      type: Type.STRING,
      description:
        "Veredicto final: recomendación clara sobre la contratación.",
    },
  },
  required: [
    "overallRiskLevel",
    "overallScore",
    "executiveSummary",
    "categoryAnalyses",
    "mitigationRecommendations",
    "resignationRiskWindow",
    "temporalRiskFactors",
    "finalVerdict",
  ],
};

  export type InterviewComparisonResult = {
    interviewsCompared: number;
  
    // Resumen ultra corto para encabezado
    executiveComparison: string;
  
    // Similitudes fuertes (3–8 bullets)
    similarities: string[];
  
    // Diferencias claras por temas (3–10 bullets)
    differences: string[];
  
    // Evolución entre entrevistas (mejoró/empeoró/estable) con explicación
    evolution: {
      overallTrend: "Mejora" | "Empeora" | "Estable" | "Mixto";
      scoreTrend: string; // explicación breve
      riskTrend: string;  // explicación breve
      verdictTrend: string; // explicación breve
    };
  
    // Hallazgos por dimensión (las 4 categorías)
    categoryChanges: Array<{
      category: string;
      trend: "Mejora" | "Empeora" | "Estable" | "Mixto";
      keyChanges: string[]; // bullets
    }>;
  
    // Alertas o inconsistencias (opcional)
    redFlags: string[];
  
    // Qué entrevista parece "más fuerte" (si aplica)
    bestInterview: {
      evaluationId: string;
      reason: string;
    } | null;
  
    // Qué entrevista parece "más débil" (si aplica)
    weakestInterview: {
      evaluationId: string;
      reason: string;
    } | null;
  };
  
  // ✅ Schema para obligar JSON consistente (Gemini responseSchema)
  const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
      interviewsCompared: { type: Type.NUMBER },
      executiveComparison: { type: Type.STRING },
      similarities: { type: Type.ARRAY, items: { type: Type.STRING } },
      differences: { type: Type.ARRAY, items: { type: Type.STRING } },
      evolution: {
        type: Type.OBJECT,
        properties: {
          overallTrend: {
            type: Type.STRING,
            enum: ["Mejora", "Empeora", "Estable", "Mixto"],
          },
          scoreTrend: { type: Type.STRING },
          riskTrend: { type: Type.STRING },
          verdictTrend: { type: Type.STRING },
        },
        required: ["overallTrend", "scoreTrend", "riskTrend", "verdictTrend"],
      },
      categoryChanges: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            trend: {
              type: Type.STRING,
              enum: ["Mejora", "Empeora", "Estable", "Mixto"],
            },
            keyChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["category", "trend", "keyChanges"],
        },
      },
      redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
      bestInterview: {
        type: Type.OBJECT,
        nullable: true,
        properties: {
          evaluationId: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["evaluationId", "reason"],
      },
      weakestInterview: {
        type: Type.OBJECT,
        nullable: true,
        properties: {
          evaluationId: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["evaluationId", "reason"],
      },
    },
    required: [
      "interviewsCompared",
      "executiveComparison",
      "similarities",
      "differences",
      "evolution",
      "categoryChanges",
      "redFlags",
      "bestInterview",
      "weakestInterview",
    ],
  };


function buildPrompt(data: InterviewData): string {
  return `
    Eres un experto en reclutamiento y selección de personal académico para una institución de educación superior. Tu tarea es analizar la siguiente transcripción de una entrevista a un candidato a facilitador y evaluar su idoneidad, identificando fortalezas, debilidades y riesgos potenciales de manera cuantitativa y cualitativa.

    **Contexto:**
    La institución valora la coherencia, el compromiso, el manejo pedagógico sólido, la adaptabilidad a la tecnología (IA) y el cumplimiento de políticas institucionales.

    **Información del Candidato:**
    - Nombre: ${data.candidateName}
    - Edad: ${data.age}
    - Escuela/Coordinación: ${data.school}
    - Programa Académico: ${data.program}
    - Resumen de Carrera: ${data.careerSummary}
    - Experiencia Docente Previa: ${data.previousExperience}

    **Observaciones del Entrevistador:**

    **1. Sobre Disponibilidad y Condiciones:**
    - Disponibilidad: ${data.availabilityDetails}
    - Aceptación de comités: ${data.acceptsCommittees}
    - Otros empleos: ${data.otherJobs}

    **2. Sobre Manejo de Aula:**
    - Metodología de evaluación: ${data.evaluationMethodology}
    - Plan ante reprobación: ${data.failureRatePlan}
    - Enfoque con estudiantes apáticos: ${data.apatheticStudentPlan}

    **3. Sobre Actitud Frente a la IA:**
    - Uso de herramientas IA: ${data.aiToolsUsage}
    - Medidas de uso ético: ${data.ethicalAiMeasures}
    - Prevención de plagio con IA: ${data.aiPlagiarismPrevention}

    **4. Sobre Coherencia y Compromiso (Escenarios):**
    - Decisión sobre '2.9': ${data.scenario29}
    - Protocolo de cobertura: ${data.scenarioCoverage}
    - Plan ante feedback negativo: ${data.scenarioFeedback}

    **Instrucciones de Análisis:**
    1. Evalúa cada una de las 4 categorías asignando un puntaje de 0 a 100.
    2. Para cada categoría, escribe un Reporte Analítico que justifique el puntaje.
    3. Para cada categoría, identifica Oportunidades y Recomendaciones.
    4. IMPORTANTE: Para cada categoría, corrige y mejora la redacción de las observaciones y devuélvelas como 'observacionesCorregidas'.
    5. Calcula un puntaje global ponderado.
    6. Determina un nivel de riesgo general (Bajo / Medio / Alto).
    7. Escribe un resumen ejecutivo.
    8. Proporciona recomendaciones de mitigación generales.
    9. Emite un veredicto final claro.
    10. Proyecta una ventana temporal de renuncia y justifícala.

    Devuelve SOLO JSON con el esquema indicado.
  `;
}

// --- Función principal de análisis ---
export const analyzeInterviewData = async (
  data: InterviewData
): Promise<AnalysisResult> => {
  // 👉 Aquí sí validamos que exista el cliente antes de usarlo
  if (!ai) {
    throw new Error(
      "La función de análisis con IA no está disponible en este entorno (falta VITE_GEMINI_API_KEY)."
    );
  }

  const prompt = buildPrompt(data);

  try {
    const model = "gemini-2.5-pro";

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
        thinkingConfig: {
          thinkingBudget: 32768,
        },
      },
    });

    const jsonText = response.text;

    if (!jsonText) {
      throw new Error("La respuesta de la IA estaba vacía.");
    }

    const result: AnalysisResult = JSON.parse(jsonText);
    if (!result.categoryAnalyses.every((c) => "observacionesCorregidas" in c)) {
      console.warn(
        "La respuesta de la IA no incluyó 'observacionesCorregidas' en todas las categorías."
      );
    }

    return result;
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    if (error instanceof Error && error.message.includes("SAFETY")) {
      throw new Error(
        "La solicitud fue bloqueada por políticas de seguridad. Revisa el contenido de las respuestas."
      );
    }
    throw new Error(
      "No se pudo completar el análisis. Inténtalo de nuevo más tarde."
    );
  }
};

type CompareInput = Array<{
  evaluationId: string;
  createdAt: string;
  analysis: AnalysisResult;
  candidateName?: string;
  programName?: string;
  schoolName?: string;
}>;

/**
 * ✅ Compara múltiples reportes IA (AnalysisResult) del mismo candidato.
 * Devuelve un JSON estructurado con similitudes, diferencias y evolución.
 */
export const compareTeacherEvaluations = async (
  reports: CompareInput
): Promise<InterviewComparisonResult> => {
  // 👉 Validación: cliente IA disponible
  if (!ai) {
    throw new Error(
      "La comparación con IA no está disponible en este entorno (falta VITE_GEMINI_API_KEY)."
    );
  }

  // ✅ Regla: mínimo 2 entrevistas para comparar
  if (!reports || reports.length < 2) {
    throw new Error("Se requieren mínimo 2 entrevistas para comparar.");
  }

  // ✅ Ordena por fecha ascendente para analizar evolución correctamente
  const ordered = [...reports].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // ✅ Tomamos datos de contexto del primer reporte (si existen)
  const context = {
    candidateName: ordered[0].candidateName ?? "Candidato",
    programName: ordered[0].programName ?? null,
    schoolName: ordered[0].schoolName ?? null,
  };

  // ✅ Reducimos un poquito el payload: nos quedamos con lo más útil del análisis
  // (esto baja tokens y hace el modelo más “determinista” en lo que compara)
  const compact = ordered.map((r) => ({
    evaluationId: r.evaluationId,
    createdAt: r.createdAt,
    overallScore: r.analysis.overallScore,
    overallRiskLevel: r.analysis.overallRiskLevel,
    finalVerdict: r.analysis.finalVerdict,
    executiveSummary: r.analysis.executiveSummary,
    categoryAnalyses: r.analysis.categoryAnalyses?.map((c) => ({
      category: c.category,
      score: c.score,
      oportunidades: c.oportunidades,
      recomendaciones: c.recomendaciones,
      // OJO: evitamos el reporteAnalitico largo para no inflar tokens
      // reporteAnalitico: c.reporteAnalitico,
    })),
    mitigationRecommendations: r.analysis.mitigationRecommendations ?? [],
    resignationRiskWindow: r.analysis.resignationRiskWindow,
    temporalRiskFactors: r.analysis.temporalRiskFactors ?? [],
  }));

  const prompt = `
Eres un analista experto en selección docente para educación superior (CUN).
Tu tarea: comparar múltiples reportes de IA del MISMO candidato, generados en distintas entrevistas.

Contexto candidato:
- Nombre: ${context.candidateName}
- Programa: ${context.programName ?? "N/A"}
- Escuela: ${context.schoolName ?? "N/A"}

Insumo (ordenado por fecha, de la entrevista más antigua a la más reciente):
${JSON.stringify(compact, null, 2)}

Instrucciones:
1) Detecta SIMILITUDES sólidas entre entrevistas (comportamientos, consistencia, patrones).
2) Detecta DIFERENCIAS claras (cambios de discurso, contradicciones, variaciones de puntaje/riesgo/veredicto).
3) Describe EVOLUCIÓN: tendencia general (Mejora/Empeora/Estable/Mixto) y justifica en 2–4 frases por score, riesgo y veredicto.
4) Analiza cambios por categoría (las 4 dimensiones) y resume el “trend” y 2–5 bullets de cambios clave.
5) Marca “redFlags”: inconsistencias, riesgos repetidos, señales de alerta.
6) Si aplica, identifica bestInterview y weakestInterview por evaluationId con razón breve.
7) Devuelve SOLO JSON con el schema indicado.
`;

  try {
    const model = "gemini-2.5-pro";

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: comparisonSchema,
        temperature: 0.25, // ✅ más estable
        thinkingConfig: {
          thinkingBudget: 32768,
        },
      },
    });

    const jsonText = response.text;

    if (!jsonText) {
      throw new Error("La respuesta de la IA estaba vacía.");
    }

    return JSON.parse(jsonText) as InterviewComparisonResult;
  } catch (error) {
    console.error("Error al comparar entrevistas con Gemini:", error);
    throw new Error("No se pudo generar la comparación IA. Intenta de nuevo.");
  }
};


// --- Helper que empaqueta el resultado para el backend ---
export const analyzeTeacherInterview = async (
  data: InterviewData
): Promise<TeacherAiResult> => {
  const result = await analyzeInterviewData(data);

  const strengths = result.categoryAnalyses
    .map((c) => `• [${c.category}] ${c.oportunidades}`)
    .join("\n");

  const improvementAreas = result.categoryAnalyses
    .map((c) => `• [${c.category}] ${c.recomendaciones}`)
    .join("\n");

  const weaknesses =
    result.mitigationRecommendations && result.mitigationRecommendations.length
      ? result.mitigationRecommendations.map((m) => `• ${m}`).join("\n")
      : undefined;

  return {
    strengths,
    weaknesses,
    improvementAreas,
    teachingSuitabilityScore: result.overallScore,
    recommendation: result.finalVerdict,
    overallComment: result.executiveSummary,
    rawOutput: result,
  };
};
