// src/pages/admin/components/AdminHeader.tsx
import React from "react";
import { LayoutDashboard, ScrollText } from "lucide-react";

const pillBase =
  "px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2";

export default function AdminHeader(props: {
  hasSelection: boolean;
  onClearSelection: () => void;
}) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
      <div>
        <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold tracking-widest text-xs uppercase">
          <LayoutDashboard size={16} /> Admin Console
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Panel de Control{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Global
          </span>
        </h1>
        <p className="text-neutral-400 mt-2 max-w-2xl text-sm leading-relaxed">
          Vista ejecutiva: métricas, distribución por escuelas, lista completa y detalle del reporte (IA + decisiones).
        </p>
      </div>

      <div className="flex items-center gap-2">
        {props.hasSelection && (
          <button
            onClick={props.onClearSelection}
            className={`${pillBase} border-white/10 text-neutral-300 hover:border-white/20 bg-white/5`}
            type="button"
          >
            <ScrollText className="w-4 h-4 text-neutral-400" />
            Cerrar detalle
          </button>
        )}
      </div>
    </header>
  );
}
