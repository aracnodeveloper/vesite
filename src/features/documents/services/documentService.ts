import api from "../../../core/api/client";
import apiService from "../../../core/api/apiService";
import { documentsApi, documentsByBiositeApi } from "../../../core/api/endpoints";
import { getErrorMessage } from "../../../core/api/errors";
import { withBiositeChange } from "../../../core/events/biositeEvents";
import type { BiositeDocument, UpdateDocumentData, UploadDocumentData } from "../types/Document";

/** Ejecuta la petición y convierte el error en un mensaje legible (p. ej. el 409 de "ya hay uno abierto"). */
const withReadableError = async <T>(request: Promise<T>, fallback: string): Promise<T> => {
  try {
    return await request;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallback));
  }
};

export const documentService = {
  /** Público: los documentos activos de un biosite, en orden. */
  getByBiosite: async (biositeId: string): Promise<BiositeDocument[]> => {
    const documents = await apiService.getAll<BiositeDocument[]>(`${documentsByBiositeApi}/${biositeId}`);
    return Array.isArray(documents) ? documents : [];
  },

  upload: ({ biositeId, title, file, displayMode }: UploadDocumentData) => {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("biositeId", biositeId);
    formData.append("title", title);
    formData.append("displayMode", displayMode);

    return withBiositeChange(
      withReadableError(
        api
          .post<BiositeDocument>(documentsApi, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((response) => response.data),
        "Error al subir el documento"
      )
    );
  },

  update: (documentId: string, data: UpdateDocumentData) =>
    withBiositeChange(
      withReadableError(
        api.patch<BiositeDocument>(`${documentsApi}/${documentId}`, data).then((response) => response.data),
        "Error al actualizar el documento"
      )
    ),

  remove: (documentId: string) =>
    withBiositeChange(
      withReadableError(apiService.delete(documentsApi, documentId), "Error al eliminar el documento")
    ),
};
