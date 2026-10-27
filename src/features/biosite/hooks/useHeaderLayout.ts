import type { HeaderLayout } from "../types/Templates";
import { DEFAULT_HEADER_LAYOUT, resolveHeaderLayout } from "../utils/headerLayouts";
import { useCachedTemplates } from "./useCachedTemplates";

/**
 * Layout de cabecera de un biosite según su plantilla. Devuelve null mientras
 * se cargan las plantillas (solo si el biosite tiene una elegida).
 */
export const useHeaderLayout = (plantillaId?: string | null): HeaderLayout | null => {
    const templates = useCachedTemplates();

    if (!plantillaId) return DEFAULT_HEADER_LAYOUT;
    if (!templates) return null;
    return resolveHeaderLayout(templates, plantillaId);
};
