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

// Helper para cargar la imagen del logo
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

/**
 * Construye el jsPDF con todo el contenido del reporte.
 * No descarga ni devuelve blob: solo devuelve la instancia jsPDF.
 */
async function buildAnalysisPdfDoc(
  result: AnalysisResult,
  interview: InterviewData
): Promise<jsPDF> {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ---------------- HEADER CON BRANDING CUN ----------------
  try {
    const img = await loadImage(logoCun);

    // Cinta superior negra
    doc.setFillColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
    doc.rect(0, 0, pageWidth, 90, "F");

    // Logo CUN
    const logoHeight = 50;
    const logoWidth = (img.width / img.height) * logoHeight;
    doc.addImage(img, "PNG", MARGIN_X, 20, logoWidth, logoHeight);

    // Texto de encabezado
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(
      "Corporación Unificada Nacional de Educación Superior - CUN",
      MARGIN_X + logoWidth + 20,
      35
    );

    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Reporte de Idoneidad y Evaluación de Candidato",
      MARGIN_X + logoWidth + 20,
      55
    );
  } catch {
    // Si el logo falla, al menos dejamos la banda negra con título
    doc.setFillColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
    doc.rect(0, 0, pageWidth, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Reporte de Idoneidad y Evaluación de Candidato", MARGIN_X, 50);
  }

  // A partir de aquí volvemos a texto negro
  doc.setTextColor(0, 0, 0);

  let y = 110; // empezamos debajo del header

  // ---------------- HELPERS DE MAQUETACIÓN ----------------
  const addTitle = (text: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(text, MARGIN_X, y);
    y += LINE_HEIGHT * 1.6;
  };

  const addLabelValue = (label: string, value: string) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", MARGIN_X, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, MARGIN_X + 95, y);
    y += LINE_HEIGHT;
  };

  const ensureSpace = (extra = 0) => {
    if (y > pageHeight - MARGIN_Y - extra) {
      doc.addPage();
      // dibujar de nuevo cinta negra pequeña en páginas siguientes
      doc.setFillColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Reporte de Evaluación de Candidato", MARGIN_X, 26);
      doc.setTextColor(0, 0, 0);
      y = 60;
    }
  };

  const addParagraph = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const maxWidth = pageWidth - MARGIN_X * 2;
    const lines = doc.splitTextToSize(text, maxWidth);
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

  const addBulletTitle = (text: string) => {
    ensureSpace();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("• " + text, MARGIN_X, y);
    y += LINE_HEIGHT;
  };

  // ---------------- FICHA DEL CANDIDATO ----------------
  addTitle("Ficha del Candidato");

  // columna izquierda (datos), derecha (score)
  const startY = y;
  addLabelValue("Nombre", interview.candidateName || "N/D");
  addLabelValue("Programa", interview.program || "N/D");
  addLabelValue("Escuela", interview.school || "N/D");
  addLabelValue("Edad", interview.age ? `${interview.age} años` : "N/D");
  y += 4;
  addLabelValue(
    "Ventana de Retención",
    result.resignationRiskWindow || "No estimada"
  );

  // bloque verde de score a la derecha
  const boxWidthScore = 170;
  const boxHeightScore = 90;
  const boxX = pageWidth - MARGIN_X - boxWidthScore;
  const boxY = startY - 10;

  doc.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  doc.setFillColor(232, 255, 244);
  doc.roundedRect(boxX, boxY, boxWidthScore, boxHeightScore, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  doc.text(`${result.overallScore.toFixed(1)}`, boxX + boxWidthScore / 2, boxY + 32, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Puntaje Global / 100", boxX + boxWidthScore / 2, boxY + 48, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  doc.text(`Riesgo: ${result.overallRiskLevel}`, boxX + boxWidthScore / 2, boxY + 64, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(result.finalVerdict, boxX + boxWidthScore / 2, boxY + 80, {
    align: "center",
  });

  doc.setTextColor(0, 0, 0);
  y += 16;

  // ---------------- RESUMEN EJECUTIVO ----------------
  addSectionBox("Resumen Ejecutivo");
  addParagraph(result.executiveSummary);

  // ---------------- ANÁLISIS POR DIMENSIÓN ----------------
  addSectionBox("Análisis Detallado por Dimensión");

  result.categoryAnalyses.forEach((ca) => {
    ensureSpace(60);

    // título de la dimensión
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`• ${ca.category} (${Math.round(ca.score)}/100)`, MARGIN_X, y);
    y += LINE_HEIGHT;

    // subsecciones
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Hallazgos clave:", MARGIN_X, y);
    y += LINE_HEIGHT - 4;
    addParagraph(ca.reporteAnalitico);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Fortalezas detectadas:", MARGIN_X, y);
    y += LINE_HEIGHT - 4;
    addParagraph(ca.oportunidades);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Recomendaciones:", MARGIN_X, y);
    y += LINE_HEIGHT - 4;
    addParagraph(ca.recomendaciones);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Observación IA:", MARGIN_X, y);
    y += LINE_HEIGHT - 4;
    addParagraph(
      ca.observacionesCorregidas || "Sin observación generada por IA."
    );

    y += 4;
  });

  // ---------------- PLAN DE MITIGACIÓN ----------------
  addSectionBox("Plan de Mitigación de Riesgos");
  if (result.mitigationRecommendations?.length) {
    result.mitigationRecommendations.forEach((rec, idx) => {
      addBulletTitle(`${idx + 1}.`);
      addParagraph(rec);
    });
  } else {
    addParagraph(
      "No se identificaron riesgos que requieran mitigación específica."
    );
  }

  // ---------------- FACTORES TEMPORALES ----------------
  addSectionBox("Factores de Retención (Riesgo Temporal)");
  addParagraph(
    `Ventana crítica estimada: ${
      result.resignationRiskWindow || "No estimada"
    }.`
  );
  if (result.temporalRiskFactors?.length) {
    addParagraph(
      `Indicadores detectados: ${result.temporalRiskFactors.join("; ")}.`
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
  options?: { download?: boolean }
): Promise<Blob> {
  const doc = await buildAnalysisPdfDoc(result, interview);

  // Nombre seguro para archivo
  const safeName = (interview.candidateName || "Candidato").replace(/ /g, "_");
  const fileName = `Reporte_IA_${safeName}.pdf`;

  // Descarga en el navegador (comportamiento anterior)
  if (options?.download !== false) {
    doc.save(fileName);
  }

  // Devolver Blob para subir al backend
  const blob = doc.output("blob") as Blob;
  return blob;
}
