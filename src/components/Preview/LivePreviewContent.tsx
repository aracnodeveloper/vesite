import { useLivePreview } from "../../hooks/useLivePreview.ts";
import { usePreview } from "../../context/PreviewContext.tsx";
import { useUser } from "../../hooks/useUser.ts";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import type {SocialLink} from "../../interfaces/PreviewContext.ts";
import {AppDownloadButtons} from "../layers/AddMoreSections/App/AppDownloadButtons.tsx";
import VCardButton from "../global/VCard/VCard.tsx";

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
    const { user, fetchUser, loading: userLoading, error: userError } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    // Determinar si estamos en la ruta expuesta
    const isExposedRoute = location.pathname === '/expoced';

    // Fetch user data when component mounts
    useEffect(() => {
        const userId = Cookies.get('userId');
        if (userId && !user) {
            fetchUser(userId);
        }
    }, [fetchUser, user]);

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

    // Funciones para manejar la navegación
    const handleMusicClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/music');
        }
    };

    const handleVideoClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/videos');
        }
    };

    const handleSocialPostClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/post');
        }
    };

    const handleLinksClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/links');
        }
    };
    const handleSocialClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/social');
        }
    };

    // Show loading state if either biosite or user is loading
    if (loading || userLoading) {
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
                        {loading ? 'Cargando biosite...' : 'Cargando usuario...'}
                    </p>
                </div>
            </div>
        );
    }

    // Show error state if there's an error
    if (error || userError) {
        return (
            <div className="w-full h-full flex items-center justify-center"
                 style={{ backgroundColor: themeConfig.colors.background }}>
                <div className="text-center p-4">
                    <div className="mb-2" style={{ color: '#ef4444' }}>
                        <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                        {error || userError}
                    </p>
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
    // Use user description if available, otherwise use a default
    const description = user?.description || user?.name || 'Tu descripción aquí';

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
                        {title || user?.name || "Tu nombre aquí"}
                    </h1>

                    <p className="text-sm mt-2 px-2 leading-relaxed"
                       style={{
                           color: themeConfig.colors.text,
                           opacity: 0.8,
                           fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                       }}>
                        {description}
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
                                        href={isExposedRoute ? link.url : undefined}
                                        target={isExposedRoute ? "_blank" : undefined}
                                        rel={isExposedRoute ? "noopener noreferrer" : undefined}
                                        onClick={isExposedRoute ? undefined : handleSocialClick}
                                        className={`w-5 h-5 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 ${!isExposedRoute ? 'cursor-pointer' : ''}`}
                                        style={{
                                            backgroundColor: 'gray' ,
                                            transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                                        }}
                                    >
                                        {platform?.icon ? (
                                            <img
                                                src={platform.icon}
                                                alt={link.label}
                                                className="w-4 h-4 filter brightness-0 invert"
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
                                href={isExposedRoute ? link.url : undefined}
                                target={isExposedRoute ? "_blank" : undefined}
                                rel={isExposedRoute ? "noopener noreferrer" : undefined}
                                onClick={isExposedRoute ? undefined : handleLinksClick}
                                className={`block w-full p-3 rounded-lg border-2 text-center transition-all flex flex-wrap duration-200 hover:shadow-md ${!isExposedRoute ? 'cursor-pointer' : ''}`}
                                style={{
                                    borderColor: themeConfig.colors.primary,
                                    backgroundColor: themeConfig.colors.profileBackground || 'transparent',
                                    transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                                }}
                            >
                                {link.image && (
                                    <div className="w-8 h-8 rounded-lg overflow-hidden mr-2 flex-shrink-0">
                                        <img
                                            src={link.image}
                                            alt={link.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                {!link.image && (
                                    <span className="text-xs mr-2">🔗</span>
                                )}
                                <div className="grid grid-cols-1 gap-1">
                                    <div className="flex items-center">
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
                                </div>
                            </a>

                        ))}
                    </div>
                )}

                {/* MÚSICA EMBED - SIEMPRE VISIBLE COMO IFRAME */}
                {musicEmbed && (
                    <div className="px-4 ">
                        <div className="relative rounded-lg shadow-md overflow-hidden"
                             >

                            {/* Iframe siempre visible */}
                            {getSpotifyEmbedUrl(musicEmbed.url) ? (
                                <div className="embed-container spotify-embed">
                                    <iframe
                                        src={getSpotifyEmbedUrl(musicEmbed.url)!}
                                        width="100%"
                                        height="100"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                        title={musicEmbed.label}
                                    ></iframe>
                                </div>
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
                                        <h3 className="font-medium text-sm truncate"
                                            style={{
                                                color: themeConfig.colors.text,
                                                fontFamily: themeConfig.fonts.primary
                                            }}>
                                            {musicEmbed.label}
                                        </h3>
                                        <p className="text-xs opacity-60 truncate mt-1"
                                           style={{
                                               color: themeConfig.colors.text,
                                               fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                                           }}>
                                            Música • {musicEmbed.url}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Overlay no interactivo cuando no estamos en la ruta expuesta */}
                            {!isExposedRoute && (
                                <div
                                    className="absolute inset-0 bg-transparent cursor-pointer z-10"
                                    onClick={handleMusicClick}
                                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* VIDEO EMBED - SIEMPRE VISIBLE COMO IFRAME */}
                {videoEmbed && (
                    <div className="px-4 mb-4">
                        <div className="relative rounded-lg shadow-md overflow-hidden"
                             style={{ backgroundColor: themeConfig.colors.profileBackground || '#ffffff' }}>

                            {/* Iframe siempre visible */}
                            {getYouTubeEmbedUrl(videoEmbed.url) ? (
                                <div className="embed-container video-embed">
                                    <iframe
                                        src={getYouTubeEmbedUrl(videoEmbed.url)!}
                                        width="100%"
                                        height="150"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        loading="lazy"
                                        title={videoEmbed.label}
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="p-4 flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center"
                                             style={{ backgroundColor: themeConfig.colors.accent || '#ef4444' }}>
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate"
                                            style={{
                                                color: themeConfig.colors.text,
                                                fontFamily: themeConfig.fonts.primary
                                            }}>
                                            {videoEmbed.label}
                                        </h3>
                                        <p className="text-xs opacity-60 truncate mt-1"
                                           style={{
                                               color: themeConfig.colors.text,
                                               fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                                           }}>
                                            Video • {videoEmbed.url}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Overlay no interactivo cuando no estamos en la ruta expuesta */}
                            {!isExposedRoute && (
                                <div
                                    className="absolute inset-0 bg-transparent cursor-pointer z-10"
                                    onClick={handleVideoClick}
                                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* SOCIAL POST EMBED - SIEMPRE VISIBLE COMO IFRAME */}
                {socialPost && (
                    <div className="px-4 mb-4">
                        <div className="relative rounded-lg shadow-md overflow-hidden"
                             style={{ backgroundColor: themeConfig.colors.profileBackground || '#ffffff' }}>

                            {/* Iframe siempre visible */}
                            {isInstagramUrl(socialPost.url) ? (
                                <div className="embed-container instagram-embed">
                                    <iframe
                                        src={getInstagramEmbedUrl(socialPost.url)!}
                                        width="100%"
                                        height="400"
                                        frameBorder="0"
                                        scrolling="no"
                                        allowTransparency
                                        loading="lazy"
                                        title={socialPost.label}
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="p-4 flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center"
                                             style={{ backgroundColor: themeConfig.colors.accent || '#8b5cf6' }}>
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate"
                                            style={{
                                                color: themeConfig.colors.text,
                                                fontFamily: themeConfig.fonts.primary
                                            }}>
                                            {socialPost.label}
                                        </h3>
                                        <p className="text-xs opacity-60 truncate mt-1"
                                           style={{
                                               color: themeConfig.colors.text,
                                               fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                                           }}>
                                            Post • {socialPost.url}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Overlay no interactivo cuando no estamos en la ruta expuesta */}
                            {!isExposedRoute && (
                                <div
                                    className="absolute inset-0 bg-transparent cursor-pointer z-10"
                                    onClick={handleSocialPostClick}
                                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                                />
                            )}
                        </div>
                    </div>
                )}
                <VCardButton
                    themeConfig={themeConfig}
                    userId={user?.id || Cookies.get('userId')}
                />
                <div className="mt-12">
                    <AppDownloadButtons />
                </div>
                <div className="h-5"></div>
            </div>
        </div>
    );
};

export default LivePreviewContent;
