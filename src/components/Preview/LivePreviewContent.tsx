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

    const { getMusicEmbed, getSocialPost, getVideoEmbed, themeColor, fontFamily } = usePreview();

    const getThemeConfig = () => {
        if (biosite?.theme?.config) {
            return {
                colors: biosite.theme.config.colors || parsedColors,
                fonts: biosite.theme.config.fonts || { primary: fontFamily || 'Inter', secondary: fontFamily || 'Lato', third: fontFamily || 'Roboto', fourth: fontFamily || 'Poppins', fifth: fontFamily || 'Monstserrat', Sixth: fontFamily || 'OpenSans'},
                isDark: biosite.theme.config.isDark || false,
                isAnimated: biosite.theme.config.isAnimated || false
            };
        }

        return {
            colors: {
                primary: parsedColors.primary,
                secondary: parsedColors.secondary,
                accent: parsedColors.accent || parsedColors.primary,
                background: themeColor || '#ffffff',
                text: parsedColors.text || '#000000',
                profileBackground: parsedColors.profileBackground || themeColor || '#ffffff'
            },
            fonts: {
                primary: fontFamily || 'Inter',
                secondary: fontFamily || 'Lato',
                thrid: fontFamily || 'Roboto',
                fourth: fontFamily || 'Poppins',
                fifth: fontFamily || 'Monstserrat',
                Sixth: fontFamily || 'OpenSans',

            },
            isDark: false,
            isAnimated: false
        };
    };

    const themeConfig = getThemeConfig();

    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    const musicEmbed = getMusicEmbed();
    const socialPost = getSocialPost();
    const videoEmbed = getVideoEmbed();

    const filterRealSocialLinks = (links: SocialLink[]) => {
        return links.filter(link => {
            if (!link.isActive) return false;

            const excludedKeywords = [
                'spotify', 'music', 'apple music', 'soundcloud', 'audio',
                'youtube', 'video', 'vimeo', 'tiktok video',
                'post', 'publicacion', 'contenido',
                'music embed', 'video embed', 'social post',
                'embed', 'player'
            ];

            const labelLower = link.label.toLowerCase();
            const urlLower = link.url.toLowerCase();

            const isExcluded = excludedKeywords.some(keyword =>
                labelLower.includes(keyword) || urlLower.includes(keyword)
            );

            if (isExcluded) return false;

            const platform = findPlatformForLink(link);
            return platform !== undefined && platform !== null;
        });
    };

    const realSocialLinks = filterRealSocialLinks(socialLinksData);

    const getSpotifyEmbedUrl = (url: string) => {
        const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
        if (trackMatch) {
            return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`;
        }
        return null;
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (videoIdMatch) {
            return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
        return null;
    };

    const getInstagramEmbedUrl = (url: string) => {
        const postMatch = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
        if (postMatch) {
            return `https://www.instagram.com/p/${postMatch[1]}/embed/`;
        }
        return null;
    };

    const isInstagramUrl = (url: string) => {
        return url.includes('instagram.com') && (url.includes('/p/') || url.includes('/reel/'));
    };

    if (loading) {
        return (
            <div className="w-full h-full p-5 flex items-center justify-center"
                 style={{
                     backgroundColor: themeConfig.colors.background,
                     fontFamily: themeConfig.fonts.primary
                 }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"
                         style={{ borderColor: themeConfig.colors.primary }}></div>
                    <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                        Cargando biosite...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center"
                 style={{ backgroundColor: themeConfig.colors.background }}>
                <div className="text-center p-4">
                    <div className="mb-2" style={{ color: '#ef4444' }}>
                        <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-sm" style={{ color: themeConfig.colors.text }}>{error}</p>
                </div>
            </div>
        );
    }

    if (!biosite) {
        return (
            <div className="w-full h-full flex items-center justify-center"
                 style={{ backgroundColor: themeConfig.colors.background }}>
                <div className="text-center p-4">
                    <div className="mb-2" style={{ color: themeConfig.colors.text, opacity: 0.6 }}>
                        <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                        No hay biosite disponible
                    </p>
                </div>
            </div>
        );
    }

    const { title } = biosite;

    return (
        <div className="w-full"
             style={{
                 minHeight: '100vh',
                 backgroundColor: themeConfig.colors.background,
                 fontFamily: themeConfig.fonts.primary,
                 color: themeConfig.colors.text
             }}>

            <div className="relative w-full h-48 flex-shrink-0">
                {validBackgroundImage ? (
                    <>
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
                                style={{ backgroundColor: themeConfig.colors.primary }}
                            >
                                <div className="text-white text-center p-4">
                                    <div className="mb-2">
                                        <svg className="w-6 h-6 mx-auto opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-base font-bold" style={{ fontFamily: themeConfig.fonts.primary }}>
                                        {title || "Tu Biosite"}
                                    </h2>
                                    <p className="text-xs opacity-80">Imagen no disponible</p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: themeConfig.colors.primary }}
                    >
                        <div className="text-white text-center p-4">
                            <h2 className="text-base font-bold" style={{ fontFamily: themeConfig.fonts.primary }}>
                                {title || "Tu Biosite"}
                            </h2>
                            <p className="text-xs opacity-80">Imagen de portada</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative pb-8">
                <div className="flex justify-center -mt-12 relative z-10 mb-4">
                    {validAvatarImage ? (
                        <div className="relative">
                            {imageLoadStates.avatar === 'loading' && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full border-3 border-white w-16 h-16"
                                     style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                                         style={{ borderColor: themeConfig.colors.primary }}></div>
                                </div>
                            )}
                            <img
                                src={validAvatarImage}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full border-3 border-white object-cover shadow-lg"
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

                <div className="text-center px-4 mb-4">
                    <h1 className="text-lg font-bold leading-tight"
                        style={{
                            color: themeConfig.colors.text,
                            fontFamily: themeConfig.fonts.primary || themeConfig.fonts.secondary
                        }}>
                        {title || "Tu nombre aquí"}
                    </h1>
                    <p className="text-xs mt-1"
                       style={{
                           color: themeConfig.colors.text,
                           opacity: 0.7,
                           fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                       }}>
                        bio.site/{biosite.slug || "tu-slug"}
                    </p>
                </div>

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
                                            backgroundColor: platform?.color || themeConfig.colors.accent,
                                            transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                                        }}
                                    >
                                        {platform?.icon ? (
                                            <img
                                                src={platform.icon}
                                                alt={link.label}
                                                className="w-5 h-5 filter brightness-0 invert"
                                            />
                                        ) : (
                                            <span className="text-white text-sm">🔗</span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {regularLinksData.length > 0 && (
                    <div className="px-4 pb-8 space-y-2">
                        {regularLinksData.map(link => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full p-3 rounded-lg border-2 text-center transition-all duration-200 hover:shadow-md"
                                style={{
                                    borderColor: themeConfig.colors.primary,
                                    backgroundColor: themeConfig.colors.profileBackground || 'transparent',
                                    transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                                }}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <span className="text-xs">🔗</span>
                                    <span className="font-medium text-xs truncate"
                                          style={{
                                              color: themeConfig.colors.text,
                                              fontFamily: themeConfig.fonts.primary
                                          }}>
                                        {link.title}
                                    </span>
                                </div>
                                <p className="text-xs opacity-60 truncate mt-1"
                                   style={{
                                       color: themeConfig.colors.text,
                                       fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                                   }}>
                                    {link.url}
                                </p>
                            </a>
                        ))}
                    </div>
                )}

                {musicEmbed && (
                    <div className="px-4 mb-4">
                        <div className="rounded-lg shadow-md overflow-hidden"
                             style={{ backgroundColor: themeConfig.colors.profileBackground || '#ffffff' }}>
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
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center"
                                             style={{ backgroundColor: themeConfig.colors.accent || '#10b981' }}>
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M18 3a1 1 0 00-1.196-.98L6 3.75c-.553.138-.954.63-.954 1.188V8.5a2.5 2.5 0 11-1.5 2.292V4.938A2.5 2.5 0 016.094 2.5L17.5 1a1 1 0 01.5.98v8.52a2.5 2.5 0 11-1.5 2.292V3z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate"
                                           style={{
                                               color: themeConfig.colors.text,
                                               fontFamily: themeConfig.fonts.primary
                                           }}>
                                            {musicEmbed.label}
                                        </p>
                                        <a
                                            href={musicEmbed.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs hover:underline"
                                            style={{ color: themeConfig.colors.accent || '#10b981' }}
                                        >
                                            Escuchar música
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {socialPost && (
                    <div className="px-4 mb-4">
                        <div className="rounded-lg shadow-md overflow-hidden"
                             style={{ backgroundColor: themeConfig.colors.profileBackground || '#ffffff' }}>
                            {isInstagramUrl(socialPost.url) && getInstagramEmbedUrl(socialPost.url) ? (
                                <iframe
                                    src={getInstagramEmbedUrl(socialPost.url)!}
                                    width="100%"
                                    height="500"
                                    frameBorder="0"
                                    scrolling="no"
                                    allowTransparency={true}
                                    allow="encrypted-media"
                                    title={socialPost.label}
                                    style={{ border: 'none', overflow: 'hidden' }}
                                ></iframe>
                            ) : (
                                <div className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                             style={{ backgroundColor: themeConfig.colors.primary }}>
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium"
                                               style={{
                                                   color: themeConfig.colors.text,
                                                   fontFamily: themeConfig.fonts.primary
                                               }}>
                                                {socialPost.label}
                                            </p>
                                            <a
                                                href={socialPost.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs hover:underline"
                                                style={{ color: themeConfig.colors.primary }}
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


                {videoEmbed && (
                    <div className="px-4 mb-4">
                        <div className="rounded-lg shadow-md overflow-hidden"
                             style={{ backgroundColor: themeConfig.colors.profileBackground || '#ffffff' }}>
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
                                    <div className="mb-2" style={{ color: themeConfig.colors.text, opacity: 0.6 }}>
                                        <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM6 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2V8zm6 4a1 1 0 100-2 1 1 0 000 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium"
                                       style={{
                                           color: themeConfig.colors.text,
                                           fontFamily: themeConfig.fonts.primary
                                       }}>
                                        {videoEmbed.label}
                                    </p>
                                    <a
                                        href={videoEmbed.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs hover:underline mt-1 block"
                                        style={{ color: themeConfig.colors.primary }}
                                    >
                                        Ver video
                                    </a>
                                </div>
                            )}
                        </div>
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
