import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import apiService from '../service/apiService';
import { plantillasApi } from '../constants/EndpointsRoutes';
import  type { Platilla } from '../interfaces/Templates.ts';

interface UseTemplateByIdReturn {
    template: Platilla | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<Platilla | null>;
}

export const useTemplateById = (id: string): UseTemplateByIdReturn => {
    const [template, setTemplate] = useState<Platilla | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    const fetchTemplate = useCallback(async (): Promise<Platilla | null> => {
        if (!id) {
            setLoading(false);
            return null;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching template by ID:', id);

            const data = await apiService.getById<Platilla>(plantillasApi, id);
            console.log('Template data received:', data);

            // Validate data structure
            if (!data || typeof data !== 'object' || !data.id) {
                throw new Error('La plantilla no es válida');
            }

            const processedTemplate: Platilla = {
                id: data.id,
                name: data.name || `Plantilla ${data.index || 1}`,
                description: data.description,
                previewUrl: data.previewUrl,
                index: data.index || 0,
                config: data.config || {},
                isActive: data.isActive !== false
            };

            console.log('Processed template:', processedTemplate);

            // Only update state if component is still mounted
            if (isMountedRef.current) {
                setTemplate(processedTemplate);
                setError(null);
            }

            return processedTemplate;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar plantilla';
            console.error('Error fetching template:', error);

            if (isMountedRef.current) {
                setError(errorMessage);

                // Handle specific error cases
                if (errorMessage.includes('401')) {
                    message.error('No autorizado. Por favor, inicia sesión nuevamente.');
                } else if (errorMessage.includes('403')) {
                    message.error('No tienes permisos para ver esta plantilla.');
                } else if (errorMessage.includes('404')) {
                    message.error('Plantilla no encontrada.');
                } else if (errorMessage.includes('500')) {
                    message.error('Error del servidor. Inténtalo más tarde.');
                } else {
                    message.error(`Error al cargar la plantilla: ${errorMessage}`);
                }
            }

            return null;
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [id]);

    // Auto-fetch template on hook initialization and when ID changes
    useEffect(() => {
        isMountedRef.current = true;
        fetchTemplate();

        // Cleanup function
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchTemplate]);

    return {
        template,
        loading,
        error,
        refetch: fetchTemplate
    };
};