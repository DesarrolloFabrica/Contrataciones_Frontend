// src/components/AuditTimeline.tsx
import React, { useMemo, useState } from "react";
import {
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Download,
  Upload,
  Sparkles,
  ShieldAlert,
  Clock,
  ChevronDown,
} from "lucide-react";

type AuditEvent = {
  id?: string;
  type: string;
  at?: string; // ISO
  actor?: { id?: string | null; name?: string | null; role?: string | null } | null;
  evaluationId?: string | null;
  metadata?: Record<string, any> | null;
};

type Props = {
  title?: string;
  events: AuditEvent[];
  emptyText?: string;
  compact?: boolean;
};

function safeDate(iso?: string) {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

function dayKey(d: Date) {
  // YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function formatDayTitle(d: Date) {
  return d.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function humanizeType(ev: AuditEvent) {
  const md = ev.metadata ?? {};
  switch (ev.type) {
    case "AI_ANALYSIS_STARTED":
      return "Análisis IA iniciado";
    case "AI_ANALYSIS_FINISHED":
      return "Análisis IA finalizado";
    case "EVALUATION_CREATED":
      return "Evaluación creada";
    case "EVALUATION_OPENED":
      return "Evaluación abierta";
    case "COORDINATOR_DECISION_SET":
      return md?.status === "APROBADO" ? "Candidato aprobado" : md?.status === "RECHAZADO" ? "Candidato rechazado" : "Decisión actualizada";
    case "COORDINATOR_COMMENT_SET":
      return "Comentario del coordinador agregado";
    case "REPORT_PDF_DOWNLOADED":
      return "Reporte PDF descargado";
    case "REPORT_PDF_UPLOADED":
      return "Reporte PDF subido al backend";
    default:
      return ev.type.replaceAll("_", " ").toLowerCase();
  }
}

function iconForType(type: string, metadata?: Record<string, any> | null) {
  if (type === "COORDINATOR_DECISION_SET") {
    const s = metadata?.status;
    if (s === "APROBADO") return <CheckCircle2 className="w-4 h-4" />;
    if (s === "RECHAZADO") return <XCircle className="w-4 h-4" />;
    return <ShieldAlert className="w-4 h-4" />;
  }
  switch (type) {
    case "AI_ANALYSIS_STARTED":
    case "AI_ANALYSIS_FINISHED":
      return <Sparkles className="w-4 h-4" />;
    case "EVALUATION_CREATED":
      return <FileText className="w-4 h-4" />;
    case "EVALUATION_OPENED":
      return <Eye className="w-4 h-4" />;
    case "COORDINATOR_COMMENT_SET":
      return <MessageSquare className="w-4 h-4" />;
    case "REPORT_PDF_DOWNLOADED":
      return <Download className="w-4 h-4" />;
    case "REPORT_PDF_UPLOADED":
      return <Upload className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function pillClass(type: string, metadata?: Record<string, any> | null) {
  if (type === "COORDINATOR_DECISION_SET") {
    const s = metadata?.status;
    if (s === "APROBADO") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    if (s === "RECHAZADO") return "bg-rose-500/10 text-rose-300 border-rose-500/20";
    return "bg-slate-500/10 text-slate-300 border-slate-500/20";
  }
  if (type.includes("ERROR")) return "bg-rose-500/10 text-rose-300 border-rose-500/20";
  if (type.includes("FINISHED") || type.includes("CREATED") || type.includes("UPLOADED"))
    return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (type.includes("OPENED") || type.includes("DOWNLOADED"))
    return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
  return "bg-white/5 text-gray-300 border-white/10";
}

function compactMetadata(ev: AuditEvent) {
  const md = ev.metadata ?? {};
  // Muestra solo cosas “humanas” (no IDs largos)
  const out: Record<string, any> = {};
  if (md.source) out.source = md.source;
  if (md.status) out.status = md.status;
  if (md.risk) out.risk = md.risk;
  if (md.verdict) out.verdict = md.verdict;
  if (typeof md.overallScore === "number") out.overallScore = md.overallScore;
  if (md.orgId && String(md.orgId).length < 30) out.orgId = md.orgId;
  if (md.hasComment) out.hasComment = md.hasComment;
  if (md.length) out.length = md.length;
  return out;
}

const AuditTimeline: React.FC<Props> = ({ title = "Actividad", events, emptyText, compact }) => {
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  const grouped = useMemo(() => {
    const sorted = [...(events ?? [])].sort((a, b) => {
      const da = safeDate(a.at)?.getTime() ?? 0;
      const db = safeDate(b.at)?.getTime() ?? 0;
      return db - da;
    });

    const groups: Array<{ day: string; dayTitle: string; items: AuditEvent[] }> = [];
    const map = new Map<string, AuditEvent[]>();

    for (const ev of sorted) {
      const d = safeDate(ev.at) ?? new Date(0);
      const key = dayKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }

    for (const [k, items] of map.entries()) {
      const d = safeDate(items[0]?.at) ?? new Date(0);
      groups.push({ day: k, dayTitle: formatDayTitle(d), items });
    }

    // ordena los días desc
    groups.sort((a, b) => (a.day < b.day ? 1 : -1));
    return groups;
  }, [events]);

  if (!events || events.length === 0) {
    return (
      <div className="bg-[#050505] border border-white/10 rounded-2xl p-4 text-gray-500 text-sm">
        {emptyText ?? "Aún no hay actividad."}
      </div>
    );
  }

  return (
    <div className={`bg-[#050505] border border-white/10 rounded-2xl ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-gray-500">{title}</p>
          {!compact && <p className="text-xs text-gray-500 mt-0.5">Trazabilidad de eventos, actor, fecha y metadata.</p>}
        </div>
        <span className="text-[11px] text-gray-500 border border-white/10 rounded-full px-2 py-1">
          {events.length} eventos
        </span>
      </div>

      <div className={`space-y-4 ${compact ? "max-h-[260px]" : "max-h-[420px]"} overflow-y-auto pr-1`}>
        {grouped.map((g) => (
          <div key={g.day} className="space-y-2">
            <div className="text-[11px] uppercase tracking-widest text-gray-600">
              {g.dayTitle}
            </div>

            <div className="space-y-2">
              {g.items.map((ev, idx) => {
                const d = safeDate(ev.at);
                const label = humanizeType(ev);
                const meta = compactMetadata(ev);
                const hasMeta = meta && Object.keys(meta).length > 0;
                const isOpen = !!openMap[idx];
                const actorName = ev.actor?.name ?? "Sistema";
                const actorRole = ev.actor?.role ?? null;

                return (
                  <div
                    key={(ev.id ?? "") + idx}
                    className="bg-[#0A0A0A] border border-white/10 rounded-xl p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-lg border ${pillClass(ev.type, ev.metadata)}`}>
                          {iconForType(ev.type, ev.metadata)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-200">{label}</p>

                            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${pillClass(ev.type, ev.metadata)}`}>
                              {ev.type}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-gray-500 flex flex-wrap items-center gap-2">
                            <span>{actorName}{actorRole ? ` • ${actorRole}` : ""}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            <span>{d ? formatTime(d) : "—"}</span>
                            {ev.evaluationId ? (
                              <>
                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                <span className="font-mono">eval: {String(ev.evaluationId).slice(0, 8)}…</span>
                              </>
                            ) : null}
                          </div>

                          {hasMeta && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(meta).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-[11px] text-gray-400 bg-black/30 border border-white/10 rounded-full px-2 py-1"
                                >
                                  {k}: <span className="text-gray-300">{String(v)}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {(ev.metadata && Object.keys(ev.metadata).length > 0) && (
                        <button
                          type="button"
                          onClick={() => setOpenMap((p) => ({ ...p, [idx]: !p[idx] }))}
                          className="text-gray-500 hover:text-gray-200 border border-white/10 rounded-lg px-2 py-1 text-xs flex items-center gap-1"
                        >
                          Detalles <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>

                    {isOpen && ev.metadata && (
                      <pre className="mt-3 text-[11px] text-gray-400 bg-black/40 border border-white/10 rounded-xl p-3 overflow-auto">
{JSON.stringify(ev.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTimeline;
