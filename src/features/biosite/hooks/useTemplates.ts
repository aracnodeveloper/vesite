import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { Platilla } from '../types/Templates.ts';
import { templateService } from '../services/templateService.ts';

const showTemplatesError = (errorMessage: string) => {
    if (errorMessage.includes('401')) {
        message.error('No autorizado. Por favor, inicia sesión nuevamente.');
    } else if (errorMessage.includes('403')) {
        message.error('No tienes permisos para ver las plantillas.');
    } else if (errorMessage.includes('404')) {
        message.error('No se encontraron plantillas.');
    } else if (errorMessage.includes('500')) {
        message.error('Error del servidor. Inténtalo más tarde.');
    } else {
        message.error(`Error al cargar las plantillas: ${errorMessage}`);
    }
};

/** Plantillas activas para el editor; avisa con un mensaje si no se pueden cargar. */
export const useTemplates = () => {
    const [templates, setTemplates] = useState<Platilla[]>(() => templateService.getCached() ?? []);
    const [loading, setLoading] = useState(() => !templateService.getCached());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        templateService.getActive()
            .then((data) => {
                if (!isMounted) return;
                setTemplates(data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching templates:', err);
                if (!isMounted) return;
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar plantillas';
                setError(errorMessage);
                showTemplatesError(errorMessage);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return { templates, loading, error };
};
