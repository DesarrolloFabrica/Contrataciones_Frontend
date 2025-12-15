// src/pages/admin/components/detail/AdminSystemMetaCard.tsx
import React, { useMemo } from "react";
import { Wrench } from "lucide-react";
import type { AdminSystemMeta } from "../../adminTypes";

type Props = { meta: AdminSystemMeta | null };

const fmt = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CO");
};

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2">
    <div className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">
      {label}
    </div>
    <div
      className="text-xs text-neutral-300 truncate max-w-[60%] text-right"
      title={value ?? ""}
    >
      {value || "—"}
    </div>
  </div>
);

const AdminSystemMetaCard: React.FC<Props> = ({ meta }) => {
  const hasMeta = !!meta;

  const title = useMemo(() => {
    // ✅ En lugar de “Meta técnica” (suena raro), que el admin lo entienda:
    return "Información técnica";
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="w-4 h-4 text-cyan-300" />
        <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
          {title}
        </div>
      </div>

      {!hasMeta ? (
        <div className="text-sm text-neutral-500">
          No hay información técnica disponible.
        </div>
      ) : (
        <details className="group">
          <summary className="cursor-pointer select-none text-xs text-neutral-300 hover:text-white transition-colors flex items-center justify-between gap-3">
            <span>Ver detalles técnicos</span>
            <span className="text-[11px] text-neutral-500 group-open:hidden">
              (expandir)
            </span>
            <span className="text-[11px] text-neutral-500 hidden group-open:inline">
              (ocultar)
            </span>
          </summary>

          <div className="mt-3">
            <Row label="ID Evaluación" value={meta?.evaluationId} />
            <Row label="Modelo" value={meta?.model} />
            <Row label="Versión prompt" value={meta?.promptVersion} />
            <Row label="Request ID" value={meta?.requestId} />
            <Row label="Creado" value={fmt(meta?.createdAt)} />
            <Row label="Actualizado" value={fmt(meta?.updatedAt)} />
          </div>

          <div className="mt-3 text-[11px] text-neutral-500">
            Útil para soporte y trazabilidad (no afecta la decisión).
          </div>
        </details>
      )}
    </div>
  );
};

export default AdminSystemMetaCard;
