import React, { useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  Loader2,
  GraduationCap,
  Briefcase,
  FolderOpen,
  BadgeCheck,
  Paperclip,
  Link2,
  FileX,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../../../context/ThemeContext";
import {
  getEvaluationDocuments,
  downloadCandidateDocument,
  type CandidateDocumentItem,
  type CandidateDocumentType,
} from "../../../services/candidateDocumentsService";
import { queryKeys } from "../../../services/queryKeys";

type Props = {
  evaluationId: string;
};

const DOC_TYPE_CONFIG: Record<
  CandidateDocumentType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  RESUME: {
    label: "Hoja de vida",
    icon: <FileText className="w-4 h-4" />,
    color: "text-cyan-400",
  },
  ACADEMIC_CERTIFICATE: {
    label: "Certificado académico",
    icon: <GraduationCap className="w-4 h-4" />,
    color: "text-violet-400",
  },
  WORK_CERTIFICATE: {
    label: "Certificado laboral",
    icon: <Briefcase className="w-4 h-4" />,
    color: "text-amber-400",
  },
  PORTFOLIO: {
    label: "Portafolio",
    icon: <FolderOpen className="w-4 h-4" />,
    color: "text-emerald-400",
  },
  IDENTITY_DOCUMENT: {
    label: "Documento de identidad",
    icon: <BadgeCheck className="w-4 h-4" />,
    color: "text-blue-400",
  },
  OTHER: {
    label: "Otro soporte",
    icon: <Paperclip className="w-4 h-4" />,
    color: "text-slate-400",
  },
};

