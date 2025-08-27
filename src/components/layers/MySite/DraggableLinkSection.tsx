import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableLinkItem {
    id: string;
    type: 'social' | 'regular' | 'app' | 'whatsapp';
    label: string;
    url: string;
    orderIndex: number;
    isActive: boolean;
    icon?: string;
    component: React.ReactNode;
}

interface DraggableLinkSectionProps {
    items: DraggableLinkItem[];
    onReorder: (reorderedItems: DraggableLinkItem[]) => Promise<void>;
    title: string;
}

const DraggableLinkSection: React.FC<DraggableLinkSectionProps> = ({
                                                                       items,
                                                                       onReorder,
                                                                       title
                                                                   }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isReordering, setIsReordering] = useState(false);

    if (!items || items.length === 0) return null;

    const activeItems = items
        .filter(item => item.isActive)
        .sort((a, b) => a.orderIndex - b.orderIndex);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', '');

        setTimeout(() => {
            const target = e.target as HTMLElement;
            const draggableElement = target.closest('[draggable="true"]') as HTMLElement;
            if (draggableElement) {
                draggableElement.style.opacity = '0.5';
            }
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        const draggableElement = target.closest('[draggable="true"]') as HTMLElement;
        if (draggableElement) {
            draggableElement.style.opacity = '1';
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex || isReordering) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        try {
            setIsReordering(true);

            const reorderedItems = Array.from(activeItems);
            const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
            reorderedItems.splice(dropIndex, 0, draggedItem);

            // Actualizar orderIndex
            const updatedItems = reorderedItems.map((item, index) => ({
                ...item,
                orderIndex: index
            }));

            await onReorder(updatedItems);
        } catch (error) {
            console.error("Error reordering items:", error);
        } finally {
            setIsReordering(false);
            setDraggedIndex(null);
            setDragOverIndex(null);
        }
    };

    return (
        <div className="mb-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wide text-start">
                {title}
            </h3>
            <div className="space-y-3">
                {activeItems.map((item, index) => (
                    <div
                        key={`${item.type}-${item.id}`}
                        draggable={!isReordering}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`
              relative group cursor-move transition-all duration-200
              ${dragOverIndex === index ? 'transform translate-y-1 shadow-lg' : ''}
              ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
              ${isReordering ? 'pointer-events-none opacity-75' : ''}
            `}
                    >
                        {/* Drag handle - visible on hover */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <GripVertical
                                size={16}
                                className="text-gray-400 hover:text-gray-600"
                            />
                        </div>

                        {/* Drop indicator */}
                        {dragOverIndex === index && draggedIndex !== index && (
                            <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10" />
                        )}

                        {/* Render the original component */}
                        <div className="hover:bg-gray-50/50 rounded-lg transition-colors pl-2">
                            {item.component}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DraggableLinkSection;