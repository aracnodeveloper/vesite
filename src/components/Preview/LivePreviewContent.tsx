import { useLivePreview } from "../../hooks/useLivePreview.ts";
import { usePreview } from "../../context/PreviewContext.tsx";
import type {SocialLink} from "../../interfaces/PreviewContext.ts";
import {AppDownloadButtons} from "../layers/AddMoreSections/App/AppDownloadButtons.tsx";

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

    const { getMusicEmbed, getSocialPost, getVideoEmbed } = usePreview();

    // Enhanced default avatar with better styling
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    // Get special content
    const musicEmbed = getMusicEmbed();
    const socialPost = getSocialPost();
    const videoEmbed = getVideoEmbed();

    const filterRealSocialLinks = (links: SocialLink[]) => {
        return links.filter(link => {
            if (!link.isActive) return false;

            // Excluir enlaces de música, video y posts sociales
            const excludedKeywords = [
                'spotify', 'music', 'apple music', 'soundcloud', 'audio',
                'youtube', 'video', 'vimeo', 'tiktok video',
                'post', 'publicacion', 'contenido',
                'music embed', 'video embed', 'social post',
                'embed', 'player'
            ];

            const labelLower = link.label.toLowerCase();
            const urlLower = link.url.toLowerCase();

            // Si el label o URL contiene palabras excluidas, no es un enlace social regular
            const isExcluded = excludedKeywords.some(keyword =>
                labelLower.includes(keyword) || urlLower.includes(keyword)
            );

            if (isExcluded) return false;

            // Verificar si es un enlace social válido usando findPlatformForLink
            const platform = findPlatformForLink(link);

            // Solo mostrar si encontramos una plataforma social válida
            return platform !== undefined && platform !== null;
        });
    };

// Luego reemplaza la línea donde usas socialLinksData con:
    const realSocialLinks = filterRealSocialLinks(socialLinksData);
    // Helper function to extract Spotify track ID
    const getSpotifyEmbedUrl = (url: string) => {
        const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
        if (trackMatch) {
            return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`;
        }
        return null;
    };

    // Helper function to extract YouTube video ID
    const getYouTubeEmbedUrl = (url: string) => {
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (videoIdMatch) {
            return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
        return null;
    };

    const isInstagramUrl = (url: string) => {
        return url.includes('instagram.com');
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

    const { title } = biosite;

    return (
        <div className="w-full bg-white" style={{ minHeight: '100vh' }}>

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
            <div className="relative pb-8">
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
                {realSocialLinks.length > 0 && (
                    <div className="px-4 mb-4">
                        <div className="flex justify-center items-center gap-3 flex-wrap">
                            {realSocialLinks.map((link) => {
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

                {/* Video Embed */}
                {videoEmbed && (
                    <div className="px-4 mb-4">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {getYouTubeEmbedUrl(videoEmbed.url) ? (
                                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                        src={getYouTubeEmbedUrl(videoEmbed.url)!}
                                        title={videoEmbed.label}
                                        className="absolute top-0 left-0 w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="p-4 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM6 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2V8zm6 4a1 1 0 100-2 1 1 0 000 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">{videoEmbed.label}</p>
                                    <a
                                        href={videoEmbed.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline mt-1 block"
                                    >
                                        Ver video
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Music Embed */}
                {musicEmbed && (
                    <div className="px-4 mb-4">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {getSpotifyEmbedUrl(musicEmbed.url) ? (
                                <iframe
                                    src={getSpotifyEmbedUrl(musicEmbed.url)!}
                                    width="100%"
                                    height="152"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    title={musicEmbed.label}
                                ></iframe>
                            ) : (
                                <div className="p-4 flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M18 3a1 1 0 00-1.196-.98L6 3.75c-.553.138-.954.63-.954 1.188V8.5a2.5 2.5 0 11-1.5 2.292V4.938A2.5 2.5 0 016.094 2.5L17.5 1a1 1 0 01.5.98v8.52a2.5 2.5 0 11-1.5 2.292V3z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{musicEmbed.label}</p>
                                        <a
                                            href={musicEmbed.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-green-600 hover:underline"
                                        >
                                            Escuchar música
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Social Post */}
                {socialPost && (
                    <div className="px-4 mb-4">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {isInstagramUrl(socialPost.url) ? (
                                <div className="p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{socialPost.label}</p>
                                            <p className="text-xs text-gray-500">Instagram Post</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                                        <div className="text-gray-500 mb-2">
                                            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <a
                                            href={socialPost.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline font-medium"
                                        >
                                            Ver en Instagram
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{socialPost.label}</p>
                                            <a
                                                href={socialPost.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Ver publicación
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Regular Links Section */}
                {regularLinksData.length > 0 && (
                    <div className="px-4 pb-8 space-y-2">
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
                <div className="mt-12">
                    <AppDownloadButtons />
                </div>
                <div className="h-12"></div>
            </div>
        </div>
    );
};

export default LivePreviewContent;
