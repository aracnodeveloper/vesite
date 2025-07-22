import React from 'react';
import { DraggableItem } from './DraggableItem';
import { useSectionReorder } from '../../hooks/useSectionReorder';
import { usePreview } from '../../context/PreviewContext';

interface DraggableRegularSectionProps {
    className?: string;
}

export const DraggableRegularSection: React.FC<DraggableRegularSectionProps> = ({ className = '' }) => {
    const { regularLinks } = usePreview();
    const { reorderRegularLinks } = useSectionReorder();

    const handleReorder = async (fromIndex: number, toIndex: number) => {
        try {
            await reorderRegularLinks(fromIndex, toIndex);
        } catch (error) {
            console.error('Failed to reorder regular links:', error);
            // Aquí podrías mostrar un toast de error
        }
    };

    if (!regularLinks.length) {
        return (
            <div className={`p-4 text-center text-gray-500 ${className}`}>
                No regular links added yet
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {regularLinks.map((link, index) => (
                <DraggableItem
                    key={link.id}
                    id={link.id}
                    type="regular"
                    index={index}
                    onReorder={handleReorder}
                    className="relative p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        {/* Image or Icon */}
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {link.image ? (
                                <img
                                    src={link.image}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : null}
                            <div
                                className={`w-full h-full flex items-center justify-center text-gray-400 ${
                                    link.image ? 'hidden' : 'flex'
                                }`}
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                                {link.title}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                                {link.url}
                            </p>
                        </div>

                        {/* Order indicator */}
                        <div className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            #{link.orderIndex + 1}
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
