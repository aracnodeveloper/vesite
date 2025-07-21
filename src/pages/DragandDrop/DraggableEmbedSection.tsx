import React from 'react';
import { DraggableItem } from './DraggableItem';
import { usePreview } from '../../context/PreviewContext';

interface EmbedItemProps {
    id: string;
    type: 'music' | 'video' | 'socialpost';
    label: string;
    url: string;
    isActive: boolean;
    orderIndex?: number;
}

const EmbedItem: React.FC<EmbedItemProps> = ({ id, type, label, url, isActive, orderIndex }) => {
    const getIconAndColor = () => {
        switch (type) {
            case 'music':
                return {
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98L6 3.75c-.553.138-.954.63-.954 1.188V8.5a2.5 2.5 0 11-1.5 2.292V4.938A2.5 2.5 0 016.094 2.5L17.5 1a1 1 0 01.5.98v8.52a2.5 2.5 0 11-1.5 2.292V3z" />
                        </svg>
                    ),
                    color: 'bg-green-500',
                    label: 'Music'
                };
            case 'video':
                return {
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                    ),
                    color: 'bg-red-500',
                    label: 'Video'
                };
            case 'socialpost':
                return {
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                    ),
                    color: 'bg-purple-500',
                    label: 'Social Post'
                };
            default:
                return {
                    icon: null,
                    color: 'bg-gray-500',
                    label: 'Embed'
                };
        }
    };

    const { icon, color, label: typeLabel } = getIconAndColor();

    return (
        <div className="flex items-center space-x-3">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white`}>
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                    {label || typeLabel}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                    {url}
                </p>
            </div>

            {/* Order indicator */}
            {typeof orderIndex === 'number' && (
                <div className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    #{orderIndex + 1}
                </div>
            )}

            {/* Status indicator */}
            <div className="flex-shrink-0">
                <div
                    className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                />
            </div>
        </div>
    );
};

interface DraggableEmbedSectionProps {
    className?: string;
}

export const DraggableEmbedSection: React.FC<DraggableEmbedSectionProps> = ({ className = '' }) => {
    const { getMusicEmbed, getSocialPost, getVideoEmbed, setMusicEmbed, setSocialPost, setVideoEmbed } = usePreview();

    const musicEmbed = getMusicEmbed();
    const socialPost = getSocialPost();
    const videoEmbed = getVideoEmbed();

    const embeds = [
        musicEmbed && {
            id: musicEmbed.id,
            type: 'music' as const,
            label: musicEmbed.label,
            url: musicEmbed.url,
            isActive: musicEmbed.isActive,
            orderIndex: musicEmbed.orderIndex,
        },
        videoEmbed && {
            id: videoEmbed.id,
            type: 'video' as const,
            label: videoEmbed.label,
            url: videoEmbed.url,
            isActive: videoEmbed.isActive,
            orderIndex: videoEmbed.orderIndex,
        },
        socialPost && {
            id: socialPost.id,
            type: 'socialpost' as const,
            label: socialPost.label,
            url: socialPost.url,
            isActive: socialPost.isActive,
            orderIndex: socialPost.orderIndex,
        },
    ].filter(Boolean) as EmbedItemProps[];

    // Ordenar por orderIndex
    embeds.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    if (!embeds.length) {
        return (
            <div className={`p-4 text-center text-gray-500 ${className}`}>
                No embeds added yet
            </div>
        );
    }

    const handleReorder = async (fromIndex: number, toIndex: number) => {
        try {
            const reorderedEmbeds = [...embeds];
            const [movedEmbed] = reorderedEmbeds.splice(fromIndex, 1);
            reorderedEmbeds.splice(toIndex, 0, movedEmbed);

            // Actualizar los orderIndex de todos los embeds reordenados
            for (let i = 0; i < reorderedEmbeds.length; i++) {
                const embed = reorderedEmbeds[i];
                const updatedEmbed = {
                    ...embed,
                    orderIndex: i
                };

                // Actualizar según el tipo de embed
                switch (embed.type) {
                    case 'music':
                        if (musicEmbed) {
                            await setMusicEmbed({
                                ...musicEmbed,
                                orderIndex: i
                            });
                        }
                        break;
                    case 'video':
                        if (videoEmbed) {
                            await setVideoEmbed({
                                ...videoEmbed,
                                orderIndex: i
                            });
                        }
                        break;
                    case 'socialpost':
                        if (socialPost) {
                            await setSocialPost({
                                ...socialPost,
                                orderIndex: i
                            });
                        }
                        break;
                }
            }

            console.log(`Reordered embeds from ${fromIndex} to ${toIndex}`);
        } catch (error) {
            console.error('Error reordering embeds:', error);
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {embeds.map((embed, index) => (
                <DraggableItem
                    key={embed.id}
                    id={embed.id}
                    type={embed.type}
                    index={index}
                    onReorder={handleReorder}
                    disabled={false} // Habilitamos el drag & drop para embeds
                    className="relative p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                >
                    <EmbedItem {...embed} />
                </DraggableItem>
            ))}
        </div>
    );
};
