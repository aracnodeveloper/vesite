import type { BiositeDocument } from "../types/Document";

/** Debe coincidir con el límite del backend (DocumentsController). */
export const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024;

/** Nombre de la sección del biosite donde se muestran los documentos. */
export const DOCUMENTS_SECTION_TITLE = "Documentos";

/** Valida el archivo antes de subirlo; devuelve el mensaje de error o null. */
export const validateDocumentFile = (file: File): string | null => {
  const isPdf = file.type === "application/pdf" && /\.pdf$/i.test(file.name);
  if (!isPdf) return "Solo se permiten archivos PDF";
  if (file.size > MAX_DOCUMENT_SIZE) {
    return `El archivo pesa ${formatFileSize(file.size)}; el máximo es ${formatFileSize(MAX_DOCUMENT_SIZE)}`;
  }
  return null;
};

/** El documento abierto (solo puede haber uno), ignorando `exceptId`. */
export const findExpandedDocument = (
  documents: BiositeDocument[],
  exceptId?: string
): BiositeDocument | undefined =>
  documents.find((doc) => doc.displayMode === "EXPANDED" && doc.id !== exceptId);

/**
 * Aplica en local la regla del backend: al abrir un documento, el que
 * estuviera abierto pasa a comprimido.
 */
export const withSingleExpanded = (
  documents: BiositeDocument[],
  updated: BiositeDocument
): BiositeDocument[] =>
  documents.map((doc) => {
    if (doc.id === updated.id) return updated;
    if (updated.displayMode === "EXPANDED" && doc.displayMode === "EXPANDED") {
      return { ...doc, displayMode: "COLLAPSED" };
    }
    return doc;
  });

/** Título sugerido a partir del nombre del archivo ("menu-verano.pdf" → "menu verano"). */
export const titleFromFileName = (fileName: string): string =>
  fileName.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").trim();

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
