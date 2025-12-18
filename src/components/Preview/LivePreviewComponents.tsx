import type { BiositeThemeConfig } from "../../interfaces/Biosite.ts";
import imgPng5 from "../../assets/img/ve_logo.svg";
import React, { useState, useEffect, useRef } from "react";
import ImageGalleryModal from "../Gallery/ImageGalleryModal";

export const LoadingComponent = ({ themeConfig }: { themeConfig: BiositeThemeConfig }) => (
    <div className="w-full h-full p-5 flex items-center justify-center"
        style={{
            backgroundColor: themeConfig.colors.background,
            fontFamily: themeConfig.fonts.primary
        }}>
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"
                style={{ borderColor: themeConfig.colors.primary }}></div>
            <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                Cargando...
            </p>
        </div>
    </div>
);

export const ErrorComponent = ({ error, themeConfig }: { error: string, themeConfig: BiositeThemeConfig }) => (
    <div className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: themeConfig.colors.background }}>
        <div className="text-center p-4">
            <div className="mb-2" style={{ color: '#ef4444' }}>
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </div>
            <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                {error}
            </p>
        </div>
    </div>
);

const DEFAULT_BACKGROUND = "https://visitaecuador.com/bio-api/img/image-1753208386348-229952436.jpeg";

export const NoBiositeComponent = ({ themeConfig }: { themeConfig: BiositeThemeConfig }) => (
    <div className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: themeConfig.colors.background }}>
        <div className="text-center p-4">
            <div className="mb-2" style={{ color: themeConfig.colors.text, opacity: 0.6 }}>
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                </svg>
            </div>
            <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                No hay vesite disponible
            </p>
        </div>
    </div>
);

export const BackgroundSection = ({
    isExposedRoute,
    validBackgroundImage,
    imageLoadStates,
    handleImageLoadStart,
    handleImageLoad,
    handleImageError,
    biosite,
    themeConfig,
    handleImageClick
}: any) => (
    <div className={`relative w-full flex-shrink-0    ${isExposedRoute ? 'h-40' : 'h-40 '} ${!isExposedRoute ? '' : 'cursor-pointer'}`}
        onClick={handleImageClick}>
        {validBackgroundImage ? (
            <>
                <div className="relative z-50">
                    <div className="relative">
                        <img
                            src={imgPng5}
                            alt="vector"
                            className={`absolute ${isExposedRoute ? 'top-22' : 'top-22'}  right-0 w-[70px] sm:w-[70px] md:w-[70px] lg:w-[70px] xl:w-[70px] max-w-none`}
                        />
                    </div>
                </div>
                {imageLoadStates.background === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2"
                            style={{ borderColor: themeConfig.colors.primary }}></div>
                    </div>
                )}
                <img
                    src={validBackgroundImage}
                    alt="Background"
                    className={`w-full object-cover ${biosite.avatarImage === null ? 'bg-transparent/50' : ''}  ${isExposedRoute ? 'h-full' : 'h-full '}`}
                    onLoadStart={() => handleImageLoadStart('background')}
                    onLoad={() => handleImageLoad('background')}
                    onError={() => handleImageError('background', biosite.backgroundImage)}
                    style={{
                        display: imageLoadStates.background === 'error' ? 'none' : 'block',
                        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
                    }}
                />
                {/* Gradiente difuminado cuando no hay avatar */}

                <div
                    className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                    style={{
                        background: `linear-gradient(to bottom, transparent 30%, ${themeConfig.colors.background} 100%)`,
                        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
                    }}
                />
                {imageLoadStates.background === 'error' && (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            backgroundImage: `url(${DEFAULT_BACKGROUND})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >

                    </div>
                )}
            </>
        ) : (
            <div
                className="w-full h-full flex items-center justify-center"
                style={{
                    backgroundImage: `url(${DEFAULT_BACKGROUND})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    clipPath: 'ellipse(100% 80% at 50% 0%)',
                }}
            >

            </div>
        )}
    </div>
);

