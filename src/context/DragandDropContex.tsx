import React, { createContext, useContext, useState, useCallback } from 'react';

interface DragItem {
    id: string;
    type: 'social' | 'regular' | 'music' | 'video' | 'socialpost';
    index: number;
}

interface DragDropContextType {
    draggedItem: DragItem | null;
    isDragging: boolean;
    dragOverIndex: number | null;
    setDraggedItem: (item: DragItem | null) => void;
    setIsDragging: (dragging: boolean) => void;
    setDragOverIndex: (index: number | null) => void;
    handleDragStart: (item: DragItem) => void;
    handleDragEnd: () => void;
    handleDragOver: (index: number) => void;
    handleDragLeave: () => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const useDragDrop = () => {
    const context = useContext(DragDropContext);
    if (!context) {
        throw new Error('useDragDrop must be used within a DragDropProvider');
    }
    return context;
};

interface DragDropProviderProps {
    children: React.ReactNode;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = useCallback((item: DragItem) => {
        setDraggedItem(item);
        setIsDragging(true);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedItem(null);
        setIsDragging(false);
        setDragOverIndex(null);
    }, []);

    const handleDragOver = useCallback((index: number) => {
        setDragOverIndex(index);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null);
    }, []);

    const value: DragDropContextType = {
        draggedItem,
        isDragging,
        dragOverIndex,
        setDraggedItem,
        setIsDragging,
        setDragOverIndex,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
    };

    return (
        <DragDropContext.Provider value={value}>
            {children}
        </DragDropContext.Provider>
    );
};
