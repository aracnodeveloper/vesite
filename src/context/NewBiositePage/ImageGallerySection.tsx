import { useState, useEffect, useRef } from "react";
import { MoveLeft, MoveRight } from "lucide-react";
import ImageGalleryModal from "../../components/global/Gallery/ImageGalleryModal";

export const ImageGallerySection = ({
                                        textBlocks,
                                        isExposedRoute,
                                        themeConfig,
                                        handleGalleryClick
                                    }: any) => {
    const blocksWithImages = textBlocks.filter((block: any) => block.image);

    if (blocksWithImages.length === 0) {
        return null;
    }

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const isDragging = useRef(false);

    const IMAGES_TO_SHOW = 3;
    const DRAG_THRESHOLD = 30;

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % blocksWithImages.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + blocksWithImages.length) % blocksWithImages.length);
    };

    const handleTouchStart = (e: any) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = e.touches[0].clientX;
        isDragging.current = false;
    };

    const handleTouchMove = (e: any) => {
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

    const handleMouseDown = (e: any) => {
        touchStartX.current = e.clientX;
        touchEndX.current = e.clientX;
        isDragging.current = false;
    };

    const handleMouseMove = (e: any) => {
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

    const getRotation = (position: number) => {
        const rotations = [-4, 0, 4, 5, 8, -6, 6, -3, 3];
        return rotations[position % rotations.length];
    };

    const getVisibleBlocks = () => {
        if (blocksWithImages.length === 0) return [];
        const visible = [];
        for (let i = 0; i < IMAGES_TO_SHOW; i++) {
            const index = (currentIndex + i) % blocksWithImages.length;
            visible.push({ block: blocksWithImages[index], position: i });
        }
        return visible;
    };

    const visibleBlocks = getVisibleBlocks();

    const handleCarouselClick = () => {
        if (!isExposedRoute) {
            handleGalleryClick();
        } else {
            setModalImageIndex(currentIndex);
            setShowModal(true);
        }
    };

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
            ? "text-black invert brightness-0 contrast-100"
            : "text-black";
    };

    return (
        <>
            <div className="px-4 pb-4">
                <div className="relative">
                    {/* Container del carrusel */}
                    <div
                        className="relative cursor-grab active:cursor-grabbing"
                        onClick={handleCarouselClick}
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
                                            ? `rotate(${getRotation(position)}deg) translateX(${(position - 1) * 80}px) scale(1)`
                                            : `rotate(0deg) translateX(0px) scale(0.5)`,
                                        zIndex: IMAGES_TO_SHOW - position,
                                        opacity: isMounted ? 1 : 0,
                                    }}
                                    onMouseDown={(e: any) => e.stopPropagation()}
                                    onTouchStart={(e: any) => e.stopPropagation()}
                                >
                                    {/* Efecto Polaroid */}
                                    <div className="relative w-[120px] h-[150px] bg-white rounded-sm shadow-2xl hover:scale-105 transition-all duration-300">
                                        {/* Borde interno estilo polaroid */}
                                        <div className="p-2 h-full">
                                            <div className="relative w-full h-[110px] rounded-sm overflow-hidden mb-2 bg-gray-50">
                                                <img
                                                    src={block.image}
                                                    alt={block.title || `Imagen ${position + 1}`}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>

                                            {/* Espacio inferior estilo polaroid con líneas */}
                                            <div className="space-y-1 flex flex-col items-center">
                                                <div className="w-16 h-0.5 bg-gray-400 rounded"></div>
                                                <div className="w-12 h-0.5 bg-gray-300 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Indicadores de paginación con navegación */}
                        {blocksWithImages.length > IMAGES_TO_SHOW && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToPrev();
                                    }}
                                    className="mr-3 cursor-pointer z-30 w-10 h-10 flex items-center justify-center transition-all duration-200 group"
                                    aria-label="Imagen anterior"
                                >
                                    <MoveLeft
                                        size={20}
                                        className={getIconClassName()}
                                        strokeWidth={2.5}
                                    />
                                </button>

                                {blocksWithImages.map((_: any, index: number) => (
                                    <button
                                        key={`indicator-${index}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentIndex(index);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            index === currentIndex
                                                ? 'bg-gray-700 w-6'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    />
                                ))}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToNext();
                                    }}
                                    className="ml-3 cursor-pointer z-30 w-10 h-10 flex items-center justify-center transition-all duration-200 group"
                                    aria-label="Imagen siguiente"
                                >
                                    <MoveRight
                                        size={20}
                                        className={getIconClassName()}
                                        strokeWidth={2.5}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de galería */}
            {showModal && isExposedRoute && (
                <ImageGalleryModal
                    images={blocksWithImages}
                    initialIndex={modalImageIndex}
                    onClose={() => setShowModal(false)}
                    themeConfig={themeConfig}
                />
            )}
        </>
    );
};