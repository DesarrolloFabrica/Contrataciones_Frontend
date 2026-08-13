import { jsPDF } from "jspdf";
import logoCun from "../../assets/images/LogoCUN.png";
import type { InterviewAnalysis } from "../intelligence/types";
import type { SelectionInterview } from "./types";
import {
  IA_DISCLAIMER,
  analysisStatusLabel,
  attentionPoints,
  evidenceClassificationLabel,
  formatConfidence,
} from "./analysisLabels";

const MARGIN_X = 40;
const MARGIN_Y = 40;
const LINE_HEIGHT = 14;
const BRAND_GREEN = { r: 0, g: 177, b: 113 };
const BRAND_DARK = { r: 8, g: 32, b: 36 };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

const safe = (value: unknown, fallback = "N/D") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

export type CharlaAnalysisPdfContext = {
  interview: SelectionInterview;
  analysis: InterviewAnalysis;
};

export async function generateCharlaInterviewAnalysisPdf(
  context: CharlaAnalysisPdfContext,
  options?: { download?: boolean },
): Promise<Blob> {
  const { interview, analysis } = context;
  const vacancy = interview.application.selectionProcess.vacancyReference;
  const output = analysis.output;
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN_X * 2;

  const drawSmallHeader = () => {
    doc.setFillColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("CHARLAS · Informe de análisis IA", MARGIN_X, 26);
    doc.setTextColor(0, 0, 0);
  };

  try {
    const img = await loadImage(logoCun);
    doc.setFillColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
    doc.rect(0, 0, pageWidth, 90, "F");
    const logoHeight = 50;
    const logoWidth = (img.width / img.height) * logoHeight;
    doc.addImage(img, "PNG", MARGIN_X, 20, logoWidth, logoHeight);
    const headerX = MARGIN_X + logoWidth + 20;
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Corporación Unificada Nacional - CUN", headerX, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("CHARLAS · Informe de análisis de entrevista", headerX, 58);
  } catch {
    doc.setFillColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
    doc.rect(0, 0, pageWidth, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CHARLAS · Informe de análisis de entrevista", MARGIN_X, 50);
  }

  doc.setTextColor(0, 0, 0);
  let y = 110;

  const ensureSpace = (extra = 0) => {
    if (y > pageHeight - MARGIN_Y - extra) {
      doc.addPage();
      drawSmallHeader();
      y = 60;
    }
  };

  const addSection = (title: string) => {
    ensureSpace(36);
    const boxHeight = 22;
    doc.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    doc.setFillColor(232, 255, 244);
    doc.roundedRect(MARGIN_X, y - 14, contentWidth, boxHeight, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
    doc.text(title, MARGIN_X + 10, y);
    doc.setTextColor(0, 0, 0);
    y += 24;
  };

  const addParagraph = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const lines = doc.splitTextToSize(text || "N/D", contentWidth);
    lines.forEach((line: string) => {
      ensureSpace();
      doc.text(line, MARGIN_X, y);
      y += LINE_HEIGHT - 2;
    });
    y += 6;
  };

  const addBullets = (items: string[], emptyLabel = "Sin hallazgos.") => {
    if (!items.length) {
      addParagraph(emptyLabel);
      return;
    }
    items.forEach((item) => {
      ensureSpace();
      const lines = doc.splitTextToSize(`• ${item}`, contentWidth);
      lines.forEach((line: string, index: number) => {
        ensureSpace();
        doc.text(line, MARGIN_X + (index === 0 ? 0 : 10), y);
        y += LINE_HEIGHT - 2;
      });
      y += 2;
    });
    y += 4;
  };

  const addLabelValue = (label: string, value: string) => {
    ensureSpace();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${label}:`, MARGIN_X, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value, contentWidth - 140);
    doc.text(lines[0] ?? "N/D", MARGIN_X + 140, y);
    y += LINE_HEIGHT;
    for (let i = 1; i < lines.length; i += 1) {
      ensureSpace();
      doc.text(lines[i], MARGIN_X + 140, y);
      y += LINE_HEIGHT;
    }
  };

  addSection("Identificación");
  addLabelValue("Candidato", safe(interview.application.candidate.fullName));
  addLabelValue("Cargo", safe(vacancy.positionName));
  addLabelValue("Área", safe(vacancy.areaName, "No informada"));
  addLabelValue(
    "Plantilla",
    `${safe(interview.templateSnapshot.templateName)} · v${interview.templateSnapshot.versionNumber}`,
  );
  addLabelValue("Estado del análisis", analysisStatusLabel[analysis.status]);
  addLabelValue("Versión / modelo", `v${analysis.version} · ${safe(analysis.model, "pendiente")}`);
  if (analysis.generatedAt) {
    addLabelValue("Generado", new Date(analysis.generatedAt).toLocaleString("es-CO"));
  }
  y += 4;

  addSection("Indicadores");
  if (analysis.scoring?.overallScore != null) {
    addLabelValue("Indicador de ajuste generado por IA", `${analysis.scoring.overallScore} / 100`);
  } else {
    addParagraph(
      `Información insuficiente para calcular el indicador.${
        analysis.scoring?.reason ? ` ${analysis.scoring.reason}` : ""
      }`,
    );
  }
  const confidence = formatConfidence(output?.confidence ?? analysis.scoring?.confidence);
  if (confidence) addLabelValue("Confidence", confidence);
  y += 4;

  addSection("Resumen ejecutivo");
  addParagraph(safe(output?.overallAssessment || output?.summary, "Sin resumen disponible."));

  addSection("Fortalezas");
  addBullets(output?.strengths ?? []);

  addSection("Puntos de atención");
  addBullets(attentionPoints(output));

  addSection("Competencias");
  if (!output?.competencies?.length) {
    addParagraph("Sin evaluación de competencias disponible.");
  } else {
    output.competencies.forEach((item) => {
      ensureSpace(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(safe(item.competency, "Competencia"), MARGIN_X, y);
      y += LINE_HEIGHT;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const meta = [
        item.score != null ? `Score ${item.score}/100` : null,
        formatConfidence(item.confidence) ? `Confidence ${formatConfidence(item.confidence)}` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      if (meta) {
        doc.text(meta, MARGIN_X, y);
        y += LINE_HEIGHT;
      }
      addParagraph(safe(item.rationale));
      if (item.evidenceRefs?.length) {
        addParagraph(`Evidencias: ${item.evidenceRefs.join(", ")}`);
      }
    });
  }

  addSection("Evidencias");
  if (!output?.evidence?.length) {
    addParagraph("Sin evidencias registradas.");
  } else {
    output.evidence.forEach((item) => {
      ensureSpace(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(
        `${evidenceClassificationLabel[item.classification]} · ${safe(item.sourceRef)}`,
        MARGIN_X,
        y,
      );
      y += LINE_HEIGHT;
      addParagraph(safe(item.statement));
      if (item.relevance) addParagraph(`Relevancia: ${item.relevance}`);
    });
  }

  addSection("Aspectos por profundizar");
  addBullets(output?.unansweredOrWeakAreas ?? [], "No se identificaron vacíos adicionales.");

  if (output?.interviewerConsistencyNotes?.length) {
    addSection("Notas de coherencia del entrevistador");
    addBullets(output.interviewerConsistencyNotes);
  }

  addSection("Conclusión");
  addParagraph(safe(output?.overallAssessment, "Sin conclusión disponible."));

  addSection("Aviso");
  addParagraph(IA_DISCLAIMER);

  const blob = doc.output("blob");
  if (options?.download !== false) {
    const fileName = `charlas-analisis-${interview.application.candidate.fullName || "candidato"}-v${analysis.version}.pdf`
      .replace(/[^\w.\-áéíóúñÁÉÍÓÚÑ ]+/gi, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    doc.save(fileName);
  }
  return blob;
}
