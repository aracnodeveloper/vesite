// components/Gallery/GalleryGrid.tsx

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, GripVertical, Check, Grid, Plus, Camera, Sparkles, MoveLeft, MoveRight } from 'lucide-react';
import { message } from 'antd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { TextBlock } from '../../../../interfaces/textBlocks.ts';
import ImageEditorModal from '../../../global/ImagenesModal/ImageEditorModal.tsx';

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
    const [showCelebration, setShowCelebration] = useState(false);

    // Referencias para Drag & Touch
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const isDragging = useRef(false);
    const prevImagesCount = useRef(0);

    // Constantes
    const IMAGES_TO_SHOW = 4;
    const DRAG_THRESHOLD = 30;

    // Efecto de Entrada
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const isActiveBlocks = blocks.filter(b => b.isActive);

    // Detectar cuando se completan las 8 fotos
    useEffect(() => {
        const imagesWithPhoto = blocks.filter(b => b.image).length;

        if (imagesWithPhoto === 4 && prevImagesCount.current === 3) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 5000);
        }

        prevImagesCount.current = imagesWithPhoto;
    }, [blocks]);

    const handleDragEnd = (result: DropResult) => {

        if (!result.destination || !onReorder) return;

        if (result.source.index === result.destination.index) return;

        const items = Array.from(blocks);

        const [reorderedItem] = items.splice(result.source.index, 1);

        // Insertar el elemento en la nueva posición
        items.splice(result.destination.index, 0, reorderedItem);

        onReorder(items);
    };

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
            if (selectedImage.blockId === 'NEW_BLOCK_TEMP') {
                if (onImageAdd) {
                    const file = new File([croppedImage], "image.jpg", { type: "image/jpeg" });
                    await onImageAdd(file);
                }
            } else if (onImageUpload) {
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
        const rotations = [-4, -2, 2, 4, 8, -6, 6, -3, 3];
        return rotations[index % rotations.length];
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % blocks.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + blocks.length) % blocks.length);
    };

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
    const canAddMore = !readOnly && blocks.length < 4 && !blocks.some(b => !b.image);

    const imagesWithPhoto = blocks.filter(b => b.image).length;
    const progressPercentage = (imagesWithPhoto / 4) * 100;

    return (
        <div className="w-full h-full overflow-y-auto mb-10 p-2  mx-auto">
            {/* Modal de Celebración */}
            {showCelebration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4 animate-in zoom-in duration-500">
                        {/* Confetti */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                            {[...Array(30)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `-10%`,
                                        backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)],
                                        animation: `fall ${2 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s infinite`,
                                    }}
                                ></div>
                            ))}
                        </div>

                        {/* Contenido */}
                        <div className="relative text-center space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800">¡Galería Completa! 🎉</h3>
                            <p className="text-gray-600">Has completado las 4 fotos de tu galería</p>

                            <div className="flex justify-center gap-2 pt-4">
                                {[1,2,3,4].map((num) => (
                                    <div
                                        key={num}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg flex items-center justify-center animate-bounce"
                                        style={{ animationDelay: `${num * 0.1}s` }}
                                    >
                                        <Camera className="w-4 h-4 text-white" />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowCelebration(false)}
                                className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`mb-6 ${isReordering ? '' : 'transition-all duration-300'}`}>
                {/* Header mejorado */}
                {!isReordering && (
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs text-gray-500">Gestiona tus fotografías</p>
                            </div>
                        </div>

                        {/* Contador Mejorado */}
                        {blocks.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Camera className="w-4 h-4 text-green-600" />
                                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-gray-300 to-green-600 rounded-full transition-all duration-500 flex items-center justify-end pr-1"
                                            style={{ width: `${progressPercentage}%` }}
                                        >
                                            {progressPercentage > 20 && (
                                                <Sparkles className="w-2 h-2 text-white animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-green-700">{imagesWithPhoto}/4</span>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    {imagesWithPhoto === 8
                                        ? '¡Galería completa! 🎉'
                                        : `¡Solo ${4 - imagesWithPhoto} foto${4 - imagesWithPhoto !== 1 ? 's' : ''} más para completar tu galería!`}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Botón organizar mejorado */}
                {!readOnly && blocks.length > 1 && isReordering && (
                    <div className="flex justify-between items-center mb-3 mt-2 ">
                        <p className="text-sm text-gray-700 font-medium">Cambia el orden</p>
                        <button
                            onClick={() => setIsReordering(!isReordering)}
                            className="group relative bg-white border-2 border-gray-800 cursor-pointer text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-800 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-bold"
                        >
                            <Check size={16} className="group-hover:scale-110 transition-transform" />
                            <span>Listo</span>
                        </button>
                    </div>
                )}

                {isReordering && isActiveBlocks ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="gallery-grid" direction="horizontal">
                            {(provided, droppableSnapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    className=' flex flex-wrap justify-center items-center gap-3 '
                                    ref={provided.innerRef}
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
                                                        className={`
                                                            relative   w-[120px] h-[150px] rounded-xl overflow-y-hidden shadow-sm bg-white group select-none
                                                            transition-all duration-200
                                                            ${snapshot.isDragging ? 'shadow-2xl ring-4 ring-green-500 z-50 scale-105 rotate-3' : ''}
                                                        `}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                        }}
                                                    >
                                                        {/* Handle de arrastre */}
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="absolute top-2 right-2 bg-white/95 p-2 rounded-lg backdrop-blur-sm cursor-grab active:cursor-grabbing z-30 shadow-md hover:shadow-lg transition-shadow"
                                                        >
                                                            <GripVertical size={16} className="text-gray-600" />
                                                        </div>

                                                        {/* Número de posición */}
                                                        <div className="absolute top-2 left-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm z-10">
                                                            {index + 1}
                                                        </div>

                                                        {block.image ? (
                                                            <img
                                                                src={block.image}
                                                                alt="Gallery item"
                                                                className="w-full h-full object-cover pointer-events-none select-none"
                                                                draggable={false}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="w-full h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const input = document.getElementById(`file-input-reorder-${block.id}`);
                                                                    if (input) input.click();
                                                                }}
                                                            >
                                                                <input
                                                                    id={`file-input-reorder-${block.id}`}
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => handleImageSelect(e, block.id)}
                                                                    disabled={loading}
                                                                />
                                                                <Upload size={20} className="text-gray-300 pointer-events-none" />
                                                            </div>
                                                        )}

                                                        {!readOnly && onImageDelete && block.image && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteImage(e, block.id);
                                                                }}
                                                                disabled={loading || deletingId === block.id}
                                                                className="absolute cursor-pointer bottom-2 left-2 p-1.5 hover:scale-110 transition-transform disabled:opacity-50 z-30 bg-red-500 hover:bg-red-600 shadow-md rounded-full"
                                                            >
                                                                {deletingId === block.id ? (
                                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <X size={14} className="text-white" strokeWidth={2.5} />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {/* Botón AGREGAR */}
                                        {canAddMore && onImageAdd && blocks.length < IMAGES_TO_SHOW && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    document.getElementById('add-new-block-input')?.click();
                                                }}
                                                className="w-[120px] h-[150px] border-2 border-dashed border-green-400 rounded-xl flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer group "
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

                                                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center group-hover:scale-110 transition-transform pointer-events-none">
                                                    <Plus size={24} className="text-green-700" />
                                                </div>
                                                <span className="text-xs font-medium text-green-700 pointer-events-none">Nueva</span>
                                            </div>
                                        )}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                ) : (
                    <div
                        className="relative cursor-grab active:cursor-grabbing rounded-2xl p-6 shadow-sm border border-gray-100"
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
                                    {/* Efecto Polaroid */}
                                    <div
                                        className="relative w-[140px] h-[185px] bg-white rounded-sm shadow-2xl group hover:scale-105 transition-all duration-300"
                                        onClick={(e) => {
                                            if (!readOnly && block.image) {
                                                e.stopPropagation();
                                                setIsReordering(true);
                                            }
                                        }}
                                    >
                                        {/* Borde interno estilo polaroid */}
                                        <div className="p-2 h-full">
                                            <div className="relative w-full h-[135px] rounded-sm overflow-hidden mb-2 bg-gray-50">
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

                                                        {/* Botón Organizar */}
                                                        {!readOnly && position === 0 && (
                                                            <div className="absolute top-2 right-2 z-30 animate-pulse pointer-events-none">
                                                                <div className="bg-white border-2 border-gray-800 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1 shadow-lg text-[10px] font-bold">
                                                                    <Grid size={10} />
                                                                    <span>ORGANIZAR</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!readOnly && (
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                <span className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium shadow-xl">
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
                                                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-300 gap-2 rounded-sm"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleImageSelect(e, block.id)}
                                                                disabled={loading}
                                                            />
                                                            <Upload size={24} className="text-gray-400" />
                                                            <span className="text-[10px] text-gray-400 font-medium">Subir</span>
                                                        </label>
                                                    )
                                                )}
                                            </div>

                                            {/* Espacio inferior estilo polaroid con líneas */}
                                            <div className="space-y-1 flex flex-col items-center">
                                                <div className="w-20 h-0.5 bg-gray-400 rounded"></div>
                                                <div className="w-16 h-0.5 bg-gray-300 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {blocks.length > IMAGES_TO_SHOW && (
                            <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToPrev();
                                    }}
                                    className="mr-3 cursor-pointer w-10 h-10 flex items-center justify-center transition-all duration-200 group"
                                    aria-label="Imagen anterior"
                                >
                                    <MoveLeft
                                        size={20}
                                        className="text-gray-700 hover:text-gray-900"
                                        strokeWidth={2.5}
                                    />
                                </button>

                                {blocks.map((_, index) => (
                                    <button
                                        key={`indicator-${index}`}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`transition-all ${
                                            index === currentIndex
                                                ? 'w-6 h-1.5 bg-gray-700 rounded-full'
                                                : 'w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400'
                                        }`}
                                    />
                                ))}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToNext();
                                    }}
                                    className="ml-3 cursor-pointer w-10 h-10 flex items-center justify-center transition-all duration-200 group"
                                    aria-label="Imagen siguiente"
                                >
                                    <MoveRight
                                        size={20}
                                        className="text-gray-700 hover:text-gray-900"
                                        strokeWidth={2.5}
                                    />
                                </button>
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

            <style>{`
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default GalleryGrid;