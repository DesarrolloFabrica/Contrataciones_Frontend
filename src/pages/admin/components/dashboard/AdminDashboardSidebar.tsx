import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  BarChart2, 
  Menu, 
  Radar, 
  ShieldCheck, 
  Clock, 
  GraduationCap,
  X
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

export type AdminDashboardSectionId = "KPIS" | "STATUS" | "SCORE" | "DECISION" | "SCHOOLS";
export type ProgramsMode = "VOLUME" | "ACCEPTANCE";

type Props = {
  activeSection: AdminDashboardSectionId;
  onSelectSection: (id: AdminDashboardSectionId) => void;
  programsMode: ProgramsMode;
  onProgramsModeChange: (mode: ProgramsMode) => void;
};

function useOutsideClose(open: boolean, refs: Array<React.RefObject<HTMLElement>>, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      for (const r of refs) {
        if (r.current?.contains(t)) return;
      }
      onClose();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, refs, onClose]);
}

export default function AdminDashboardSidebar({
  activeSection,
  onSelectSection,
  programsMode,
  onProgramsModeChange,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useOutsideClose(open, [drawerRef as any, btnRef as any], () => setOpen(false));

  const items = useMemo(
    () =>
      [
        { id: "KPIS" as const, label: "KPIs", icon: BarChart2 },
        { id: "STATUS" as const, label: "Estado", icon: ShieldCheck },
        { id: "SCORE" as const, label: "Score", icon: Radar },
        { id: "DECISION" as const, label: "Tiempo", icon: Clock },
        { id: "SCHOOLS" as const, label: "Escuelas", icon: GraduationCap },
      ] as const,
    []
  );

  const sidebarContainerClass = [
    "flex flex-col h-full rounded-3xl border p-5 transition-colors duration-300",
    isDark 
      ? "border-white/10 bg-[#0a0c0b]/80 backdrop-blur-xl shadow-2xl" 
      : "border-slate-200 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
  ].join(" ");

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 pb-4">
        <div className="relative flex h-3 w-3 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-20"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </div>
        <span className={["text-xs font-bold uppercase tracking-[0.2em]", isDark ? "text-neutral-400" : "text-slate-500"].join(" ")}>
          Navegación
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 mt-2">
        {items.map((item) => {
          const active = item.id === activeSection;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectSection(item.id);
                setOpen(false);
              }}
              className={[
                "group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200",
                active
                  ? isDark
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-emerald-50 text-emerald-700"
                  : isDark
                    ? "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
            >
              <Icon 
                className={[
                  "w-[18px] h-[18px] transition-colors duration-200",
                  active 
                    ? isDark ? "text-emerald-400" : "text-emerald-600" 
                    : isDark ? "text-neutral-500 group-hover:text-neutral-300" : "text-slate-400 group-hover:text-slate-600"
                ].join(" ")} 
              />
              <span className="text-sm font-semibold tracking-wide truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Segmented Control Footer */}
      <div className={["mt-8 pt-6 border-t", isDark ? "border-white/10" : "border-slate-100"].join(" ")}>
        <div className={["text-[10px] uppercase tracking-[0.2em] font-bold mb-3 px-2", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}>
          Métrica de Programas
        </div>
        
        {/* Modern Segmented Control */}
        <div className={["flex p-1 rounded-2xl border", isDark ? "bg-[#121514] border-white/5" : "bg-slate-50 border-slate-200/60"].join(" ")}>
          {(["VOLUME", "ACCEPTANCE"] as const).map((mode) => {
            const active = mode === programsMode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onProgramsModeChange(mode)}
                className={[
                  "flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200",
                  active
                    ? isDark
                      ? "bg-white/10 text-emerald-300 shadow-sm"
                      : "bg-white text-emerald-700 shadow-sm border border-slate-200/50"
                    : isDark
                      ? "text-neutral-500 hover:text-neutral-300"
                      : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                {mode === "VOLUME" ? "Volumen" : "Aceptación"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-[280px] h-full">
        <div className={sidebarContainerClass}>{content}</div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden relative z-40">
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen(true)}
          className={[
            "w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border transition-all active:scale-[0.98]",
            isDark
              ? "border-white/10 bg-[#0a0c0b] text-neutral-200"
              : "border-slate-200 bg-white text-slate-700 shadow-sm",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <Menu className={["w-5 h-5", isDark ? "text-neutral-400" : "text-slate-400"].join(" ")} />
            <span className="text-sm font-bold tracking-wide">Menú del Dashboard</span>
          </div>
          <span className={["px-3 py-1 rounded-full text-xs font-bold tracking-wider", isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"].join(" ")}>
            {items.find((x) => x.id === activeSection)?.label ?? "KPIs"}
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          
          {/* Sliding Sidebar */}
          <div 
            ref={drawerRef} 
            className={[
              "absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] p-4 flex flex-col shadow-2xl animate-in slide-in-from-left-8 duration-300",
              isDark ? "bg-[#050708]" : "bg-slate-50"
            ].join(" ")}
          >
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setOpen(false)}
                className={["p-2 rounded-full transition-colors", isDark ? "bg-white/5 text-neutral-400 hover:text-white" : "bg-slate-200/50 text-slate-500 hover:text-slate-800"].join(" ")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={sidebarContainerClass.replace('rounded-3xl', 'rounded-2xl')}>
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}