// components/Gallery/GalleryGrid.tsx

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, GripVertical, Check, Grid, Plus } from 'lucide-react';
import { message } from 'antd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { TextBlock } from '../../interfaces/textBlocks';
import ImageEditorModal from '../global/ImagenesModal/ImageEditorModal';

interface GalleryGridProps {
    blocks: TextBlock[];
    onImageUpload?: (blockId: string, imageFile: Blob) => Promise<void>;
    onImageAdd?: (file?: File) => Promise<void> | void;
    onImageDelete?: (blockId: string) => Promise<void>;
    onReorder?: (newBlocks: TextBlock[]) => Promise<void>;
    loading?: boolean;
    readOnly?: boolean;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({
    blocks,
    onImageUpload,
    onImageAdd,
    onImageDelete,
    onReorder,
    loading = false,
    readOnly = false
}) => {
    // Estados principales
    const [selectedImage, setSelectedImage] = useState<{ url: string; blockId: string } | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    // Referencias para Drag & Touch
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const isDragging = useRef(false);

    // Constantes
    const IMAGES_TO_SHOW = 4;
    const AUTO_SCROLL_INTERVAL = 3000;
    const DRAG_THRESHOLD = 30; // Changed from 50 to 30 as per Step 697

    // Efecto de Entrada
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (blocks.length <= IMAGES_TO_SHOW || isPaused || isReordering) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % blocks.length);
        }, AUTO_SCROLL_INTERVAL);

        return () => clearInterval(interval);
    }, [blocks.length, isPaused, isReordering]);

    // Handlers de Drag & Drop
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || !onReorder) return;

        const items = Array.from(blocks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onReorder(items);
    };

    // Handlers de Imagen
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            message.error('Por favor selecciona un archivo de imagen válido');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            message.error('La imagen no debe superar los 5MB');
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setSelectedImage({ url: imageUrl, blockId });
        setIsEditorOpen(true);
    };

    const handleEditorSave = async (croppedImage: Blob) => {
        if (!selectedImage) return;

        try {
            // CASO 1: Agregando NUEVA imagen (desde el botón +)
            if (selectedImage.blockId === 'NEW_BLOCK_TEMP') {
                if (onImageAdd) {
                    // Convertimos Blob a File
                    const file = new File([croppedImage], "image.jpg", { type: "image/jpeg" });
                    await onImageAdd(file);
                }
            }
            // CASO 2: Editando imagen EXISTENTE
            else if (onImageUpload) {
                await onImageUpload(selectedImage.blockId, croppedImage);
            }

            message.success('Imagen guardada exitosamente');
            setIsEditorOpen(false);
            setSelectedImage(null);
        } catch (error) {
            console.error('Error saving image:', error);
            message.error('Error al guardar la imagen');
        }
    };

    const handleEditorCancel = () => {
        if (selectedImage?.url) {
            URL.revokeObjectURL(selectedImage.url);
        }
        setIsEditorOpen(false);
        setSelectedImage(null);
    };

    const handleDeleteImage = async (e: React.MouseEvent, blockId: string) => {
        e.stopPropagation();
        if (!onImageDelete) return;
        setDeletingId(blockId);
        try {
            await onImageDelete(blockId);
            message.success('Imagen eliminada');
        } catch (error) {
            console.error('Error deleting image:', error);
            message.error('Error al eliminar la imagen');
        } finally {
            setDeletingId(null);
        }
    };

    // Navegación Carrusel
    const getRotation = (index: number) => {
        const rotations = [-8, -4, 0, 4, 8, -6, 6, -3, 3];
        return rotations[index % rotations.length];
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % blocks.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + blocks.length) % blocks.length);
    };

    // Touch Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = e.touches[0].clientX;
        isDragging.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
        const diff = Math.abs(touchStartX.current - touchEndX.current);
        if (diff > DRAG_THRESHOLD) {
            isDragging.current = true;
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging.current) return;
        if (touchStartX.current - touchEndX.current > 30) goToNext();
        if (touchStartX.current - touchEndX.current < -30) goToPrev();
        isDragging.current = false;
    };

    // Mouse Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        touchStartX.current = e.clientX;
        touchEndX.current = e.clientX;
        isDragging.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (touchStartX.current === 0) return;
        touchEndX.current = e.clientX;
        const diff = Math.abs(touchStartX.current - touchEndX.current);
        if (diff > DRAG_THRESHOLD) {
            isDragging.current = true;
        }
    };

    const handleMouseUp = () => {
        if (touchStartX.current === 0) return;
        if (isDragging.current) {
            if (touchStartX.current - touchEndX.current > 30) goToNext();
            if (touchStartX.current - touchEndX.current < -30) goToPrev();
        }
        touchStartX.current = 0;
        touchEndX.current = 0;
        isDragging.current = false;
    };

    // Cálculo de bloques visibles
    const getVisibleBlocks = () => {
        const effectiveBlocks = blocks.length > 0 ? blocks : [];
        if (effectiveBlocks.length === 0) return [];
        const visible = [];
        for (let i = 0; i < IMAGES_TO_SHOW; i++) {
            const index = (currentIndex + i) % effectiveBlocks.length;
            visible.push({ block: effectiveBlocks[index], position: i });
        }
        return visible;
    };

    const visibleBlocks = getVisibleBlocks();

    const canAddMore = !readOnly && blocks.length < 8 && !blocks.some(b => !b.image);

    return (
        <>
            <div className={`mb-6 ${isReordering ? '' : 'transition-all duration-300'}`}>
                <div className="flex justify-between items-center mb-3">
                    {!readOnly && (
                        <p className="text-sm text-gray-700 font-medium">
                            {isReordering ? 'Grid de reordenamiento' : 'Galería de imágenes'}
                        </p>
                    )}

                    {!readOnly && blocks.length > 1 && (
                        <button
                            onClick={() => setIsReordering(!isReordering)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isReordering
                                ? 'bg-black text-white shadow-lg scale-105'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 opacity-0 pointer-events-none'
                                }`}
                            style={{ opacity: isReordering ? 1 : 0 }}
                        >
                            <Check size={14} /> Listo
                        </button>
                    )}
                </div>

                {isReordering ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="gallery-grid" direction="horizontal">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[220px] p-4 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200"
                                    style={{ transform: 'none' }}
                                >
                                    {blocks.map((block, index) => (
                                        <Draggable
                                            key={block.id}
                                            draggableId={block.id.toString()}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`
                                                        aspect-[3/4] rounded-xl overflow-hidden shadow-sm relative bg-white group select-none
                                                        ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-black z-50 opacity-90' : ''}
                                                    `}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                                    }}
                                                >
                                                    {block.image ? (
                                                        <img
                                                            src={block.image}
                                                            alt="Gallery item"
                                                            className="w-full h-full object-cover pointer-events-none select-none"
                                                            draggable={false}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-full h-full flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onTouchStart={(e) => e.stopPropagation()}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const input = document.getElementById(`file-input-${block.id}`);
                                                                if (input) input.click();
                                                            }}
                                                        >
                                                            <input
                                                                id={`file-input-${block.id}`}
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleImageSelect(e, block.id)}
                                                                disabled={loading}
                                                            />
                                                            <Upload size={20} className="text-gray-300 pointer-events-none" />
                                                        </div>
                                                    )}

                                                    {!readOnly && onImageDelete && (
                                                        <button
                                                            onClick={(e) => handleDeleteImage(e, block.id)}
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onTouchStart={(e) => e.stopPropagation()}
                                                            disabled={loading || deletingId === block.id}
                                                            className="absolute -top-2 -right-2 p-1.5 hover:scale-110 transition-transform disabled:opacity-50 z-20 bg-white shadow-md rounded-full border border-gray-100"
                                                        >
                                                            {deletingId === block.id ? (
                                                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <X size={16} className="text-red-500" strokeWidth={2.5} />
                                                            )}
                                                        </button>
                                                    )}

                                                    <div className="absolute top-2 left-2 bg-white/90 p-1 rounded backdrop-blur-sm">
                                                        <GripVertical size={14} className="text-gray-500" />
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {/* Botón AGREGAR con lógica de Editor */}
                                    {canAddMore && onImageAdd && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                document.getElementById('add-new-block-input')?.click();
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-gray-400 hover:shadow-sm transition-all group"
                                        >
                                            <input
                                                id="add-new-block-input"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const imageUrl = URL.createObjectURL(file);
                                                        setSelectedImage({ url: imageUrl, blockId: 'NEW_BLOCK_TEMP' });
                                                        setIsEditorOpen(true);
                                                    }
                                                    e.target.value = '';
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />

                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors pointer-events-none">
                                                <Plus size={24} className="text-gray-400 group-hover:text-gray-600" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 pointer-events-none">Nueva Foto</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                ) : (
                    <div
                        className="relative cursor-grab active:cursor-grabbing"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => {
                            setIsPaused(false);
                            handleMouseUp();
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                    >
                        <div className="flex justify-center items-center min-h-[220px] relative transition-all duration-500">
                            {visibleBlocks.map(({ block, position }) => (
                                <div
                                    key={`block-${block.id}-${position}`}
                                    className="absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                    style={{
                                        transform: isMounted
                                            ? `rotate(${getRotation(position)}deg) translateX(${(position - 1.5) * 80}px) scale(1)`
                                            : `rotate(0deg) translateX(0px) scale(0.5)`,
                                        zIndex: IMAGES_TO_SHOW - position,
                                        opacity: isMounted ? 1 : 0,
                                        cursor: block.image ? 'pointer' : 'default'
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                >
                                    <div
                                        className="relative w-[140px] h-[180px] rounded-2xl overflow-hidden bg-white shadow-xl group"
                                        onClick={(e) => {
                                            if (!readOnly && block.image) {
                                                e.stopPropagation();
                                                setIsReordering(true);
                                            }
                                        }}
                                    >
                                        {block.image ? (
                                            <>
                                                <img
                                                    src={block.image}
                                                    alt={block.title || 'Gallery item'}
                                                    className="w-full h-full object-cover"
                                                />
                                                {!readOnly && (
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                                )}

                                                {!readOnly && position === 0 && (
                                                    <div className="absolute top-3 right-3 z-30 animate-pulse pointer-events-none">
                                                        <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
                                                            <Grid size={12} className="text-white" />
                                                            <span className="text-[10px] font-semibold tracking-wide uppercase">Organizar</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {!readOnly && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                        <span className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium shadow-xl transform scale-95 group-hover:scale-100 transition-all">
                                                            Tocar para editar
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            readOnly ? (
                                                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                                                </div>
                                            ) : (
                                                <label
                                                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-300 gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleImageSelect(e, block.id)}
                                                        disabled={loading}
                                                    />
                                                    <Upload size={28} className="text-gray-400" />
                                                    <span className="text-xs text-gray-400 font-medium">Subir imagen</span>
                                                </label>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {blocks.length > IMAGES_TO_SHOW && (
                            <div className="flex justify-center gap-2 mt-4">
                                {blocks.map((_, index) => (
                                    <button
                                        key={`indicator-${index}`}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                            ? 'bg-gray-700 w-6'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!readOnly && selectedImage && (
                <ImageEditorModal
                    visible={isEditorOpen}
                    imageUrl={selectedImage.url}
                    onCancel={handleEditorCancel}
                    onSave={handleEditorSave}
                    aspectRatio={1}
                />
            )}
        </>
    );
};

export default GalleryGrid;