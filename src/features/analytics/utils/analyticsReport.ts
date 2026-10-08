import jsPDF from "jspdf";
import type { AnalyticsData, TimeRange } from "../types/Analytics";
import { getCtr, getPeriodUnit, getTimeRangeLabel } from "./timeRange";

type RGB = [number, number, number];

const PRIMARY: RGB = [152, 192, 34];
const DARK: RGB = [51, 51, 51];
const GRAY: RGB = [102, 102, 102];
const LIGHT_GRAY: RGB = [248, 249, 250];

const truncate = (text: string, max: number) =>
  text.length > max ? text.substring(0, max - 3) + "..." : text;

/** Genera el reporte PDF de métricas del biosite. */
export const generateAnalyticsPdf = (data: AnalyticsData, timeRange: TimeRange): Blob => {
  const doc = new jsPDF();
  const { unit } = getPeriodUnit(timeRange);

  doc.setFontSize(24);
  doc.setTextColor(...PRIMARY);
  doc.text("Reporte de Métricas", 20, 30);

  doc.setFontSize(12);
  doc.setTextColor(...GRAY);
  doc.text("Biosite Analytics Dashboard", 20, 40);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generado el ${currentDate}`, 20, 50);

  doc.setLineWidth(0.5);
  doc.setDrawColor(...PRIMARY);
  doc.line(20, 55, 190, 55);

  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text(`Período: ${getTimeRangeLabel(timeRange)}`, 20, 70);

  let yPosition = 85;
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text("Resumen General", 20, yPosition);

  yPosition += 15;

  // Resumen: vistas, clicks y CTR en tres recuadros
  const metrics = [
    { value: data.views.toString(), label: "TOTAL VISTAS" },
    { value: data.clicks.toString(), label: "TOTAL CLICKS" },
    { value: `${getCtr(data.views, data.clicks)}%`, label: "CTR" },
  ];
  metrics.forEach((metric, index) => {
    const x = 20 + index * 60;
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(x, yPosition, 50, 25, "F");
    doc.setTextColor(...DARK);
    doc.setFontSize(20);
    doc.text(metric.value, x + 5, yPosition + 15);
    doc.setFontSize(10);
    doc.text(metric.label, x + 5, yPosition + 22);
  });

  yPosition += 40;

  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text(`Actividad por ${unit}`, 20, yPosition);

  yPosition += 15;

  const tableStartY = yPosition;
  const colWidth = 60;

  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(20, tableStartY, colWidth, 8, "F");
  doc.rect(20 + colWidth, tableStartY, colWidth, 8, "F");
  doc.rect(20 + colWidth * 2, tableStartY, colWidth, 8, "F");

  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(unit, 22, tableStartY + 6);
  doc.text("Vistas", 22 + colWidth, tableStartY + 6);
  doc.text("Clicks", 22 + colWidth * 2, tableStartY + 6);

  let tableY = tableStartY + 8;

  for (const activity of data.dailyActivity.slice(0, 10)) {
    doc.setTextColor(...DARK);
    doc.text(activity.day, 22, tableY + 6);
    doc.text(`${activity.views}`, 22 + colWidth, tableY + 6);
    doc.text(`${activity.clicks}`, 22 + colWidth * 2, tableY + 6);

    tableY += 8;

    if (activity.linkClicks && activity.linkClicks.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      activity.linkClicks.slice(0, 2).forEach((link) => {
        doc.text(`  - ${truncate(link.label, 25)}: ${link.count}`, 24, tableY + 4);
        tableY += 5;
      });
      doc.setFontSize(10);
    }
  }

  if (data.dailyActivity.length > 10 || data.clickDetails.length > 0) {
    doc.addPage();
    yPosition = 20;

    if (data.clickDetails.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(...DARK);
      doc.text("Clicks por Link", 20, yPosition);

      yPosition += 15;

      doc.setFillColor(...LIGHT_GRAY);
      doc.rect(20, yPosition, 120, 8, "F");
      doc.rect(140, yPosition, 40, 8, "F");

      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text("Link", 22, yPosition + 6);
      doc.text("Clicks", 142, yPosition + 6);

      yPosition += 8;

      const clickRows = data.clickDetails.slice(0, 20);
      clickRows.forEach((click, i) => {
        doc.setTextColor(...DARK);
        doc.text(truncate(click.label, 30), 22, yPosition + 6);
        doc.text(click.count.toString(), 142, yPosition + 6);

        yPosition += 8;

        if (yPosition > 270 && i < clickRows.length - 1) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text("Este reporte fue generado automáticamente por Biosite Analytics", 20, 285);
    doc.text(`Página ${i} de ${totalPages}`, 170, 285);
  }

  return doc.output("blob");
};

export const getReportFilename = (timeRange: TimeRange): string =>
  `biosite-metricas-${getTimeRangeLabel(timeRange)
    .toLowerCase()
    .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

export const getReportSummary = (data: AnalyticsData, timeRange: TimeRange): string =>
  `📊 Mis estadísticas (${getTimeRangeLabel(timeRange)}):\n👁 ${data.views} vistas\n👆 ${
    data.clicks
  } clics\n📈 ${getCtr(data.views, data.clicks)}% CTR`;

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const TOAST_STYLE = `
  position: fixed;
  top: 20px;
  right: 20px;
  color: white;
  border-radius: 8px;
  z-index: 1000;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

/** Aviso flotante verde con título y subtítulo. */
export const showReportToast = (title: string, subtitle: string, duration = 3000) => {
  const notification = document.createElement("div");
  notification.innerHTML = `
    <div style="max-width: 300px;">
      <strong>${title}</strong><br>
      <small>${subtitle}</small>
    </div>
  `;
  notification.style.cssText = `${TOAST_STYLE} background: #98C022; padding: 16px 20px; max-width: 320px;`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), duration);
};

/** Aviso flotante rojo de error. */
export const showReportError = (text: string) => {
  const notification = document.createElement("div");
  notification.textContent = text;
  notification.style.cssText = `${TOAST_STYLE} background: #dc3545; padding: 12px 20px;`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
};