function formatFileSize(bytes: string | null): string {
  if (!bytes) return "";
  const n = parseInt(bytes, 10);
  if (!Number.isFinite(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

type DocActionProps = {
  doc: CandidateDocumentItem;
  downloadingId: string | null;
  onDownload: (doc: CandidateDocumentItem) => void;
  isDark: boolean;
  compact?: boolean;
};

const DocumentAction: React.FC<DocActionProps> = ({
  doc,
  downloadingId,
  onDownload,
  isDark,
  compact = false,
}) => {
  const isFile = doc.sourceType === "FILE";
  const isUrl = doc.sourceType === "URL";
  const hasUrl = !!doc.url;

  if (isFile) {
    return (
      <button
        onClick={() => onDownload(doc)}
        disabled={downloadingId === doc.id}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
          downloadingId === doc.id
            ? isDark
              ? "bg-white/5 text-slate-500 cursor-wait"
              : "bg-slate-100 text-slate-400 cursor-wait"
            : isDark
              ? "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
        }`}
      >
        {downloadingId === doc.id ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {downloadingId === doc.id ? "..." : compact ? "Descargar" : "Descargar"}
      </button>
    );
  }

  if (isUrl && hasUrl) {
    return (
      <a
        href={doc.url!}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
          isDark
            ? "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20"
            : "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200"
        }`}
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Abrir enlace
      </a>
    );
  }

  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
        isDark
          ? "bg-white/5 text-slate-600 border border-white/5"
          : "bg-slate-50 text-slate-400 border border-slate-100"
      }`}
    >
      <FileX className="w-3.5 h-3.5" />
      Sin archivo adjunto
    </span>
  );
};

export const CoordinatorDocumentsSection: React.FC<Props> = ({
  evaluationId,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: documents = [], isLoading: loading, error: queryError } = useQuery<CandidateDocumentItem[]>({
    queryKey: queryKeys.documents.byEvaluation(evaluationId),
    queryFn: () => getEvaluationDocuments(evaluationId),
    staleTime: 1000 * 60 * 5,
  });

  const error = queryError
    ? (queryError as any)?.response?.data?.message ?? (queryError as Error)?.message ?? "Error cargando documentos"
    : null;

  const handleDownload = async (doc: CandidateDocumentItem) => {
    if (doc.sourceType === "URL" && doc.url) {
      window.open(doc.url, "_blank");
      return;
    }
    if (doc.sourceType === "URL" && !doc.url) return;
    setDownloadingId(doc.id);
    try {
      await downloadCandidateDocument(doc.id, doc.fileName);
    } catch (err) {
      console.error("Error descargando documento:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const resumeDocs = documents.filter((d) => d.isPrimaryResume);
  const otherDocs = documents.filter((d) => !d.isPrimaryResume);

  if (loading) {
    return (
      <div
        className={`rounded-2xl border p-6 ${
          isDark ? "bg-[#0A0C10] border-white/5" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Cargando documentos...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-2xl border p-6 ${
          isDark ? "bg-rose-500/5 border-rose-500/20" : "bg-rose-50 border-rose-200"
        }`}
      >
        <p className="text-sm text-rose-400">{error}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-dashed p-8 text-center ${
          isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50"
        }`}
      >
        <FileText
          className={`w-8 h-8 mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`}
        />
        <p className={`text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          No hay soportes registrados
        </p>
        <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          El líder aún no ha cargado documentos para este candidato.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hoja de vida principal */}
      {resumeDocs.length > 0 &&
        resumeDocs.map((doc) => {
          const cfg = DOC_TYPE_CONFIG[doc.documentType];
          const isFile = doc.sourceType === "FILE";
          const isUrl = doc.sourceType === "URL";

          return (
            <div
              key={doc.id}
              className={`relative rounded-2xl border overflow-hidden ${
                isDark
                  ? "bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-500/20"
                  : "bg-gradient-to-br from-cyan-50 to-white border-cyan-200"
              }`}
            >
              <div
                className={`px-5 py-3 border-b ${
                  isDark ? "border-cyan-500/10" : "border-cyan-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDark ? "bg-cyan-500/10" : "bg-cyan-100"
                    }`}
                  >
                    <FileText className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      isDark ? "text-cyan-300" : "text-cyan-700"
                    }`}
                  >
                    Hoja de vida principal
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {doc.fileName || "Hoja de vida"}
                    </p>
                    <div
                      className={`flex items-center gap-3 mt-2 text-xs ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      <span>{cfg.label}</span>
                      {isFile && doc.sizeBytes && (
                        <>
                          <span>·</span>
                          <span>{formatFileSize(doc.sizeBytes)}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{formatDate(doc.uploadedAt)}</span>
                    </div>
                    {doc.notes && (
                      <p
                        className={`text-xs mt-2 italic ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {doc.notes}
                      </p>
                    )}
                  </div>

                  <DocumentAction
                    doc={doc}
                    downloadingId={downloadingId}
                    onDownload={handleDownload}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          );
        })}

      {/* Otros documentos */}
      {otherDocs.length > 0 && (
        <div>
          <h4
            className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Soportes adicionales
          </h4>
          <div className="space-y-2">
            {otherDocs.map((doc) => {
              const cfg = DOC_TYPE_CONFIG[doc.documentType];
              const isFile = doc.sourceType === "FILE";

              return (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-all ${
                    isDark
                      ? "bg-[#0A0C10] border-white/5 hover:border-white/10"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDark ? "bg-white/5" : "bg-slate-50"
                      }`}
                    >
                      <span className={cfg.color}>{cfg.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        {doc.fileName || cfg.label}
                      </p>
                      <div
                        className={`flex items-center gap-2 text-[11px] ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        <span>{cfg.label}</span>
                        {isFile && doc.sizeBytes && (
                          <>
                            <span>·</span>
                            <span>{formatFileSize(doc.sizeBytes)}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </div>
                      {doc.notes && (
                        <p
                          className={`text-[11px] mt-0.5 italic ${
                            isDark ? "text-slate-600" : "text-slate-400"
                          }`}
                        >
                          {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <DocumentAction
                      doc={doc}
                      downloadingId={downloadingId}
                      onDownload={handleDownload}
                      isDark={isDark}
                      compact
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorDocumentsSection;
