import React from "react";
import {
  AlertTriangle,
  FileText,
  Upload,
  Clock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../../../context/ThemeContext";
import {
  getEvaluationDocuments,
  type CandidateDocumentItem,
} from "../../../services/candidateDocumentsService";
import { queryKeys } from "../../../services/queryKeys";

type Props = {
  evaluationId?: string;
  missingReasons: string[];
  mitigations?: string[];
  lastUpdated?: string | null;
  compact?: boolean;
  /** Sin borde propio (cuando va dentro de un panel compuesto). */
  embedded?: boolean;
};

function CompactDocuments({ evaluationId, compact }: { evaluationId: string; compact?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.documents.byEvaluation(evaluationId),
    queryFn: () => getEvaluationDocuments(evaluationId),
    enabled: !!evaluationId,
  });

  const docs = (data ?? []) as CandidateDocumentItem[];

  if (isLoading) {
    return (
      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        Cargando documentos…
      </p>
    );
  }

  if (!docs.length) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border border-dashed px-3.5 ${compact ? "py-2.5" : "py-3"} ${
          isDark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-400"
        }`}
      >
        <Upload className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Sin soportes registrados
          </p>
          <p className="text-[11px] opacity-80">El líder aún no cargó documentos.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {docs.map((doc) => (
        <li
          key={doc.id}
          className={`truncate rounded-xl border px-3 py-2 text-xs ${
            isDark
              ? "border-white/[0.06] bg-[#07171c]/60 text-slate-300"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {doc.fileName || doc.documentType || "Documento"}
        </li>
      ))}
    </ul>
  );
}

export function DecisionSupportSidebar({
  evaluationId,
  missingReasons,
  mitigations = [],
  lastUpdated,
  compact = false,
  embedded = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const panel = isDark
    ? "border-white/[0.08] bg-[#0d252b]"
    : "border-slate-200/80 bg-white shadow-[0_14px_36px_-28px_rgba(15,23,42,0.2)]";

  const divider = isDark ? "border-white/[0.06]" : "border-slate-100";

  return (
    <aside
      className={
        embedded
          ? "flex flex-col"
          : `flex flex-col overflow-hidden rounded-2xl border ${panel}`
      }
    >
      <header
        className={`flex items-center gap-3 border-b ${compact ? "px-4 py-3" : "px-4 py-4 md:px-5"} ${
          isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-100 bg-slate-50/80"
        }`}
      >
        <span
          className={`flex shrink-0 items-center justify-center rounded-xl border ${compact ? "h-8 w-8" : "h-9 w-9"} ${
            isDark
              ? "border-emerald-400/15 bg-emerald-500/[0.08] text-emerald-300"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Soporte para la decisión
          </h2>
          <p className={`mt-0.5 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Evidencias y alertas antes de confirmar.
          </p>
        </div>
      </header>

      <section
        className={[
          `border-b ${compact ? "p-3" : "p-4 md:p-5"}`,
          divider,
          missingReasons.length > 0
            ? isDark
              ? "bg-amber-500/[0.07]"
              : "bg-amber-50"
            : "",
        ].join(" ")}
      >
        <div className={`${compact ? "mb-2" : "mb-2.5"} flex items-center gap-2.5`}>
          <AlertTriangle
            className={`h-4 w-4 ${
              missingReasons.length > 0
                ? isDark
                  ? "text-amber-300"
                  : "text-amber-600"
                : isDark
                  ? "text-emerald-400"
                  : "text-emerald-600"
            }`}
          />
          <h3
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            {missingReasons.length > 0 ? "Requisitos pendientes" : "Requisitos completos"}
          </h3>
        </div>

        {missingReasons.length > 0 ? (
          <ul className={compact ? "space-y-1.5" : "space-y-2"}>
            {missingReasons.map((reason, i) => (
              <li
                key={i}
                className={`flex gap-2.5 text-[12px] ${compact ? "leading-[18px]" : "leading-5"} ${
                  isDark ? "text-amber-100/85" : "text-amber-800"
                }`}
              >
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    isDark ? "bg-amber-400" : "bg-amber-500"
                  }`}
                />
                {reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-[12px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Requisitos completos.
          </p>
        )}
      </section>

      <section className={`border-b ${compact ? "p-3" : "p-4 md:p-5"} ${divider}`}>
        <div className={`${compact ? "mb-2" : "mb-3"} flex items-center justify-between gap-2`}>
          <div className="flex items-center gap-2.5">
            <ShieldAlert
              className={`h-4 w-4 ${isDark ? "text-amber-400" : "text-amber-600"}`}
            />
            <h3
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Alertas y mitigación
            </h3>
          </div>
          {mitigations.length > 0 && (
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                isDark
                  ? "bg-amber-500/15 text-amber-300"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {mitigations.length}
            </span>
          )}
        </div>

        {mitigations.length > 0 ? (
          <div className={compact ? "space-y-1.5" : "space-y-2.5"}>
            {mitigations.map((item, i) => (
              <div
                key={i}
                className={`rounded-xl ${compact ? "p-2" : "p-3"} ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}
              >
                <div className={`flex items-start ${compact ? "gap-2" : "gap-2.5"}`}>
                  <span
                    className={[
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      isDark
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-amber-100 text-amber-700",
                    ].join(" ")}
                  >
                    {i + 1}
                  </span>
                  <p
                    className={`${compact ? "text-[11px] leading-[18px]" : "text-[12px] leading-5"} ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {item}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-[12px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Sin alertas críticas.
          </p>
        )}
      </section>

      <section className={compact ? "p-3" : "p-4 md:p-5"}>
        <div className={`${compact ? "mb-2" : "mb-2.5"} flex items-center gap-2.5`}>
          <FileText
            className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
          />
          <h3
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Soporte documental
          </h3>
        </div>

        {evaluationId ? (
          <CompactDocuments evaluationId={evaluationId} compact={compact} />
        ) : (
          <div
            className={`flex items-center gap-2 rounded-xl border border-dashed px-3.5 py-3 ${
              isDark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-400"
            }`}
          >
            <Upload className="h-4 w-4" />
            <p className="text-xs">Sin evaluación seleccionada</p>
          </div>
        )}

        <p
          className={`${compact ? "mt-3" : "mt-4"} flex items-center gap-1.5 text-[11px] ${
            isDark ? "text-slate-600" : "text-slate-400"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Actualizado ·{" "}
          {lastUpdated
            ? new Date(lastUpdated).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : new Date().toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
        </p>
      </section>
    </aside>
  );
}

export default DecisionSupportSidebar;
