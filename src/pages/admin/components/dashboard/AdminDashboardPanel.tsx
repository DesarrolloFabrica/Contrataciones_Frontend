// src/pages/admin/dashboard/AdminDashboardPanel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutDashboard,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

// ✅ DB scope service (para escuelas/programas)
import { listProgramsBySchool, listSchools, ProgramOption, SchoolOption } from "../../../../services/adminScopeService";
import AdminStatusBars from "./AdminStatusBars";
import AdminScoreCard from "./AdminScoreCard";
import AdminEvaluationsSeriesChart from "./AdminEvaluationsSeriesChart";
import AdminTimeToDecisionCard from "./AdminTimeToDecisionCard";
import AdminTopProgramsCard from "./AdminTopProgramsCard";
import { useTheme } from "../../../../context/ThemeContext";
import AdminDashboardContent, {
  type AdminDashboardSectionId,
  type ProgramsMode,
} from "./AdminDashboardContent";

type Props = {
  scope: {
    selectedSchoolId?: string | null;
    selectedProgramId?: string | null;
    orgId?: string | null;
  };
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function isoUtcStartOfDay(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
}
function isoUtcStartOfNextDay(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0)).toISOString();
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function clampYmd(ymd: string, min?: string, max?: string) {
  if (min && ymd < min) return min;
  if (max && ymd > max) return max;
  return ymd;
}
function formatLabel(ymd: string) {
  const d = parseYmd(ymd);
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "2-digit" });
}

type DatePickerProps = {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (ymd: string) => void;
  min?: string;
  max?: string;
};

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

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

