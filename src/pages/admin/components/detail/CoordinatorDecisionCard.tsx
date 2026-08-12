import React from "react";
import { ShieldCheck, CheckCircle2, XCircle, Clock, User, Calendar, MessageSquare } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

type CoordinatorCriteria = {
  docs_ok?: boolean;
  profile_fit?: boolean;
  risk_ok?: boolean;
  communication_ok?: boolean;
};

type Props = {
  status?: string | null;
  coordinatorName?: string | null;
  coordinatorEmail?: string | null;
  decidedAt?: string | null;
  notes?: string | null;
  criteria?: CoordinatorCriteria | null;
};

function statusBadge(status: string, isDark: boolean) {
  const s = (status || "").toUpperCase();
  const base =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border";

  if (s === "APPROVED" || s === "APROBADO") {
    return `${base} ${isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-emerald-200/80 bg-emerald-50 text-emerald-700"}`;
  }
  if (s === "REJECTED" || s === "RECHAZADO") {
    return `${base} ${isDark ? "border-rose-500/20 bg-rose-500/10 text-rose-300" : "border-rose-200/80 bg-rose-50 text-rose-700"}`;
  }
  return `${base} ${isDark ? "border-white/[0.05] bg-white/[0.03] text-neutral-300" : "border-slate-200/70 bg-slate-50 text-slate-600"}`;
}

function statusIcon(status: string) {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED" || s === "APROBADO") return <CheckCircle2 className="w-4 h-4" />;
  if (s === "REJECTED" || s === "RECHAZADO") return <XCircle className="w-4 h-4" />;
  return <Clock className="w-4 h-4" />;
}

function statusLabel(status: string): string {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED" || s === "APROBADO") return "Aprobado";
  if (s === "REJECTED" || s === "RECHAZADO") return "Rechazado";
  return "Pendiente";
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const criteriaLabels: Record<keyof CoordinatorCriteria, string> = {
  docs_ok: "Documentos OK",
  profile_fit: "Perfil adecuado",
  risk_ok: "Riesgos OK",
  communication_ok: "Comunicación OK",
};

export default function CoordinatorDecisionCard({
  status,
  coordinatorName,
  coordinatorEmail,
  decidedAt,
  notes,
  criteria,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasCriteria = criteria && Object.keys(criteria).length > 0;
  const criteriaEntries = hasCriteria ? Object.entries(criteria) : [];

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        isDark
          ? "border-white/[0.05] bg-white/[0.03]"
          : "border-slate-200/60 bg-white"
      }`}
    >
      <div
        className={`border-b px-5 py-3 ${
          isDark ? "border-white/[0.05] bg-white/[0.02]" : "border-slate-100 bg-slate-50/80"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isDark ? "bg-emerald-500/10" : "bg-emerald-50"
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
          </div>
          <span
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              isDark ? "text-emerald-300/90" : "text-emerald-700"
            }`}
          >
            Decisión oficial del coordinador
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <span className={statusBadge(status || "PENDING", isDark)}>
            {statusIcon(status || "PENDING")}
            {statusLabel(status || "PENDING")}
          </span>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            isDark
              ? "border-white/[0.04] bg-white/[0.025]"
              : "border-slate-200/60 bg-slate-50/80"
          }`}
        >
          <div className="space-y-2 text-sm">
            {coordinatorName && (
              <div className="flex items-center gap-2">
                <User className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
                <span className={isDark ? "text-white" : "text-slate-900"}>{coordinatorName}</span>
              </div>
            )}
            {coordinatorEmail && (
              <div className={`text-xs ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                {coordinatorEmail}
              </div>
            )}
            {decidedAt && (
              <div className="flex items-center gap-2">
                <Calendar className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
                <span className={`text-xs ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                  {formatDate(decidedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {notes && notes.trim() && (
          <div>
            <p
              className={`mb-2 text-[10px] font-bold uppercase tracking-[0.24em] ${
                isDark ? "text-white/35" : "text-slate-500"
              }`}
            >
              Nota oficial
            </p>
            <div
              className={`rounded-xl border p-3 ${
                isDark
                  ? "border-white/[0.04] bg-white/[0.025]"
                  : "border-slate-200/60 bg-slate-50/80"
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isDark ? "text-neutral-500" : "text-slate-400"}`}
                />
                <p
                  className={`whitespace-pre-wrap text-sm leading-relaxed ${
                    isDark ? "text-white/80" : "text-slate-700"
                  }`}
                >
                  {notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {hasCriteria && criteriaEntries.length > 0 && (
          <div>
            <p
              className={`mb-2 text-[10px] font-bold uppercase tracking-[0.24em] ${
                isDark ? "text-white/35" : "text-slate-500"
              }`}
            >
              Criterios técnicos
            </p>
            <div className="grid grid-cols-2 gap-2">
              {criteriaEntries.map(([key, value]) => {
                const label = criteriaLabels[key as keyof CoordinatorCriteria] ?? key;
                const ok = value === true;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                      ok
                        ? isDark
                          ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-300"
                          : "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                        : isDark
                          ? "border-white/[0.04] bg-white/[0.025] text-neutral-400"
                          : "border-slate-200/60 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={`border-t pt-3 ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
          <p className={`text-[11px] ${isDark ? "text-white/30" : "text-slate-400"}`}>
            Administración solo consulta esta decisión, sus criterios técnicos y la trazabilidad.
          </p>
        </div>
      </div>
    </div>
  );
}
