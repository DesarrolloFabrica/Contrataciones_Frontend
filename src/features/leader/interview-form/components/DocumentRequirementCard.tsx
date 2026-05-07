import React from "react";
import { useTheme } from "../../../../context/ThemeContext";
import { darkInputStyles, lightInputStyles } from "../constants";
import type { CandidateDocumentDraft } from "../types";

const statusOptions = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Disponible", label: "Disponible" },
  { value: "No aplica", label: "No aplica" },
];

interface DocumentRequirementCardProps {
  item: CandidateDocumentDraft;
  onChange: (updated: CandidateDocumentDraft) => void;
}

export const DocumentRequirementCard: React.FC<DocumentRequirementCardProps> = ({
  item,
  onChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...item, status: e.target.value as CandidateDocumentDraft["status"] });
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...item, note: e.target.value });
  };

  const handleTempUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...item, tempUrl: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    onChange({
      ...item,
      file: selectedFile,
      fileName: selectedFile?.name ?? "",
      status: selectedFile ? "Disponible" : item.status,
    });
  };

  const isResume = item.id === "resume";

  return (
    <div
      className={`rounded-2xl border p-5 space-y-4 ${
        isDark
          ? "bg-white/[0.02] border-white/10"
          : "bg-slate-50/50 border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h4
          className={`text-xs font-bold uppercase tracking-[0.14em] ${
            isDark ? "text-gray-100" : "text-slate-700"
          }`}
        >
          {item.label}
        </h4>
        <select
          value={item.status}
          onChange={handleStatusChange}
          className={`${isDark ? darkInputStyles : lightInputStyles} appearance-none cursor-pointer ${isResume ? "w-56" : "w-44"}`}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {isResume && (
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${isDark ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30" : "bg-cyan-100 text-cyan-700 border border-cyan-300"}`}>
            Documento principal
          </span>
          <span className={`text-[11px] ${isDark ? "text-amber-300" : "text-amber-700"}`}>
            Obligatorio
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={item.note}
          onChange={handleNoteChange}
          rows={2}
          placeholder="Observación..."
          className={`${isDark ? darkInputStyles : lightInputStyles} resize-none min-h-[60px] leading-relaxed`}
        />
        {isResume ? (
          <div className="space-y-2">
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className={isDark ? darkInputStyles : lightInputStyles}
            />
            <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {item.fileName?.trim() ? `Archivo seleccionado: ${item.fileName}` : "No se ha seleccionado archivo"}
            </p>
          </div>
        ) : (
          <input
            type="text"
            value={item.tempUrl}
            onChange={handleTempUrlChange}
            placeholder="Link opcional (URL)"
            className={isDark ? darkInputStyles : lightInputStyles}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentRequirementCard;
