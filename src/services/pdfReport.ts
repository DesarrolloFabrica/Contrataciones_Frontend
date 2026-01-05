// src/services/pdfReport.ts
import { jsPDF } from "jspdf";
import type { AnalysisResult, InterviewData } from "../types";
import logoCun from "../assets/images/LogoCUN.png";

const MARGIN_X = 40;
const MARGIN_Y = 40;
const LINE_HEIGHT = 14;

// Colores corporativos aproximados CUN
const BRAND_GREEN = { r: 0, g: 177, b: 113 }; // verde
const BRAND_DARK = { r: 8, g: 32, b: 36 }; // fondo header

export type PdfCandidateContext = {
  fullName?: string | null;
  programName?: string | null;
  schoolName?: string | null;
  age?: number | string | null;
  evaluationId?: string | null;
};

export type PdfOptions = {
  download?: boolean;
  candidate?: PdfCandidateContext;
};

// Helper para cargar la imagen del logo
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

const safeText = (v: any, fallback = "N/D") => {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
};

const safeAge = (v: any) => {
  if (v === null || v === undefined || v === "") return "N/D";
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isFinite(n) && n > 0) return `${Math.round(n)} años`;
  const t = String(v).trim();
  return t ? `${t} años` : "N/D";
};

/**
 * Construye el jsPDF con todo el contenido del reporte.
 * No descarga ni devuelve blob: solo devuelve la instancia jsPDF.
 */
