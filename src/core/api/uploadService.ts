import api from "./client";
import {
    blockImageApi,
    linkImageApi,
    uploadBiositeAvatarApi,
    uploadBiositeBackgroundApi,
    uploadImageApi,
} from "./endpoints";
import { getErrorMessage } from "./errors";

interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
        url: string;
    };
}

const toFile = (file: File | Blob): File =>
    file instanceof File ? file : new File([file], "image.jpg", { type: "image/jpeg" });

/**
 * Sube una imagen como multipart/form-data y devuelve la URL pública.
 */
const postImage = async (endpoint: string, file: File | Blob, fallbackMessage: string): Promise<string> => {
    if (!(file instanceof Blob)) {
        throw new Error("Archivo no válido");
    }

    try {
        const image = toFile(file);
        const formData = new FormData();
        formData.append("image", image, image.name);

        const response = await api.post<UploadResponse>(endpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (!response.data) {
            throw new Error("No se recibió respuesta del servidor");
        }
        if (response.data.success === false) {
            throw new Error(response.data.message || fallbackMessage);
        }
        if (!response.data.data?.url) {
            throw new Error("URL de imagen no recibida del servidor");
        }
        return response.data.data.url;
    } catch (error) {
        console.error(`Error uploading image to ${endpoint}:`, error);
        throw new Error(getErrorMessage(error, fallbackMessage));
    }
};

const requireId = (id: string, message: string) => {
    if (!id || typeof id !== "string") {
        throw new Error(message);
    }
};

export const uploadService = {
    uploadImage: (file: File) =>
        postImage(uploadImageApi, file, "Error al subir la imagen"),

    uploadBiositeAvatar: (file: File, biositeId: string) => {
        requireId(biositeId, "ID de biosite no válido");
        return postImage(`${uploadBiositeAvatarApi}/${biositeId}`, file, "Error al subir el avatar");
    },

    uploadBiositeBackground: (file: File, biositeId: string) => {
        requireId(biositeId, "ID de biosite no válido");
        return postImage(`${uploadBiositeBackgroundApi}/${biositeId}`, file, "Error al subir la imagen de fondo");
    },

    uploadLinkImage: (file: File, linkId: string) => {
        requireId(linkId, "ID de enlace no válido");
        return postImage(`${linkImageApi}/${linkId}`, file, "Error al subir la imagen del enlace");
    },

    uploadBlockImage: (file: File | Blob, blockId: string) => {
        requireId(blockId, "ID de bloque no válido");
        return postImage(`${blockImageApi}/${blockId}`, file, "Error al subir imagen");
    },
};
