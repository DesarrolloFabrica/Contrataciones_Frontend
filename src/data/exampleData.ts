// src/data/exampleData.ts
import { InterviewData } from "../types";
import { createInitialCandidateDocuments } from "../features/leader/interview-form/constants";
import type {
  CandidateDocumentDraft,
  CandidateDocumentsDraft,
  HiringContextDraft,
} from "../features/leader/interview-form/types";

export interface InterviewExampleProfile {
  formData: InterviewData;
  hiringContext: HiringContextDraft;
  candidateDocuments: CandidateDocumentsDraft;
}

const createExampleDocuments = (
  overrides: Record<string, Partial<CandidateDocumentDraft>> = {},
): CandidateDocumentsDraft => ({
  items: createInitialCandidateDocuments().items.map((item) => ({
    ...item,
    status: "Disponible",
    note: "Documento validado para el caso de prueba.",
    tempUrl: "",
    ...overrides[item.id],
  })),
});

/**
 * ✅ Coherente con DB:
 * - school: NOMBRE exacto de school.name (no IDs)
 * - program: NOMBRE exacto de program.name (no IDs)
 * - Evita: Escuela de Salud (sin programas) y especializaciones como programa
 * - Incluye documentNumber (nuevo en el form)
 */

export const approvedExample: InterviewData = {
  documentNumber: "1030123456",
  candidateName: "Dra. Elena Vélez",
  age: "42",
  school: "Escuela de Ingeniería",
  program: "Ingeniería de Sistemas (Presencial)",
  careerSummary:
    "Doctora en Ciencias de la Computación con 15+ años de experiencia en docencia universitaria e investigación aplicada. He liderado proyectos de desarrollo de software y publicado en conferencias internacionales. Mi enfoque es formar ingenieros con base sólida, práctica y ética.",
  previousExperience:
    "Docente universitaria por 10 años en asignaturas como Algoritmos, Estructuras de Datos, Arquitectura de Software e IA. Experiencia en industria como Ingeniera de Software Senior liderando equipos y revisiones técnicas, aportando una visión aplicada al aula.",
  availabilityDetails:
    "Disponibilidad estable lunes a viernes en franjas tarde-noche. Flexibilidad para tutorías y reuniones programadas con coordinación.",
  acceptsCommittees: "Sí",
  otherJobs:
    "Consultoría puntual de forma esporádica. No interfiere con docencia; la prioridad es el compromiso con la institución.",
  evaluationMethodology:
    "Evaluación continua con rúbricas claras: quizzes cortos, talleres guiados, laboratorios de programación, parcial aplicado y proyecto final integrador. Priorizo evidencias de razonamiento y calidad del proceso, no solo el resultado.",
  failureRatePlan:
    "Si hay alta reprobación, reviso evidencia (quizzes, tareas) para detectar conceptos críticos. Ajusto secuencias, agrego refuerzos, tutorías y ejercicios escalonados. Implemento retroalimentación temprana y seguimiento individual a quienes se rezagan.",
  apatheticStudentPlan:
    "Identifico causa (motivación, hábitos, contexto) en conversación individual. Conecto los contenidos con objetivos profesionales y uso aprendizaje basado en proyectos con entregas pequeñas para reactivar participación. Defino expectativas, acompañamiento y métricas de avance.",
  aiToolsUsage:
    "Uso herramientas como GitHub Copilot y asistentes de búsqueda/lectura para apoyar aprendizaje y productividad. Enseño a usarlas como apoyo: planteamiento de hipótesis, verificación y refactor, manteniendo trazabilidad de decisiones.",
  ethicalAiMeasures:
    "Trabajo sesgos, privacidad y trazabilidad. Exijo declaración de uso de IA y reflexión sobre límites. Promuevo buenas prácticas: no exponer datos sensibles, evaluar outputs y justificar decisiones técnicas.",
  aiPlagiarismPrevention:
    "Evalúo por proceso: sustentaciones, preguntas de verificación, commits/iteraciones, y ejercicios contextualizados. Pido que expliquen decisiones, complejidad y trade-offs. La IA se permite con citación y defensa técnica.",
  scenario29:
    "No modifico la nota. Explico criterios con evidencia, muestro oportunidades de mejora y propongo plan de recuperación dentro de reglas (refuerzo/talleres) si la normativa lo permite, sin negociar el estándar.",
  scenarioCoverage:
    "Aviso a coordinación de inmediato y solicito plan de contingencia. Dejo material listo (guía, actividades, repositorio) para continuidad. Nunca delego en personas no autorizadas.",
  scenarioFeedback:
    "Recibo el feedback, pido evidencias y acordamos plan de mejora con métricas. Ajusto metodología y comunicación, y hago seguimiento en próximas sesiones para validar impacto.",
};

