import { X, MoveLeft, MoveRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const SWIPE_THRESHOLD = 50;
    const ANIMATION_DURATION = 300;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft" && !isZoomed) goToPrevious();
            if (e.key === "ArrowRight" && !isZoomed) goToNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, onClose, isZoomed]);

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

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isZoomed) return;
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isZoomed) return;
        setIsDragging(true);
        setStartX(e.clientX);
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

    const handleDoubleClick = () => {
        setIsZoomed(!isZoomed);
    };

    const currentImage = images[currentIndex];

    const isDarkTheme = () => {
        const backgroundColor = themeConfig.colors.background;

        if (backgroundColor.includes('gradient')) {
            const hexColors = backgroundColor.match(/#[0-9A-Fa-f]{6}/g);
            const rgbColors = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/g);

            let colors: { r: number; g: number; b: number }[] = [];

            if (hexColors) {
                colors = colors.concat(
                    hexColors.map(hex => {
                        const cleanHex = hex.replace('#', '');
                        return {
                            r: parseInt(cleanHex.substr(0, 2), 16),
                            g: parseInt(cleanHex.substr(2, 2), 16),
                            b: parseInt(cleanHex.substr(4, 2), 16)
                        };
                    })
                );
            }
            if (rgbColors) {
                colors = colors.concat(
                    rgbColors.map(rgb => {
                        const match = rgb.match(/(\d+)/g);
                        if (match && match.length >= 3) {
                            return {
                                r: parseInt(match[0]),
                                g: parseInt(match[1]),
                                b: parseInt(match[2])
                            };
                        }
                        return { r: 255, g: 255, b: 255 };
                    })
                );
            }

            if (colors.length === 0) {
                return false;
            }

            const avgLuminance = colors.reduce((sum, color) => {
                const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
                return sum + luminance;
            }, 0) / colors.length;

            return avgLuminance < 0.5;
        }

        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance < 0.5;
    };

    const getIconClassName = () => {
        return isDarkTheme()
            ? "text-white"
            : "text-white";
    };

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={onClose}
        >
            <div className="relative w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl max-h-[95vh] flex flex-col">
                {/* Header */}
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
                            className="p-1.5 sm:p-2 cursor-pointer rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md pointer-events-auto"
                            aria-label="Cerrar galería"
                        >
                            <X size={20} className="text-white sm:hidden" />
                            <X size={24} className="text-white hidden sm:block" />
                        </button>
                    </div>
                </div>

                {/* Contenedor de imágenes con efecto Polaroid */}
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
                    <div
                        className={`relative transition-all ${
                            isDragging ? "duration-0" : `duration-300`
                        } ${isZoomed ? "cursor-zoom-out" : isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                        style={{
                            transform: `translateX(${dragOffset}px) scale(${isZoomed ? 1.5 : 1})`,
                        }}
                        onDoubleClick={handleDoubleClick}
                    >
                        {/* Marco Polaroid */}
                        <div className="bg-white rounded-sm shadow-2xl p-3 sm:p-4 md:p-6 max-w-[90vw] sm:max-w-[85vw] md:max-w-4xl">
                            {/* Imagen */}
                            <div className="relative bg-gray-50 rounded-sm overflow-hidden mb-3 sm:mb-4 md:mb-6">
                                <img
                                    ref={imageRef}
                                    src={currentImage.image}
                                    alt={currentImage.title || `Imagen ${currentIndex + 1}`}
                                    className="w-full h-[50vh] sm:h-[60vh] md:h-[65vh] object-contain select-none pointer-events-none"
                                    draggable={false}
                                />
                            </div>

                            {/* Espacio inferior estilo polaroid */}
                            <div className="space-y-2 flex flex-col items-center pb-2">
                                {currentImage.title && !isZoomed ? (
                                    <p className="text-gray-700 text-center font-medium text-sm sm:text-base md:text-lg px-2">
                                        {currentImage.title}
                                    </p>
                                ) : (
                                    <>
                                        <div className="w-32 sm:w-40 md:w-48 h-0.5 bg-gray-400 rounded"></div>
                                        <div className="w-24 sm:w-32 md:w-40 h-0.5 bg-gray-300 rounded"></div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {images.length > 1 && !isZoomed && (
                        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
                            <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                <p className="text-black text-xs sm:text-sm font-medium">
                                    ← Desliza →
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Indicadores con navegación */}
                {images.length > 1 && !isZoomed && (
                    <div className="flex justify-center items-center gap-2 mt-4 mb-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            disabled={isTransitioning}
                            className="mr-3 sm:mr-5 cursor-pointer flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Imagen anterior"
                        >
                            <MoveLeft
                                size={20}
                                className={`${getIconClassName()} sm:w-6 sm:h-6`}
                                strokeWidth={2.5}
                            />
                        </button>

                        <div className="flex gap-2">
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
                                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                                        index === currentIndex
                                            ? "w-6 sm:w-8 h-2 bg-white shadow-lg"
                                            : "w-2 h-2 bg-white/40 hover:bg-white/60 hover:scale-125"
                                    }`}
                                    aria-label={`Ir a imagen ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            disabled={isTransitioning}
                            className="ml-3 sm:ml-5 cursor-pointer flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Imagen siguiente"
                        >
                            <MoveRight
                                size={20}
                                className={`${getIconClassName()} sm:w-6 sm:h-6`}
                                strokeWidth={2.5}
                            />
                        </button>
                    </div>
                )}

                {/* Tooltip de zoom */}
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