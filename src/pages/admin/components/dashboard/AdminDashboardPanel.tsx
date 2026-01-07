// src/pages/admin/dashboard/AdminDashboardPanel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

// ✅ DB scope service (para escuelas/programas)
import { listProgramsBySchool, listSchools, ProgramOption, SchoolOption } from "../../../../services/adminScopeService";

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

  useOutsideClose(open, [btnRef as any, popRef as any], () => setOpen(false));

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs
                   hover:bg-white/10 transition min-w-[140px] text-left"
        title="Cambiar mes"
      >
        {MONTHS[value]}
      </button>

      {open && (
        <div
          ref={popRef}
          className="absolute left-0 top-full mt-2 z-[250] w-[220px] max-h-[240px] overflow-auto
                     rounded-2xl border border-white/10 bg-[#0b0d0c]
                     shadow-[0_30px_120px_rgba(0,0,0,0.8)] p-1"
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
                  "w-full text-left px-3 py-2 rounded-xl text-xs transition",
                  active
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-white"
                    : "bg-transparent hover:bg-white/10 text-neutral-200",
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
        <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
          {label}
        </label>

        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-[260px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-left
                     hover:bg-white/10 transition flex items-center justify-between gap-3"
        >
          <span className="truncate">{formatLabel(value)}</span>
          <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
        </button>
      </div>

      {open && (
        <div
          ref={popRef}
          className="absolute z-[200] mt-2 w-[360px] rounded-2xl border border-white/10 bg-[#0b0d0c]/95 shadow-[0_30px_120px_rgba(0,0,0,0.8)] p-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
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
                className="w-[92px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs"
                inputMode="numeric"
              />
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mt-3 text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
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
                    // ✅ tamaño fijo, cuadrado, centrado (no se corta)
                    "h-10 w-10 flex items-center justify-center",
                    "rounded-xl text-xs font-bold border transition select-none",
                    // ✅ evita que el texto empuje / recorte
                    "leading-none",
                    c.disabled
                      ? "border-white/5 text-neutral-700 bg-white/2 cursor-not-allowed"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200",
                    isSelected ? "bg-emerald-500/20 border-emerald-500/30 text-white" : "",
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
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold
                         uppercase tracking-widest hover:bg-white/10 transition"
            >
              Hoy
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold
                         uppercase tracking-widest hover:bg-white/10 transition"
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

  useOutsideClose(open, [btnRef as any, popRef as any], () => setOpen(false));

  const valueLabel = useMemo(() => {
    if (!valueId) return "";
    return options.find((o) => String(o.id) === String(valueId))?.name ?? "";
  }, [valueId, options]);

  const isDisabled = !!disabled || !!loading;

  return (
    <div className="relative">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
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
              ? "bg-white/2 border-white/5 text-neutral-600 cursor-not-allowed"
              : "bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10",
          ].join(" ")}
        >
          <span className="truncate">
            {valueLabel || placeholder}
          </span>
          <span className="text-neutral-500 text-[11px]">
            {loading ? "..." : "▾"}
          </span>
        </button>
      </div>

      {open && !isDisabled && (
        <div
          ref={popRef}
          className="absolute left-0 top-full mt-2 z-[220] w-[320px] max-h-[280px] overflow-auto
                     rounded-2xl border border-white/10 bg-[#0b0d0c]
                     shadow-[0_30px_120px_rgba(0,0,0,0.8)] p-1"
        >
          {allowClear && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={[
                "w-full text-left px-3 py-2 rounded-xl text-xs transition",
                !valueId
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-white"
                  : "hover:bg-white/10 text-neutral-200",
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
                  "w-full text-left px-3 py-2 rounded-xl text-xs transition",
                  active
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-white"
                    : "hover:bg-white/10 text-neutral-200",
                ].join(" ")}
              >
                {o.name}
              </button>
            );
          })}

          {options.length === 0 && (
            <div className="px-3 py-3 text-xs text-neutral-500">
              {placeholder}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const AdminDashboardPanel: React.FC<Props> = ({ scope }) => {
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

  const { data, loading, error } = useAdminDashboard({
    orgId: scope.orgId ?? null,
    schoolId: schoolId ?? null,
    programId: programId ?? null,
    from: fromIso,
    to: toIso,
  });

  const acceptancePct = useMemo(() => {
    const r = data?.kpis?.acceptanceRate ?? 0;
    return Math.round(r * 1000) / 10;
  }, [data?.kpis?.acceptanceRate]);

  return (
    <div className="space-y-6">
      {/* filtros */}
      <div className="flex flex-wrap items-end gap-4">
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
        <div className="p-4 rounded-2xl border border-red-500/15 bg-red-500/5 text-red-300 text-sm">
          {scopeError}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span className="text-sm">Cargando dashboard…</span>
        </div>
      )}

      {!loading && error && (
        <div className="p-5 rounded-2xl border border-red-500/15 bg-red-500/5 text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!loading && !error && data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
              Total candidatos
            </div>
            <div className="mt-2 text-3xl font-black">{data.kpis.totalCandidates}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
              Total evaluaciones
            </div>
            <div className="mt-2 text-3xl font-black">{data.kpis.totalEvaluations}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
              % tasa aceptación
            </div>
            <div className="mt-2 text-3xl font-black">{acceptancePct}%</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPanel;
