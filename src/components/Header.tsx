// src/components/Header.tsx
import React from "react";

import LogoCUN from "../assets/images/LogoCUN.png";
type ViewMode = "analyze" | "history";

interface HeaderProps {
  mode: ViewMode;
  onChangeMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, onChangeMode }) => {
  // ✅ Colores de marca (se conservan)
  const brandFrom = "#91DC00";
  const brandTo = "#31AB2E";

  return (
    // ✅ Solo UI: header más “premium” + más claro en jerarquía (sin tocar lógica/conexiones)
    <header className="w-full bg-[#020202] relative">
      {/* ================= BACKDROP / ATMÓSFERA ================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Glow superior central: guía visual hacia el header */}
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[980px] h-[260px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,rgba(34,211,238,0.08)_28%,rgba(0,0,0,0)_70%)] blur-3xl" />

        {/* Viñeta suave para “cerrar” bordes y elevar contraste del contenido */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0)_45%),radial-gradient(circle_at_top,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_65%)]" />
      </div>

      <div className="relative z-10">
        {/* ✅ Línea superior sutil (sensación de “marco”) */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ✅ Fondo del header con blur sutil (sin sticky para no tocar comportamiento) */}
        <div className="relative">
          {/* capa glass */}
          <div className="pointer-events-none absolute inset-0 bg-white/[0.02] backdrop-blur-xl" />
          {/* borde inferior suave */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-white/6" />

          <div className="container mx-auto px-4 md:px-8 py-4 md:py-5 relative">
            <div className="flex items-center justify-between gap-4">
              {/* ================= LOGO + TEXTO ================= */}
              <div className="flex items-center gap-4 min-w-0">
                {/* ✅ Logo “chip” mejor definido: borde + glow contenido */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-emerald-500 blur-xl opacity-10" />
                  <div className="relative h-11 w-11 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-[0_18px_55px_-40px_rgba(0,0,0,0.95)]">
                    <img
                      src={LogoCUN}
                      alt="Logo CUN"
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  {/* ✅ Título + “tag” pequeño para reforzar sistema */}
                  <div className="flex items-center gap-3 min-w-0">


                    {/* ✅ Título con mejor jerarquía (antes estaba vacío) */}
                    <h1 className="text-base md:text-lg font-extrabold tracking-tight text-white/90 truncate">
                      IA para Facilitadores
                    </h1>
                  </div>

                  {/* ✅ Subtítulo más informativo y con mejor legibilidad */}
                  <div className="flex items-center gap-2 mt-1">
                    
                    <span className="text-xs md:text-sm text-white/60 font-light tracking-wide truncate">
                      Consola de Líder · Evaluación de Talento Docente
                    </span>
                  </div>
                </div>
              </div>

              {/* ================= TOGGLE ================= */}
              {/* ✅ Toggle más claro: estado activo “pill” + ring consistente */}
              <div className="shrink-0">
                <div className="rounded-full p-[1px] bg-gradient-to-b from-white/14 to-transparent">
                  <div className="flex items-center gap-1 rounded-full bg-[#0A0A0A]/70 border border-white/10 backdrop-blur-2xl p-1 text-[11px] font-extrabold uppercase tracking-widest shadow-[0_18px_55px_-38px_rgba(0,0,0,0.9)]">
                    <button
                      type="button"
                      onClick={() => onChangeMode("analyze")}
                      className={`px-4 py-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 ${
                        mode === "analyze"
                          ? "text-black shadow-[0_0_18px_-6px_rgba(16,185,129,0.25)]"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                      style={
                        mode === "analyze"
                          ? {
                              background: `linear-gradient(90deg, ${brandFrom}, ${brandTo})`,
                            }
                          : undefined
                      }
                    >
                      Analizar
                    </button>

                    <button
                      type="button"
                      onClick={() => onChangeMode("history")}
                      className={`px-4 py-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/25 ${
                        mode === "history"
                          ? "text-black shadow-[0_0_18px_-6px_rgba(34,211,238,0.22)]"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                      style={
                        mode === "history"
                          ? {
                              background:
                                "linear-gradient(90deg, rgba(34,211,238,0.95), rgba(6,182,212,0.95))",
                            }
                          : undefined
                      }
                    >
                      Historial
                    </button>
                  </div>
                </div>

                {/* ✅ Micro-estado debajo del toggle (solo visual, no cambia lógica) */}
                <div className="mt-2 flex justify-end">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] border backdrop-blur-xl ${
                      mode === "analyze"
                        ? "text-emerald-200/80 border-emerald-500/15 bg-emerald-500/10"
                        : "text-cyan-200/80 border-cyan-500/15 bg-cyan-500/10"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        mode === "analyze" ? "bg-emerald-400/80" : "bg-cyan-300/80"
                      }`}
                    />
                    {mode === "analyze" ? "Listo para analizar" : "Historial disponible"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Separador inferior degradado (mejor que una línea plana) */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </header>
  );
};

export default Header;
