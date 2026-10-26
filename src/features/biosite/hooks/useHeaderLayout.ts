import { useEffect, useState } from "react";
import type { HeaderLayout, Platilla } from "../types/Templates";
import { templateService } from "../services/templateService";
import { DEFAULT_HEADER_LAYOUT, resolveHeaderLayout } from "../utils/headerLayouts";

/**
 * Layout de cabecera de un biosite según su plantilla. Devuelve null mientras
 * se cargan las plantillas (solo si el biosite tiene una elegida) y, si no se
 * pueden cargar, cae al layout por defecto sin avisar: lo usa la página pública.
 */
export const useHeaderLayout = (plantillaId?: string | null): HeaderLayout | null => {
    const [templates, setTemplates] = useState<Platilla[] | null>(() => templateService.getCached());

    // Se piden ya, en paralelo con el biosite, para no esperar a saber su plantilla
    useEffect(() => {
        if (templates) return;
        let isMounted = true;

        templateService.getActive()
            .then((data) => isMounted && setTemplates(data))
            .catch(() => isMounted && setTemplates([]));

        return () => {
            isMounted = false;
        };
    }, [templates]);

    if (!plantillaId) return DEFAULT_HEADER_LAYOUT;
    if (!templates) return null;
    return resolveHeaderLayout(templates, plantillaId);
};
