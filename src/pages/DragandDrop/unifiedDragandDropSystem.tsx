import React, { useState } from 'react';
import { DraggableItem } from './DraggableItem';
import { usePreview } from '../../context/PreviewContext';
import { useSectionReorder } from '../../hooks/useSectionReorder';

interface UnifiedSection {
    id: string;
    type: 'social' | 'regular' | 'music' | 'video' | 'socialpost';
    title: string;
    url: string;
    orderIndex: number;
    isActive: boolean;
    icon?: string;
    color?: string;
    image?: string;
    label?: string;
    originalIndex: number; // Índice original dentro de su tipo
}

interface UnifiedDragDropSectionProps {
    className?: string;
}

export const UnifiedDragDropSection: React.FC<UnifiedDragDropSectionProps> = ({
                                                                                  className = ''
                                                                              }) => {
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
        reorderRegularLinks
    } = usePreview();

    const { reorderSocialLinks } = useSectionReorder();
    const [isReordering, setIsReordering] = useState(false);

    // Crear lista unificada de todas las secciones
    const createUnifiedSections = (): UnifiedSection[] => {
        const sections: UnifiedSection[] = [];

        // Agregar social links
        socialLinks.forEach((link, index) => {
            sections.push({
                id: link.id,
                type: 'social',
                title: link.label,
                url: link.url,
                orderIndex: sections.length,
                isActive: link.isActive,
                icon: link.icon,
                color: link.color,
                label: link.label,
                originalIndex: index
            });
        });

        // Agregar regular links
        regularLinks.forEach((link, index) => {
            sections.push({
                id: link.id,
                type: 'regular',
                title: link.title,
                url: link.url,
                orderIndex: link.orderIndex,
                isActive: link.isActive,
                image: link.image,
                originalIndex: index
            });
        });

        // Agregar embeds especiales
        const musicEmbed = getMusicEmbed();
        if (musicEmbed) {
            sections.push({
                id: musicEmbed.id,
                type: 'music',
                title: musicEmbed.label,
                url: musicEmbed.url,
                orderIndex: musicEmbed.orderIndex || 999,
                isActive: musicEmbed.isActive,
                originalIndex: 0
            });
        }

        const socialPost = getSocialPost();
        if (socialPost) {
            sections.push({
                id: socialPost.id,
                type: 'socialpost',
                title: socialPost.label,
                url: socialPost.url,
                orderIndex: socialPost.orderIndex || 999,
                isActive: socialPost.isActive,
                originalIndex: 0
            });
        }

        const videoEmbed = getVideoEmbed();
        if (videoEmbed) {
            sections.push({
                id: videoEmbed.id,
                type: 'video',
                title: videoEmbed.label,
                url: videoEmbed.url,
                orderIndex: videoEmbed.orderIndex || 999,
                isActive: videoEmbed.isActive,
                originalIndex: 0
            });
        }

        // Ordenar por orderIndex
        return sections.sort((a, b) => a.orderIndex - b.orderIndex);
    };

    const [unifiedSections, setUnifiedSections] = useState<UnifiedSection[]>(createUnifiedSections());

    // Actualizar secciones cuando cambien los datos
    React.useEffect(() => {
        if (!isReordering) {
            setUnifiedSections(createUnifiedSections());
        }
    }, [socialLinks, regularLinks, getMusicEmbed(), getSocialPost(), getVideoEmbed()]);

    // Función para reordenar globalmente
    const handleGlobalReorder = async (fromIndex: number, toIndex: number) => {
        if (isReordering) return;

        setIsReordering(true);

        try {
            const newSections = [...unifiedSections];
            const [movedSection] = newSections.splice(fromIndex, 1);
            newSections.splice(toIndex, 0, movedSection);

            // Actualizar orderIndex para todas las secciones
            const updatedSections = newSections.map((section, index) => ({
                ...section,
                orderIndex: index
            }));

            setUnifiedSections(updatedSections);

            // Separar por tipos y actualizar cada uno
            const socialSections = updatedSections.filter(s => s.type === 'social');
            const regularSections = updatedSections.filter(s => s.type === 'regular');
            const musicSection = updatedSections.find(s => s.type === 'music');
            const videoSection = updatedSections.find(s => s.type === 'video');
            const socialPostSection = updatedSections.find(s => s.type === 'socialpost');

            // Actualizar social links
            if (socialSections.length > 0) {
                const reorderedSocialLinks = socialSections.map((section, index) => {
                    const originalLink = socialLinks.find(link => link.id === section.id);
                    return {
                        ...originalLink!,
                        // Los social links no tienen orderIndex explícito en tu estructura
                    };
                });

                // Reordenar social links manteniendo el orden global
                for (let i = 0; i < reorderedSocialLinks.length; i++) {
                    await updateSocialLink(reorderedSocialLinks[i].id, reorderedSocialLinks[i]);
                }
            }

            // Actualizar regular links
            if (regularSections.length > 0) {
                const reorderedRegularLinks = regularSections.map((section, index) => {
                    const originalLink = regularLinks.find(link => link.id === section.id);
                    return {
                        ...originalLink!,
                        orderIndex: section.orderIndex
                    };
                });

                await reorderRegularLinks(reorderedRegularLinks);
            }

            // Actualizar embeds especiales
            if (musicSection && getMusicEmbed()) {
                await setMusicEmbed({
                    ...getMusicEmbed()!,
                    orderIndex: musicSection.orderIndex
                });
            }

            if (videoSection && getVideoEmbed()) {
                await setVideoEmbed({
                    ...getVideoEmbed()!,
                    orderIndex: videoSection.orderIndex
                });
            }

            if (socialPostSection && getSocialPost()) {
                await setSocialPost({
                    ...getSocialPost()!,
                    orderIndex: socialPostSection.orderIndex
                });
            }

            console.log(`Global reorder completed from ${fromIndex} to ${toIndex}`);

        } catch (error) {
            console.error('Error in global reorder:', error);
            // Revertir cambios en caso de error
            setUnifiedSections(createUnifiedSections());
        } finally {
            setIsReordering(false);
        }
    };

    // Función para renderizar el ícono según el tipo
    const renderSectionIcon = (section: UnifiedSection) => {
        const iconClasses = "w-5 h-5";

        switch (section.type) {
            case 'social':
                return (
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                        style={{ backgroundColor: section.color || '#6b7280' }}
                    >
                        {section.icon ? (
                            <img
                                src={section.icon}
                                alt={section.label}
                                className="w-6 h-6"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            section.label?.charAt(0).toUpperCase()
                        )}
                    </div>
                );

            case 'regular':
                return (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {section.image ? (
                            <img
                                src={section.image}
                                alt={section.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <svg className={`${iconClasses} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        )}
                    </div>
                );

            case 'music':
                return (
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98L6 3.75c-.553.138-.954.63-.954 1.188V8.5a2.5 2.5 0 11-1.5 2.292V4.938A2.5 2.5 0 016.094 2.5L17.5 1a1 1 0 01.5.98v8.52a2.5 2.5 0 11-1.5 2.292V3z" />
                        </svg>
                    </div>
                );

            case 'video':
                return (
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
                        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                    </div>
                );

            case 'socialpost':
                return (
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                    </div>
                );

            default:
                return (
                    <div className="w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center text-white">
                        <span>?</span>
                    </div>
                );
        }
    };

    // Función para obtener el label del tipo
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'social': return 'Social';
            case 'regular': return 'Link';
            case 'music': return 'Music';
            case 'video': return 'Video';
            case 'socialpost': return 'Post';
            default: return type;
        }
    };

    if (!unifiedSections.length) {
        return (
            <div className={`p-8 text-center text-gray-500 ${className}`}>
                <div className="flex flex-col items-center space-y-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p>No sections added yet</p>
                    <p className="text-sm">Add links, music, videos or social posts to see them here</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">All Sections</h4>
                <p className="text-sm text-blue-700">
                    Drag and drop to reorder how sections appear in your profile
                </p>
            </div>

            {unifiedSections.map((section, index) => (
                <DraggableItem
                    key={section.id}
                    id={section.id}
                    type="regular" // Usamos 'regular' como tipo base para el drag and drop global
                    index={index}
                    onReorder={handleGlobalReorder}
                    className="relative p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200 hover:shadow-sm"
                    disabled={isReordering}
                >
                    <div className="flex items-center space-x-3">
                        {/* Icon */}
                        {renderSectionIcon(section)}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 truncate">
                                    {section.title}
                                </h4>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {getTypeLabel(section.type)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                                {section.url}
                            </p>
                        </div>

                        {/* Order indicator */}
                        <div className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            #{section.orderIndex + 1}
                        </div>

                        {/* Status indicator */}
                        <div className="flex-shrink-0">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    section.isActive ? 'bg-green-400' : 'bg-gray-300'
                                }`}
                            />
                        </div>
                    </div>
                </DraggableItem>
            ))}

            {isReordering && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                        <span className="text-sm text-yellow-700">Reordering sections...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
