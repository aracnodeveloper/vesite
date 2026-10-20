import { useCallback, useEffect, useState } from "react";
import { documentService } from "../services/documentService";
import type { BiositeDocument, DocumentDisplayMode, UploadDocumentData } from "../types/Document";
import { withSingleExpanded } from "../utils/documentRules";

/**
 * Documentos de un biosite. `refreshKey` vuelve a cargarlos (lo usa el preview
 * del teléfono al guardarse un cambio en el editor).
 */
export const useDocuments = (biositeId?: string, refreshKey = 0) => {
  const [documents, setDocuments] = useState<BiositeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!biositeId) return;
    setLoading(true);
    setError(null);
    try {
      setDocuments(await documentService.getByBiosite(biositeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los documentos");
    } finally {
      setLoading(false);
    }
  }, [biositeId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const upload = useCallback(async (data: Omit<UploadDocumentData, "biositeId">) => {
    if (!biositeId) throw new Error("No hay un biosite seleccionado");
    const created = await documentService.upload({ ...data, biositeId });
    setDocuments((prev) => withSingleExpanded([...prev, created], created));
    return created;
  }, [biositeId]);

  const setDisplayMode = useCallback(async (documentId: string, displayMode: DocumentDisplayMode) => {
    const updated = await documentService.update(documentId, { displayMode });
    setDocuments((prev) => withSingleExpanded(prev, updated));
    return updated;
  }, []);

  const rename = useCallback(async (documentId: string, title: string) => {
    const updated = await documentService.update(documentId, { title });
    setDocuments((prev) => withSingleExpanded(prev, updated));
    return updated;
  }, []);

  const remove = useCallback(async (documentId: string) => {
    await documentService.remove(documentId);
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  }, []);

  return { documents, loading, error, reload: load, upload, setDisplayMode, rename, remove };
};
