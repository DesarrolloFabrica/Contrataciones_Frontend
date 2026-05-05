import React, { useState } from "react";
import {
  Gavel,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useAdminLocalDecision } from "../../hooks/useAdminLocalDecision";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  evaluationId: string | null;
};

const pillBase =
  "px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-widest transition inline-flex items-center gap-2";

export default function AdminFinalDecisionPanel({ evaluationId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { decision, setStatus, clearDecision, status, note } =
    useAdminLocalDecision(evaluationId);

  const [localNote, setLocalNote] = useState(note);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setLocalNote(note);
  }, [note]);

  const handleApprove = async () => {
    if (!evaluationId) return;
    setSaving(true);
    // Simulate brief delay for UX
    await new Promise((r) => setTimeout(r, 200));
    setStatus("APROBADO", localNote);
    setSaving(false);
  };

  const handleReject = async () => {
    if (!evaluationId) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 200));
    setStatus("RECHAZADO", localNote);
    setSaving(false);
  };

  const handleClear = () => {
    clearDecision();
    setLocalNote("");
  };

  const cardCls = isDark
    ? "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5"
    : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

  const subCardCls = isDark
    ? "rounded-2xl border border-white/10 bg-black/25 backdrop-blur-sm p-4"
    : "rounded-2xl border border-slate-200 bg-slate-50 p-4";

  const labelCls = isDark
    ? "text-[10px] uppercase tracking-[0.24em] text-white/35 font-bold"
    : "text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold";

  return (
    <div className={cardCls}>
      <div className="flex items-center gap-2 mb-3">
        <Gavel className="w-4 h-4 text-cyan-300" />
        <h5 className={`text-sm font-extrabold uppercase tracking-[0.18em] ${isDark ? "text-white" : "text-slate-900"}`}>
          Decisión final Admin
        </h5>
      </div>

      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border mb-3 ${
          isDark
            ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
            : "border-amber-300 bg-amber-50 text-amber-700"
        }`}
      >
        <AlertTriangle className="w-3 h-3" />
        Decisión local (no persistida en backend)
      </span>

      <p className={`text-[12px] mb-4 ${isDark ? "text-white/45" : "text-slate-600"}`}>
        Esta decisión se guarda solo en el navegador.
        No afecta al backend ni a otros usuarios.
      </p>

      {/* Current status */}
      <div className={`mb-4 ${subCardCls}`}>
        <p className={labelCls}>Estado actual</p>
        <div className="mt-2 flex items-center gap-3">
          {status === "APROBADO" && (
            <>
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span className={`text-sm font-bold ${isDark ? "text-cyan-200" : "text-cyan-700"}`}>
                Aprobado
              </span>
            </>
          )}
          {status === "RECHAZADO" && (
            <>
              <XCircle className="w-5 h-5 text-rose-400" />
              <span className={`text-sm font-bold ${isDark ? "text-rose-200" : "text-rose-700"}`}>
                Rechazado
              </span>
            </>
          )}
          {status === "PENDIENTE" && (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className={`text-sm font-bold ${isDark ? "text-amber-200" : "text-amber-700"}`}>
                Pendiente
              </span>
            </>
          )}
        </div>
        {decision?.timestamp && (
          <p className={`text-[11px] mt-1 ${isDark ? "text-white/35" : "text-slate-500"}`}>
            {new Date(decision.timestamp).toLocaleString("es-CO")}
          </p>
        )}
      </div>

      {/* Note */}
      <div className="mb-4">
        <p className={`${labelCls} mb-1.5`}>Nota opcional</p>
        <textarea
          value={localNote}
          onChange={(e) => setLocalNote(e.target.value)}
          placeholder="Agrega una nota sobre tu decisión..."
          rows={3}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm resize-none outline-none transition-colors ${
            isDark
              ? "bg-black/30 border-white/10 text-white placeholder:text-neutral-600 focus:border-cyan-500/50"
              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"
          }`}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving || !evaluationId}
          onClick={handleApprove}
          className={`${pillBase} ${
            status === "APROBADO"
              ? "border-cyan-400/40 bg-cyan-600/30 text-cyan-200 cursor-default"
              : isDark
                ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"
                : "border-cyan-500 bg-cyan-600 text-white hover:bg-cyan-500 shadow-sm"
          } disabled:opacity-40`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Aprobar
        </button>

        <button
          type="button"
          disabled={saving || !evaluationId}
          onClick={handleReject}
          className={`${pillBase} ${
            status === "RECHAZADO"
              ? "border-rose-400/40 bg-rose-600/30 text-rose-200 cursor-default"
              : isDark
                ? "border-rose-500/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
                : "border-rose-500 bg-rose-600 text-white hover:bg-rose-500 shadow-sm"
          } disabled:opacity-40`}
        >
          <XCircle className="w-4 h-4" />
          Rechazar
        </button>

        {status !== "PENDIENTE" && (
          <button
            type="button"
            onClick={handleClear}
            disabled={saving}
            className={`${pillBase} ${
              isDark
                ? "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            } disabled:opacity-40`}
          >
            Limpiar decisión
          </button>
        )}
      </div>
    </div>
  );
}
