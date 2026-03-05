// src/pages/admin/dashboard/AdminDashboardPanel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

// ✅ DB scope service (para escuelas/programas)
import { listProgramsBySchool, listSchools, ProgramOption, SchoolOption } from "../../../../services/adminScopeService";
import AdminStatusBars from "./AdminStatusBars";
import AdminScoreCard from "./AdminScoreCard";
import AdminEvaluationsSeriesChart from "./AdminEvaluationsSeriesChart";
import { useTheme } from "../../../../context/ThemeContext";

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
          "px-3 py-2 rounded-xl text-xs transition min-w-[140px] text-left border",
          isDark
            ? "bg-white/5 border-white/10 hover:bg-white/10 text-neutral-200"
            : "bg-white border-slate-200 hover:bg-slate-100 text-slate-800 shadow-sm",
        ].join(" ")}
        title="Cambiar mes"
      >
        {MONTHS[value]}
      </button>

      {open && (
        <div
          ref={popRef}
          className={[
            "absolute left-0 top-full mt-2 z-[250] w-[220px] max-h-[240px] overflow-auto rounded-2xl border p-1",
            isDark
              ? "border-white/10 bg-[#0b0d0c] shadow-[0_30px_120px_rgba(0,0,0,0.8)]"
              : "border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]",
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
                  "w-full text-left px-3 py-2 rounded-xl text-xs transition border",
                  active
                    ? isDark
                      ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : isDark
                      ? "bg-transparent border-transparent hover:bg-white/10 text-neutral-200"
                      : "bg-transparent border-transparent hover:bg-slate-100 text-slate-700",
                ].join(" ")}
              >
                {m}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

  const firstDow = (first.getDay() + 6) % 7; // lunes=0..domingo=6
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
      <div className="flex flex-col gap-1">
        <label
          className={[
            "text-[11px] uppercase tracking-widest font-bold",
            isDark ? "text-neutral-500" : "text-slate-500",
          ].join(" ")}
        >
          {label}
        </label>

        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={[
            "w-[260px] px-3 py-2 rounded-xl text-xs text-left transition flex items-center justify-between gap-3 border",
            isDark
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-neutral-200"
              : "bg-white border-slate-200 hover:bg-slate-100 text-slate-800 shadow-sm",
          ].join(" ")}
        >
          <span className="truncate">{formatLabel(value)}</span>
          <Calendar
            className={[
              "w-4 h-4 shrink-0",
              isDark ? "text-neutral-400" : "text-slate-400",
            ].join(" ")}
          />
        </button>
      </div>

      {open && (
        <div
          ref={popRef}
          className={[
            "absolute z-[200] mt-2 w-[360px] rounded-2xl border p-3",
            isDark
              ? "border-white/10 bg-[#0b0d0c]/95 shadow-[0_30px_120px_rgba(0,0,0,0.8)]"
              : "border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className={[
                "p-2 rounded-xl border transition",
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-slate-200 bg-white hover:bg-slate-100",
              ].join(" ")}
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <MonthDropdown value={viewMonth} onChange={setViewMonth} />
              <input
                value={String(viewYear)}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/\D/g, "")) || new Date().getFullYear();
                  setViewYear(Math.max(1900, Math.min(2100, n)));
                }}
                className={[
                  "w-[92px] px-3 py-2 rounded-xl text-xs border outline-none",
                  isDark
                    ? "bg-white/5 border-white/10 text-neutral-200"
                    : "bg-white border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
                ].join(" ")}
                inputMode="numeric"
              />
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              className={[
                "p-2 rounded-xl border transition",
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-slate-200 bg-white hover:bg-slate-100",
              ].join(" ")}
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div
            className={[
              "grid grid-cols-7 gap-1 mt-3 text-[11px] uppercase tracking-widest font-bold",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2 mt-2">
            {cells.map((c, idx) => {
              if (!c.ymd) {
                return <div key={idx} className="h-10 w-10" />;
              }

              const isSelected = c.ymd === value;

              return (
                <button
                  key={c.ymd}
                  type="button"
                  disabled={c.disabled}
                  onClick={() => onPick(c.ymd)}
                  className={[
                    "h-10 w-10 flex items-center justify-center",
                    "rounded-xl text-xs font-bold border transition select-none",
                    "leading-none",
                    c.disabled
                      ? isDark
                        ? "border-white/5 text-neutral-700 bg-white/5 cursor-not-allowed"
                        : "border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed"
                      : isDark
                        ? "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200"
                        : "border-slate-200 bg-white hover:bg-emerald-50 text-slate-800",
                    isSelected
                      ? isDark
                        ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                        : "bg-emerald-600 border-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)]"
                      : "",
                  ].join(" ")}
                >
                  {c.day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onPick(toYmd(new Date()))}
              className={[
                "px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition",
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-100"
                  : "border-emerald-500 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)]",
              ].join(" ")}
            >
              Hoy
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className={[
                "px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition",
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-100"
                  : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700",
              ].join(" ")}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type SimpleOption = { id: string; name: string };

function Dropdown({
  label,
  valueId,
  placeholder,
  options,
  loading,
  disabled,
  onChange,
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
      <div className="flex flex-col gap-1">
        <label
          className={[
            "text-[11px] uppercase tracking-widest font-bold",
            isDark ? "text-neutral-500" : "text-slate-500",
          ].join(" ")}
        >
          {label}
        </label>

        <button
          ref={btnRef}
          type="button"
          disabled={isDisabled}
          onClick={() => setOpen((v) => !v)}
          className={[
            "w-[260px] px-3 py-2 rounded-xl border text-xs text-left transition flex items-center justify-between gap-3",
            isDisabled
              ? isDark
                ? "bg-white/5 border-white/5 text-neutral-600 cursor-not-allowed"
                : "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
              : isDark
                ? "bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10"
                : "bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-sm",
          ].join(" ")}
        >
          <span className="truncate">
            {valueLabel || placeholder}
          </span>
          <span
            className={[
              "text-[11px]",
              isDark ? "text-neutral-500" : "text-slate-400",
            ].join(" ")}
          >
            {loading ? "..." : "▾"}
          </span>
        </button>
      </div>

      {open && !isDisabled && (
        <div
          ref={popRef}
          className={[
            "absolute left-0 top-full mt-2 z-[220] w-[320px] max-h-[280px] overflow-auto rounded-2xl border p-1",
            isDark
              ? "border-white/10 bg-[#0b0d0c] shadow-[0_30px_120px_rgba(0,0,0,0.8)]"
              : "border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]",
          ].join(" ")}
        >
          {allowClear && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={[
                "w-full text-left px-3 py-2 rounded-xl text-xs transition border",
                !valueId
                  ? isDark
                    ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : isDark
                    ? "bg-transparent border-transparent hover:bg-white/10 text-neutral-200"
                    : "bg-transparent border-transparent hover:bg-slate-100 text-slate-700",
              ].join(" ")}
            >
              {clearLabel}
            </button>
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
                  "w-full text-left px-3 py-2 rounded-xl text-xs transition border",
                  active
                    ? isDark
                      ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : isDark
                      ? "bg-transparent border-transparent hover:bg-white/10 text-neutral-200"
                      : "bg-transparent border-transparent hover:bg-slate-100 text-slate-700",
                ].join(" ")}
              >
                {o.name}
              </button>
            );
          })}

          {options.length === 0 && (
            <div
              className={[
                "px-3 py-3 text-xs",
                isDark ? "text-neutral-500" : "text-slate-500",
              ].join(" ")}
            >
              {placeholder}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const AdminDashboardPanel: React.FC<Props> = ({ scope }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  // Fechas
  const [fromDate, setFromDate] = useState(() => toYmd(startOfMonth(new Date())));
  const [toDate, setToDate] = useState(() => toYmd(new Date()));

  const safeFrom = useMemo(() => (fromDate <= toDate ? fromDate : toDate), [fromDate, toDate]);
  const safeTo = useMemo(() => (toDate >= fromDate ? toDate : fromDate), [fromDate, toDate]);

  // Backend: [from, to)
  const fromIso = useMemo(() => isoUtcStartOfDay(safeFrom), [safeFrom]);
  const toIso = useMemo(() => isoUtcStartOfNextDay(safeTo), [safeTo]);

  // ✅ Filtros: escuela -> programas
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [scopeError, setScopeError] = useState<string | null>(null);

  const [schoolId, setSchoolId] = useState<string | null>(scope.selectedSchoolId ?? null);
  const [programId, setProgramId] = useState<string | null>(scope.selectedProgramId ?? null);

  // Carga escuelas (1 vez)
  useEffect(() => {
    let alive = true;
    setLoadingSchools(true);
    setScopeError(null);

    listSchools()
      .then((rows) => {
        if (!alive) return;
        setSchools(rows ?? []);
      })
      .catch((e) => {
        if (!alive) return;
        setScopeError(e?.message ?? "Error cargando escuelas");
        setSchools([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingSchools(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Si el padre cambia el scope (modal), reflejarlo acá
  useEffect(() => {
    setSchoolId(scope.selectedSchoolId ?? null);
    setProgramId(scope.selectedProgramId ?? null);
  }, [scope.selectedSchoolId, scope.selectedProgramId]);

  // Carga programas cuando cambia schoolId
  useEffect(() => {
    let alive = true;
    setPrograms([]);
    setScopeError(null);

    if (!schoolId) {
      setProgramId(null);
      return;
    }

    setLoadingPrograms(true);

    listProgramsBySchool(schoolId)
      .then((rows) => {
        if (!alive) return;
        setPrograms(rows ?? []);
      })
      .catch((e) => {
        if (!alive) return;
        setScopeError(e?.message ?? "Error cargando programas");
        setPrograms([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingPrograms(false);
      });

    return () => {
      alive = false;
    };
  }, [schoolId]);

  const schoolOptions: SimpleOption[] = useMemo(
    () => (schools ?? []).map((s) => ({ id: String(s.id), name: String(s.name) })),
    [schools]
  );

  const programOptions: SimpleOption[] = useMemo(
    () => (programs ?? []).map((p) => ({ id: String(p.id), name: String(p.name) })),
    [programs]
  );

  const schoolNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of schools ?? []) {
      if (s?.id) m.set(String(s.id), String(s.name ?? ""));
    }
    return m;
  }, [schools]);

  const programNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of programs ?? []) {
      if (p?.id) m.set(String(p.id), String(p.name ?? ""));
    }
    return m;
  }, [programs]);

  const periodLabel = useMemo(() => {
    if (!safeFrom || !safeTo) return "";
    if (safeFrom === safeTo) {
      return `Día: ${formatLabel(safeFrom)}`;
    }
    return `Periodo: ${formatLabel(safeFrom)} · ${formatLabel(safeTo)}`;
  }, [safeFrom, safeTo]);

  const scopeLabel = useMemo(() => {
    const schoolLabel = schoolId ? schoolNameById.get(String(schoolId)) ?? "Escuela seleccionada" : "Todas las escuelas";
    const programLabel = programId
      ? programNameById.get(String(programId)) ?? "Programa seleccionado"
      : schoolId
      ? "Todos los programas"
      : "Todos los programas";
    return `${schoolLabel} · ${programLabel}`;
  }, [schoolId, programId, schoolNameById, programNameById]);

  const { data, loading, error } = useAdminDashboard({
    orgId: scope.orgId ?? null,
    schoolId: schoolId ?? null,
    programId: programId ?? null,
    from: fromIso,
    to: toIso,
  });

  const acceptancePct = useMemo(() => {
    const r = data?.kpis?.acceptanceRate ?? 0;
    return Math.round(r * 1000) / 10; // 1 decimal
  }, [data?.kpis?.acceptanceRate]);

  const rejectionPct = useMemo(() => {
    const approved = Number(data?.kpis?.approved ?? 0);
    const rejected = Number(data?.kpis?.rejected ?? 0);
    const decided = approved + rejected;

    if (decided <= 0) return 0;
    const rate = rejected / decided;
    return Math.round(rate * 1000) / 10; // 1 decimal
  }, [data?.kpis?.approved, data?.kpis?.rejected]);

  return (
    <div className="space-y-6">
      {/* Encabezado contextual del dashboard */}
      <div
        className={[
          "rounded-3xl border px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4",
          isDark
            ? "border-white/10 bg-black/40"
            : "border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]",
        ].join(" ")}
      >
        <div>
          <p
            className={[
              "text-[11px] uppercase tracking-[0.22em] font-bold",
              isDark ? "text-neutral-500" : "text-emerald-600",
            ].join(" ")}
          >
            Dashboard global
          </p>
          <p
            className={[
              "text-sm font-semibold mt-1",
              isDark ? "text-neutral-200" : "text-slate-900",
            ].join(" ")}
          >
            Visión ejecutiva del funnel de candidatos y evaluaciones.
          </p>
          <p
            className={[
              "text-xs mt-1",
              isDark ? "text-neutral-500" : "text-slate-600",
            ].join(" ")}
          >
            {periodLabel}
          </p>
          <p
            className={[
              "text-[10px] mt-1",
              isDark ? "text-neutral-600" : "text-slate-500",
            ].join(" ")}
          >
            Esta sección de dashboard sigue en evolución; algunas métricas y visualizaciones pueden cambiar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest">
          <span
            className={[
              "px-3 py-1 rounded-full border",
              isDark
                ? "bg-white/5 border-white/10 text-neutral-200"
                : "bg-emerald-50 border-emerald-100 text-emerald-700",
            ].join(" ")}
          >
            {scopeLabel}
          </span>
        </div>
      </div>

      {/* filtros */}
      <div
        className={[
          "rounded-3xl border px-5 py-4 flex flex-wrap items-end gap-4",
          isDark
            ? "border-white/10 bg-[#050708]/80"
            : "border-slate-200 bg-slate-50 shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
        ].join(" ")}
      >
        <DatePicker label="Desde" value={safeFrom} max={safeTo} onChange={setFromDate} />
        <DatePicker label="Hasta" value={safeTo} min={safeFrom} onChange={setToDate} />

        <Dropdown
          label="Escuela"
          valueId={schoolId}
          placeholder="Todas las escuelas"
          options={schoolOptions}
          loading={loadingSchools}
          onChange={(id) => {
            setSchoolId(id);
            setProgramId(null);
          }}
          clearLabel="Todas las escuelas"
        />

        <Dropdown
          label="Programa"
          valueId={programId}
          placeholder={schoolId ? "Todos los programas" : "Selecciona una escuela"}
          options={programOptions}
          loading={loadingPrograms}
          disabled={!schoolId}
          onChange={(id) => setProgramId(id)}
          clearLabel="Todos los programas"
        />
      </div>

      {scopeError && (
        <div
          className={[
            "p-4 rounded-2xl border text-sm",
            isDark
              ? "border-red-500/15 bg-red-500/5 text-red-300"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {scopeError}
        </div>
      )}

      {loading && (
        <div
          className={[
            "flex items-center gap-3",
            isDark ? "text-neutral-400" : "text-slate-600",
          ].join(" ")}
        >
          <Loader2
            className={[
              "w-5 h-5 animate-spin",
              isDark ? "text-emerald-400" : "text-emerald-600",
            ].join(" ")}
          />
          <span className="text-sm">Cargando dashboard…</span>
        </div>
      )}

      {!loading && error && (
        <div
          className={[
            "p-5 rounded-2xl border flex items-center gap-3",
            isDark
              ? "border-red-500/15 bg-red-500/5 text-red-300"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className={[
              "rounded-2xl border p-5",
              isDark
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white shadow-sm",
            ].join(" ")}
          >
            <div
              className={[
                "text-[11px] uppercase tracking-widest font-bold",
                isDark ? "text-neutral-500" : "text-slate-500",
              ].join(" ")}
            >
              Total candidatos
            </div>
            <div
              className={[
                "mt-2 text-3xl font-black",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {data.kpis.totalCandidates}
            </div>
          </div>

          <div
            className={[
              "rounded-2xl border p-5",
              isDark
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white shadow-sm",
            ].join(" ")}
          >
            <div
              className={[
                "text-[11px] uppercase tracking-widest font-bold",
                isDark ? "text-neutral-500" : "text-slate-500",
              ].join(" ")}
            >
              Total evaluaciones
            </div>
            <div
              className={[
                "mt-2 text-3xl font-black",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              {data.kpis.totalEvaluations}
            </div>
          </div>

          <div
            className={[
              "rounded-2xl border p-5",
              isDark
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white shadow-sm",
            ].join(" ")}
          >
            <div
              className={[
                "text-[11px] uppercase tracking-widest font-bold",
                isDark ? "text-neutral-500" : "text-slate-500",
              ].join(" ")}
            >
              % tasa aceptación
            </div>
            <div
              className={[
                "mt-2 text-3xl font-black",
                isDark ? "text-white" : "text-emerald-700",
              ].join(" ")}
            >
              {acceptancePct}%
            </div>
          </div>
          <div
            className={[
              "rounded-2xl border p-5",
              isDark
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white shadow-sm",
            ].join(" ")}
          >
          <div
            className={[
              "text-[11px] uppercase tracking-widest font-bold",
              isDark ? "text-neutral-500" : "text-slate-500",
            ].join(" ")}
          >
            % tasa rechazo
          </div>
          <div
            className={[
              "mt-2 text-3xl font-black",
              isDark ? "text-white" : "text-rose-700",
            ].join(" ")}
          >
            {rejectionPct}%
          </div>
        </div>

        </div>

          {/* Barras por estado (full width) */}
          <div>
            <AdminStatusBars
              approved={data.kpis.approved}
              rejected={data.kpis.rejected}
              pending={data.kpis.pending}
              noEval={data.kpis.noEvalCandidates}
            />
          </div>

          {/* Abajo: serie temporal + score */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <AdminEvaluationsSeriesChart points={data.evaluationsSeries} />
            </div>

            <div className="lg:col-span-5">
              <AdminScoreCard
                avg={data.score.avg}
                median={data.score.median}
                min={data.score.min}
                max={data.score.max}
                count={data.score.count}
              />
            </div>
          </div>
        </>
      )}


    </div>
    
  );
};

export default AdminDashboardPanel;
