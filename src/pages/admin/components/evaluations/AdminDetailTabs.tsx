// src/pages/admin/components/AdminDetailTabs.tsx
import React from "react";
import { Activity, ShieldCheck, Wrench, Users } from "lucide-react";
import type { AdminTab } from "../../adminTypes";

const pillBase =
  "px-3 py-1 rounded-full border text-[11px] uppercase tracking-widest transition inline-flex items-center gap-2";

export default function AdminDetailTabs(props: {
  tab: AdminTab;
  setTab: (t: AdminTab) => void;
}) {
  const { tab, setTab } = props;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setTab("RESUMEN")}
        className={`${pillBase} ${
          tab === "RESUMEN"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
        }`}
      >
        <Users className="w-4 h-4" />
        Resumen
      </button>

      <button
        type="button"
        onClick={() => setTab("COORDINADOR")}
        className={`${pillBase} ${
          tab === "COORDINADOR"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
        }`}
      >
        <ShieldCheck className="w-4 h-4" />
        Decisiones
      </button>

      <button
        type="button"
        onClick={() => setTab("IA")}
        className={`${pillBase} ${
          tab === "IA"
            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
            : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
        }`}
      >
        <Activity className="w-4 h-4" />
        IA
      </button>

      <button
        type="button"
        onClick={() => setTab("TECNICO")}
        className={`${pillBase} ${
          tab === "TECNICO"
            ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
            : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
        }`}
      >
        <Wrench className="w-4 h-4" />
        Soporte
      </button>
    </div>
  );
}
