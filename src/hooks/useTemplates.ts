import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import apiService from '../service/apiService';
import { plantillasApi } from '../constants/EndpointsRoutes';
import type {Platilla} from '../interfaces/Templates.ts'

interface UseTemplatesReturn {
    templates: Platilla[];
    loading: boolean;
    error: string | null;
    fetchTemplates: () => Promise<Platilla[]>;
    getTemplateById: (id: string) => Platilla | undefined;
    getActiveTemplates: () => Platilla[];
    refetch: () => Promise<Platilla[]>;
    createTemplate: (data: Omit<Platilla, 'id'>) => Promise<Platilla>;
    updateTemplate: (id: string, data: Partial<Platilla>) => Promise<Platilla>;
    deleteTemplate: (id: string) => Promise<void>;
    getDefaultTemplate: () => Platilla | undefined; // NEW: Get default template
    isTemplatesLoaded: boolean; // NEW: Check if templates are loaded
}

export const useTemplates = (): UseTemplatesReturn => {
    const [templates, setTemplates] = useState<Platilla[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTemplatesLoaded, setIsTemplatesLoaded] = useState(false);
    const isMountedRef = useRef(true);

    const fetchTemplates = useCallback(async (): Promise<Platilla[]> => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching templates from:', plantillasApi);

            const data = await apiService.getAll<Platilla[]>(plantillasApi);
            console.log('Templates data received:', data);

            // Validate data structure
            if (!Array.isArray(data)) {
                throw new Error('La respuesta del servidor no es válida');
            }

            const processedTemplates = data
                .filter((template: any) => {
                    if (!template || typeof template !== 'object' || !template.id) {
                        console.warn('Invalid template found:', template);
                        return false;
                    }
                    return template.isActive !== false;
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

            console.log('Processed templates:', processedTemplates);

            if (isMountedRef.current) {
                setTemplates(processedTemplates);
                setError(null);
                setIsTemplatesLoaded(true); // Mark as loaded
            }

            return processedTemplates;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar plantillas';
            console.error('Error fetching templates:', error);

            if (isMountedRef.current) {
                setError(errorMessage);
                setIsTemplatesLoaded(true); // Mark as loaded even with error

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
            }

            return [];
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    const getTemplateById = useCallback((id: string | null | undefined): Platilla | undefined => {
        if (!id || id === 'null' || !templates.length) {
            return undefined;
        }
        return templates.find(template => template.id === id);
    }, [templates]);

    const getActiveTemplates = useCallback((): Platilla[] => {
        return templates.filter(template => template.isActive !== false);
    }, [templates]);

    // NEW: Get default template (first template or template with index 0)
    const getDefaultTemplate = useCallback((): Platilla | undefined => {
        if (!templates.length) return undefined;

        // First try to find template with index 0
        const defaultTemplate = templates.find(template => template.index === 0);
        if (defaultTemplate) return defaultTemplate;

        // Fallback to first template
        return templates[0];
    }, [templates]);

    const createTemplate = useCallback(async (data: Omit<Platilla, 'id'>): Promise<Platilla> => {
        try {
            setLoading(true);
            const newTemplate = await apiService.create<Omit<Platilla, 'id'>, Platilla>(plantillasApi, data);

            if (isMountedRef.current) {
                setTemplates(prev => [...prev, newTemplate].sort((a, b) => (a.index || 0) - (b.index || 0)));
            }

            message.success('Plantilla creada exitosamente');
            return newTemplate;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear plantilla';
            console.error('Error creating template:', error);
            message.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTemplate = useCallback(async (id: string, data: Partial<Platilla>): Promise<Platilla> => {
        try {
            setLoading(true);
            const updatedTemplate = await apiService.update<Partial<Platilla>>(plantillasApi, id, data);

            if (isMountedRef.current) {
                setTemplates(prev =>
                    prev.map(template =>
                        template.id === id ? { ...template, ...updatedTemplate } as Platilla : template
                    ).sort((a, b) => (a.index || 0) - (b.index || 0))
                );
            }

            message.success('Plantilla actualizada exitosamente');
            return updatedTemplate as Platilla;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar plantilla';
            console.error('Error updating template:', error);
            message.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTemplate = useCallback(async (id: string): Promise<void> => {
        try {
            setLoading(true);
            await apiService.delete(plantillasApi, id);

            if (isMountedRef.current) {
                setTemplates(prev => prev.filter(template => template.id !== id));
            }

            message.success('Plantilla eliminada exitosamente');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al eliminar plantilla';
            console.error('Error deleting template:', error);
            message.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        fetchTemplates();

        return () => {
            isMountedRef.current = false;
        };
    }, [fetchTemplates]);

    return {
        templates,
        loading,
        error,
        fetchTemplates,
        getTemplateById,
        getActiveTemplates,
        refetch: fetchTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        getDefaultTemplate, // NEW
        isTemplatesLoaded // NEW
    };
};