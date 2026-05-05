import React from "react";

import AdminStatusBars from "./AdminStatusBars";
import AdminScoreCard from "./AdminScoreCard";
import AdminEvaluationsSeriesChart from "./AdminEvaluationsSeriesChart";
import AdminTimeToDecisionCard from "./AdminTimeToDecisionCard";
import AdminTopProgramsCard from "./AdminTopProgramsCard";

export type AdminDashboardSectionId =
  | "ALL"
  | "KPIS"
  | "STATUS"
  | "SCORE"
  | "DECISION";

export type ProgramsMode = "VOLUME" | "ACCEPTANCE";

export type DashboardData = {
  kpis: {
    totalCandidates: number;
    totalEvaluations: number;
    approved: number;
    rejected: number;
    pending: number;
    noEvalCandidates: number;
  };
  evaluationsSeries: Array<{ bucket: string; evaluations: number }>;
  score: { avg: number | null; median: number | null; min: number | null; max: number | null; count: number };
  timeToDecision: { avgHours: number | null; medianHours: number | null; decided: number };
  topPrograms: {
    byVolume: Array<{ programId: string; name: string; candidates: number }>;
    byAcceptance: Array<{ programId: string; name: string; decided: number; approved: number; acceptanceRate: number }>;
  };
};

type Props = {
  isDark: boolean;
  activeSection: AdminDashboardSectionId;
  data: DashboardData;
  rejectionPct: number;
  programsMode: ProgramsMode;
  kpisRef: React.RefObject<HTMLDivElement | null>;
  statusRef: React.RefObject<HTMLDivElement | null>;
  seriesRef: React.RefObject<HTMLDivElement | null>;
  scoreRef: React.RefObject<HTMLDivElement | null>;
  decisionRef: React.RefObject<HTMLDivElement | null>;
  topProgramsRef: React.RefObject<HTMLDivElement | null>;
};

function KpisGrid({
  isDark,
  totalCandidates,
  totalEvaluations,
  rejectionPct,
}: {
  isDark: boolean;
  totalCandidates: number;
  totalEvaluations: number;
  rejectionPct: number;
}) {
  const acceptancePct = Math.max(0, 100 - rejectionPct);

  const cardBase = [
    "relative flex flex-col justify-between rounded-xl border p-5 min-h-[110px]",
    isDark
      ? "bg-white/[0.04] border-white/10"
      : "bg-white border-slate-200 shadow-sm",
  ].join(" ");

  const labelCls = [
    "text-xs font-medium tracking-wider",
    isDark ? "text-neutral-500" : "text-slate-500",
  ].join(" ");

  const valueCls = (color: string) =>
    ["mt-2 text-3xl font-bold tracking-tight", color].join(" ");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className={cardBase}>
        <div className={labelCls}>Total candidatos</div>
        <div className={valueCls(isDark ? "text-white" : "text-slate-900")}>
          {totalCandidates}
        </div>
      </div>

      <div className={cardBase}>
        <div className={labelCls}>Total evaluaciones</div>
        <div className={valueCls(isDark ? "text-white" : "text-slate-900")}>
          {totalEvaluations}
        </div>
      </div>

      <div className={cardBase}>
        <div className={labelCls}>% Tasa aceptación</div>
        <div className={valueCls(isDark ? "text-emerald-400" : "text-emerald-600")}>
          {acceptancePct}%
        </div>
      </div>

      <div className={cardBase}>
        <div className={labelCls}>% Tasa rechazo</div>
        <div className={valueCls(isDark ? "text-rose-400" : "text-rose-600")}>
          {rejectionPct}%
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardContent({
  isDark,
  activeSection,
  data,
  rejectionPct,
  programsMode,
  kpisRef,
  statusRef,
  seriesRef,
  scoreRef,
  decisionRef,
  topProgramsRef,
}: Props) {
  return (
    <div className="space-y-6">
      {activeSection === "ALL" && (
        <>
          {/* KPIs */}
          <div ref={kpisRef} className="scroll-mt-20">
            <KpisGrid
              isDark={isDark}
              totalCandidates={data.kpis.totalCandidates}
              totalEvaluations={data.kpis.totalEvaluations}
              rejectionPct={rejectionPct}
            />
          </div>

          {/* Row 1: Status de candidatos - full width */}
          <div ref={statusRef} className="scroll-mt-20">
            <AdminStatusBars
              approved={data.kpis.approved}
              rejected={data.kpis.rejected}
              pending={data.kpis.pending}
              noEval={data.kpis.noEvalCandidates}
            />
          </div>

          {/* Row 2: Serie temporal (left/large) + AI Score (right/compact) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div ref={seriesRef} className="lg:col-span-7 scroll-mt-20">
              <AdminEvaluationsSeriesChart points={data.evaluationsSeries} />
            </div>
            <div ref={scoreRef} className="lg:col-span-5 scroll-mt-20">
              <AdminScoreCard
                avg={data.score.avg}
                median={data.score.median}
                min={data.score.min}
                max={data.score.max}
                count={data.score.count}
              />
            </div>
          </div>

          {/* Row 3: Tiempo a decisión + Programas top */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div ref={decisionRef} className="lg:col-span-4 scroll-mt-20">
              <AdminTimeToDecisionCard
                avgHours={data.timeToDecision.avgHours}
                medianHours={data.timeToDecision.medianHours}
                decided={data.timeToDecision.decided}
              />
            </div>
            <div ref={topProgramsRef} className="lg:col-span-8 scroll-mt-20">
              <AdminTopProgramsCard
                mode={programsMode}
                byVolume={data.topPrograms.byVolume}
                byAcceptance={data.topPrograms.byAcceptance}
              />
            </div>
          </div>
        </>
      )}

      {activeSection === "KPIS" && (
        <div ref={kpisRef} className="scroll-mt-20">
          <KpisGrid
            isDark={isDark}
            totalCandidates={data.kpis.totalCandidates}
            totalEvaluations={data.kpis.totalEvaluations}
            rejectionPct={rejectionPct}
          />
        </div>
      )}

      {activeSection === "STATUS" && (
        <div ref={statusRef} className="scroll-mt-20">
          <AdminStatusBars
            approved={data.kpis.approved}
            rejected={data.kpis.rejected}
            pending={data.kpis.pending}
            noEval={data.kpis.noEvalCandidates}
          />
        </div>
      )}

      {activeSection === "SCORE" && (
        <div ref={scoreRef} className="scroll-mt-20">
          <AdminScoreCard
            avg={data.score.avg}
            median={data.score.median}
            min={data.score.min}
            max={data.score.max}
            count={data.score.count}
          />
        </div>
      )}

      {activeSection === "DECISION" && (
        <div ref={decisionRef} className="scroll-mt-20">
          <AdminTimeToDecisionCard
            avgHours={data.timeToDecision.avgHours}
            medianHours={data.timeToDecision.medianHours}
            decided={data.timeToDecision.decided}
          />
        </div>
      )}
    </div>
  );
}
