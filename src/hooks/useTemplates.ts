import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';

// Define the API endpoint - adjust this path according to your routing
const TEMPLATES_ENDPOINT = '/api/platillas';

export interface Platilla {
    id: string;
    name?: string;
    description?: string;
    previewUrl?: string;
    index?: number;
    config: any; // JSON configuration
    isActive?: boolean;
}

interface UseTemplatesReturn {
    templates: Platilla[];
    loading: boolean;
    error: string | null;
    fetchTemplates: () => Promise<Platilla[]>;
    getTemplateById: (id: string) => Platilla | undefined;
    getActiveTemplates: () => Platilla[];
    refetch: () => Promise<Platilla[]>;
}

export const useTemplates = (): UseTemplatesReturn => {
    const [templates, setTemplates] = useState<Platilla[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }, []);

    const fetchTemplates = useCallback(async (): Promise<Platilla[]> => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching templates from:', TEMPLATES_ENDPOINT);

            const response = await fetch(TEMPLATES_ENDPOINT, {
                method: 'GET',
                headers: getAuthHeaders(),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                let errorMessage = `Error ${response.status}: ${response.statusText}`;

                switch (response.status) {
                    case 401:
                        errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
                        break;
                    case 403:
                        errorMessage = 'No tienes permisos para ver las plantillas.';
                        break;
                    case 404:
                        errorMessage = 'No se encontraron plantillas.';
                        break;
                    case 500:
                        errorMessage = 'Error del servidor. Inténtalo más tarde.';
                        break;
                    default:
                        break;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Templates data received:', data);

            // Validate data structure
            if (!Array.isArray(data)) {
                throw new Error('La respuesta del servidor no es válida');
            }

            // Filter only active templates and sort by index
            const activeTemplates = data
                .filter((template: any) => {
                    // Validate template structure
                    if (!template || typeof template !== 'object' || !template.id) {
                        console.warn('Invalid template found:', template);
                        return false;
                    }
                    return template.isActive !== false; // Include if isActive is true or undefined
                })
                .sort((a: Platilla, b: Platilla) => (a.index || 0) - (b.index || 0))
                .map((template: any) => ({
                    id: template.id,
                    name: template.name || `Plantilla ${template.index || 1}`,
                    description: template.description,
                    previewUrl: template.previewUrl,
                    index: template.index || 0,
                    config: template.config || {},
                    isActive: template.isActive !== false
                }));

            console.log('Processed templates:', activeTemplates);

            // Only update state if component is still mounted
            if (isMountedRef.current) {
                setTemplates(activeTemplates);
                setError(null);
            }

            return activeTemplates;
        } catch (error) {
            // Don't handle aborted requests as errors
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Template fetch was aborted');
                return [];
            }

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar plantillas';
            console.error('Error fetching templates:', error);

            if (isMountedRef.current) {
                setError(errorMessage);

                // Only show error message for non-auth issues
                if (!errorMessage.includes('autorizado') && !errorMessage.includes('permisos')) {
                    message.error(`Error al cargar las plantillas: ${errorMessage}`);
                }
            }

            return [];
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [getAuthHeaders]);

    const getTemplateById = useCallback((id: string): Platilla | undefined => {
        return templates.find(template => template.id === id);
    }, [templates]);

    const getActiveTemplates = useCallback((): Platilla[] => {
        return templates.filter(template => template.isActive !== false);
    }, [templates]);

    // Auto-fetch templates on hook initialization
    useEffect(() => {
        isMountedRef.current = true;
        fetchTemplates();

        // Cleanup function
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchTemplates]);

    return {
        templates,
        loading,
        error,
        fetchTemplates,
        getTemplateById,
        getActiveTemplates,
        refetch: fetchTemplates
    };
};
