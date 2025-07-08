import type {BiositeThemeConfig} from "../../../interfaces/Biosite.ts";

interface EmbedSectionProps {
    isExposedRoute: boolean;
    themeConfig: BiositeThemeConfig;
    musicEmbed: any;
    videoEmbed: any;
    socialPost: any;
    handleMusicClick: (e: React.MouseEvent) => void;
    handleVideoClick: (e: React.MouseEvent) => void;
    handleSocialPostClick: (e: React.MouseEvent) => void;
}

export const EmbedSection = ({
                                 isExposedRoute,
                                 themeConfig,
                                 musicEmbed,
                                 videoEmbed,
                                 socialPost,
                                 handleMusicClick,
                                 handleVideoClick,
                                 handleSocialPostClick
                             }: EmbedSectionProps) => {
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


    return (
        <>
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
                                         style={{backgroundColor: themeConfig.colors.accent || '#10b981'}}>
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M18 3a1 1 0 00-1.196-.98L6 3.75c-.553.138-.954.63-.954 1.188V8.5a2.5 2.5 0 11-1.5 2.292V4.938A2.5 2.5 0 016.094 2.5L17.5 1a1 1 0 01.5.98v8.52a2.5 2.5 0 11-1.5 2.292V3z"/>
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
                                style={{backgroundColor: 'rgba(0, 0, 0, 0.01)'}}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* VIDEO EMBED - SIEMPRE VISIBLE COMO IFRAME */}
            {videoEmbed && (
                <div className="px-4 mb-4">
                    <div className="relative rounded-lg shadow-md overflow-hidden"
                         style={{backgroundColor: themeConfig.colors.profileBackground || '#ffffff'}}>

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
                                         style={{backgroundColor: themeConfig.colors.accent || '#ef4444'}}>
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
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
                                style={{backgroundColor: 'rgba(0, 0, 0, 0.01)'}}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* SOCIAL POST EMBED - SIEMPRE VISIBLE COMO IFRAME */}
            {socialPost && (
                <div className="px-4 mb-4">
                    <div className="relative rounded-lg shadow-md overflow-hidden"
                         style={{backgroundColor: themeConfig.colors.profileBackground || '#ffffff'}}>

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
                                         style={{backgroundColor: themeConfig.colors.accent || '#8b5cf6'}}>
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                                                  clipRule="evenodd"/>
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
                                style={{backgroundColor: 'rgba(0, 0, 0, 0.01)'}}
                            />
                        )}
                    </div>
                </div>
            )}etSpotifyEmbedUrl(musicEmbed.url)
        </>
    );
};