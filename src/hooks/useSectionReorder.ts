// useSectionReorder.ts - Updated
import { useCallback, useMemo } from 'react';
import { usePreview } from '../context/PreviewContext';

export interface SectionOrder {
    id: string;
    type: 'social' | 'regular' | 'music' | 'video' | 'socialpost';
    orderIndex: number;
    isActive: boolean;
    data: any; // Datos originales del elemento
}

export const useSectionReorder = () => {
    const {
        socialLinks,
        regularLinks,
        getMusicEmbed,
        getSocialPost,
        getVideoEmbed,
        updateSocialLink,
        updateRegularLink,
        setMusicEmbed,
        setSocialPost,
        setVideoEmbed,
        reorderRegularLinks,
        setSocialLinks, // Asumiendo que existe esta función
    } = usePreview();

    // Crear la lista unificada con orden global
    const allSections = useMemo(() => {
        const sections: SectionOrder[] = [];
        let globalOrderIndex = 0;

        // Recopilar todos los elementos con sus órdenes actuales
        const allItems = [
            // Social links - usando el índice del array como orden
            ...socialLinks.map((link, index) => ({
                ...link,
                type: 'social' as const,
                orderIndex: globalOrderIndex++,
                originalIndex: index,
            })),

            // Regular links - usando orderIndex existente
            ...regularLinks.map(link => ({
                ...link,
                type: 'regular' as const,
                orderIndex: link.orderIndex,
            })),

            // Embeds especiales
            ...[getMusicEmbed(), getSocialPost(), getVideoEmbed()].filter(Boolean).map(embed => ({
                ...embed!,
                type: embed!.type || (
                    getMusicEmbed()?.id === embed!.id ? 'music' :
                        getSocialPost()?.id === embed!.id ? 'socialpost' : 'video'
                ) as 'music' | 'video' | 'socialpost',
                orderIndex: embed!.orderIndex ?? 999,
            })),
        ];

        // Ordenar por orderIndex y mapear a SectionOrder
        return allItems
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((item, index) => ({
                id: item.id,
                type: item.type,
                orderIndex: index, // Nuevo orden secuencial
                isActive: item.isActive,
                data: item,
            }));
    }, [socialLinks, regularLinks, getMusicEmbed, getSocialPost, getVideoEmbed]);

    // Función para reordenar social links
    const reorderSocialLinks = useCallback(async (fromIndex: number, toIndex: number) => {
        try {
            const reorderedLinks = [...socialLinks];
            const [movedLink] = reorderedLinks.splice(fromIndex, 1);
            reorderedLinks.splice(toIndex, 0, movedLink);

            // Actualizar cada link - los social links no necesitan orderIndex explícito
            // su orden se determina por la posición en el array
            for (let i = 0; i < reorderedLinks.length; i++) {
                await updateSocialLink(reorderedLinks[i].id, reorderedLinks[i]);
            }

            // Si existe setSocialLinks, úsalo para actualizar todo el array de una vez
            if (setSocialLinks) {
                await setSocialLinks(reorderedLinks);
            }
        } catch (error) {
            console.error('Error reordering social links:', error);
            throw error;
        }
    }, [socialLinks, updateSocialLink, setSocialLinks]);

    // Función para reordenar regular links
    const reorderRegularLinksHandler = useCallback(async (fromIndex: number, toIndex: number) => {
        try {
            const reorderedLinks = [...regularLinks];
            const [movedLink] = reorderedLinks.splice(fromIndex, 1);
            reorderedLinks.splice(toIndex, 0, movedLink);

            // Actualizar orderIndex para cada link
            const updatedLinks = reorderedLinks.map((link, index) => ({
                ...link,
                orderIndex: index,
            }));

            await reorderRegularLinks(updatedLinks);
        } catch (error) {
            console.error('Error reordering regular links:', error);
            throw error;
        }
    }, [regularLinks, reorderRegularLinks]);

    // Función para reordenar embeds
    const reorderEmbeds = useCallback(async (embedType: 'music' | 'video' | 'socialpost', newOrderIndex: number) => {
        try {
            switch (embedType) {
                case 'music':
                    const musicEmbed = getMusicEmbed();
                    if (musicEmbed) {
                        await setMusicEmbed({
                            ...musicEmbed,
                            orderIndex: newOrderIndex
                        });
                    }
                    break;

                case 'video':
                    const videoEmbed = getVideoEmbed();
                    if (videoEmbed) {
                        await setVideoEmbed({
                            ...videoEmbed,
                            orderIndex: newOrderIndex
                        });
                    }
                    break;

                case 'socialpost':
                    const socialPost = getSocialPost();
                    if (socialPost) {
                        await setSocialPost({
                            ...socialPost,
                            orderIndex: newOrderIndex
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error(`Error reordering ${embedType} embed:`, error);
            throw error;
        }
    }, [getMusicEmbed, getSocialPost, getVideoEmbed, setMusicEmbed, setSocialPost, setVideoEmbed]);

    // Función principal para reordenar cualquier sección
    const reorderAllSections = useCallback(async (fromIndex: number, toIndex: number, sectionType?: string) => {
        try {
            // Si no se especifica tipo, intentamos reordenar globalmente
            if (!sectionType) {
                // Lógica para reorden global - más compleja
                console.log('Global reordering not fully implemented yet');
                return;
            }

            switch (sectionType) {
                case 'social':
                    await reorderSocialLinks(fromIndex, toIndex);
                    break;
                case 'regular':
                    await reorderRegularLinksHandler(fromIndex, toIndex);
                    break;
                case 'music':
                case 'video':
                case 'socialpost':
                    await reorderEmbeds(sectionType as 'music' | 'video' | 'socialpost', toIndex);
                    break;
                default:
                    console.warn('Unknown section type:', sectionType);
            }
        } catch (error) {
            console.error('Error reordering sections:', error);
            throw error;
        }
    }, [reorderSocialLinks, reorderRegularLinksHandler, reorderEmbeds]);

    // Función para obtener el orden de visualización en LivePreview
    const getDisplayOrder = useCallback(() => {
        return allSections
            .filter(section => section.isActive)
            .sort((a, b) => a.orderIndex - b.orderIndex);
    }, [allSections]);

    return {
        allSections,
        reorderSocialLinks,
        reorderRegularLinks: reorderRegularLinksHandler,
        reorderAllSections,
        reorderEmbeds,
        getDisplayOrder,
    };
};

export default useSectionReorder;