async function buildAnalysisPdfDoc(
  result: AnalysisResult,
  interview: InterviewData,
  options?: PdfOptions
): Promise<jsPDF> {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ---------------- HEADER CON BRANDING CUN ----------------
  const drawSmallHeader = () => {
    doc.setFillColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Reporte de Evaluación de Candidato", MARGIN_X, 26);
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
    const headerMaxW = pageWidth - headerX - MARGIN_X;

    doc.setTextColor(255, 255, 255);

    const title1 = "Corporación Unificada Nacional de Educación Superior - CUN";
    const title2 = "Reporte de Idoneidad y Evaluación de Candidato";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const t1 = doc.splitTextToSize(title1, headerMaxW);

    const baseY = 34;
    const t1LineGap = 18;
    doc.text(t1, headerX, baseY);

    const afterT1Y = baseY + (t1.length - 1) * t1LineGap + 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    const t2 = doc.splitTextToSize(title2, headerMaxW);
    doc.text(t2, headerX, afterT1Y);
  } catch {
    doc.setFillColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
    doc.rect(0, 0, pageWidth, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Reporte de Idoneidad y Evaluación de Candidato", MARGIN_X, 50);
  }

  doc.setTextColor(0, 0, 0);
  let y = 110;

  // ---------------- HELPERS DE MAQUETACIÓN ----------------
  const ensureSpace = (extra = 0) => {
    if (y > pageHeight - MARGIN_Y - extra) {
      doc.addPage();
      drawSmallHeader();
      y = 60;
    }
  };

  const addTitle = (text: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(text, MARGIN_X, y);
    y += LINE_HEIGHT * 1.6;
  };

  const addLabelValue = (label: string, value: string, maxWidth: number) => {
    const labelX = MARGIN_X;
    const labelColW = 150;
    const valueX = MARGIN_X + labelColW;

    doc.setFontSize(11);

    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, labelX, y);

    doc.setFont("helvetica", "normal");

    const valueMaxW = Math.max(140, maxWidth - labelColW);
    const lines = doc.splitTextToSize(value || "N/D", valueMaxW);

    doc.text(lines[0] ?? "N/D", valueX, y);
    y += LINE_HEIGHT;

    for (let i = 1; i < lines.length; i++) {
      ensureSpace();
      doc.text(lines[i], valueX, y);
      y += LINE_HEIGHT;
    }
  };

  const addParagraph = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const maxWidth = pageWidth - MARGIN_X * 2;
    const lines = doc.splitTextToSize(text ?? "", maxWidth);

    lines.forEach((line: string) => {
      ensureSpace();
      doc.text(line, MARGIN_X, y);
      y += LINE_HEIGHT - 2;
    });
    y += 4;
  };

  const addSectionBox = (text: string) => {
    ensureSpace(30);
    const boxHeight = 22;
    const boxWidth = pageWidth - MARGIN_X * 2;

    doc.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    doc.setFillColor(232, 255, 244);
    doc.roundedRect(MARGIN_X, y, boxWidth, boxHeight, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    doc.text(text.toUpperCase(), MARGIN_X + 10, y + 14);

    doc.setTextColor(0, 0, 0);
    y += boxHeight + 10;
  };

  const addInfoBox = (title: string, body: string) => {
    ensureSpace(90);

    const w = pageWidth - MARGIN_X * 2;

    // título
    doc.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    doc.setFillColor(232, 255, 244);
    doc.roundedRect(MARGIN_X, y, w, 22, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    doc.text(title.toUpperCase(), MARGIN_X + 10, y + 14);

    y += 32;

    // body (wrap normal)
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const lines = doc.splitTextToSize(body ?? "", w);
    lines.forEach((ln: string) => {
      ensureSpace();
      doc.text(ln, MARGIN_X, y);
      y += LINE_HEIGHT - 2;
    });

    y += 6;
  };

  const addBulletTitle = (text: string) => {
    ensureSpace();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("• " + text, MARGIN_X, y);
    y += LINE_HEIGHT;
  };

  // ---------------- FICHA DEL CANDIDATO ----------------
  addTitle("Ficha del Candidato");

  const cand = options?.candidate;

  const candidateName = safeText(
    cand?.fullName ?? (interview as any)?.candidateName,
    "N/D"
  );
  const programName = safeText(
    cand?.programName ?? (interview as any)?.program,
    "N/D"
  );
  const schoolName = safeText(
    cand?.schoolName ?? (interview as any)?.school,
    "N/D"
  );
  const ageText = safeAge(cand?.age ?? (interview as any)?.age);

  // box score (derecha)
  const boxWidthScore = 170;
  const boxHeightScore = 90;
  const gapToBox = 18;

  const startY = y;
  const boxX = pageWidth - MARGIN_X - boxWidthScore;
  const boxY = startY - 10;

  const leftMaxWidth = boxX - (MARGIN_X + gapToBox);

  addLabelValue("Nombre", candidateName, leftMaxWidth);
  addLabelValue("Programa", programName, leftMaxWidth);
  addLabelValue("Escuela", schoolName, leftMaxWidth);
  addLabelValue("Edad", ageText, leftMaxWidth);
  y += 4;
  addLabelValue(
    "Ventana de Retención",
    safeText((result as any)?.resignationRiskWindow, "No estimada"),
    leftMaxWidth
  );

  // draw score box (solo métricas)
  doc.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  doc.setFillColor(232, 255, 244);
  doc.roundedRect(boxX, boxY, boxWidthScore, boxHeightScore, 6, 6, "FD");

  const score =
    typeof (result as any)?.overallScore === "number"
      ? (result as any).overallScore
      : Number((result as any)?.overallScore ?? 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  doc.text(
    `${Number.isFinite(score) ? score.toFixed(1) : "0.0"}`,
    boxX + boxWidthScore / 2,
    boxY + 32,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Puntaje Global / 100", boxX + boxWidthScore / 2, boxY + 48, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  doc.text(
    `Riesgo: ${safeText((result as any)?.overallRiskLevel)}`,
    boxX + boxWidthScore / 2,
    boxY + 64,
    { align: "center" }
  );

  doc.setTextColor(0, 0, 0);

  // ✅ baja el cursor debajo del box
  const bottomScore = boxY + boxHeightScore;
  y = Math.max(y, bottomScore) + 18;

  // ✅ NUEVO: Veredicto completo fuera del cuadro (no se corta)
  const verdictRaw = safeText((result as any)?.finalVerdict, "");
  if (verdictRaw) {
    addInfoBox("Veredicto / Recomendación", verdictRaw);
  }

  // ---------------- RESUMEN EJECUTIVO ----------------
  addSectionBox("Resumen Ejecutivo");
  addParagraph((result as any)?.executiveSummary ?? "");

  // ---------------- ANÁLISIS POR DIMENSIÓN ----------------
  addSectionBox("Análisis Detallado por Dimensión");

  ((result as any)?.categoryAnalyses ?? []).forEach((ca: any) => {
    ensureSpace(60);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(
      `• ${safeText(ca?.category)} (${Math.round(Number(ca?.score ?? 0))}/100)`,
      MARGIN_X,
      y
    );
    y += LINE_HEIGHT;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Hallazgos clave:", MARGIN_X, y);
    y += LINE_HEIGHT - 4;
    addParagraph(ca?.reporteAnalitico ?? "");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Fortalezas detectadas:", MARGIN_X, y);
    y += LINE_HEIGHT - 4;
    addParagraph(ca?.oportunidades ?? "");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Recomendaciones:", MARGIN_X, y);
    y += LINE_HEIGHT - 4;
    addParagraph(ca?.recomendaciones ?? "");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Observación IA:", MARGIN_X, y);
    y += LINE_HEIGHT - 4;
    addParagraph(
      ca?.observacionesCorregidas || "Sin observación generada por IA."
    );

    y += 4;
  });

  // ---------------- PLAN DE MITIGACIÓN ----------------
  addSectionBox("Plan de Mitigación de Riesgos");
  if ((result as any)?.mitigationRecommendations?.length) {
    (result as any).mitigationRecommendations.forEach(
      (rec: string, idx: number) => {
        addBulletTitle(`${idx + 1}.`);
        addParagraph(rec);
      }
    );
  } else {
    addParagraph(
      "No se identificaron riesgos que requieran mitigación específica."
    );
  }

  // ---------------- FACTORES TEMPORALES ----------------
  addSectionBox("Factores de Retención (Riesgo Temporal)");
  addParagraph(
    `Ventana crítica estimada: ${safeText(
      (result as any)?.resignationRiskWindow,
      "No estimada"
    )}.`
  );

  if ((result as any)?.temporalRiskFactors?.length) {
    addParagraph(
      `Indicadores detectados: ${(result as any).temporalRiskFactors.join("; ")}.`
    );
  } else {
    addParagraph("No se detectaron factores de riesgo temporal relevantes.");
  }

  return doc;
}

/**
 * Genera el PDF, lo descarga opcionalmente en el navegador
 * y devuelve un Blob listo para enviar al backend.
 */
export async function generateAnalysisPdfFromData(
  result: AnalysisResult,
  interview: InterviewData,
  options?: PdfOptions
): Promise<Blob> {
  const doc = await buildAnalysisPdfDoc(result, interview, options);

  const nameForFile = safeText(
    options?.candidate?.fullName ?? (interview as any)?.candidateName,
    "Candidato"
  );
  const safeName = nameForFile.replace(/\s+/g, "_");
  const fileName = `Reporte_IA_${safeName}.pdf`;

  if (options?.download !== false) {
    doc.save(fileName);
  }

  return doc.output("blob") as Blob;
}
