import { useState, useCallback, useEffect } from 'react';
import sectionService from '../service/sectionService';
import type { Section, CreateSectionDto } from '../interfaces/sections.ts';
import { usePreview } from '../context/PreviewContext';

export const useSection = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { socialLinks, regularLinks, appLinks, whatsAppLinks } = usePreview();
    const [biositeId, setBiositeId] = useState<string>('');

    // Load sections from API
    const loadSections = useCallback(async (biositeId: string): Promise<void> => {
        if (!biositeId) return;

        try {
            setLoading(true);
            setError(null);
            const fetchedSections = await sectionService.getSectionsByBiositeId(biositeId);
            setSections(fetchedSections);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading sections');
        } finally {
            setLoading(false);
        }
    }, []);

    // Create section when moving from "Add More" to "MySite"
    const activateSection = useCallback(async (sectionType: string, biositeId: string): Promise<Section | null> => {
        const sectionConfigs = {
            'social': {
                titulo: 'Social',
                icon: 'social-icon',
                descripcion: 'Social media links'
            },
            'links': {
                titulo: 'Links',
                icon: 'links-icon',
                descripcion: 'Links Diversos'
            },
            'whatsapp': {
                titulo: 'Contactame',
                icon: 'whatsapp-icon',
                descripcion: 'WhatsApp'
            },
            'app': {
                titulo: 'Link de mi App',
                icon: 'app-icon',
                descripcion: 'Links de App'
            }
        };

        const config = sectionConfigs[sectionType as keyof typeof sectionConfigs];
        if (!config) return null;

        try {
            setLoading(true);
            setError(null);

            const createData: CreateSectionDto = {
                biositeId,
                titulo: config.titulo,
                icon: config.icon,
                descripcion: config.descripcion,
                orderIndex: sections.length // Add at the end
            };

            const newSection = await sectionService.createSection(createData);
            setSections(prev => [...prev, newSection]);
            return newSection;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error activating section');
            return null;
        } finally {
            setLoading(false);
        }
    }, [sections.length]);

    // Delete section when moving from "MySite" to "Add More"
    const deactivateSection = useCallback(async (sectionId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            await sectionService.deleteSection(sectionId);
            setSections(prev => prev.filter(section => section.id !== sectionId));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deactivating section');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update section



    // Get sections that should appear in MySite (active sections)
    const getActiveSections = useCallback((): Section[] => {
        const activeSectionTypes: string[] = [];

        // Check which section types have active content
        const activeSocialLinks = socialLinks.filter(link => {
            if (!link.isActive) return false;
            const labelLower = link.label.toLowerCase();
            const urlLower = link.url.toLowerCase();
            if (urlLower.includes("api.whatsapp.com")) return false;
            const excludedKeywords = [
                'open.spotify.com/embed', 'music', 'apple music', 'soundcloud', 'audio',
                'youtube.com/watch', 'video', 'vimeo', 'tiktok video',
                'post', 'publicacion', 'contenido','api.whatsapp.com',
                'music embed', 'video embed', 'social post'
            ];
            return !excludedKeywords.some(keyword =>
                labelLower.includes(keyword) || urlLower.includes(keyword)
            );
        });

        const activeRegularLinks = regularLinks.filter(link => link.isActive);
        const activeAppLinks = appLinks.filter(link => link.isActive);
        const activeWhatsAppLinks = whatsAppLinks.filter(link =>
            link.isActive &&
            link.phone &&
            link.message &&
            link.phone.trim() !== '' &&
            link.message.trim() !== ''
        );

        if (activeSocialLinks.length > 0) activeSectionTypes.push('Social');
        if (activeRegularLinks.length > 0) activeSectionTypes.push('Links');
        if (activeAppLinks.length > 0) activeSectionTypes.push('Link de mi App');
        if (activeWhatsAppLinks.length > 0) activeSectionTypes.push('Contactame');

        // Filter sections that should be active based on content
        return sections
            .filter(section => activeSectionTypes.includes(section.titulo) ||
                ['Perfil', 'VCard'].includes(section.titulo)) // These are always active
            .sort((a, b) => a.orderIndex - b.orderIndex);
    }, [sections, socialLinks, regularLinks, appLinks, whatsAppLinks]);

    // Get sections that should appear in Add More (inactive sections)
    const getInactiveSections = useCallback(() => {
        const activeTitles = getActiveSections().map(s => s.titulo);

        const availableSections = [
            { id: 'social-add', titulo: 'Social', icon: 'social-icon', descripcion: 'Add your social media' },
            { id: 'links-add', titulo: 'Links', icon: 'links-icon', descripcion: 'Links Diversos' },
            { id: 'whatsapp-add', titulo: 'Contactame', icon: 'whatsapp-icon', descripcion: 'WhatsApp' },
            { id: 'app-add', titulo: 'Link de mi App', icon: 'app-icon', descripcion: 'Links de App' }
        ];

        return availableSections.filter(section => !activeTitles.includes(section.titulo));
    }, [getActiveSections]);

    // Auto-sync sections when content changes
    useEffect(() => {
        if (!biositeId) return;

        const syncSections = async () => {
            const currentActiveSections = getActiveSections();
            const shouldBeActive = [];

            // Determine which sections should be active based on content
            const activeSocialLinks = socialLinks.filter(link => {
                if (!link.isActive) return false;
                const labelLower = link.label.toLowerCase();
                const urlLower = link.url.toLowerCase();
                if (urlLower.includes("api.whatsapp.com")) return false;
                const excludedKeywords = [
                    'open.spotify.com/embed', 'music', 'apple music', 'soundcloud', 'audio',
                    'youtube.com/watch', 'video', 'vimeo', 'tiktok video',
                    'post', 'publicacion', 'contenido','api.whatsapp.com',
                    'music embed', 'video embed', 'social post'
                ];
                return !excludedKeywords.some(keyword =>
                    labelLower.includes(keyword) || urlLower.includes(keyword)
                );
            });

            if (activeSocialLinks.length > 0) shouldBeActive.push('social');
            if (regularLinks.filter(link => link.isActive).length > 0) shouldBeActive.push('links');
            if (appLinks.filter(link => link.isActive).length > 0) shouldBeActive.push('app');
            if (whatsAppLinks.filter(link =>
                link.isActive && link.phone && link.message &&
                link.phone.trim() !== '' && link.message.trim() !== ''
            ).length > 0) shouldBeActive.push('whatsapp');

            // Create sections that should be active but don't exist
            for (const sectionType of shouldBeActive) {
                const exists = currentActiveSections.some(s => {
                    const typeMapping = {
                        'social': 'Social',
                        'links': 'Links',
                        'app': 'Link de mi App',
                        'whatsapp': 'Contactame'
                    };
                    return s.titulo === typeMapping[sectionType as keyof typeof typeMapping];
                });

                if (!exists) {
                    await activateSection(sectionType, biositeId);
                }
            }
        };

        syncSections();
    }, [socialLinks, regularLinks, appLinks, whatsAppLinks, biositeId, getActiveSections, activateSection]);

    return {
        sections,
        loading,
        error,
        biositeId,
        setBiositeId,
        loadSections: (id: string) => loadSections(id),
        activateSection,
        deactivateSection,
        getActiveSections,
        getInactiveSections
    };
};