/* =========================================================================
   1. MONTH DROPDOWN
   ========================================================================= */
   function MonthDropdown({ value, onChange }: { value: number; onChange: (m: number) => void }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const popRef = useRef<HTMLDivElement | null>(null);
    const { theme } = useTheme();
    const isDark = theme === "dark";
  
    useOutsideClose(open, [btnRef as any, popRef as any], () => setOpen(false));
  
    return (
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={[
            "px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-[130px] text-left border outline-none",
            isDark
              ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-neutral-200 focus:border-emerald-500/50"
              : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-800 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100",
          ].join(" ")}
          title="Cambiar mes"
        >
          <div className="flex items-center justify-between">
            <span>{MONTHS[value]}</span>
            <ChevronRight className={["w-3 h-3 transition-transform", open ? "rotate-90" : "rotate-0", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")} />
          </div>
        </button>
  
        {open && (
          <div
            ref={popRef}
            className={[
              "absolute left-0 top-full mt-2 z-[250] w-[180px] max-h-[260px] overflow-auto rounded-2xl border p-1.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200",
              isDark
                ? "border-white/10 bg-[#0a0c0b]/95 shadow-[0_30px_120px_rgba(0,0,0,0.8)]"
                : "border-slate-200 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.15)]",
            ].join(" ")}
          >
            {MONTHS.map((m, idx) => {
              const active = idx === value;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    onChange(idx);
                    setOpen(false);
                  }}
                  className={[
                    "w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between group",
                    active
                      ? isDark
                        ? "bg-emerald-500/10 text-emerald-400 font-bold"
                        : "bg-emerald-50 text-emerald-700 font-bold"
                      : isDark
                        ? "bg-transparent hover:bg-white/10 text-neutral-300"
                        : "bg-transparent hover:bg-slate-100 text-slate-700",
                  ].join(" ")}
                >
                  {m}
                  {active && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  
  /* =========================================================================
     2. DATE PICKER
     ========================================================================= */
  function DatePicker({ label, value, onChange, min, max }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const popRef = useRef<HTMLDivElement | null>(null);
    const { theme } = useTheme();
    const isDark = theme === "dark";
  
    useOutsideClose(open, [btnRef as any, popRef as any], () => setOpen(false));
  
    const selected = useMemo(() => parseYmd(value), [value]);
    const [viewMonth, setViewMonth] = useState(() => selected.getMonth());
    const [viewYear, setViewYear] = useState(() => selected.getFullYear());
  
    useEffect(() => {
      setViewMonth(selected.getMonth());
      setViewYear(selected.getFullYear());
    }, [selected]);
  
    const first = new Date(viewYear, viewMonth, 1);
    const last = endOfMonth(first);
    const firstDow = (first.getDay() + 6) % 7;
    const daysInMonth = last.getDate();
  
    const cells: Array<{ ymd: string; day: number; disabled: boolean }> = [];
    for (let i = 0; i < firstDow; i++) cells.push({ ymd: "", day: 0, disabled: true });
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const ymd = toYmd(d);
      const disabled = (min && ymd < min) || (max && ymd > max);
      cells.push({ ymd, day, disabled: !!disabled });
    }
  
    const goPrevMonth = () => {
      const d = new Date(viewYear, viewMonth - 1, 1);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    };
    const goNextMonth = () => {
      const d = new Date(viewYear, viewMonth + 1, 1);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    };
  
    const onPick = (ymd: string) => {
      const clamped = clampYmd(ymd, min, max);
      onChange(clamped);
      setOpen(false);
    };
  
    return (
      <div className="relative">
        <div className="flex flex-col gap-1.5">
          <label className={["text-[10px] uppercase tracking-widest font-bold ml-1", isDark ? "text-neutral-500" : "text-slate-500"].join(" ")}>
            {label}
          </label>
          <button
            ref={btnRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={[
              "w-[240px] px-4 py-2.5 rounded-2xl text-sm font-medium text-left transition-all flex items-center justify-between gap-3 border outline-none group",
              isDark
                ? "bg-[#121514] border-white/10 hover:border-emerald-500/30 text-neutral-200 focus:border-emerald-500/50"
                : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md text-slate-800 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100",
            ].join(" ")}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Calendar className={["w-4 h-4 shrink-0 transition-colors", open ? "text-emerald-500" : isDark ? "text-neutral-500 group-hover:text-emerald-400" : "text-slate-400 group-hover:text-emerald-600"].join(" ")} />
              <span className="truncate">{formatLabel(value)}</span>
            </div>
          </button>
        </div>
  
        {open && (
          <div
            ref={popRef}
            className={[
              "absolute z-[200] mt-2 w-[340px] rounded-[1.5rem] border p-4 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200",
              isDark
                ? "border-white/10 bg-[#0a0c0b]/95 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                : "border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.15)]",
            ].join(" ")}
          >
            {/* Header Calendario */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <button
                type="button"
                onClick={goPrevMonth}
                className={["p-2 rounded-xl border transition-all hover:scale-105", isDark ? "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"].join(" ")}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 flex-1 justify-center">
                <MonthDropdown value={viewMonth} onChange={setViewMonth} />
                <input
                  value={String(viewYear)}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/\D/g, "")) || new Date().getFullYear();
                    setViewYear(Math.max(1900, Math.min(2100, n)));
                  }}
                  className={[
                    "w-[70px] px-3 py-2 rounded-xl text-xs font-medium border outline-none text-center transition-all",
                    isDark
                      ? "bg-white/5 border-white/10 text-neutral-200 focus:border-emerald-500/50"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-400 focus:bg-white",
                  ].join(" ")}
                  inputMode="numeric"
                />
              </div>
              <button
                type="button"
                onClick={goNextMonth}
                className={["p-2 rounded-xl border transition-all hover:scale-105", isDark ? "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"].join(" ")}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
  
            <div className={["grid grid-cols-7 gap-1 mb-2 text-[10px] uppercase tracking-widest font-bold", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}>
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center py-1">{d}</div>
              ))}
            </div>
  
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((c, idx) => {
                if (!c.ymd) return <div key={idx} className="aspect-square" />;
                const isSelected = c.ymd === value;
  
                return (
                  <button
                    key={c.ymd}
                    type="button"
                    disabled={c.disabled}
                    onClick={() => onPick(c.ymd)}
                    className={[
                      "aspect-square flex items-center justify-center rounded-xl text-xs font-semibold transition-all select-none relative z-10",
                      c.disabled
                        ? isDark ? "text-neutral-700 cursor-not-allowed" : "text-slate-300 cursor-not-allowed"
                        : isSelected
                          ? isDark
                            ? "bg-emerald-500 text-black shadow-[0_0_16px_rgba(16,185,129,0.4)] scale-105 z-20"
                            : "bg-emerald-500 text-white shadow-[0_6px_16px_rgba(16,185,129,0.35)] scale-105 z-20"
                          : isDark
                            ? "hover:bg-white/10 text-neutral-300 hover:scale-110"
                            : "hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 hover:scale-110",
                    ].join(" ")}
                  >
                    {c.day}
                  </button>
                );
              })}
            </div>
  
            <div className="mt-5 pt-4 border-t border-dashed border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onPick(toYmd(new Date()))}
                className={["px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02]", isDark ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"].join(" ")}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={["px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02]", isDark ? "bg-white/5 text-neutral-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"].join(" ")}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  /* =========================================================================
     3. DROPDOWN REUTILIZABLE CON ICONOS
     ========================================================================= */
  type SimpleOption = { id: string; name: string };
  
  function Dropdown({
    label,
    valueId,
    placeholder,
    options,
    loading,
    disabled,
    onChange,
    icon: Icon,
    allowClear = true,
    clearLabel = "Todas",
  }: {
    label: string;
    valueId: string | null;
    placeholder: string;
    options: SimpleOption[];
    loading?: boolean;
    disabled?: boolean;
    onChange: (id: string | null) => void;
    icon?: any;
    allowClear?: boolean;
    clearLabel?: string;
  }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const popRef = useRef<HTMLDivElement | null>(null);
    const { theme } = useTheme();
    const isDark = theme === "dark";
  
    useOutsideClose(open, [btnRef as any, popRef as any], () => setOpen(false));
  
    const valueLabel = useMemo(() => {
      if (!valueId) return "";
      return options.find((o) => String(o.id) === String(valueId))?.name ?? "";
    }, [valueId, options]);
  
    const isDisabled = !!disabled || !!loading;
  
    return (
      <div className="relative">
        <div className="flex flex-col gap-1.5">
          <label className={["text-[10px] uppercase tracking-widest font-bold ml-1", isDark ? "text-neutral-500" : "text-slate-500"].join(" ")}>
            {label}
          </label>
          <button
            ref={btnRef}
            type="button"
            disabled={isDisabled}
            onClick={() => setOpen((v) => !v)}
            className={[
              "w-[260px] px-4 py-2.5 rounded-2xl border text-sm font-medium text-left transition-all flex items-center justify-between gap-3 outline-none group",
              isDisabled
                ? isDark
                  ? "bg-white/5 border-white/5 text-neutral-600 cursor-not-allowed"
                  : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                : isDark
                  ? "bg-[#121514] border-white/10 text-neutral-200 hover:border-emerald-500/30 focus:border-emerald-500/50"
                  : "bg-white border-slate-200 text-slate-800 hover:border-emerald-300 hover:shadow-md focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100",
            ].join(" ")}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {Icon && <Icon className={["w-4 h-4 shrink-0 transition-colors", open ? "text-emerald-500" : isDisabled ? (isDark ? "text-neutral-600" : "text-slate-300") : (isDark ? "text-neutral-500 group-hover:text-emerald-400" : "text-slate-400 group-hover:text-emerald-600")].join(" ")} />}
              <span className={["truncate", !valueLabel && !isDark && !isDisabled ? "text-slate-500" : ""].join(" ")}>
                {valueLabel || placeholder}
              </span>
            </div>
            <ChevronRight className={["w-4 h-4 shrink-0 transition-transform", open ? "rotate-90" : "rotate-0", isDark ? "text-neutral-600" : "text-slate-400"].join(" ")} />
          </button>
        </div>
  
        {open && !isDisabled && (
          <div
            ref={popRef}
            className={[
              "absolute left-0 top-full mt-2 z-[220] w-[320px] max-h-[300px] overflow-auto rounded-[1.5rem] border p-1.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200",
              isDark
                ? "border-white/10 bg-[#0a0c0b]/95 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                : "border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.15)]",
            ].join(" ")}
          >
            {allowClear && (
              <div className="mb-1 border-b border-dashed border-slate-200 dark:border-white/10 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className={[
                    "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between",
                    !valueId
                      ? isDark ? "bg-emerald-500/10 text-emerald-400 font-bold" : "bg-emerald-50 text-emerald-700 font-bold"
                      : isDark ? "hover:bg-white/10 text-neutral-400" : "hover:bg-slate-50 text-slate-500",
                  ].join(" ")}
                >
                  {clearLabel}
                  {!valueId && <Check className="w-4 h-4" />}
                </button>
              </div>
            )}
  
            {options.map((o) => {
              const active = String(o.id) === String(valueId ?? "");
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className={[
                    "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group",
                    active
                      ? isDark ? "bg-emerald-500/10 text-emerald-400 font-bold" : "bg-emerald-50 text-emerald-700 font-bold"
                      : isDark ? "hover:bg-white/10 text-neutral-200" : "hover:bg-slate-50 text-slate-700",
                  ].join(" ")}
                >
                  <span className="truncate pr-2">{o.name}</span>
                  {active && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
  
            {options.length === 0 && (
              <div className={["px-4 py-6 text-sm text-center", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}>
                No hay opciones disponibles
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  /* =========================================================================
     4. DASHBOARD PANEL PRINCIPAL
     ========================================================================= */
  const AdminDashboardPanel: React.FC<Props> = ({ scope }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
  
    // Fechas y Lógica (Se mantiene intacta la funcionalidad original)
    const [fromDate, setFromDate] = useState(() => toYmd(startOfMonth(new Date())));
    const [toDate, setToDate] = useState(() => toYmd(new Date()));
    const safeFrom = useMemo(() => (fromDate <= toDate ? fromDate : toDate), [fromDate, toDate]);
    const safeTo = useMemo(() => (toDate >= fromDate ? toDate : fromDate), [fromDate, toDate]);
    const fromIso = useMemo(() => isoUtcStartOfDay(safeFrom), [safeFrom]);
    const toIso = useMemo(() => isoUtcStartOfNextDay(safeTo), [safeTo]);
  
    // Filtros
    const [schools, setSchools] = useState<SchoolOption[]>([]);
    const [programs, setPrograms] = useState<ProgramOption[]>([]);
    const [loadingSchools, setLoadingSchools] = useState(false);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [scopeError, setScopeError] = useState<string | null>(null);
  
    const [schoolId, setSchoolId] = useState<string | null>(scope.selectedSchoolId ?? null);
    const [programId, setProgramId] = useState<string | null>(scope.selectedProgramId ?? null);
  
    // Mantener estados sincronizados si cambia el scope externo
    useEffect(() => {
      setSchoolId(scope.selectedSchoolId ?? null);
      setProgramId(scope.selectedProgramId ?? null);
    }, [scope.selectedSchoolId, scope.selectedProgramId]);

    // Cargar escuelas disponibles para el org (si aplica)
    useEffect(() => {
      let cancelled = false;

      const run = async () => {
        setScopeError(null);
        setLoadingSchools(true);
        try {
          const res = await listSchools();
          if (cancelled) return;
          setSchools(res ?? []);
        } catch (e: any) {
          if (cancelled) return;
          setScopeError(e?.message ?? "No se pudieron cargar las escuelas.");
          setSchools([]);
        } finally {
          if (!cancelled) setLoadingSchools(false);
        }
      };

      void run();
      return () => {
        cancelled = true;
      };
    }, []);

    // Cargar programas en función de la escuela seleccionada
    useEffect(() => {
      let cancelled = false;

      const run = async () => {
        setScopeError(null);

        if (!schoolId) {
          setPrograms([]);
          return;
        }

        setLoadingPrograms(true);
        try {
          const res = await listProgramsBySchool(schoolId);
          if (cancelled) return;
          setPrograms(res ?? []);
        } catch (e: any) {
          if (cancelled) return;
          setScopeError(e?.message ?? "No se pudieron cargar los programas.");
          setPrograms([]);
        } finally {
          if (!cancelled) setLoadingPrograms(false);
        }
      };

      void run();
      return () => {
        cancelled = true;
      };
    }, [schoolId]);

    const schoolOptions: { id: string; name: string }[] = useMemo(() => {
      return (schools ?? []).map((s: SchoolOption) => ({ id: String(s.id), name: s.name }));
    }, [schools]);

    const programOptions: { id: string; name: string }[] = useMemo(() => {
      return (programs ?? []).map((p: ProgramOption) => ({ id: String(p.id), name: p.name }));
    }, [programs]);
  
    // Labels
    const periodLabel = useMemo(() => {
      if (!safeFrom || !safeTo) return "";
      return safeFrom === safeTo ? `Día: ${formatLabel(safeFrom)}` : `${formatLabel(safeFrom)} al ${formatLabel(safeTo)}`;
    }, [safeFrom, safeTo]);
  
    const scopeLabel = useMemo(() => {
      const s = schoolId ? (schools.find(x => String(x.id) === String(schoolId))?.name ?? "Escuela") : "Todas las escuelas";
      const p = programId ? (programs.find(x => String(x.id) === String(programId))?.name ?? "Programa") : "Todos los programas";
      return `${s} • ${p}`;
    }, [schoolId, programId, schools, programs]);
  
    // Data fetching
    const { data, loading, error } = useAdminDashboard({
      orgId: scope.orgId ?? null,
      schoolId: schoolId ?? null,
      programId: programId ?? null,
      from: fromIso,
      to: toIso,
    });
  
    const [activeSection, setActiveSection] = useState<AdminDashboardSectionId>("ALL");
    const [programsMode, setProgramsMode] = useState<ProgramsMode>("VOLUME");
  
    // Referencias para Scroll... (Misma lógica)
    const kpisRef = useRef<HTMLDivElement | null>(null);
    const statusRef = useRef<HTMLDivElement | null>(null);
    const seriesRef = useRef<HTMLDivElement | null>(null);
    const scoreRef = useRef<HTMLDivElement | null>(null);
    const decisionRef = useRef<HTMLDivElement | null>(null);
    const topProgramsRef = useRef<HTMLDivElement | null>(null);
  
    const getRefBySection = (id: AdminDashboardSectionId): React.RefObject<HTMLDivElement | null> => {
      switch (id) {
        case "ALL": case "KPIS": return kpisRef;
        case "STATUS": return statusRef;
        case "SCORE": return scoreRef;
        case "DECISION": return decisionRef;
        default: return kpisRef;
      }
    };
  
    const scrollToSection = (id: AdminDashboardSectionId) => setActiveSection(id);
  
    useEffect(() => {
      const ref = getRefBySection(activeSection);
      const t = window.setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return () => window.clearTimeout(t);
    }, [activeSection]);
  
    const rejectionPct = useMemo(() => {
      const approved = Number(data?.kpis?.approved ?? 0);
      const rejected = Number(data?.kpis?.rejected ?? 0);
      const decided = approved + rejected;
      if (decided <= 0) return 0;
      return Math.round((rejected / decided) * 1000) / 10;
    }, [data?.kpis?.approved, data?.kpis?.rejected]);
  
    return (
      <div className="space-y-6">
        {/* 1. HERO CABECERA */}
        <div
          className={[
            "relative overflow-hidden rounded-3xl border px-8 py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6",
            isDark
              ? "border-white/10 bg-[#0a0c0b]/80 backdrop-blur-xl"
              : "border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]",
          ].join(" ")}
        >
          {/* Glow Decorativo */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className={[
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-inner",
              isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 text-emerald-600"
            ].join(" ")}>
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className={["w-3.5 h-3.5", isDark ? "text-emerald-500" : "text-emerald-500"].join(" ")} />
                <p className={["text-[10px] uppercase tracking-[0.25em] font-extrabold", isDark ? "text-emerald-500" : "text-emerald-600"].join(" ")}>
                  Centro de Comando
                </p>
              </div>
              <h1 className={["text-2xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900"].join(" ")}>
                Dashboard Global
              </h1>
              <p className={["text-sm mt-1", isDark ? "text-neutral-400" : "text-slate-500"].join(" ")}>
                Visión ejecutiva del funnel de candidatos y métricas de evaluación.
              </p>
            </div>
          </div>
  
          <div className="flex flex-col items-start md:items-end gap-2 relative z-10">
            <div className={[
              "px-4 py-2 rounded-xl border text-xs font-semibold shadow-sm flex items-center gap-2 max-w-[300px]",
              isDark ? "bg-black/50 border-white/10 text-neutral-300" : "bg-slate-50 border-slate-200 text-slate-700"
            ].join(" ")}>
              <Filter className="w-3.5 h-3.5 opacity-70 shrink-0" />
              <span className="truncate">{scopeLabel}</span>
            </div>
            <p className={["text-xs font-medium", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}>
              {periodLabel}
            </p>
          </div>
        </div>
  
        {/* 2. PANEL DE FILTROS & CONTROLES */}
        <div
          className={[
            "rounded-3xl border p-6 flex flex-wrap items-end gap-6 relative z-50",
            isDark
              ? "border-white/10 bg-[#0a0c0b]/60 backdrop-blur-xl"
              : "border-slate-200 bg-white/60 backdrop-blur-xl shadow-sm",
          ].join(" ")}
        >
          <DatePicker label="Fecha Inicio" value={safeFrom} max={safeTo} onChange={setFromDate} />
          <DatePicker label="Fecha Fin" value={safeTo} min={safeFrom} onChange={setToDate} />
  
          <div className="w-px h-12 bg-slate-200 dark:bg-white/10 hidden xl:block self-center mx-2" />
  
          <Dropdown
            label="Filtrar por Escuela"
            icon={Building2}
            valueId={schoolId}
            placeholder="Todas las escuelas"
            options={schoolOptions}
            loading={loadingSchools}
            onChange={(id) => { setSchoolId(id); setProgramId(null); }}
          />
  
          <Dropdown
            label="Filtrar por Programa"
            icon={BookOpen}
            valueId={programId}
            placeholder={schoolId ? "Todos los programas" : "Seleccione escuela primero"}
            options={programOptions}
            loading={loadingPrograms}
            disabled={!schoolId}
            onChange={(id) => setProgramId(id)}
          />
  
          {/* TABS DE VISTA Y MODO - Estilo Segmented Control */}
          <div className="w-full mt-4 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-6">
            
            <div className="flex flex-col gap-2">
              <span className={["text-[10px] uppercase tracking-widest font-bold ml-1", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}>
                Secciones del Dashboard
              </span>
              <div className={["inline-flex p-1.5 rounded-2xl border", isDark ? "bg-[#121514] border-white/5" : "bg-slate-100/50 border-slate-200/50"].join(" ")}>
                {(
                  [
                    { id: "ALL" as const, label: "Todas" },
                    { id: "KPIS" as const, label: "KPIs" },
                    { id: "STATUS" as const, label: "Estado" },
                    { id: "SCORE" as const, label: "Score" },
                    { id: "DECISION" as const, label: "Tiempos" },
                  ] as const
                ).map((t) => {
                  const active = t.id === activeSection;
                  return (
                    <button
                      key={t.id}
                      onClick={() => scrollToSection(t.id)}
                      className={[
                        "px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ease-out",
                        active
                          ? isDark
                            ? "bg-emerald-500/20 text-emerald-400 shadow-sm"
                            : "bg-white text-emerald-600 shadow-sm border border-slate-200/60"
                          : isDark
                            ? "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50",
                      ].join(" ")}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
  
            <div className="flex flex-col gap-2">
              <span className={["text-[10px] uppercase tracking-widest font-bold ml-1", isDark ? "text-neutral-500" : "text-slate-400"].join(" ")}>
                Métrica de Programas Top
              </span>
              <div className={["inline-flex p-1.5 rounded-2xl border", isDark ? "bg-[#121514] border-white/5" : "bg-slate-100/50 border-slate-200/50"].join(" ")}>
                {(
                  [
                    { id: "VOLUME" as const, label: "Por Volumen" },
                    { id: "ACCEPTANCE" as const, label: "Por Aceptación" },
                  ] as const
                ).map((m) => {
                  const active = programsMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setProgramsMode(m.id)}
                      className={[
                        "px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
                        active
                          ? isDark
                            ? "bg-neutral-800 text-white shadow-sm"
                            : "bg-white text-slate-800 shadow-sm border border-slate-200/60"
                          : isDark
                            ? "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50",
                      ].join(" ")}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
  
          </div>
        </div>
  
        {/* Estados de Error y Carga */}
        {scopeError && (
          <div className={["p-5 rounded-3xl border flex items-center gap-3", isDark ? "border-red-500/15 bg-red-500/5 text-red-300" : "border-red-200 bg-red-50 text-red-700"].join(" ")}>
            <AlertCircle className="w-5 h-5" /> <span className="text-sm font-medium">{scopeError}</span>
          </div>
        )}
  
        {loading && (
          <div className={["flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed", isDark ? "border-white/10 bg-[#0a0c0b]/50" : "border-slate-200 bg-slate-50/50"].join(" ")}>
            <Loader2 className={["w-8 h-8 animate-spin mb-4", isDark ? "text-emerald-500" : "text-emerald-600"].join(" ")} />
            <span className={["text-sm font-medium tracking-wide animate-pulse", isDark ? "text-neutral-400" : "text-slate-500"].join(" ")}>
              Recopilando métricas del dashboard...
            </span>
          </div>
        )}
  
        {!loading && error && (
          <div className={["p-5 rounded-3xl border flex items-center gap-3", isDark ? "border-red-500/15 bg-red-500/5 text-red-300" : "border-red-200 bg-red-50 text-red-700"].join(" ")}>
            <AlertCircle className="w-5 h-5" /> <span className="text-sm font-medium">{error}</span>
          </div>
        )}
  
        {/* Renderizado del contenido final */}
        {!loading && !error && data && (
          <div className="mt-8">
            <AdminDashboardContent
              isDark={isDark}
              activeSection={activeSection}
              data={data}
              rejectionPct={rejectionPct}
              programsMode={programsMode}
              kpisRef={kpisRef}
              statusRef={statusRef}
              seriesRef={seriesRef}
              scoreRef={scoreRef}
              decisionRef={decisionRef}
              topProgramsRef={topProgramsRef}
            />
          </div>
        )}
      </div>
    );
  };
  
  export default AdminDashboardPanel;
