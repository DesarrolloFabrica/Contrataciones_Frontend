// src/pages/coordinator/components/EvaluationsListPanel.tsx
import React, { useMemo } from "react";
import { Calendar, FileText, Filter, Search, Lock } from "lucide-react";
import TeacherEvaluationItem from "../../../components/TeacherEvaluationItem";
import type { DecisionFilter, LocalDecision, CandidateGroup } from "../types";

type ProgramOption = { id: string; name: string };

const normalizeDecision = (value: unknown): LocalDecision => {
  const v = String(value ?? "").trim().toUpperCase();

  // Backend EN
  if (v === "PENDING") return "PENDIENTE";
  if (v === "APPROVED") return "APROBADO";
  if (v === "REJECTED") return "RECHAZADO";

  // ES
  if (v === "PENDIENTE") return "PENDIENTE";
  if (v === "APROBADO") return "APROBADO";
  if (v === "RECHAZADO") return "RECHAZADO";

  // Fallback por contains
  if (v.includes("PEND")) return "PENDIENTE";
  if (v.includes("APROB")) return "APROBADO";
  if (v.includes("RECHAZ")) return "RECHAZADO";

  return "PENDIENTE";
};

const toTime = (d?: unknown) => {
  const t = new Date(String(d ?? "")).getTime();
  return Number.isFinite(t) ? t : 0;
};

type Props = {
  schoolFilter: string;
  setSchoolFilter: (v: string) => void;

  // programFilter ahora es programId
  programFilter: string;
  setProgramFilter: (v: string) => void;

  schoolOptions: string[];
  programOptions: ProgramOption[];

  mustChooseScope: boolean;

  groupedCandidates: CandidateGroup[];
  selectedId: string | null;

  search: string;
  setSearch: (v: string) => void;

  decisionFilter: DecisionFilter;
  setDecisionFilter: (v: DecisionFilter) => void;

  localDecisions: Record<string, LocalDecision>;

  onSelectEvaluation: (candidateKey: string, evaluationId: string) => void;

  onOpenDetail: (candidateKey: string, evaluationId: string) => void;
  onOpenSecond: (candidateKey: string, evaluationId: string) => void;

  lockedSchool?: boolean;
  schoolHint?: string;
};

