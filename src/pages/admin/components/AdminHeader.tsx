// src/pages/admin/components/layout/AdminHeader.tsx
import React from "react";
import { LayoutDashboard, XCircle } from "lucide-react";

const pillBase =
  "px-3 py-1.5 rounded-full border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2";

export default function AdminHeader(props: {
  hasSelection: boolean;
  onClearSelection: () => void;
}) {
  const { hasSelection, onClearSelection } = props;

  return (
    <header className="relative pb-10 mb-6">
      {/* subtle divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        {/* LEFT */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold tracking-widest text-xs uppercase">
            <LayoutDashboard size={16} />
            Admin Console
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Panel de Control{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Global
            </span>
          </h1>

          <p className="text-neutral-400 mt-3 max-w-2xl text-sm leading-relaxed">
            Vista ejecutiva para seguimiento institucional: métricas clave,
            distribución por escuelas, evaluaciones docentes y análisis
            detallado con soporte IA y decisiones humanas.
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {hasSelection && (
            <button
              onClick={onClearSelection}
              type="button"
              className={[
                pillBase,
                "border-rose-500/30",
                "bg-rose-500/10",
                "text-rose-300",
                "hover:bg-rose-500/20",
              ].join(" ")}
              title="Cerrar evaluación seleccionada"
            >
              <XCircle className="w-4 h-4" />
              Cerrar detalle
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