export const AvatarSection = ({
    isExposedRoute,
    validAvatarImage,
    imageLoadStates,
    handleImageLoadStart,
    handleImageLoad,
    handleImageError,
    biosite,
    themeConfig,
    defaultAvatar,
    handleImageClick
}: any) => {
    const defaultAvatars = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    return (

        <div
            className={`flex justify-center  ${biosite.avatarImage === null ? 'hidden' : ''} ${isExposedRoute ? '-mt-14' : '-mt-14'} relative z-10 mb-4 ${!isExposedRoute ? '' : 'cursor-pointer'}`}
            onClick={handleImageClick}>
            {validAvatarImage ? (
                <div className="relative">
                    {imageLoadStates.avatar === 'loading' && (
                        <div
                            className={`absolute inset-0 flex items-center justify-center rounded-full border-3 border-white ${isExposedRoute ? 'w-16 h-16' : 'w-16 h-16'}`}
                            style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                                style={{ borderColor: themeConfig.colors.primary }}></div>
                        </div>
                    )}
                    <img
                        src={validAvatarImage}
                        alt="Avatar"
                        className={`${isExposedRoute ? 'w-22 h-22' : 'w-22 h-22'} rounded-full border-3 border-white object-cover shadow-lg`}
                        onLoadStart={() => handleImageLoadStart('avatar')}
                        onLoad={() => handleImageLoad('avatar')}
                        onError={() => handleImageError('avatar', biosite.avatarImage)}
                        style={{
                            display: imageLoadStates.avatar === 'error' ? 'none' : 'block'
                        }}
                    />
                    {imageLoadStates.avatar === 'error' && (
                        <img
                            src={defaultAvatar}
                            alt="Avatar placeholder"
                            className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
                        />
                    )}
                </div>
            ) : (
                <img
                    src={defaultAvatar}
                    alt="Avatar placeholder"
                    className="w-20 h-20 rounded-full border-3 border-white object-cover shadow-lg mt-5"
                />
            )}

        </div>
    );
};
export const TwoSquareImagesSection = ({
    isExposedRoute,
    validBackgroundImage,
    validAvatarImage,
    imageLoadStates,
    handleImageLoadStart,
    handleImageLoad,
    handleImageError,
    biosite,
    themeConfig,
    defaultAvatar,
    handleImageClick
}: any) => (
    <div className="flex justify-center items-center gap-4 px-4 mb-6 mt-6">
        {/* Primera imagen cuadrada (Avatar) */}
        <div className={`relative ${!isExposedRoute ? 'cursor-pointer' : ''}`}
            onClick={handleImageClick}>
            {validAvatarImage ? (
                <>
                    {imageLoadStates.avatar === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg w-32 h-32">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                                style={{ borderColor: themeConfig.colors.primary }}></div>
                        </div>
                    )}
                    <img
                        src={validAvatarImage}
                        alt="Avatar"
                        className="w-32 h-32 rounded-lg object-cover shadow-lg"
                        onLoadStart={() => handleImageLoadStart('avatar')}
                        onLoad={() => handleImageLoad('avatar')}
                        onError={() => handleImageError('avatar', biosite.avatarImage)}
                        style={{
                            display: imageLoadStates.avatar === 'error' ? 'none' : 'block'
                        }}
                    />
                    {imageLoadStates.avatar === 'error' && (
                        <img
                            src={defaultAvatar}
                            alt="Avatar placeholder"
                            className="w-32 h-32 rounded-lg object-cover shadow-lg"
                        />
                    )}
                </>
            ) : (
                <img
                    src={defaultAvatar}
                    alt="Avatar placeholder"
                    className="w-32 h-32 rounded-lg object-cover shadow-lg"
                />
            )}

        </div>

        {/* Segunda imagen cuadrada (Background) */}
        <div className="relative">
            {validBackgroundImage ? (
                <>
                    {imageLoadStates.background === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg w-32 h-32">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                                style={{ borderColor: themeConfig.colors.primary }}></div>
                        </div>
                    )}
                    <img
                        src={validBackgroundImage}
                        alt="Background"
                        className="w-32 h-32 rounded-lg object-cover shadow-lg"
                        onLoadStart={() => handleImageLoadStart('background')}
                        onLoad={() => handleImageLoad('background')}
                        onError={() => handleImageError('background', biosite.backgroundImage)}
                        style={{
                            display: imageLoadStates.background === 'error' ? 'none' : 'block'
                        }}
                    />
                    {imageLoadStates.background === 'error' && (
                        <div className="w-32 h-32 rounded-lg flex items-center justify-center shadow-lg"
                            style={{
                                backgroundImage: `url(${DEFAULT_BACKGROUND})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}>
                            <div className="text-white text-center p-2 bg-black bg-opacity-50 rounded">
                                <svg className="w-6 h-6 mx-auto opacity-60 mb-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs opacity-80">No disponible</p>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="w-32 h-32 rounded-lg flex items-center justify-center shadow-lg"
                    style={{
                        backgroundImage: `url(${DEFAULT_BACKGROUND})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}>
                    <div className="text-white text-center p-2 bg-black bg-opacity-50 rounded">
                        <svg className="w-6 h-6 mx-auto opacity-60 mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs opacity-80">Portada</p>
                    </div>
                </div>
            )}
        </div>
    </div>
);

export const UserInfoSection = ({ biosite, user, description, themeConfig, isExposedRoute, handleUserInfoClick }: any) => (
    <div className={`text-center px-4 mb-4 ${!isExposedRoute ? 'cursor-pointer' : ''}`}
        onClick={handleUserInfoClick}>
        <h1 className="text-lg font-bold leading-tight"
            style={{
                color: themeConfig.colors.text,
                fontFamily: themeConfig.fonts.primary || themeConfig.fonts.secondary
            }}>
            {biosite.title || user?.name || "Tu nombre aquí"}
        </h1>

        <p className="text-md mt-2 px-2 leading-relaxed"
            style={{
                color: themeConfig.colors.text,
                opacity: 0.8,
                fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
            }}>
            {description}
        </p>
    </div>
);

export const SocialLinksSection = ({
    realSocialLinks,
    isExposedRoute,
    findPlatformForLink,
    handleSocialClick,
    themeConfig,
    handleSocialLinkClick
}: any) => {

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
            ? "w-6 h-6 invert brightness-0 contrast-100"
            : "w-6 h-6";
    };

    return (
        realSocialLinks.length > 0 && (
            <div className="px-4 mb-4">
                <div className="flex justify-center items-center gap-4 flex-wrap">
                    {realSocialLinks.map((link: any) => {
                        const platform = findPlatformForLink(link);

                        return isExposedRoute ? (
                            <button
                                key={link.id}
                                onClick={() => handleSocialLinkClick ? handleSocialLinkClick(link.id, link.url) : window.open(link.url, '_blank')}
                                className="w-5 h-5 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.20] active:scale-[0.98]"
                                style={{
                                    color: themeConfig.colors.text,
                                }}
                            >
                                {platform?.icon ? (
                                    <img
                                        src={platform.icon}
                                        alt={link.label}
                                        className={getIconClassName()}
                                        style={{ color: themeConfig.colors.text }}
                                    />
                                ) : (
                                    <span className="text-white text-sm">🔗</span>
                                )}
                            </button>
                        ) : (
                            <a
                                key={link.id}
                                href={undefined}
                                onClick={handleSocialClick}
                                className="w-5 h-5 gap-3 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.20] active:scale-[0.98]"
                                style={{
                                    color: themeConfig.colors.text,
                                }}
                            >
                                {platform?.icon ? (
                                    <img
                                        src={platform.icon}
                                        alt={link.label}
                                        className={getIconClassName()}
                                        style={{ color: themeConfig.colors.text }}
                                    />
                                ) : (
                                    <span className="text-white text-sm">🔗</span>
                                )}
                            </a>
                        );
                    })}
                </div>
            </div>
        )
    );
};

const placeholderLinkImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6' rx='6'/%3E%3Cpath d='M10 10h20v20H10z' fill='%23d1d5db'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%239ca3af'/%3E%3Cpath d='M12 28l8-6 8 6H12z' fill='%239ca3af'/%3E%3C/svg%3E";

export const RegularLinksSection = ({
    regularLinksData,
    isExposedRoute,
    handleLinksClick,
    themeConfig,
    handleLinkClick
}: any) => (
    regularLinksData.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
            {regularLinksData.map((link: any) => {
                return isExposedRoute ? (
                    <button
                        key={link.id}
                        onClick={() => handleLinkClick ? handleLinkClick(link.id, link.url) : window.open(link.url, '_blank')}
                        className="w-full p-2  text-center items-center shadow-lg transition-all flex flex-wrap duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            transform: themeConfig.isAnimated ? 'scale(1)' : 'none',
                            backgroundColor: themeConfig.colors.accent,
                            background: themeConfig.colors.accent
                        }}
                    >
                        {link.image && (
                            <div className="w-10 h-10  bg-white rounded-lg overflow-hidden mr-2 flex-shrink-0">
                                <img
                                    src={link.image}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {!link.image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden mr-2 flex-shrink-0">
                                <img
                                    src={placeholderLinkImage}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex flex-col justify-center ml-2 flex-1 text-left ">
                            <div className="flex items-center">
                                <span className="font-medium text-xs truncate">
                                    {link.title}
                                </span>
                            </div>
                        </div>


                    </button>
                ) : (
                    <a
                        key={link.id}
                        href={undefined}
                        onClick={handleLinksClick}
                        className="w-full p-2 items-center  text-center shadow-lg transition-all flex flex-wrap duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            transform: themeConfig.isAnimated ? 'scale(1)' : 'none',
                            backgroundColor: themeConfig.colors.accent,
                            background: themeConfig.colors.accent
                        }}
                    >
                        {link.image && (
                            <div className="w-10 h-10 rounded-lg bg-white overflow-hidden mr-2 flex-shrink-0">
                                <img
                                    key={link.id}
                                    src={link.image}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {!link.image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden mr-2 flex-shrink-0">
                                <img
                                    src={placeholderLinkImage}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex flex-col justify-center ml-2 flex-1 text-left ">
                            <div className="flex items-center">
                                <span className="font-medium text-md truncate">
                                    {link.title}
                                </span>
                            </div>
                        </div>

                    </a>
                );
            })}
        </div>
    )
);

export const ImageGallerySection = ({
    textBlocks,
    isExposedRoute,
    themeConfig,
    handleGalleryClick
}: any) => {
    // Filtrar solo bloques con imágenes
    const blocksWithImages = textBlocks.filter((block: any) => block.image);

    if (blocksWithImages.length === 0) {
        return null;
    }

    // Estados del carrusel
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    /**
     * Estado del modal de galería
     * 
     * - showModal: Controla si el modal está visible
     * - modalImageIndex: Índice de la imagen a mostrar en el modal
     * 
     * Solo se usa cuando isExposedRoute=true (visitante público)
     */
    const [showModal, setShowModal] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    // Referencias para touch/drag
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const isDragging = useRef(false);

    // Constantes
    const IMAGES_TO_SHOW = 3;
    const AUTO_SCROLL_INTERVAL = 3000;
    const DRAG_THRESHOLD = 30;

    // Efecto de entrada
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (blocksWithImages.length <= IMAGES_TO_SHOW || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % blocksWithImages.length);
        }, AUTO_SCROLL_INTERVAL);

        return () => clearInterval(interval);
    }, [blocksWithImages.length, isPaused]);

    // Funciones de navegación
    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % blocksWithImages.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + blocksWithImages.length) % blocksWithImages.length);
    };

    // Touch handlers
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

    // Mouse handlers
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

    // Rotaciones dinámicas
    const getRotation = (position: number) => {
        const rotations = [-8, -4, 0, 4, 8, -6, 6, -3, 3];
        return rotations[position % rotations.length];
    };

    // Calcular bloques visibles
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

    /**
     * Maneja el click en el carrusel
     * 
     * Lógica de control de acceso:
     * - Si !isExposedRoute (dueño): Ejecuta handleGalleryClick (navega al editor)
     * - Si isExposedRoute (visitante): Abre el modal de galería
     */
    const handleCarouselClick = () => {
        if (!isExposedRoute) {
            // Dueño: Navegar al editor
            handleGalleryClick();
        } else {
            // Visitante: Abrir modal con la imagen actual
            setModalImageIndex(currentIndex);
            setShowModal(true);
        }
    };

    return (
        <>
            <div className="px-4 pb-4">
                <div
                    className="relative cursor-pointer"
                    onClick={handleCarouselClick}
                >
                    {/* Título de la sección */}
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">


                        </div>
                        <div className="flex items-center space-x-2">


                        </div>
                    </div>

                    {/* Container del carrusel - FUNCIONAL como GalleryPage */}
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
                                            ? `rotate(${getRotation(position)}deg) translateX(${(position - 1) * 80}px) scale(1)`
                                            : `rotate(0deg) translateX(0px) scale(0.5)`,
                                        zIndex: IMAGES_TO_SHOW - position,
                                        opacity: isMounted ? 1 : 0,
                                    }}
                                    onMouseDown={(e: any) => e.stopPropagation()}
                                    onTouchStart={(e: any) => e.stopPropagation()}
                                >
                                    <div className="relative w-[120px] h-[150px] rounded-2xl overflow-hidden bg-white shadow-xl">
                                        <img
                                            src={block.image}
                                            alt={block.title || `Imagen ${position + 1}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Indicadores de paginación */}
                        {blocksWithImages.length > IMAGES_TO_SHOW && (
                            <div className="flex justify-center gap-2 mt-4">
                                {blocksWithImages.map((_: any, index: number) => (
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
                </div>
            </div>

            {/* Modal de galería para visitantes públicos */}
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
