import { useEffect, useState } from "react";
import type { Platilla } from "../types/Templates";
import { templateService } from "../services/templateService";

/**
 * Plantillas activas (de cabecera y de links) para pintar el vesite. Devuelve
 * null mientras cargan y, si fallan, una lista vacía sin avisar: lo usa la
 * página pública, que cae a los diseños por defecto.
 */
export const useCachedTemplates = (): Platilla[] | null => {
    const [templates, setTemplates] = useState<Platilla[] | null>(() => templateService.getCached());

    // Se piden ya, en paralelo con el biosite, para no esperar a saber sus plantillas
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

    return templates;
};
