// src/pages/admin/components/detail/AdminAuditTimeline.tsx
import React, { useMemo, useState } from "react";
import { ScrollText, ChevronDown, ChevronUp } from "lucide-react";
import type { AdminAuditEvent } from "../../adminTypes";

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const label = (a: AdminAuditEvent["action"]) => {
  switch (a) {
    case "USER_CREATED":
      return "Usuario creado";
    case "USER_UPDATED":
      return "Usuario actualizado";
    case "USER_TOGGLED":
      return "Cambio de estado";
    case "PASSWORD_RESET":
      return "Contraseña restablecida";
    case "COORDINATOR_ASSIGNED":
      return "Coordinador asignado";
    case "COORDINATOR_DECISION_SAVED":
      return "Decisión de coordinador guardada";
    case "ADMIN_DECISION_SAVED":
      return "Decisión final guardada";
    case "PDF_EXPORTED":
      return "PDF exportado";
    case "DETAIL_VIEWED":
      return "Detalle consultado";
    default:
      return a;
  }
};

type Props = { events: AdminAuditEvent[] };

const AdminAuditTimeline: React.FC<Props> = ({ events }) => {
  // ✅ Por defecto, que el admin no se ahogue con logs
  const [expanded, setExpanded] = useState(false);

  const ordered = useMemo(() => {
    // Más reciente primero
    return [...events].sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [events]);

  const visible = expanded ? ordered : ordered.slice(0, 5);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-emerald-300" />
          <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
            Historial de cambios
          </div>
        </div>

        {ordered.length > 5 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-neutral-400 hover:text-white border border-white/10 bg-black/20 hover:bg-white/10 transition-colors rounded-lg px-3 py-1.5 inline-flex items-center gap-2"
          >
            {expanded ? (
              <>
                Ver menos <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Ver todo ({ordered.length}) <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {ordered.length === 0 ? (
        <div className="text-sm text-neutral-500">
          Aún no hay cambios registrados.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-white font-semibold">
                  {label(ev.action)}
                </div>
                <div className="text-[11px] text-neutral-500">{fmt(ev.at)}</div>
              </div>

              <div className="text-xs text-neutral-400 mt-1">
                Realizado por{" "}
                <span className="text-neutral-200 font-semibold">
                  {ev.actorRole}
                </span>
              </div>

              {/* ✅ Meta: solo si existe, pero más discreto (sin “pre” gigante por defecto) */}
              {ev.meta && (
                <details className="mt-2">
                  <summary className="cursor-pointer select-none text-[11px] text-neutral-400 hover:text-white">
                    Ver detalles
                  </summary>
                  <pre className="mt-2 text-[11px] text-neutral-400 bg-black/30 border border-white/10 rounded-lg p-2 overflow-x-auto">
                    {JSON.stringify(ev.meta, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}

          {!expanded && ordered.length > 5 && (
            <div className="text-[11px] text-neutral-500">
              Mostrando los últimos 5 cambios.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAuditTimeline;