export const mediumExample: InterviewData = {
  documentNumber: "1010123456",
  candidateName: "Lic. Carlos Rojas",
  age: "35",
  school: "Escuela de Transformación Empresarial",
  program: "Publicidad y Mercadeo",
  careerSummary:
    "Profesional en publicidad con 10 años en agencias manejando cuentas y campañas. Quiero pasar a docencia para aportar experiencia real y conectar los contenidos con el contexto laboral.",
  previousExperience:
    "He dictado talleres cortos y capacitaciones internas. No tengo trayectoria larga en universidad, pero tengo experiencia práctica y metodología basada en casos.",
  availabilityDetails:
    "Lunes y miércoles en la noche, y sábados en la mañana. Entre semana estoy vinculado laboralmente en horario de oficina.",
  acceptsCommittees: "Depende",
  otherJobs:
    "Trabajo de tiempo completo en agencia. Puedo asistir a comités si se programan en franjas nocturnas o sábados. Requiero calendarización anticipada.",
  evaluationMethodology:
    "Enfoque por entregables: proyecto de campaña con fases (brief, investigación, propuesta creativa, pauta y medición). Evaluaciones cortas de conceptos y rúbricas para cada entrega.",
  failureRatePlan:
    "Si hay baja comprensión, haría sesiones de nivelación por temas (brief, segmentación, métricas) y reentrenaría el alcance del proyecto. Mantendría estándares, pero con acompañamiento y reentregas controladas.",
  apatheticStudentPlan:
    "Trato de enganchar con casos reales y roles del equipo (planner, creativo, medios). Si persiste desinterés, documento seguimiento y coordino estrategias de acompañamiento académico.",
  aiToolsUsage:
    "Uso Midjourney y ChatGPT para ideación y borradores, y enseño a validar y ajustar resultados. Los estudiantes deben justificar decisiones y evidenciar iteraciones.",
  ethicalAiMeasures:
    "Enfatizo derechos de autor, uso responsable, sesgos en imágenes, y transparencia: declarar cuándo se usó IA y cómo se transformó el material.",
  aiPlagiarismPrevention:
    "Uso entregas por etapas, bitácora de decisiones y sustentación. Verifico coherencia entre brief, ejecución y análisis; si hay señales de copia, pido defensa y evidencia del proceso.",
  scenario29:
    "Reviso evidencias y normativa. Si existe opción reglamentaria (actividad de recuperación), la aplico con criterios claros. Si no, mantengo la nota y dejo plan de mejora para el siguiente ciclo.",
  scenarioCoverage:
    "Aviso a coordinación y dejo material asincrónico (guía + actividad). Si se permite, pido apoyo institucional (docente suplente) con brief claro de lo que deben cubrir.",
  scenarioFeedback:
    "Escucho y pido ejemplos concretos. Ajusto la forma de explicar y los criterios de evaluación si algo no fue claro, manteniendo el enfoque práctico pero con estructura académica.",
};

