import { useRef, useState } from "react";
import { Input, Modal, Segmented, message } from "antd";
import { FileText, Trash2, Upload } from "lucide-react";
import Cookies from "js-cookie";
import BackButton from "../../../shared/ui/BackButton";
import Loading from "../../../shared/ui/Loading";
import { useDocuments } from "../hooks/useDocuments";
import type { BiositeDocument, DocumentDisplayMode } from "../types/Document";
import {
  MAX_DOCUMENT_SIZE,
  findExpandedDocument,
  formatFileSize,
  titleFromFileName,
  validateDocumentFile,
} from "../utils/documentRules";

const DISPLAY_OPTIONS = [
  { label: "Comprimido", value: "COLLAPSED" },
  { label: "Abierto", value: "EXPANDED" },
];

/**
 * Solo puede haber un documento abierto. Si ya hay otro, pide confirmación
 * antes de abrir este (el backend cerrará el anterior).
 */
const confirmSingleExpanded = (current: BiositeDocument | undefined): Promise<boolean> => {
  if (!current) return Promise.resolve(true);
  return new Promise((resolve) => {
    Modal.confirm({
      title: "Solo puede haber un documento abierto",
      content: `"${current.title}" pasará a mostrarse comprimido.`,
      okText: "Abrir este",
      cancelText: "Cancelar",
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};

/** Pantalla del editor para subir y gestionar los documentos (PDF) del vesite. */
const DocumentsPage = () => {
  const biositeId = Cookies.get("biositeId");
  const { documents, loading, upload, setDisplayMode, rename, remove } = useDocuments(biositeId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [displayMode, setNewDisplayMode] = useState<DocumentDisplayMode>("COLLAPSED");
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setNewDisplayMode("COLLAPSED");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (selected: File | undefined) => {
    if (!selected) return;
    const validationError = validateDocumentFile(selected);
    if (validationError) {
      message.error(validationError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(selected);
    if (!title.trim()) setTitle(titleFromFileName(selected.name));
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;
    if (displayMode === "EXPANDED" && !(await confirmSingleExpanded(findExpandedDocument(documents)))) return;

    setUploading(true);
    try {
      await upload({ file, title: title.trim(), displayMode });
      message.success("Documento subido");
      resetForm();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al subir el documento");
    } finally {
      setUploading(false);
    }
  };

  const handleDisplayModeChange = async (doc: BiositeDocument, mode: DocumentDisplayMode) => {
    if (mode === doc.displayMode) return;
    if (mode === "EXPANDED" && !(await confirmSingleExpanded(findExpandedDocument(documents, doc.id)))) return;

    setBusyId(doc.id);
    try {
      await setDisplayMode(doc.id, mode);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al actualizar el documento");
    } finally {
      setBusyId(null);
    }
  };

  const handleRename = async (doc: BiositeDocument, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === doc.title) return;
    try {
      await rename(doc.id, trimmed);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al renombrar el documento");
    }
  };

  const handleDelete = (doc: BiositeDocument) => {
    Modal.confirm({
      title: "¿Eliminar documento?",
      content: `"${doc.title}" se quitará del vesite y se borrará el archivo.`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await remove(doc.id);
          message.success("Documento eliminado");
        } catch (error) {
          message.error(error instanceof Error ? error.message : "Error al eliminar el documento");
        }
      },
    });
  };

  return (
    <div className="w-full h-full mb-10 mt-0 lg:mt-20 p-2 max-w-xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-700">
        <BackButton text="Documentos" />
      </div>

      {/* Subir un documento */}
      <div className="mt-6 bg-white/50 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Subir documento</h2>
        <p className="text-xs text-gray-500">
          Menús, catálogos u otros PDF (máx. {formatFileSize(MAX_DOCUMENT_SIZE)}). Comprimido se muestra como un
          link; abierto muestra el documento dentro de tu vesite (solo uno a la vez).
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-600 hover:border-gray-400 hover:bg-white/40 transition-colors cursor-pointer"
        >
          <Upload size={16} />
          {file ? `${file.name} · ${formatFileSize(file.size)}` : "Elegir PDF"}
        </button>

        <Input
          placeholder="Título (p. ej. Menú de temporada)"
          value={title}
          maxLength={255}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex items-center justify-between gap-3">
          <Segmented
            options={DISPLAY_OPTIONS}
            value={displayMode}
            onChange={(value) => setNewDisplayMode(value as DocumentDisplayMode)}
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || !title.trim() || uploading}
            className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? "Subiendo..." : "Subir"}
          </button>
        </div>
      </div>

      {/* Documentos del vesite */}
      <div className="mt-6 space-y-3">
        {loading && documents.length === 0 ? (
          <div className="flex justify-center p-8">
            <Loading />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">Todavía no has subido documentos.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="bg-white/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#E4572E] rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={18} color="#ffffff" />
                </div>
                <Input
                  variant="borderless"
                  defaultValue={doc.title}
                  maxLength={255}
                  className="!px-0 font-medium"
                  onBlur={(e) => handleRename(doc, e.target.value)}
                  onPressEnter={(e) => (e.target as HTMLInputElement).blur()}
                />
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 pl-12">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 underline truncate"
                >
                  {formatFileSize(doc.size)} · ver PDF
                </a>
                <Segmented
                  size="small"
                  options={DISPLAY_OPTIONS}
                  value={doc.displayMode}
                  disabled={busyId === doc.id}
                  onChange={(value) => handleDisplayModeChange(doc, value as DocumentDisplayMode)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
