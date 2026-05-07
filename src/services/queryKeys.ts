const evaluations = {
  all: ["evaluations"] as const,
  lists: () => [...evaluations.all, "list"] as const,
  list: () => [...evaluations.lists()] as const,
  details: () => [...evaluations.all, "detail"] as const,
  detail: (id: string) => [...evaluations.details(), id] as const,
  summary: (id: string) => [...evaluations.detail(id), "summary"] as const,
  coordinatorDecision: (id: string) => [...evaluations.detail(id), "coordinator-decision"] as const,
  adminDecision: (id: string) => [...evaluations.detail(id), "admin-decision"] as const,
};

const users = {
  all: ["users"] as const,
  lists: () => [...users.all, "list"] as const,
  list: () => [...users.lists()] as const,
  detail: (id: string) => [...users.all, "detail", id] as const,
};

const audit = {
  all: ["audit"] as const,
  lists: () => [...audit.all, "list"] as const,
  list: (filters?: { entityType?: string; entityId?: string }) =>
    [...audit.lists(), filters?.entityType ?? "ALL", filters?.entityId ?? "GLOBAL"] as const,
};

const dashboard = {
  all: ["dashboard"] as const,
  detail: (params: { orgId?: string | null; schoolId?: string | null; programId?: string | null; from: string; to: string }) =>
    [...dashboard.all, "detail", params.orgId ?? "null", params.schoolId ?? "null", params.programId ?? "null", params.from, params.to] as const,
};

const schools = {
  all: ["schools"] as const,
  lists: () => [...schools.all, "list"] as const,
  list: () => [...schools.lists()] as const,
  programs: (schoolId: string) => [...schools.all, "programs", schoolId] as const,
  schoolsWithPrograms: () => [...schools.all, "with-programs"] as const,
};

const candidates = {
  all: ["candidates"] as const,
  search: (orgId: string, q: string) => [...candidates.all, "search", orgId, q] as const,
};

const documents = {
  all: ["documents"] as const,
  byCandidate: (candidateId: string) => [...documents.all, "candidate", candidateId] as const,
  byEvaluation: (evaluationId: string) => [...documents.all, "evaluation", evaluationId] as const,
};

const coordinatorUsers = {
  all: ["coordinator-users"] as const,
  lists: () => [...coordinatorUsers.all, "list"] as const,
  list: (schoolId: string | null) => [...coordinatorUsers.lists(), schoolId ?? "null"] as const,
};

const areas = {
  all: ["areas"] as const,
  lists: () => [...areas.all, "list"] as const,
  list: () => [...areas.lists()] as const,
};

export const queryKeys = {
  evaluations,
  users,
  audit,
  dashboard,
  schools,
  candidates,
  documents,
  coordinatorUsers,
  areas,
} as const;
