import { useCallback, useState } from "react";
import type { AnalyticsData, TimeRange } from "../types/Analytics";
import {
  downloadBlob,
  generateAnalyticsPdf,
  getReportFilename,
  getReportSummary,
  showReportError,
  showReportToast,
} from "../utils/analyticsReport";

const SHARE_TITLE = "Métricas de mi Biosite";

/** Acciones de compartir y descargar el reporte PDF de métricas. */
export const useAnalyticsReport = (analyticsData: AnalyticsData | null, timeRange: TimeRange) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = useCallback(async () => {
    if (!analyticsData) return;

    const summaryText = getReportSummary(analyticsData, timeRange);
    const filename = getReportFilename(timeRange);

    try {
      // 1) Compartir el PDF con la API nativa; 2) solo el texto; 3) copiar y descargar
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([generateAnalyticsPdf(analyticsData, timeRange)], filename, {
            type: "application/pdf",
          });
          const shareData = { title: SHARE_TITLE, text: summaryText, files: [file] };
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        } catch (shareError) {
          console.log("No se pudo compartir el archivo, intentando con texto solamente:", shareError);
        }

        try {
          const textOnlyData = {
            title: SHARE_TITLE,
            text: `${summaryText}\n\n📄 Descarga el reporte completo desde: ${window.location.href}`,
          };
          if (navigator.canShare(textOnlyData)) {
            await navigator.share(textOnlyData);
            return;
          }
        } catch (textShareError) {
          console.log("Error compartiendo texto:", textShareError);
        }
      }

      await navigator.clipboard.writeText(
        `${summaryText}\n\n📄 Reporte completo disponible\n\n${window.location.href}`
      );
      downloadBlob(generateAnalyticsPdf(analyticsData, timeRange), filename);
      showReportToast("📊 Métricas compartidas", "Texto copiado al portapapeles y PDF descargado", 4000);
    } catch (error) {
      console.error("Error sharing:", error);
      showReportError("❌ Error al compartir las métricas");
    }
  }, [analyticsData, timeRange]);

  const handleDownloadPDF = useCallback(async () => {
    if (!analyticsData || isDownloading) return;

    setIsDownloading(true);
    try {
      downloadBlob(generateAnalyticsPdf(analyticsData, timeRange), getReportFilename(timeRange));
      showReportToast("📄 PDF Generado", "El reporte se ha descargado exitosamente");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showReportError("❌ Error al generar el PDF");
    } finally {
      setIsDownloading(false);
    }
  }, [analyticsData, timeRange, isDownloading]);

  return { handleShare, handleDownloadPDF, isDownloading };
};
