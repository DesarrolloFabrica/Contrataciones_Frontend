import React from "react";
import { Search, Loader2 } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import type { TeacherCandidateSearchItemDto } from "../types";

interface CandidateLookupPanelProps {
  isSearching: boolean;
  lookupError: string | null;
  candidateMatches: TeacherCandidateSearchItemDto[];
  selectedCandidateId: string | null;
  onPickCandidate: (c: TeacherCandidateSearchItemDto) => void;
}

export const CandidateLookupPanel: React.FC<CandidateLookupPanelProps> = ({
  isSearching,
  lookupError,
  candidateMatches,
  selectedCandidateId,
  onPickCandidate,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="mt-3 space-y-2">
      {lookupError && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-950/30 px-4 py-3 text-xs text-rose-200">
          {lookupError}
        </div>
      )}

      {candidateMatches.length > 0 && (
        <div
          className={`rounded-2xl overflow-hidden border ${
            isDark
              ? "border-cyan-500/25 bg-[#061015]"
              : "border-cyan-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
          }`}
        >
          <div
            className={`px-4 py-3 border-b text-[11px] font-extrabold uppercase tracking-[0.22em] ${
              isDark
                ? "border-white/10 text-cyan-200/80"
                : "border-cyan-100 text-cyan-700"
            }`}
          >
            Coincidencias por cédula
          </div>

          <div
            className={`divide-y ${
              isDark ? "divide-white/10" : "divide-slate-100"
            }`}
          >
            {candidateMatches.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onPickCandidate(c)}
                className={`w-full text-left px-4 py-3 transition ${
                  isDark
                    ? "hover:bg-white/[0.04]"
                    : "hover:bg-cyan-50/60"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div
                      className={`text-sm font-semibold ${
                        isDark ? "text-white/85" : "text-slate-900"
                      }`}
                    >
                      {c.fullName}
                    </div>
                    <div
                      className={`text-[11px] font-mono ${
                        isDark ? "text-white/45" : "text-slate-500"
                      }`}
                    >
                      CC: {c.documentNumber ?? "—"}
                      {typeof c.age === "number"
                        ? ` · ${c.age} años`
                        : ""}
                    </div>
                  </div>

                  <div
                    className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${
                      isDark
                        ? "text-cyan-300/80"
                        : "text-cyan-600"
                    }`}
                  >
                    Seleccionar
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCandidateId && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-600/80">
          Candidato seleccionado
        </div>
      )}
    </div>
  );
};

export default CandidateLookupPanel;
