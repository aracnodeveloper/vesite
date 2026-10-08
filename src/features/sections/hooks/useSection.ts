import { useState } from 'react';
import type { CreateSectionData, Section } from '../types/sections.ts'
import { sectionService } from '../services/sectionService.ts';

/** Secciones que todo biosite debe tener, en su orden por defecto. */
const REQUIRED_SECTIONS: Omit<CreateSectionData, 'biositeId' | 'orderIndex'>[] = [
    { titulo: 'Profile', icon: 'profile', descripcion: 'User profile section' },
    { titulo: 'Social', icon: 'social', descripcion: 'Social media links' },
    { titulo: 'Links', icon: 'link', descripcion: 'Enlaces diversos' },
    { titulo: 'Contactame', icon: 'whatsapp', descripcion: 'WhatsApp contact' },
    { titulo: 'Link de mi App', icon: 'app', descripcion: 'App download links' },
    { titulo: 'VCard', icon: 'vcard', descripcion: 'Digital business card' },
    { titulo: 'Video', icon: 'video', descripcion: 'YouTube videos' },
    { titulo: 'Music / Podcast', icon: 'music', descripcion: 'Audio content' },
    { titulo: 'Social Post', icon: 'instagram', descripcion: 'Instagram posts' },
    { titulo: 'Gallery', icon: 'gallery', descripcion: 'Galleria de imagenes' },
    { titulo: 'Historias', icon: 'histories', descripcion: 'Historias temporales del perfil' },
];

/** Elimina secciones repetidas por título y las ordena por orderIndex. */
const dedupeSections = (sections: Section[]): Section[] => {
    const unique = sections.reduce((acc: Section[], current: Section) => {
        const existingIndex = acc.findIndex(section => section.titulo === current.titulo);

        if (existingIndex === -1) {
            acc.push(current);
        } else if (
            current.orderIndex < acc[existingIndex].orderIndex ||
            new Date(current.updatedAt) > new Date(acc[existingIndex].updatedAt)
        ) {
            acc[existingIndex] = current;
        }

        return acc;
    }, []);

    return unique.sort((a, b) => a.orderIndex - b.orderIndex);
};

export const useSections = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getSectionsByBiosite = async (biositeId: string): Promise<Section[]> => {
        try {
            setLoading(true);
            setError(null);
            const uniqueSections = dedupeSections(await sectionService.getByBiosite(biositeId));
            setSections(uniqueSections);
            return uniqueSections;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error fetching sections';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reorderSections = async (
        biositeId: string,
        reorderData: { id: string; orderIndex: number }[]
    ): Promise<Section[]> => {
        try {
            setLoading(true);
            setError(null);
            const reorderedSections = await sectionService.reorder(biositeId, reorderData);
            setSections(reorderedSections);
            return reorderedSections;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error reordering sections';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Crea las secciones requeridas que falten (al final del orden actual)
     * sin tocar el orderIndex de las existentes.
     */
    const verifyAndCreateAllSections = async (biositeId: string): Promise<Section[]> => {
        try {
            setLoading(true);
            setError(null);

            const existingSections = await getSectionsByBiosite(biositeId);
            const existingTitles = new Set(existingSections.map(section => section.titulo));

            let nextOrderIndex = existingSections.length > 0
                ? Math.max(...existingSections.map(s => s.orderIndex)) + 1
                : 0;

            const sectionsToCreate: CreateSectionData[] = REQUIRED_SECTIONS
                .filter(section => !existingTitles.has(section.titulo))
                .map(section => ({ ...section, biositeId, orderIndex: nextOrderIndex++ }));

            let createdCount = 0;
            for (const sectionData of sectionsToCreate) {
                try {
                    await sectionService.create(sectionData);
                    createdCount++;
                } catch (createError) {
                    // Continuar con las demás secciones aunque una falle
                    console.error(`Error creando sección ${sectionData.titulo}:`, createError);
                }
            }

            const finalSections = createdCount > 0
                ? await getSectionsByBiosite(biositeId)
                : existingSections;

            const finalTitles = new Set(finalSections.map(s => s.titulo));
            const missingSections = REQUIRED_SECTIONS.filter(req => !finalTitles.has(req.titulo));
            if (missingSections.length > 0) {
                console.warn('Algunas secciones aún faltan después de la verificación:',
                    missingSections.map(s => s.titulo));
            }

            return finalSections;
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error verificando y creando secciones';
            setError(errorMessage);
            console.error('Error en verifyAndCreateAllSections:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        sections,
        loading,
        error,
        getSectionsByBiosite,
        reorderSections,
        verifyAndCreateAllSections,
        clearError: () => setError(null),
    };
};
