import React from 'react';
import { DraggableItem } from './DraggableItem';
import { useSectionReorder } from '../../hooks/useSectionReorder';
import { usePreview } from '../../context/PreviewContext';

interface DraggableSocialSectionProps {
    className?: string;
}

export const DraggableSocialSection: React.FC<DraggableSocialSectionProps> = ({ className = '' }) => {
    const { socialLinks } = usePreview();
    const { reorderSocialLinks } = useSectionReorder();

    const handleReorder = async (fromIndex: number, toIndex: number) => {
        try {
            await reorderSocialLinks(fromIndex, toIndex);
        } catch (error) {
            console.error('Failed to reorder social links:', error);
            // Aquí podrías mostrar un toast de error
        }
    };

    if (!socialLinks.length) {
        return (
            <div className={`p-4 text-center text-gray-500 ${className}`}>
                No social links added yet
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {socialLinks.map((link, index) => (
                <DraggableItem
                    key={link.id}
                    id={link.id}
                    type="social"
                    index={index}
                    onReorder={handleReorder}
                    className="relative p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        {/* Icon */}
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                            style={{ backgroundColor: link.color }}
                        >
                            {link.icon ? (
                                <img
                                    src={link.icon}
                                    alt={link.label}
                                    className="w-6 h-6"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : null}
                            <span
                                className="hidden"
                                style={{ display: link.icon ? 'none' : 'block' }}
                            >
                                {link.label.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                                {link.label}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                                {link.url}
                            </p>
                        </div>

                        {/* Status indicator */}
                        <div className="flex-shrink-0">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    link.isActive ? 'bg-green-400' : 'bg-gray-300'
                                }`}
                            />
                        </div>
                    </div>
                </DraggableItem>
            ))}
        </div>
    );
};
