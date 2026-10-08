import apiService from "../../../core/api/apiService";
import { plantillasApi } from "../../../core/api/endpoints";
import type { Platilla } from "../types/Templates";

let templatesCache: Platilla[] | null = null;

const normalizeTemplates = (data: unknown): Platilla[] => {
    if (!Array.isArray(data)) {
        throw new Error("La respuesta del servidor no es válida");
    }

    return data
        .filter((template: any) => template && typeof template === "object" && template.id && template.isActive !== false)
        .sort((a: Platilla, b: Platilla) => (a.index || 0) - (b.index || 0))
        .map((template: any) => ({
            id: template.id,
            name: template.name || `Plantilla ${template.index || 1}`,
            description: template.description,
            previewUrl: template.previewUrl,
            index: template.index || 0,
            config: template.config || {},
            isActive: template.isActive !== false,
        }));
};

export const templateService = {
    /** Plantillas activas ordenadas por índice; se cachean durante la sesión. */
    getActive: async (): Promise<Platilla[]> => {
        if (templatesCache) return templatesCache;
        templatesCache = normalizeTemplates(await apiService.getAll<unknown>(plantillasApi));
        return templatesCache;
    },
};
