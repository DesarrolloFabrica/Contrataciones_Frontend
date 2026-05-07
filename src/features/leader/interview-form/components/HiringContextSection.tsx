import React from "react";
import { Briefcase } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";
import { SelectInput } from "./SelectInput";
import { darkInputStyles, lightInputStyles } from "../constants";
import type { HiringContextDraft } from "../types";
import {
  listOpenHiringRequestsMine,
  type HiringRequestItem,
} from "../../../../services/hiringRequestsService";

interface HiringContextSectionProps {
  hiringContext: HiringContextDraft;
  onChange: (updated: HiringContextDraft) => void;
}

const processTypeOptions = [
  { value: "Facilitador", label: "Facilitador" },
  { value: "Docente", label: "Docente" },
  { value: "Administrativo", label: "Administrativo" },
  { value: "Otro", label: "Otro" },
];

const priorityOptions = [
  { value: "Alta", label: "Alta" },
  { value: "Media", label: "Media" },
  { value: "Baja", label: "Baja" },
];

export const HiringContextSection: React.FC<HiringContextSectionProps> = ({
  hiringContext,
  onChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [loading, setLoading] = React.useState(false);
  const [fetchDone, setFetchDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [requests, setRequests] = React.useState<HiringRequestItem[]>([]);
  const didFetchRef = React.useRef(false);

  // Ref para acceder al hiringContext más reciente dentro de callbacks async
  const hiringContextRef = React.useRef(hiringContext);
  React.useLayoutEffect(() => { hiringContextRef.current = hiringContext; });
  const onChangeRef = React.useRef(onChange);
  React.useLayoutEffect(() => { onChangeRef.current = onChange; });

  const hasRequests = requests.length > 0;

  React.useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    let active = true;
    setLoading(true);
    setError(null);
    listOpenHiringRequestsMine()
      .then((rows) => {
        if (!active) return;
        setRequests(rows);
        if (rows.length === 0) {
          // Sin vacantes disponibles: forzar modo manual si no lo era ya
          const ctx = hiringContextRef.current;
          if (ctx.contextMode !== "MANUAL") {
            onChangeRef.current({ ...ctx, contextMode: "MANUAL", hiringRequestId: null, selectedVacancyLabel: "" });
          }
        }
      })
      .catch(() => {
        if (!active) return;
        setError("No se pudieron cargar vacantes.");
        const ctx = hiringContextRef.current;
        if (ctx.contextMode !== "MANUAL") {
          onChangeRef.current({ ...ctx, contextMode: "MANUAL", hiringRequestId: null, selectedVacancyLabel: "" });
        }
      })
      .finally(() => {
        // Sin guardia "if (active)": siempre limpiar loading.
        // En React 18 Strict Mode, el primer mount se desmonta y remonta; sin esto
        // el segundo mount no tiene forma de saber que el fetch ya terminó y loading
        // quedaría en true indefinidamente.
        setLoading(false);
        setFetchDone(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    onChange({ ...hiringContext, [name]: value });
  };

  const handleSelectRequest = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      onChange({
        ...hiringContext,
        hiringRequestId: null,
        contextMode: "MANUAL",
        selectedVacancyLabel: "",
      });
      return;
    }

    const selected = requests.find((x) => x.id === id);
    if (!selected) return;

    onChange({
      ...hiringContext,
      hiringRequestId: selected.id,
      contextMode: "SELECTED",
      selectedVacancyLabel: selected.title || selected.positionName,
      targetRole: selected.roleName || selected.positionName || "",
      processType: selected.profile || "",
      requestingArea: selected.area || "",
      coordination: selected.coordination || "",
      needDescription: selected.description || "",
      priority: ((selected.priority as any) ?? "") as any,
    });
  };

  const isSelectedMode = hiringContext.contextMode === "SELECTED" && !!hiringContext.hiringRequestId;

  return (
    <FormSection
      title="Contexto de búsqueda / Perfil solicitado"
      icon={<Briefcase className="w-6 h-6" />}
      step={0}
      subtitle="Define el perfil y las condiciones de la vacante antes de evaluar al candidato."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Vacante / Contexto" name="hiringRequestId">
          <select
            name="hiringRequestId"
            value={hiringContext.hiringRequestId ?? ""}
            onChange={handleSelectRequest}
            disabled={loading || (!hasRequests && fetchDone)}
            className={`${isDark ? darkInputStyles : lightInputStyles} appearance-none`}
          >
            <option value="">
              {loading
                ? "Cargando vacantes disponibles..."
                : error
                  ? "No se pudieron cargar vacantes"
                  : !hasRequests && fetchDone
                    ? "No hay vacantes disponibles"
                    : "Selecciona una vacante"}
            </option>
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title || r.positionName}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Modo" name="contextMode">
          <input
            readOnly
            value={
              hiringContext.contextMode === "SELECTED" && !!hiringContext.hiringRequestId
                ? "Vacante seleccionada"
                : "Manual temporal"
            }
            className={`${isDark ? darkInputStyles : lightInputStyles} cursor-default select-none`}
          />
        </FormField>

        <FormField label="Cargo o perfil buscado" name="targetRole">
          <TextInput
            name="targetRole"
            value={hiringContext.targetRole}
            onChange={handleFieldChange}
            placeholder="Ej. Facilitador de Matemáticas"
            required={false}
            disabled={isSelectedMode}
          />
        </FormField>

        <FormField label="Tipo de proceso" name="processType">
          <SelectInput
            name="processType"
            value={hiringContext.processType}
            onChange={handleFieldChange}
            options={processTypeOptions}
            placeholder="Seleccione tipo..."
            disabled={isSelectedMode}
          />
        </FormField>
      </div>

      <FormField label="Área solicitante" name="requestingArea">
        <TextInput
          name="requestingArea"
          value={hiringContext.requestingArea}
          onChange={handleFieldChange}
          placeholder="Ej. Coordinación Académica, Facultad de Ciencias"
          required={false}
          disabled={isSelectedMode}
        />
      </FormField>

      <FormField label="Coordinación" name="coordination">
        <TextInput
          name="coordination"
          value={hiringContext.coordination ?? ""}
          onChange={handleFieldChange}
          placeholder="Ej. Fábrica de contenido"
          required={false}
          disabled={isSelectedMode}
        />
      </FormField>

      <FormField label="Descripción de la necesidad" name="needDescription">
        <TextArea
          name="needDescription"
          value={hiringContext.needDescription}
          onChange={handleFieldChange}
          rows={3}
          placeholder="Describe brevemente por qué se requiere este perfil, el contexto y las expectativas..."
          disabled={isSelectedMode}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Prioridad" name="priority">
          <SelectInput
            name="priority"
            value={hiringContext.priority}
            onChange={handleFieldChange}
            options={priorityOptions}
            placeholder="Seleccione prioridad..."
            disabled={isSelectedMode}
          />
        </FormField>
      </div>

      {error && (
        <p className="text-xs text-rose-500">
          No se pudieron cargar vacantes. Modo manual activo.
        </p>
      )}
      {!loading && !error && !hasRequests && fetchDone && (
        <p className="text-xs text-amber-500">
          No hay vacantes disponibles. Modo manual activo.
        </p>
      )}

      {!isSelectedMode && !error && (hasRequests || !fetchDone) && (
        <p className="text-xs text-slate-500">
          Modo manual activo. El contexto se registrará en backend al enviar la entrevista.
        </p>
      )}

      <div
        className={[
          "rounded-xl border px-5 py-4 text-xs leading-relaxed",
          isDark
            ? "bg-cyan-500/5 border-cyan-500/15 text-cyan-300/70"
            : "bg-cyan-50 border-cyan-200 text-cyan-700",
        ].join(" ")}
      >
        Esta informacion prepara la trazabilidad del proceso y podra conectarse
        al backend en una fase posterior.
      </div>
    </FormSection>
  );
};

export default HiringContextSection;
