/** COLLAPSED: tarjeta como un link · EXPANDED: el PDF se ve embebido. */
export type DocumentDisplayMode = "COLLAPSED" | "EXPANDED";

export interface BiositeDocument {
  id: string;
  biositeId: string;
  title: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
  displayMode: DocumentDisplayMode;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentData {
  biositeId: string;
  title: string;
  file: File;
  displayMode: DocumentDisplayMode;
}

/** Colores y fuentes del tema del vesite que usan los componentes públicos. */
export interface DocumentTheme {
  colors: { accent: string; text: string; accentText?: string; border?: string; background: string };
  fonts: { primary: string; secondary?: string };
}

export interface UpdateDocumentData {
  title?: string;
  displayMode?: DocumentDisplayMode;
  orderIndex?: number;
}