export const rejectedExample: InterviewData = {
  documentNumber: "990012345",
  candidateName: "Sr. Ricardo Montes",
  age: "51",
  school: "Escuela de Ciencias Sociales Jurídicas y Gobierno",
  program: "Administración Pública",
  careerSummary:
    "Me interesa compartir reflexiones sobre liderazgo y sociedad desde mi experiencia personal. Considero que la formación formal no siempre es necesaria y que lo importante es la visión de vida.",
  previousExperience:
    "Charlas informales y motivacionales. No tengo experiencia docente universitaria estructurada ni evidencias de planeación, evaluación o seguimiento académico.",
  availabilityDetails:
    "Disponibilidad variable y sin compromisos fijos. Prefiero decidir semana a semana según mis actividades personales.",
  acceptsCommittees: "No",
  otherJobs:
    "No tengo empleo formal, pero no me interesan reuniones ni procesos administrativos; priorizo mi autonomía y no me adapto a lineamientos institucionales.",
  evaluationMethodology:
    "Evaluación principalmente subjetiva con un ensayo final sin rúbricas claras. No considero necesarios instrumentos, criterios ni evidencias medibles.",
  failureRatePlan:
    "No aplicaría reprobación ni seguimiento. Considero que las notas no son importantes y que el sistema de evaluación es un formalismo.",
  apatheticStudentPlan:
    "No implementaría estrategias de acompañamiento. Asumo que la motivación es responsabilidad exclusiva del estudiante.",
  aiToolsUsage:
    "Prohibiría la IA sin políticas claras y sin criterios académicos de uso responsable. No contemplaría integración guiada ni alfabetización digital.",
  ethicalAiMeasures:
    "No tengo un marco de ética aplicado; mi propuesta es prohibición total sin alternativas pedagógicas.",
  aiPlagiarismPrevention:
    "No tengo un método verificable. Mi enfoque sería punitivo sin proceso de validación ni criterios consistentes.",
  scenario29:
    "Cambiaría la nota para evitar conflictos y simplificar. No priorizo estándares ni consistencia evaluativa.",
  scenarioCoverage:
    "Cancelar clases sin plan de contingencia ni coordinación. No prepararía material alterno ni pediría apoyo institucional.",
  scenarioFeedback:
    "No tomaría acciones de mejora. Considero que el problema es el estudiante y no ajustaría metodología ni comunicación.",
};

export const approvedExampleProfile: InterviewExampleProfile = {
  formData: approvedExample,
  hiringContext: {
    targetRole: "Docente de Ingeniería de Software e IA",
    processType: "Docente",
    requestingArea: "Escuela de Ingeniería",
    needDescription:
      "Se requiere fortalecer la oferta de asignaturas prácticas de programación, arquitectura de software e inteligencia artificial con un perfil docente de alta experiencia académica y aplicada.",
    priority: "Alta",
  },
  candidateDocuments: createExampleDocuments({
    portfolio: {
      note: "Incluye repositorio docente, proyectos de software y evidencias de investigación aplicada.",
      tempUrl: "https://ejemplo.cun.edu.co/portafolio/elena-velez",
    },
    "other-supports": {
      status: "Disponible",
      note: "Cartas de recomendación y certificados de ponencias disponibles.",
    },
  }),
};

export const mediumExampleProfile: InterviewExampleProfile = {
  formData: mediumExample,
  hiringContext: {
    targetRole: "Facilitador de Publicidad y Mercadeo",
    processType: "Facilitador",
    requestingArea: "Escuela de Transformación Empresarial",
    needDescription:
      "Se busca un perfil con experiencia real en agencias para acompañar cursos de campaña, estrategia y medición, con disponibilidad parcial y seguimiento cercano de coordinación.",
    priority: "Media",
  },
  candidateDocuments: createExampleDocuments({
    "academic-certificates": {
      status: "Pendiente",
      note: "Pendiente validar diploma y acta de grado.",
    },
    portfolio: {
      status: "Disponible",
      note: "Presenta muestras de campañas y casos de agencia.",
      tempUrl: "https://ejemplo.cun.edu.co/portafolio/carlos-rojas",
    },
    "other-supports": {
      status: "No aplica",
      note: "No se requieren soportes adicionales para esta prueba.",
    },
  }),
};

export const rejectedExampleProfile: InterviewExampleProfile = {
  formData: rejectedExample,
  hiringContext: {
    targetRole: "Docente de Administración Pública",
    processType: "Docente",
    requestingArea: "Escuela de Ciencias Sociales Jurídicas y Gobierno",
    needDescription:
      "La coordinación necesita evaluar un perfil propuesto para clases introductorias, pero existen dudas sobre metodología, compromiso institucional y criterios de evaluación.",
    priority: "Baja",
  },
  candidateDocuments: createExampleDocuments({
    "academic-certificates": {
      status: "Pendiente",
      note: "No presenta soportes académicos verificables.",
      tempUrl: "",
    },
    "work-certificates": {
      status: "Pendiente",
      note: "Experiencia reportada sin certificaciones laborales.",
    },
    portfolio: {
      status: "Pendiente",
      note: "No aporta portafolio ni evidencias docentes.",
    },
    "other-supports": {
      status: "No aplica",
      note: "Sin soportes complementarios.",
    },
  }),
};
