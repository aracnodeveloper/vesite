import React, { useRef } from 'react';
import { useDragDrop } from '../../context/DragandDropContex.tsx';

interface DraggableItemProps {
    id: string;
    type: 'social' | 'regular' | 'music' | 'video' | 'socialpost';
    index: number;
    children: React.ReactNode;
    onReorder?: (fromIndex: number, toIndex: number) => void;
    className?: string;
    disabled?: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
                                                                id,
                                                                type,
                                                                index,
                                                                children,
                                                                onReorder,
                                                                className = '',
                                                                disabled = false,
                                                            }) => {
    const {
        draggedItem,
        isDragging,
        dragOverIndex,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
    } = useDragDrop();

    const elementRef = useRef<HTMLDivElement>(null);

    const handleDragStartEvent = (e: React.DragEvent) => {
        if (disabled) return;

        e.dataTransfer.effectAllowed = 'move';
        handleDragStart({ id, type, index });
    };

    const handleDragOverEvent = (e: React.DragEvent) => {
        if (disabled) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedItem && draggedItem.type === type && draggedItem.id !== id) {
            handleDragOver(index);
        }
    };

    const handleDropEvent = (e: React.DragEvent) => {
        if (disabled) return;

        e.preventDefault();

        if (draggedItem && draggedItem.type === type && draggedItem.id !== id) {
            if (onReorder) {
                onReorder(draggedItem.index, index);
            }
        }

        handleDragEnd();
    };

    const handleDragEndEvent = () => {
        handleDragEnd();
    };

    const handleDragLeaveEvent = () => {
        handleDragLeave();
    };

    const isDraggedItem = draggedItem?.id === id;
    const isValidDropTarget = draggedItem && draggedItem.type === type && draggedItem.id !== id;
    const isDropTarget = isValidDropTarget && dragOverIndex === index;

    const combinedClassName = `
        ${className}
        ${!disabled ? 'cursor-move' : ''}
        ${isDraggedItem ? 'opacity-50 scale-95' : ''}
        ${isDropTarget ? 'border-2 border-blue-400 border-dashed bg-blue-50' : ''}
        ${isDragging && !isDraggedItem && !isValidDropTarget ? 'pointer-events-none' : ''}
        transition-all duration-200 ease-in-out
    `.trim();

    return (
        <div
            ref={elementRef}
            draggable={!disabled}
            onDragStart={handleDragStartEvent}
            onDragOver={handleDragOverEvent}
            onDrop={handleDropEvent}
            onDragEnd={handleDragEndEvent}
            onDragLeave={handleDragLeaveEvent}
            className={combinedClassName}
            style={{
                touchAction: disabled ? 'auto' : 'none',
            }}
        >
            {!disabled && (
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity">
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400"
                    >
                        <circle cx="2" cy="2" r="1" fill="currentColor" />
                        <circle cx="2" cy="6" r="1" fill="currentColor" />
                        <circle cx="2" cy="10" r="1" fill="currentColor" />
                        <circle cx="6" cy="2" r="1" fill="currentColor" />
                        <circle cx="6" cy="6" r="1" fill="currentColor" />
                        <circle cx="6" cy="10" r="1" fill="currentColor" />
                    </svg>
                </div>
            )}
            <div className={!disabled ? 'pl-6' : ''}>
                {children}
            </div>
        </div>
    );
};
