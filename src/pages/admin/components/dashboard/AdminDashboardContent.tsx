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

function CardShell({ 
  isDark, 
  children,
  className = ""
}: { 
  isDark: boolean; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative flex flex-col justify-between overflow-hidden rounded-[24px] border p-6 min-h-[140px] transition-all duration-500 hover:-translate-y-1",
        isDark
          ? "border-white/[0.04] bg-[#0c0c0e] hover:border-white/[0.08] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          : "border-slate-200/60 bg-white shadow-sm hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}

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
  const labelCls = [
    "text-[11px] uppercase tracking-widest font-semibold", 
    isDark ? "text-neutral-500" : "text-slate-500"
  ].join(" ");
  
  const valueCls = [
    "mt-auto pt-4 text-4xl font-bold tracking-tight", 
    isDark ? "text-slate-100" : "text-slate-900"
  ].join(" ");

  // Calculamos la tasa de aceptación para balancear el grid a 4 tarjetas
  const acceptancePct = Math.max(0, 100 - rejectionPct);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* 1. Total Candidatos */}
      <CardShell isDark={isDark}>
        <div className={labelCls}>Total candidatos</div>
        <div className={valueCls}>{totalCandidates}</div>
      </CardShell>

      {/* 2. Total Evaluaciones */}
      <CardShell isDark={isDark}>
        <div className={labelCls}>Total evaluaciones</div>
        <div className={valueCls}>{totalEvaluations}</div>
      </CardShell>

      {/* 3. Tasa Aceptación (Añadida para completar el diseño visual) */}
      <CardShell isDark={isDark} className="group">
        {isDark && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
        )}
        <div className={labelCls}>% Tasa aceptación</div>
        <div className={[
          "mt-auto pt-4 text-4xl font-bold tracking-tight", 
          isDark ? "text-white" : "text-emerald-700"
        ].join(" ")}>
          {acceptancePct}%
        </div>
      </CardShell>

      {/* 4. Tasa Rechazo */}
      <CardShell isDark={isDark} className="group">
        {isDark && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
        )}
        <div className={labelCls}>% Tasa rechazo</div>
        <div className={[
          "mt-auto pt-4 text-4xl font-bold tracking-tight", 
          isDark ? "text-white" : "text-rose-700"
        ].join(" ")}>
          {rejectionPct}%
        </div>
      </CardShell>
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
    <div className="space-y-6 md:space-y-8">
      {activeSection === "ALL" && (
        <>
          <div ref={kpisRef} className="scroll-mt-28">
            <KpisGrid
              isDark={isDark}
              totalCandidates={data.kpis.totalCandidates}
              totalEvaluations={data.kpis.totalEvaluations}
              rejectionPct={rejectionPct}
            />
          </div>

          <div ref={statusRef} className="scroll-mt-28">
            <AdminStatusBars
              approved={data.kpis.approved}
              rejected={data.kpis.rejected}
              pending={data.kpis.pending}
              noEval={data.kpis.noEvalCandidates}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:items-stretch">
            <div ref={seriesRef} className="lg:col-span-7 scroll-mt-28 flex min-h-0 h-full">
              <AdminEvaluationsSeriesChart points={data.evaluationsSeries} />
            </div>
            <div ref={scoreRef} className="lg:col-span-5 scroll-mt-28 flex min-h-0 h-full">
              <AdminScoreCard
                avg={data.score.avg}
                median={data.score.median}
                min={data.score.min}
                max={data.score.max}
                count={data.score.count}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:items-stretch">
            <div ref={decisionRef} className="lg:col-span-4 scroll-mt-28 flex min-h-0 h-full">
              <AdminTimeToDecisionCard
                avgHours={data.timeToDecision.avgHours}
                medianHours={data.timeToDecision.medianHours}
                decided={data.timeToDecision.decided}
              />
            </div>
            <div ref={topProgramsRef} className="lg:col-span-8 scroll-mt-28 flex min-h-0 h-full">
              <AdminTopProgramsCard
                mode={programsMode}
                byVolume={data.topPrograms.byVolume}
                byAcceptance={data.topPrograms.byAcceptance}
              />
            </div>
          </div>
        </>
      )}

      {/* Renderizado individual de secciones */}
      {activeSection === "KPIS" && (
        <div ref={kpisRef} className="scroll-mt-28">
          <KpisGrid
            isDark={isDark}
            totalCandidates={data.kpis.totalCandidates}
            totalEvaluations={data.kpis.totalEvaluations}
            rejectionPct={rejectionPct}
          />
        </div>
      )}

      {activeSection === "STATUS" && (
        <div ref={statusRef} className="scroll-mt-28">
          <AdminStatusBars
            approved={data.kpis.approved}
            rejected={data.kpis.rejected}
            pending={data.kpis.pending}
            noEval={data.kpis.noEvalCandidates}
          />
        </div>
      )}

      {activeSection === "SCORE" && (
        <div ref={scoreRef} className="scroll-mt-28">
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
        <div ref={decisionRef} className="scroll-mt-28">
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