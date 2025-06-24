import { useLivePreview } from "../../hooks/useLivePreview.ts";

const LivePreviewContent = () => {
    const {
        biosite,
        loading,
        error,
        imageLoadStates,
        handleImageLoad,
        handleImageError,
        handleImageLoadStart,
        parsedColors,
        regularLinksData,
        socialLinksData,
        validBackgroundImage,
        validAvatarImage,
        findPlatformForLink
    } = useLivePreview();

    // Enhanced default avatar with better styling
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

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

    const { title } = biosite;

    return (
        <div className="w-full min-h-full bg-white">
            {/* Background Header - Altura fija para móvil */}
            <div className="relative w-full h-48 flex-shrink-0">
                {validBackgroundImage ? (
                    <>
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
                            onError={() => handleImageError('background', biosite.backgroundImage)}
                            style={{
                                display: imageLoadStates.background === 'error' ? 'none' : 'block'
                            }}
                        />
                        {imageLoadStates.background === 'error' && (
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: parsedColors.primary || '#3B82F6' }}
                            >
                                <div className="text-white text-center p-4">
                                    <div className="mb-2">
                                        <svg className="w-6 h-6 mx-auto opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-base font-bold">{title || "Tu Biosite"}</h2>
                                    <p className="text-xs opacity-80">Imagen no disponible</p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: parsedColors.primary || '#3B82F6' }}
                    >
                        <div className="text-white text-center p-4">
                            <h2 className="text-base font-bold">{title || "Tu Biosite"}</h2>
                            <p className="text-xs opacity-80">Imagen de portada</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 relative">
                {/* Profile Avatar */}
                <div className="flex justify-center -mt-8 relative z-10 mb-4">
                    {validAvatarImage ? (
                        <div className="relative">
                            {imageLoadStates.avatar === 'loading' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full border-3 border-white w-16 h-16">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                </div>
                            )}
                            <img
                                src={validAvatarImage}
                                alt="Avatar"
                                className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
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
                            className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
                        />
                    )}
                </div>

                {/* Profile Info */}
                <div className="text-center px-4 mb-4">
                    <h1 className="text-lg font-bold text-gray-800 leading-tight">
                        {title || "Tu nombre aquí"}
                    </h1>
                    <p className="text-gray-600 text-xs mt-1">
                        bio.site/{biosite.slug || "tu-slug"}
                    </p>
                </div>

                {/* Social Media Icons */}
                {socialLinksData.length > 0 && (
                    <div className="px-4 mb-4">
                        <div className="flex justify-center items-center gap-3 flex-wrap">
                            {socialLinksData.map((link) => {
                                const platform = findPlatformForLink(link);

                                return (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
                                        style={{
                                            backgroundColor: platform?.color || '#3B82F6'
                                        }}
                                    >
                                        {platform?.icon ? (
                                            <img
                                                src={platform.icon}
                                                alt={link.label}
                                                className="w-5 h-5 filter brightness-0 invert"
                                            />
                                        ) : (
                                            <span className="text-white text-sm">
                                                🔗
                                            </span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Regular Links Section */}
                {regularLinksData.length > 0 && (
                    <div className="px-4 pb-6 space-y-2">
                        {regularLinksData.map(link => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full p-3 rounded-lg border-2 text-center transition-all duration-200 hover:shadow-md"
                                style={{ borderColor: parsedColors.primary, color: parsedColors.primary }}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <span className="text-xs">🔗</span>
                                    <span className="font-medium text-xs text-black truncate">{link.title}</span>
                                </div>
                                <p className="text-xs opacity-60 truncate text-gray-600 mt-1">{link.url}</p>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LivePreviewContent;