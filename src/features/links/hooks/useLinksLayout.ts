import { useCachedTemplates } from "../../biosite/hooks/useCachedTemplates";
import { DEFAULT_LINK_LAYOUT, resolveLinkLayout, type LinkLayout } from "../design/linkLayouts";

/**
 * Diseño de los links de un biosite según su plantilla de links. Devuelve null
 * mientras se cargan las plantillas (solo si el biosite tiene una elegida).
 */
export const useLinksLayout = (linksPlantillaId?: string | null): LinkLayout | null => {
    const templates = useCachedTemplates();

    if (!linksPlantillaId) return DEFAULT_LINK_LAYOUT;
    if (!templates) return null;
    return resolveLinkLayout(templates, linksPlantillaId);
};
