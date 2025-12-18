import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

/**
 * Modal moderno para visualizar imágenes de la galería con gestos táctiles
 * 
 * Características:
 * - Navegación con gestos táctiles (swipe)
 * - Navegación con arrastre del ratón
 * - Doble click para zoom
 * - Animaciones suaves y fluidas
 * - Diseño minimalista estilo Instagram/Pinterest
 * - Indicadores de posición elegantes
 * - Cierre con Escape o click en el fondo
 */

interface ImageGalleryModalProps {
    images: Array<{ id: string; image: string; title?: string }>;
    initialIndex?: number;
    onClose: () => void;
    themeConfig?: any;
}

export default function ImageGalleryModal({
    images,
    initialIndex = 0,
    onClose,
    themeConfig,
}: ImageGalleryModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [startX, setStartX] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showHint, setShowHint] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Constantes
    const SWIPE_THRESHOLD = 50; // Píxeles necesarios para cambiar de imagen
    const ANIMATION_DURATION = 300; // ms

    // Ocultar hint después de 3 segundos
    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Navegación con teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft" && !isZoomed) goToPrevious();
            if (e.key === "ArrowRight" && !isZoomed) goToNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, onClose, isZoomed]);

    // Prevenir scroll del body
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const goToNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setTimeout(() => setIsTransitioning(false), ANIMATION_DURATION);
    };

    const goToPrevious = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setTimeout(() => setIsTransitioning(false), ANIMATION_DURATION);
    };

    // Handlers táctiles
    const handleTouchStart = (e: React.TouchEvent) => {
        if (isZoomed) return;
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
        setShowHint(false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || isZoomed) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        setDragOffset(diff);
    };

    const handleTouchEnd = () => {
        if (!isDragging || isZoomed) return;
        setIsDragging(false);

        if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
            if (dragOffset > 0) {
                goToPrevious();
            } else {
                goToNext();
            }
        }

        setDragOffset(0);
    };

    // Handlers de ratón
    const handleMouseDown = (e: React.MouseEvent) => {
        if (isZoomed) return;
        setIsDragging(true);
        setStartX(e.clientX);
        setShowHint(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || isZoomed) return;
        const currentX = e.clientX;
        const diff = currentX - startX;
        setDragOffset(diff);
    };

    const handleMouseUp = () => {
        if (!isDragging || isZoomed) return;
        setIsDragging(false);

        if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
            if (dragOffset > 0) {
                goToPrevious();
            } else {
                goToNext();
            }
        }

        setDragOffset(0);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setDragOffset(0);
        }
    };

    // Doble click para zoom
    const handleDoubleClick = () => {
        setIsZoomed(!isZoomed);
    };

    const currentImage = images[currentIndex];

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={onClose}
        >
            {/* Contenedor del modal con tamaño limitado */}
            <div className="relative w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-6xl max-h-[95vh] flex flex-col">
                {/* Header con botón de cerrar y contador */}
                <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex justify-between items-center z-50 pointer-events-none">
                    <div className="flex-1" />
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-md">
                        <p className="text-white text-xs sm:text-sm font-medium tabular-nums">
                            {currentIndex + 1} / {images.length}
                        </p>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <button
                            onClick={onClose}
                            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md pointer-events-auto"
                            aria-label="Cerrar galería"
                        >
                            <X size={20} className="text-white sm:hidden" />
                            <X size={24} className="text-white hidden sm:block" />
                        </button>
                    </div>
                </div>

                {/* Contenedor de imágenes con gestos */}
                <div
                    ref={containerRef}
                    className="relative w-full h-full flex items-center justify-center overflow-hidden px-4 py-20"
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Imagen principal con efecto de arrastre */}
                    <div
                        className={`relative transition-all ${isDragging ? "duration-0" : `duration-300`
                            } ${isZoomed ? "cursor-zoom-out" : isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                        style={{
                            transform: `translateX(${dragOffset}px) scale(${isZoomed ? 1.8 : 1})`,
                        }}
                        onDoubleClick={handleDoubleClick}
                    >
                        <img
                            ref={imageRef}
                            src={currentImage.image}
                            alt={currentImage.title || `Imagen ${currentIndex + 1}`}
                            className="w-full h-[70vh] sm:h-[75vh] md:h-[80vh] object-contain rounded-xl select-none pointer-events-none shadow-2xl"
                            draggable={false}
                        />

                        {/* Título de la imagen (si existe) */}
                        {currentImage.title && !isZoomed && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 sm:p-6 rounded-b-xl">
                                <p className="text-white text-center font-medium text-base sm:text-lg drop-shadow-lg">
                                    {currentImage.title}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Hint visual para arrastrar */}
                    {showHint && images.length > 1 && !isZoomed && (
                        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
                            <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                <p className="text-white text-xs sm:text-sm font-medium">
                                    ← Desliza →
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Indicadores de posición minimalistas */}
                {images.length > 1 && !isZoomed && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isTransitioning) {
                                        setIsTransitioning(true);
                                        setCurrentIndex(index);
                                        setTimeout(() => setIsTransitioning(false), ANIMATION_DURATION);
                                    }
                                }}
                                className={`transition-all duration-300 rounded-full ${index === currentIndex
                                    ? "w-8 h-2 bg-white shadow-lg"
                                    : "w-2 h-2 bg-white/40 hover:bg-white/60 hover:scale-125"
                                    }`}
                                aria-label={`Ir a imagen ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Instrucción de zoom */}
                {!isZoomed && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <p className="text-white text-xs font-medium">
                                Doble click para zoom
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
