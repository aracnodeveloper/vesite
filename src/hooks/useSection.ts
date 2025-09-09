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

    // Obtener secciones por biosite ID - with deduplication
    const getSectionsByBiosite = async (biositeId: string): Promise<Section[]> => {
        try {
            setLoading(true);
            setError(null);
            const fetchedSections = await apiService.getAll<Section[]>(
                `${getSectionsByBiositeApi}/${biositeId}`
            );

            // Remove duplicates based on titulo, keeping the one with the lowest orderIndex
            const uniqueSections = fetchedSections.reduce((acc: Section[], current: Section) => {
                const existingIndex = acc.findIndex(section => section.titulo === current.titulo);

                if (existingIndex === -1) {
                    acc.push(current);
                } else {
                    // Keep the one with lower orderIndex or more recent updatedAt
                    if (current.orderIndex < acc[existingIndex].orderIndex ||
                        new Date(current.updatedAt) > new Date(acc[existingIndex].updatedAt)) {
                        acc[existingIndex] = current;
                    }
                }

                return acc;
            }, []);

            // Sort by orderIndex
            uniqueSections.sort((a, b) => a.orderIndex - b.orderIndex);

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
                titulo: 'Profile',
                icon: 'profile',
                descripcion: 'User profile section',
                orderIndex: 0, // Profile should always be first
            },
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
                titulo: 'Galeria',
                icon: 'gallery',
                descripcion: 'Image carousel gallery',
                orderIndex: 6,
            },
            {
                biositeId,
                titulo: 'Video',
                icon: 'video',
                descripcion: 'YouTube videos',
                orderIndex: 7,
            },
            {
                biositeId,
                titulo: 'Music / Podcast',
                icon: 'music',
                descripcion: 'Audio content',
                orderIndex: 8,
            },
            {
                biositeId,
                titulo: 'Social Post',
                icon: 'instagram',
                descripcion: 'Instagram posts',
                orderIndex: 9,
            },
        ];

        try {
            const createdSections: Section[] = [];
            for (const sectionData of defaultSections) {
                // Check if section already exists before creating
                const existingSections = await getSectionsByBiosite(biositeId);
                const existingSection = existingSections.find(s => s.titulo === sectionData.titulo);

                if (!existingSection) {
                    const created = await createSection(sectionData);
                    createdSections.push(created);
                }
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
            const existingSections = await getSectionsByBiosite(biositeId);

            if (existingSections.length === 0) {
                return await createDefaultSections(biositeId);
            } else {
                // Check if Profile section is missing and add it
                const hasProfile = existingSections.some(section => section.titulo === 'Profile');
                if (!hasProfile) {
                    const profileSection: CreateSectionData = {
                        biositeId,
                        titulo: 'Profile',
                        icon: 'profile',
                        descripcion: 'User profile section',
                        orderIndex: 0, // Profile should always be first
                    };
                    await createSection(profileSection);
                }

                // Check if VCard section is missing and add it
                const hasVCard = existingSections.some(section => section.titulo === 'VCard');
                if (!hasVCard) {
                    const vCardSection: CreateSectionData = {
                        biositeId,
                        titulo: 'VCard',
                        icon: 'vcard',
                        descripcion: 'Digital business card',
                        orderIndex: existingSections.length + 1,
                    };
                    await createSection(vCardSection);
                }

                // Check if Galeria section is missing and add it
                const hasGaleria = existingSections.some(section => section.titulo === 'Galeria');
                if (!hasGaleria) {
                    const galeriaSection: CreateSectionData = {
                        biositeId,
                        titulo: 'Galeria',
                        icon: 'gallery',
                        descripcion: 'Image carousel gallery',
                        orderIndex: existingSections.length + 2,
                    };
                    await createSection(galeriaSection);
                }

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