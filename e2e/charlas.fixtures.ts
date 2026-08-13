import type { Page, Route } from "@playwright/test";

export const ids = {
  vacancy: "11111111-1111-4111-8111-111111111111",
  process: "22222222-2222-4222-8222-222222222222",
  candidate: "33333333-3333-4333-8333-333333333333",
  application: "44444444-4444-4444-8444-444444444444",
  interviewer: "55555555-5555-4555-8555-555555555555",
  responsible: "66666666-6666-4666-8666-666666666666",
  interview: "77777777-7777-4777-8777-777777777777",
  template: "88888888-8888-4888-8888-888888888888",
  version: "99999999-9999-4999-8999-999999999999",
  section: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  question: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  assessment: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  comparison: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
};

const now = "2026-08-13T15:00:00.000Z";
const candidate = { id: ids.candidate, fullName: "Ana Pérez", email: "ana@example.com", phone: null, identificationType: "CC", identificationValue: "123", identificationCountryCode: "CO", createdAt: now, updatedAt: now };
const vacancyBase = {
  id: ids.vacancy, source: "CORE", externalVacancyId: "orbit-vacancy-1", publicId: "VAC-101",
  positionName: "Analista de datos", quantity: 2, hiredQuantity: 0, pendingPositions: 2,
  operationStatus: "requisition_sent", areaExternalId: "area-1", areaName: "Tecnología",
  schoolExternalId: null, schoolName: null, programExternalId: null, programName: null,
  directManagerRawValue: "Jefatura Datos", directManagerIdentifierType: "FREE_TEXT",
  directManagerResolutionStatus: "UNRESOLVED", resolvedManagerPersonExternalId: null,
  resolvedManagerDisplayName: null, coreCreatedAt: now, coreUpdatedAt: now, coreClosedAt: null,
  syncedAt: now, dataQualityFlags: [], eligibility: { status: "ELIGIBLE", reason: "Disponible para iniciar proceso." },
};
const processBase: any = {
  id: ids.process, vacancyReferenceId: ids.vacancy, status: "ACTIVE", activatedAt: now,
  pausedAt: null, completedAt: null, cancelledAt: null, statusUpdatedAt: now, createdAt: now,
  updatedAt: now, activeTemplateVersionId: ids.version,
  activeTemplateVersion: { id: ids.version, versionNumber: 1, status: "PUBLISHED", createdAt: now, updatedAt: now, template: { id: ids.template, name: "Plantilla general", description: null } },
};
const application = { id: ids.application, selectionProcessId: ids.process, candidateId: ids.candidate, status: "IN_PROCESS", statusUpdatedAt: now, createdAt: now, updatedAt: now, candidate, selectionProcess: { ...processBase, vacancyReference: vacancyBase } };
const templateSnapshot = { templateName: "Plantilla general", versionNumber: 1, sections: [{ id: ids.section, title: "Experiencia", description: null, displayOrder: 1, questions: [{ id: ids.question, prompt: "Cuéntanos un logro relevante", helpText: null, type: "LONG_TEXT", required: true, displayOrder: 1, weight: 1, competency: "Experiencia", evaluationGuidance: null, configuration: {} }] }] };

function capabilities(role: "ADMIN" | "INTERVIEWER", responsible: boolean) {
  const base = ["vacancy.read", "process.read", "candidate.read", "participant.read", "interview.read", "interview.execute"];
  if (role === "ADMIN") return [...base, "process.read_all", "vacancy.sync", "process.manage", "candidate.manage", "application.manage", "template.read", "template.manage", "template.publish", "participant.manage", "interview.assign", "interview.read_all", "intelligence.read", "intelligence.generate", "intelligence.regenerate", "decision.read", "decision.manage"];
  return responsible ? [...base, "candidate.manage", "application.manage", "interview.read_all", "intelligence.read", "intelligence.generate", "decision.read", "decision.manage"] : base;
}

function token() {
  return `${Buffer.from("{}").toString("base64url")}.${Buffer.from(JSON.stringify({ exp: 4102444800 })).toString("base64url")}.signature`;
}

function json(route: Route, value: unknown, status = 200) {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(value) });
}

