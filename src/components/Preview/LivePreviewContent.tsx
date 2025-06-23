import { usePreview } from "../../context/PreviewContext.tsx";
import { useState, useEffect } from "react";
import type { BiositeColors } from "../../interfaces/Biosite";

const LivePreviewContent = () => {
    const { biosite, loading, error } = usePreview();
    const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
    const [imageLoadStates, setImageLoadStates] = useState<{[key: string]: 'loading' | 'loaded' | 'error'}>({});

    const parseColors = (colors: string | BiositeColors | null | undefined): BiositeColors => {
        const defaultColors: BiositeColors = { primary: '#3B82F6', secondary: '#1F2937' };

        if (!colors) return defaultColors;

        if (typeof colors === 'string') {
            try {
                const parsed = JSON.parse(colors);
                return { ...defaultColors, ...parsed };
            } catch (e) {
                console.warn('Error parsing colors:', e);
                return defaultColors;
            }
        } else if (colors && typeof colors === 'object') {
            return { ...defaultColors, ...colors };
        }

        return defaultColors;
    };

    const isValidImageUrl = (url: string | null | undefined): boolean => {
        if (!url || typeof url !== 'string') return false;

        if (url.startsWith('data:')) {
            const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
            const isValid = dataUrlRegex.test(url);

            if (isValid) {
                const base64Part = url.split(',')[1];
                return base64Part && base64Part.length > 10;
            }
            return false;
        }

        try {
            const urlObj = new URL(url);
            const isHttps = ['http:', 'https:'].includes(urlObj.protocol);

            const blockedDomains = ['visitaecuador.com'];
            const isDomainBlocked = blockedDomains.some(domain => urlObj.hostname.includes(domain));

            return isHttps && !isDomainBlocked;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        setImageErrors({});
        setImageLoadStates({});
    }, [biosite?.id]);

    const handleImageLoad = (imageType: string) => {

        setImageLoadStates(prev => ({ ...prev, [imageType]: 'loaded' }));
        setImageErrors(prev => ({ ...prev, [imageType]: false }));
    };

    const handleImageError = (imageType: string, imageUrl?: string) => {

        setImageLoadStates(prev => ({ ...prev, [imageType]: 'error' }));
        setImageErrors(prev => ({ ...prev, [imageType]: true }));
    };

    const handleImageLoadStart = (imageType: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'loading' }));
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Cargando biosite...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                    <div className="text-red-500 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!biosite) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No hay biosite disponible</p>
                </div>
            </div>
        );
    }

    const { title, avatarImage, backgroundImage, links, colors } = biosite;
    const parsedColors = parseColors(colors);

    // Enhanced default avatar with better styling
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    // Validate images with enhanced logic
    const validBackgroundImage = isValidImageUrl(backgroundImage) && !imageErrors.background ? backgroundImage : null;
    const validAvatarImage = isValidImageUrl(avatarImage) && !imageErrors.avatar ? avatarImage : null;

    return (
        <div className="relative w-full h-full overflow-hidden bg-white">
            {/* Background Header */}

                {validBackgroundImage ? (
                    <div className="relative w-full h-full">
                        {imageLoadStates.background === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                        <img
                            src={validBackgroundImage}
                            alt="Background"
                            className="w-full h-full object-cover"
                            onLoadStart={() => handleImageLoadStart('background')}
                            onLoad={() => handleImageLoad('background')}
                            onError={() => handleImageError('background', backgroundImage)}
                            style={{
                                display: imageLoadStates.background === 'error' ? 'none' : 'block'
                            }}
                        />
                        {imageLoadStates.background === 'error' && (
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: parsedColors.primary || '#3B82F6' }}
                            >
                                <div className="text-white text-center">
                                    <div className="mb-2">
                                        <svg className="w-8 h-8 mx-auto opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold">{title || "Tu Biosite"}</h2>
                                    <p className="text-sm opacity-80">Imagen no disponible</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: parsedColors.primary || '#3B82F6' }}
                    >
                        <div className="text-white text-center">
                            <h2 className="text-lg font-bold">{title || "Tu Biosite"}</h2>
                            <p className="text-sm opacity-80">Imagen de portada</p>
                        </div>
                    </div>
                )}


            {/* Profile Avatar */}
            <div className="flex justify-center -mt-12 relative z-10">
                {validAvatarImage ? (
                    <div className="relative">
                        {imageLoadStates.avatar === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full border-4 border-white w-24 h-24">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                        <img
                            src={validAvatarImage}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                            onLoadStart={() => handleImageLoadStart('avatar')}
                            onLoad={() => handleImageLoad('avatar')}
                            onError={() => handleImageError('avatar', avatarImage)}
                            style={{
                                display: imageLoadStates.avatar === 'error' ? 'none' : 'block'
                            }}
                        />
                        {imageLoadStates.avatar === 'error' && (
                            <img
                                src={defaultAvatar}
                                alt="Avatar placeholder"
                                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                            />
                        )}
                    </div>
                ) : (
                    <img
                        src={defaultAvatar}
                        alt="Avatar placeholder"
                        className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                )}
            </div>

            {/* Profile Info */}
            <div className="text-center mt-4 px-4">
                <h1 className="text-xl font-bold text-gray-800">
                    {title || "Tu nombre aquí"}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                    bio.site/{biosite.slug || "tu-slug"}
                </p>
            </div>

            {/* Links Section */}
            <div className="mt-6 px-4 space-y-3">
                {links && links.length > 0 ? (
                    links
                        .filter(link => link.isActive)
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .slice(0, 5) // Show maximum 5 links in preview
                        .map((link) => (
                            <div
                                key={link.id}

                                className="w-full p-3 rounded-lg border-2 text-center transition-all hover:shadow-md cursor-pointer"
                                style={{
                                    borderColor: parsedColors.primary || '#3B82F6',
                                    color: parsedColors.primary || '#3B82F6'
                                }}
                                onClick={() => console.log('Link clicked:', link.url)}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    {link.icon && (
                                        <span className="text-sm">{link.icon}</span>
                                    )}
                                    <span className="font-medium text-sm truncate">{link.label}</span>
                                </div>
                                <p className="text-xs opacity-60 truncate mt-1">{link.url}</p>
                            </div>
                        ))
                ) : (
                    <div className="space-y-3">
                        {/* Placeholder links */}
                        <div
                            className="w-full p-3 rounded-lg border-2 text-center opacity-50"
                            style={{ borderColor: parsedColors.primary || '#3B82F6' }}
                        >
                            <span className="text-gray-500 text-sm">Agregar enlace</span>
                        </div>
                        <div
                            className="w-full p-3 rounded-lg border-2 text-center opacity-30"
                            style={{ borderColor: parsedColors.primary || '#3B82F6' }}
                        >
                            <span className="text-gray-400 text-sm">Agregar enlace</span>
                        </div>
                        <div
                            className="w-full p-3 rounded-lg border-2 text-center opacity-20"
                            style={{ borderColor: parsedColors.primary || '#3B82F6' }}
                        >
                            <span className="text-gray-400 text-sm">Agregar enlace</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pb-4 px-4">
                <p className="text-xs text-gray-400">
                    Creado con ❤️ en biosite
                </p>
            </div>
        </div>
    );
};

export default LivePreviewContent;