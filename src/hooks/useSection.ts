import { useState, useEffect } from 'react';
import apiService from '../service/apiService';
import {
    sectionsApi,
    getSectionsByBiositeApi,
    reorderSectionsApi
} from '../constants/EndpointsRoutes';
import type {CreateSectionData,ReorderSectionData,Section} from '../interfaces/sections.ts'

export const useSections = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Crear sección inicial
    const createSection = async (sectionData: CreateSectionData): Promise<Section> => {
        try {
            setLoading(true);
            setError(null);
            const newSection = await apiService.create<CreateSectionData, Section>(
                sectionsApi,
                sectionData
            );
            setSections(prev => [...prev, newSection]);
            return newSection;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creating section';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Obtener secciones por biosite ID
    const getSectionsByBiosite = async (biositeId: string): Promise<Section[]> => {
        try {
            setLoading(true);
            setError(null);
            const fetchedSections = await apiService.getAll<Section[]>(
                `${getSectionsByBiositeApi}/${biositeId}`
            );
            setSections(fetchedSections);
            return fetchedSections;
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

            const requestBody = {
                sections: reorderData
            };

            const reorderedSections = await apiService.patch<typeof requestBody>(
                `${reorderSectionsApi}/${biositeId}`,
                requestBody
            );
            setSections(reorderedSections as unknown as Section[]);
            return reorderedSections as unknown as Section[];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error reordering sections';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createDefaultSections = async (biositeId: string): Promise<Section[]> => {
        const defaultSections: CreateSectionData[] = [
            {
                biositeId,
                titulo: 'Social',
                icon: 'social',
                descripcion: 'Social media links',
                orderIndex: 1,
            },
            {
                biositeId,
                titulo: 'Links',
                icon: 'link',
                descripcion: 'Enlaces diversos',
                orderIndex: 2,
            },
            {
                biositeId,
                titulo: 'Contactame',
                icon: 'whatsapp',
                descripcion: 'WhatsApp contact',
                orderIndex: 3,
            },
            {
                biositeId,
                titulo: 'Link de mi App',
                icon: 'app',
                descripcion: 'App download links',
                orderIndex: 4,
            },
            {
                biositeId,
                titulo: 'VCard',
                icon: 'vcard',
                descripcion: 'Digital business card',
                orderIndex: 5,
            },
            {
                biositeId,
                titulo: 'Video',
                icon: 'video',
                descripcion: 'YouTube videos',
                orderIndex: 6,
            },
            {
                biositeId,
                titulo: 'Music / Podcast',
                icon: 'music',
                descripcion: 'Audio content',
                orderIndex: 7,
            },
            {
                biositeId,
                titulo: 'Social Post',
                icon: 'instagram',
                descripcion: 'Instagram posts',
                orderIndex: 8,
            },
        ];

        try {
            const createdSections: Section[] = [];
            for (const sectionData of defaultSections) {
                const created = await createSection(sectionData);
                createdSections.push(created);
            }
            return createdSections;
        } catch (err) {
            console.error('Error creating default sections:', err);
            throw err;
        }
    };

    const checkExistingSections = async (biositeId: string): Promise<boolean> => {
        try {
            const existingSections = await getSectionsByBiosite(biositeId);
            return existingSections.length > 0;
        } catch (err) {
            console.error('Error checking existing sections:', err);
            return false;
        }
    };

    const initializeSections = async (biositeId: string): Promise<Section[]> => {
        try {
            const hasExistingSections = await checkExistingSections(biositeId);

            if (!hasExistingSections) {
                return await createDefaultSections(biositeId);
            } else {
                return await getSectionsByBiosite(biositeId);
            }
        } catch (err) {
            console.error('Error initializing sections:', err);
            throw err;
        }
    };

    return {
        sections,
        loading,
        error,
        createSection,
        getSectionsByBiosite,
        reorderSections,
        createDefaultSections,
        initializeSections,
        clearError: () => setError(null),
    };
};