export async function installCharlasMocks(page: Page, profile: "ADMIN" | "INTERVIEWER" | "RESPONSIBLE") {
  const isAdmin = profile === "ADMIN";
  const responsible = profile === "RESPONSIBLE";
  const role = isAdmin ? "ADMIN" : "INTERVIEWER";
  const userId = responsible ? ids.responsible : ids.interviewer;
  const caps = capabilities(role, responsible);
  let interviewStatus = "ASSIGNED";
  let answers: any[] = [];
  let decision: any = null;
  let processCreated = profile !== "ADMIN";
  let templateAssigned = profile !== "ADMIN";
  let candidates = profile !== "ADMIN" ? [application] : [];
  let interviewAssigned = profile !== "ADMIN";
  let participants: any[] = profile === "ADMIN" ? [] : [{ id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", selectionProcessId: ids.process, userId, responsibilities: responsible ? ["INTERVIEWER", "RESPONSIBLE"] : ["INTERVIEWER"], user: { id: userId, fullName: responsible ? "Rosa Responsable" : "Iván Entrevistador", email: "usuario@cun.edu.co" } }];

  const interview = () => ({ id: ids.interview, applicationId: ids.application, interviewerUserId: ids.interviewer, templateVersionId: ids.version, templateSnapshot, status: interviewStatus, generalObservations: null, assignedAt: now, startedAt: interviewStatus === "ASSIGNED" ? null : now, completedAt: interviewStatus === "COMPLETED" ? now : null, cancelledAt: null, application, interviewer: { id: ids.interviewer, fullName: "Iván Entrevistador", email: "ivan@cun.edu.co" }, templateVersion: processBase.activeTemplateVersion, answers });
  const currentProcess = () => ({ ...processBase, activeTemplateVersionId: templateAssigned ? ids.version : null, activeTemplateVersion: templateAssigned ? processBase.activeTemplateVersion : null });
  const vacancy = () => ({ ...vacancyBase, selectionProcesses: processCreated ? [currentProcess()] : [], activeProcess: processCreated ? currentProcess() : null });
  const access = () => ({ selectionProcessId: ids.process, productRole: role, legacyRole: isAdmin ? "ADMIN" : "LIDER", compatibilityMapping: isAdmin ? null : "LIDER", participantId: responsible || !isAdmin ? participants[0]?.id ?? null : null, responsibilities: responsible ? ["INTERVIEWER", "RESPONSIBLE"] : isAdmin ? [] : ["INTERVIEWER"], globalProcessAccess: isAdmin, canRead: true, effectiveCapabilities: caps });
  const processSummary = () => ({ process: { ...currentProcess() }, vacancy: { positionName: vacancyBase.positionName, areaName: vacancyBase.areaName, quantity: 2, hiredQuantity: 0, operationStatus: vacancyBase.operationStatus, resolvedManagerDisplayName: null }, responsibilities: access().responsibilities, responsibles: responsible ? [{ id: ids.responsible, name: "Rosa Responsable" }] : [], indicators: { candidates: candidates.length, interviewers: participants.filter((p) => p.responsibilities.includes("INTERVIEWER")).length, assignedInterviews: profile === "ADMIN" && !candidates.length ? 0 : 1, completedInterviews: interviewStatus === "COMPLETED" ? 1 : 0, assessmentsReady: responsible ? 1 : 0, staleOrFailedAssessments: 0, decisions: decision ? 1 : 0, selected: decision?.decision === "SELECTED" ? 1 : 0, requestedPositions: 2, comparisonStatus: responsible ? "COMPLETED" : null }, checklist: [{ key: "PROCESS", label: "Crear y activar el proceso", state: "READY", reason: "Estado CHARLAS: ACTIVE" }, { key: "TEMPLATE", label: "Asignar una plantilla publicada", state: templateAssigned ? "READY" : "BLOCKED", reason: templateAssigned ? "Plantilla activa disponible." : "El proceso aún no tiene plantilla." }, { key: "CANDIDATES", label: "Registrar candidatos", state: candidates.length ? "READY" : "PENDING", reason: `${candidates.length} candidatura(s) registrada(s).` }], access: access() });
  const home = () => ({ profile: { productRole: role, legacyRole: isAdmin ? "ADMIN" : "LIDER", compatibilityMapping: isAdmin ? null : "LIDER" }, work: { pending: profile === "INTERVIEWER" && interviewStatus === "ASSIGNED" ? [interview()] : [], inProgress: profile === "INTERVIEWER" && interviewStatus === "IN_PROGRESS" ? [interview()] : [], recentCompleted: profile === "INTERVIEWER" && interviewStatus === "COMPLETED" ? [interview()] : [] }, processes: profile === "ADMIN" ? [] : [{ id: ids.process, vacancyReferenceId: ids.vacancy, status: "ACTIVE", positionName: vacancyBase.positionName, areaName: vacancyBase.areaName, quantity: 2, responsibilities: access().responsibilities, updatedAt: now }], responsibleProcesses: responsible ? [processSummary()] : [], admin: isAdmin ? { coreSnapshot: { available: true, lastSyncedAt: now, message: "Trabajando con la última información sincronizada de Orbit." }, vacancyCount: 1, activeProcesses: processCreated ? 1 : 0, templateCount: 1, failedJobs: [] } : null });

  const assessment = { id: ids.assessment, applicationId: ids.application, version: 1, status: "COMPLETED", coverage: { requiredInterviews: 1, completedInterviews: 1, cancelledInterviews: 0, pendingInterviews: 0, completionPercentage: 100, status: "COMPLETE" }, output: { consolidatedSummary: "La candidata demuestra experiencia relevante.", strengths: ["Análisis"], risks: ["Profundizar liderazgo"], competencies: [], evidence: [{ sourceRef: "Q1", statement: "Explicó un logro medible", classification: "EVIDENCE", relevance: "Experiencia" }], disagreementsBetweenInterviewers: [], informationGaps: [], facts: [], inferences: [], interviewerOpinions: [], confidence: 0.9, recommendation: "RECOMMENDED", recommendationExplanation: "La evidencia respalda el perfil." }, aggregateScoring: { status: "AVAILABLE", overallScore: 88, confidence: 0.9, reason: "Criterios comparables", criteria: [] }, overallScore: "88", scoringStatus: "AVAILABLE", recommendation: "RECOMMENDED", confidence: "0.9", errorCode: null, errorMessage: null, provider: "mock", model: "fixture", promptVersion: "test", generatedAt: now, staleAt: null };
  const comparison = { id: ids.comparison, selectionProcessId: ids.process, version: 1, status: "COMPLETED", output: { summary: "Comparativo disponible para revisión humana.", candidates: [{ candidateRef: "C1", strengths: ["Análisis"], risks: [], competencies: ["Datos"], gaps: [], differentiators: [], tradeOffs: [], recommendationSummary: "Buen ajuste" }], crossCandidateTradeOffs: [], informationGaps: [], recommendationSummary: "Revisar evidencia antes de decidir.", confidence: 0.88 }, inputSnapshot: { references: { C1: ids.application } }, ranking: [{ applicationId: ids.application, rank: 1, score: 88 }], isScoreComparable: true, errorCode: null, errorMessage: null, generatedAt: now };
  const overview = () => ({ process: { ...currentProcess(), vacancyReference: { id: ids.vacancy, positionName: vacancyBase.positionName, areaName: vacancyBase.areaName, quantity: 2, hiredQuantity: 0 } }, capacity: { requestedPositions: 2, hiredInCore: 0, pendingInCore: 2, locallySelected: decision?.decision === "SELECTED" ? 1 : 0, locallyAvailable: decision?.decision === "SELECTED" ? 1 : 2, coreCapacityWarning: false }, candidates: [{ application, coverage: assessment.coverage, interviews: [{ interview: { ...interview(), status: "COMPLETED" }, analysis: { status: "COMPLETED" }, analysisJob: null }], assessment, assessmentJob: null, decision }], comparison, comparisonJob: null, canManageDecisions: responsible || isAdmin, readiness: { applications: 1, requiredInterviews: 1, completedInterviews: 1, interviewsComplete: true, assessmentsGenerated: 1, decisionsRegistered: decision ? 1 : 0, locallySelected: decision?.decision === "SELECTED" ? 1 : 0, requestedPositions: 2, hiredInCore: 0, localPositionsCovered: false, readyForHumanCompletion: false, processStatus: "ACTIVE", note: "Falta registrar la decisión humana." } });

  await page.route("http://127.0.0.1:3001/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    if (path === "/auth/dev/email" && method === "POST") return json(route, { accessToken: token(), user: { id: userId, email: "usuario@cun.edu.co", role: isAdmin ? "ADMIN" : "LIDER", schoolId: null, fullName: isAdmin ? "Ada Administradora" : responsible ? "Rosa Responsable" : "Iván Entrevistador", productRole: role, capabilities: caps } });
    if (path === "/selection/product/home") return json(route, home());
    if (path === `/selection/product/processes/${ids.process}/summary`) return json(route, processSummary());
    if (path === `/selection/access/processes/${ids.process}`) return json(route, access());
    if (path === "/selection/vacancy-references" && method === "GET") return json(route, [vacancy()]);
    if (path === `/selection/vacancy-references/${ids.vacancy}`) return json(route, vacancy());
    if (path === "/selection/processes" && method === "POST") { processCreated = true; templateAssigned = false; return json(route, currentProcess(), 201); }
    if (path === `/selection/processes/${ids.process}/template` && method === "PATCH") { templateAssigned = true; return json(route, currentProcess()); }
    if (path === "/selection/templates" && method === "GET") return json(route, [{ id: ids.template, name: "Plantilla general", description: null, versions: [processBase.activeTemplateVersion] }]);
    if (path === "/selection/candidates" && method === "POST") return json(route, candidate, 201);
    if (path === "/selection/candidates" && method === "GET") return json(route, [candidate]);
    if (path === "/selection/applications" && method === "GET") return json(route, candidates);
    if (path === "/selection/applications" && method === "POST") { candidates = [application]; return json(route, application, 201); }
    if (path === `/selection/participants/process/${ids.process}` && method === "GET") return json(route, participants);
    if (path === "/selection/participants/available-users") return json(route, [{ id: ids.interviewer, fullName: "Iván Entrevistador", email: "ivan@cun.edu.co", role: "LIDER", isActive: true }]);
    if (path === `/selection/participants/process/${ids.process}` && method === "PUT") { participants = [{ id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", selectionProcessId: ids.process, userId: ids.interviewer, responsibilities: ["INTERVIEWER"], user: { id: ids.interviewer, fullName: "Iván Entrevistador", email: "ivan@cun.edu.co" } }]; return json(route, participants[0]); }
    if (path === "/selection/interviews" && method === "GET") return json(route, interviewAssigned ? [interview()] : []);
    if (path === "/selection/interviews" && method === "POST") { interviewAssigned = true; return json(route, interview(), 201); }
    if (path === `/selection/interviews/${ids.interview}` && method === "GET") return json(route, interview());
    if (path === `/selection/interviews/${ids.interview}/start` && method === "POST") { interviewStatus = "IN_PROGRESS"; return json(route, interview()); }
    if (path === `/selection/interviews/${ids.interview}/draft` && method === "PATCH") { const body = request.postDataJSON(); answers = body.answers.map((item: any, index: number) => ({ id: `answer-${index}`, interviewId: ids.interview, questionId: item.questionId, value: item.value, questionSnapshot: {}, updatedAt: now })); return json(route, interview()); }
    if (path === `/selection/interviews/${ids.interview}/complete` && method === "POST") { interviewStatus = "COMPLETED"; return json(route, interview()); }
    if (path === `/selection/intelligence/processes/${ids.process}/overview`) return json(route, overview());
    if (path === `/selection/intelligence/applications/${ids.application}/assessment` && method === "GET") return json(route, { ...overview().candidates[0], process: overview().process, capacity: overview().capacity, canManageDecision: responsible || isAdmin, assessmentHistory: [assessment], decisionHistory: decision ? [decision] : [] });
    if (path === `/selection/intelligence/applications/${ids.application}/assessment` && method === "POST") return json(route, { job: null, result: assessment, reused: true });
    if (path === `/selection/decisions/applications/${ids.application}` && method === "POST") { const body = request.postDataJSON(); decision = { id: "decision-1", applicationId: ids.application, decision: body.decision, reason: body.reason, notes: body.notes ?? null, assessmentId: ids.assessment, active: true, decidedAt: now, decidedBy: { id: userId, fullName: "Rosa Responsable", email: "usuario@cun.edu.co" } }; return json(route, decision, 201); }
    return json(route, { message: `Mock no definido: ${method} ${path}` }, 500);
  });
}

export async function login(page: Page, email = "usuario@cun.edu.co") {
  await page.goto("/login");
  await page.getByLabel("Correo institucional").fill(email);
  await page.getByRole("button", { name: "Ingresar con correo" }).click();
  await page.waitForURL("**/charlas");
  await page.getByRole("heading", { name: "Tu trabajo en CHARLAS" }).waitFor();
}