const EvaluationsListPanel: React.FC<Props> = ({
  schoolFilter,
  setSchoolFilter,
  programFilter,
  setProgramFilter,
  schoolOptions,
  programOptions,
  mustChooseScope,

  groupedCandidates,
  selectedId,
  search,
  setSearch,
  decisionFilter,
  setDecisionFilter,
  localDecisions,

  onSelectEvaluation,
  onOpenDetail,
  onOpenSecond,

  lockedSchool,
  schoolHint,
}) => {
  /**
   * Estado del candidato:
   * 1) si existe decisión local para alguna entrevista, toma la más reciente
   * 2) si no, toma la más reciente del backend (coordinatorDecisionStatus / coordinatorDecision.verdict)
   */
  const getCandidateDecision = (g: CandidateGroup): LocalDecision => {
    const interviews = Array.isArray(g.interviews) ? g.interviews : [];

    // 1) Local (tiene prioridad)
    const localWithTime = interviews
      .map((ev: any) => ({
        id: ev?.id,
        t: Math.max(toTime(ev?.updatedAt), toTime(ev?.createdAt)),
        local: ev?.id ? localDecisions?.[ev.id] : undefined,
      }))
      .filter((x) => !!x.local)
      .sort((a, b) => b.t - a.t);

    if (localWithTime.length > 0) return localWithTime[0].local as LocalDecision;

    // 2) Backend (más reciente)
    const backendWithTime = interviews
      .map((ev: any) => {
        const raw =
          ev?.coordinatorDecisionStatus ??
          ev?.coordinatorDecision?.verdict ?? // por si en algún punto lo envías anidado
          ev?.coordinatorDecision ?? // fallback
          null;

        return {
          t: Math.max(toTime(ev?.updatedAt), toTime(ev?.createdAt)),
          raw,
        };
      })
      .sort((a, b) => b.t - a.t);

    if (backendWithTime.length > 0) return normalizeDecision(backendWithTime[0].raw);

    return "PENDIENTE";
  };

  const visibleGroups = useMemo(() => {
    if (mustChooseScope) return [];
    return groupedCandidates.filter((g) => {
      if (decisionFilter === "ALL") return true;
      return getCandidateDecision(g) === decisionFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mustChooseScope, groupedCandidates, decisionFilter, localDecisions]);

  return (
    <div className="bg-[#1F1F1F]/30 border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Evaluaciones Registradas
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Selecciona escuela y programa para ver el historial.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Historial guardado en backend</span>
        </div>
      </div>

      {/* SCOPE (obligatorio) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
            Escuela / Coordinación
            {lockedSchool ? <Lock className="w-3.5 h-3.5 text-emerald-400/80" /> : null}
          </label>

          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            disabled={!!lockedSchool}
            className={`w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500/50 ${
              lockedSchool ? "text-gray-400 cursor-not-allowed" : "text-gray-200"
            }`}
          >
            <option value="">Selecciona una escuela…</option>
            {schoolOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {schoolHint && <div className="text-[11px] text-emerald-400/70 mt-1">{schoolHint}</div>}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-widest text-gray-500">
            Programa Académico
          </label>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            disabled={!schoolFilter}
            className={`w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500/50 ${
              !schoolFilter ? "text-gray-500 cursor-not-allowed" : "text-gray-200"
            }`}
          >
            <option value="">
              {schoolFilter ? "Selecciona un programa…" : "Primero elige escuela…"}
            </option>

            {programOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {mustChooseScope && (
          <div className="md:col-span-2 text-[11px] text-gray-500 bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            Debes seleccionar <b>Escuela</b> y <b>Programa</b> para habilitar la lista.
          </div>
        )}
      </div>

      {/* buscador + filtro decisión */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, programa, escuela..."
              disabled={mustChooseScope}
              className={`w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-500/50 ${
                mustChooseScope ? "text-gray-500 cursor-not-allowed" : "text-gray-200"
              }`}
            />
          </div>

          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-white/10 text-[11px] uppercase tracking-widest text-gray-500 flex items-center gap-1 cursor-default"
          >
            <Filter className="w-3 h-3" />
            <span>Filtros</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="uppercase tracking-widest text-gray-500">Estado:</span>
          {(["ALL", "PENDIENTE", "APROBADO", "RECHAZADO"] as DecisionFilter[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => !mustChooseScope && setDecisionFilter(opt)}
              disabled={mustChooseScope}
              className={`px-3 py-1 rounded-full border text-[11px] ${
                decisionFilter === opt
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 text-gray-400 hover:border-emerald-500/40"
              } ${mustChooseScope ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {opt === "ALL" ? "Todos" : opt}
            </button>
          ))}
        </div>
      </div>

      {/* lista */}
      <div className="space-y-3 overflow-y-auto pr-1 max-h-[480px]">
        {mustChooseScope && (
          <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
            Elige escuela y programa para ver evaluaciones.
          </div>
        )}

        {!mustChooseScope && visibleGroups.length === 0 && (
          <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
            No hay evaluaciones para los filtros actuales.
          </div>
        )}

        {!mustChooseScope &&
          visibleGroups.map((g) => {
            const ev = g.latest;
            const candidateDecision = getCandidateDecision(g);

            return (
              <div key={g.key} className="space-y-2">
                <TeacherEvaluationItem
                  evaluation={ev}
                  selected={selectedId === ev.id}
                  onClick={() => onSelectEvaluation(g.key, ev.id)}
                  decisionStatus={candidateDecision}
                />

                <div className="flex items-center justify-between px-2">
                  <span className="text-xs text-gray-500">
                    Entrevistas: <b className="text-gray-300">{g.interviews.length}</b>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(g.key, ev.id)}
                      className="px-3 py-2 rounded-xl border border-emerald-500/25
                                 text-[11px] uppercase tracking-widest text-emerald-300
                                 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition"
                    >
                      Ver detalle
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenSecond(g.key, ev.id)}
                      className="px-3 py-2 rounded-xl border border-white/10
                                 text-[11px] uppercase tracking-widest text-gray-300
                                 hover:border-white/20 hover:bg-white/5 transition"
                    >
                      Comparativa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default EvaluationsListPanel;
