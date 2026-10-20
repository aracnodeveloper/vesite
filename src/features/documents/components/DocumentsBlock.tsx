import { FileText } from "lucide-react";
import Cardbase from "../../biosite-public/CardBase";
import type { BiositeDocument, DocumentTheme } from "../types/Document";
import PdfViewer from "./PdfViewer";

interface DocumentsBlockProps {
  documents: BiositeDocument[];
  themeConfig: DocumentTheme;
  /** En el preview del editor, tocar un documento lleva a su pantalla de edición. */
  onEdit?: () => void;
}

/**
 * Sección "Documentos" del vesite: cada documento comprimido se ve como un
 * link que abre el PDF; el abierto (solo uno) muestra su contenido embebido.
 */
const DocumentsBlock = ({ documents, themeConfig, onEdit }: DocumentsBlockProps) => {
  if (documents.length === 0) return null;

  return (
    <div className="flex flex-col">
      {documents.map((doc) =>
        doc.displayMode === "EXPANDED" ? (
          <div
            key={doc.id}
            onClickCapture={
              onEdit
                ? (e) => {
                    e.preventDefault();
                    onEdit();
                  }
                : undefined
            }
          >
            <PdfViewer url={doc.fileUrl} title={doc.title} themeConfig={themeConfig} />
          </div>
        ) : (
          <Cardbase
            key={doc.id}
            id={doc.id}
            title={doc.title}
            url={onEdit ? undefined : doc.fileUrl}
            onClick={onEdit}
            icon={FileText}
            themeConfig={themeConfig}
            showBorder
            useAccentText
          />
        )
      )}
    </div>
  );
};

export default DocumentsBlock;
