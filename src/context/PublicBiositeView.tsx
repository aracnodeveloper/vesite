import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type {BiositeFull} from "../interfaces/Biosite";
import type { SocialLink, RegularLink, AppLink } from "../interfaces/PreviewContext";
import apiService from "../service/apiService";
import {
    BackgroundSection,
    AvatarSection,
    UserInfoSection,
    SocialLinksSection,
    RegularLinksSection,
    TwoSquareImagesSection,
} from '../components/Preview/LivePreviewComponents';
import VCardButton from "../components/global/VCard/VCard.tsx";
import ConditionalNavButton from "../components/ConditionalNavButton.tsx";
import { useTemplates } from "../hooks/useTemplates.ts";
import { useMemo } from 'react';
import {socialMediaPlatforms} from "../media/socialPlataforms.ts";
// import {usePreview} from "./PreviewContext.tsx";
import {useUser} from "../hooks/useUser.ts";

interface PublicBiositeData {
    biosite: BiositeFull;
    socialLinks: SocialLink[];
    regularLinks: RegularLink[];
    appLinks: AppLink[];
    musicEmbed?: any;
    socialPost?: any;
    videoEmbed?: any;
}

const PublicBiositeView = () => {
    const { slug } = useParams<{ slug: string }>();
    const [biositeData, setBiositeData] = useState<PublicBiositeData | null>(null);
    const {user}= useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageLoadStates, setImageLoadStates] = useState<{[key: string]: 'loading' | 'loaded' | 'error'}>({});
   // const {getMusicEmbed, getSocialPost, getVideoEmbed} = usePreview()

    const { templates, getTemplateById, getDefaultTemplate, isTemplatesLoaded } = useTemplates();

    const getIconIdentifier = (iconPath: string): string => {
        const iconMap: { [key: string]: string } = {
            '/assets/icons/instagram.svg': 'instagram',
            '/assets/icons/tiktok.svg': 'tiktok',
            '/assets/icons/X.svg': 'twitter',
            '/assets/icons/facebook.svg': 'facebook',
            '/assets/icons/twitch.svg': 'twitch',
            '/assets/icons/linkdl.svg': 'linkedin',
            '/assets/icons/snapchat.svg': 'snapchat',
            '/assets/icons/threads.svg': 'threads',
            '/assets/icons/gmail.svg': 'email',
            '/assets/icons/pinterest.svg': 'pinterest',
            '/assets/icons/spottufy.svg': 'spotify',
            '/assets/icons/music.svg': 'apple-music',
            '/assets/icons/discord.svg': 'discord',
            '/assets/icons/tumblr.svg': 'tumblr',
            '/assets/icons/whatsapp.svg': 'whatsapp',
            '/assets/icons/telegram.svg': 'telegram',
            '/assets/icons/amazon.svg': 'amazon',
            '/assets/icons/onlyfans.svg': 'onlyfans',
            '/assets/icons/appstore.svg': 'appstore',
            '/assets/icons/googleplay.svg': 'googleplay'
        };

        // Si es exactamente "link", devolver "link"
        if (iconPath === 'link') {
            return 'link';
        }

        // Si es exactamente "social-post", devolver "social-post"
        if (iconPath === 'social-post') {
            return 'social-post';
        }

        // Si es exactamente "music-embed", devolver "music-embed"
        if (iconPath === 'music-embed') {
            return 'music-embed';
        }

        // Si es exactamente "video-embed", devolver "video-embed"
        if (iconPath === 'video-embed') {
            return 'video-embed';
        }

        const fullPath = Object.keys(iconMap).find(path => path.includes(iconPath));
        if (fullPath) return iconMap[fullPath];

        const fileName = iconPath.split('/').pop()?.replace('.svg', '') || 'link';
        return fileName.toLowerCase();
    };

    const isAppStoreLink = (link: any): boolean => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        return (
            labelLower.includes('app store') ||
            labelLower.includes('appstore') ||
            urlLower.includes('apps.apple.com') ||
            labelLower.includes('google play') ||
            labelLower.includes('googleplay') ||
            urlLower.includes('play.google.com')
        );
    };

    const getStoreType = (link: any): 'appstore' | 'googleplay' => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (labelLower.includes('google play') || urlLower.includes('play.google.com')) {
            return 'googleplay';
        }
        return 'appstore';
    };

    const isSocialLink = (link: any): boolean => {
        const iconIdentifier = getIconIdentifier(link.icon);
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        // Lista de plataformas sociales conocidas
        const socialPlatforms = [
            'instagram', 'tiktok', 'x', 'facebook', 'twitch',
            'linkedin', 'snapchat', 'threads', 'pinterest', 'discord',
            'tumblr', 'whatsapp', 'telegram', 'onlyfans'
        ];

        if (socialPlatforms.includes(iconIdentifier)) {
            return true;
        }

        const socialDomains = [
            'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'facebook.com',
            'twitch.tv', 'linkedin.com', 'snapchat.com', 'threads.net',
            'pinterest.com', 'discord.gg', 'discord.com', 'tumblr.com',
            'wa.me', 'whatsapp.com', 't.me', 'telegram.me', 'onlyfans.com'
        ];

        const hasSocialDomain = socialDomains.some(domain => {
            return urlLower.includes(`://${domain}/`) || urlLower.includes(`://www.${domain}/`) ||
                urlLower.includes(`://${domain}`) || urlLower.includes(`://www.${domain}`);
        });

        if (hasSocialDomain) {
            return true;
        }

        const exactSocialLabels = [
            'instagram', 'tiktok',  'twitter', 'twitter/x', 'x',  'facebook', 'twitch',
            'linkedin', 'snapchat', 'threads', 'pinterest', 'discord', 'youtube',
            'tumblr', 'whatsapp', 'telegram', 'onlyfans'
        ];

        return exactSocialLabels.some(label => labelLower === label);
    };

    const isEmbedLink = (link: any): boolean => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();
        const iconIdentifier = getIconIdentifier(link.icon);

        if (iconIdentifier === 'social-post' || iconIdentifier === 'music-embed' || iconIdentifier === 'video-embed') {
            return true;
        }

        const embedLabels = [
            'music embed', 'video embed', 'social post', 'embed', 'player',
            'spotify track', 'youtube video','youtube.com/watch' ,'instagram post', 'music/podcast'
        ];

        const hasEmbedLabel = embedLabels.some(embedLabel => labelLower.includes(embedLabel));

        if (hasEmbedLabel) {
            return true;
        }

        const isSpotifyTrack = urlLower.includes('spotify.com/track/');
        const isYouTubeVideo = urlLower.includes('youtube.com/watch') || urlLower.includes('youtu.be/');
        const isInstagramPost = urlLower.includes('instagram.com/p/') || urlLower.includes('instagram.com/reel/');

        return isSpotifyTrack || isYouTubeVideo || isInstagramPost;
    };

    const getEmbedType = (link: any): 'music' | 'social-post' | 'video' | null => {
        const iconIdentifier = getIconIdentifier(link.icon);
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (iconIdentifier === 'music-embed' || iconIdentifier === 'music') {
            return 'music';
        }
        if (iconIdentifier === 'social-post') {
            return 'social-post';
        }
        if (iconIdentifier === 'video-embed' || iconIdentifier === 'video') {
            return 'video';
        }

        if (labelLower.includes('music') || labelLower.includes('podcast')) {
            return 'music';
        }
        if (labelLower.includes('social post') || labelLower.includes('post')) {
            return 'social-post';
        }
        if (labelLower.includes('video')) {
            return 'video';
        }

        // Verificar por URL
        if (urlLower.includes('spotify.com/track/')) {
            return 'music';
        }
        if (urlLower.includes('instagram.com/p/') || urlLower.includes('instagram.com/reel/')) {
            return 'social-post';
        }
        if (urlLower.includes('youtube.com/watch') || urlLower.includes('youtu.be/')) {
            return 'video';
        }

        return null;
    };

    const processLinks = (links: any) => {
        const socialLinks: SocialLink[] = [];
        const regularLinks: RegularLink[] = [];
        const appLinks: AppLink[] = [];
        let musicEmbed: any = null;
        let socialPost: any = null;
        let videoEmbed: any = null;

        links.forEach(link => {
            const iconIdentifier = getIconIdentifier(link.icon);

            if (isAppStoreLink(link)) {
                // Enlaces de tiendas de aplicaciones
                appLinks.push({
                    id: link.id,
                    store: getStoreType(link),
                    url: link.url,
                    isActive: link.isActive
                });
            } else if (isEmbedLink(link)) {
                // Procesar embeds
                const embedType = getEmbedType(link);
                console.log('Embed detected:', link.label, 'Type:', embedType);

                if (embedType === 'music') {
                    musicEmbed = link;
                } else if (embedType === 'social-post') {
                    socialPost = link;
                } else if (embedType === 'video') {
                    videoEmbed = link;
                }
            } else if (isSocialLink(link)) {
                socialLinks.push({
                    id: link.id,
                    label: link.label,
                    name: link.label,
                    url: link.url,
                    icon: iconIdentifier,
                    color: link.color || '#3B82F6',
                    isActive: link.isActive
                });
            } else {
                regularLinks.push({
                    id: link.id,
                    title: link.label,
                    url: link.url,
                    image: link.image,
                    orderIndex: link.orderIndex || 0,
                    isActive: link.isActive
                });
            }
        });

        return {
            socialLinks,
            regularLinks: regularLinks.sort((a, b) => a.orderIndex - b.orderIndex),
            appLinks,
            musicEmbed,
            socialPost,
            videoEmbed
        };
    };

    // Handlers de imágenes para la vista pública
    const handleImageLoad = (imageType: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'loaded' }));
    };

    const handleImageError = (imageType: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'error' }));
    };

    const handleImageLoadStart = (imageType: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'loading' }));
    };

    // Función para validar URLs de imagen
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
            return isHttps;
        } catch {
            return false;
        }
    };

    const currentTemplate = useMemo(() => {
        if (!isTemplatesLoaded || !templates.length) {
            return undefined;
        }

        if (biositeData?.biosite?.themeId &&
            biositeData.biosite.themeId !== 'null' &&
            biositeData.biosite.themeId !== null &&
            biositeData.biosite.themeId !== undefined &&
            biositeData.biosite.themeId.trim() !== '') {

            const template = getTemplateById(biositeData.biosite.themeId);
            if (template) {
                return template;
            }
        }

        return getDefaultTemplate();
    }, [biositeData?.biosite?.themeId, templates, isTemplatesLoaded, getTemplateById, getDefaultTemplate]);

    useEffect(() => {
        const fetchBiositeBySlug = async () => {
            if (!slug) {
                setError("No se proporcionó un slug válido");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const biosite = await apiService.getById<BiositeFull>('/biosites/slug', slug);

                if (!biosite) {
                    setError("Biosite no encontrado");
                    setLoading(false);
                    return;
                }

                const { socialLinks, regularLinks, appLinks, musicEmbed, socialPost, videoEmbed } = processLinks(biosite.links);

                setBiositeData({
                    biosite,
                    socialLinks,
                    regularLinks,
                    appLinks,
                    musicEmbed,
                    socialPost,
                    videoEmbed
                });

            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar el biosite";
                setError(errorMessage);
                console.error('Error fetching biosite by slug:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBiositeBySlug();
    }, [slug]);

    if (loading || !isTemplatesLoaded) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando biosite...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Biosite no encontrado</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Ir al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!biositeData || !currentTemplate) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No se pudo cargar el biosite</p>
                </div>
            </div>
        );
    }

    // Configuración de tema para vista pública
    const getThemeConfig = () => {
        if (biositeData.biosite?.theme?.config) {
            return {
                colors: {
                    primary: biositeData.biosite.theme.config.colors.primary,
                    secondary: biositeData.biosite.theme.config.colors.secondary,
                    accent: biositeData.biosite.theme.config.colors.accent || biositeData.biosite.theme.config.colors.primary,
                    background: biositeData.biosite.theme.config.colors.background || '#ffffff',
                    text: biositeData.biosite.theme.config.colors.text || '#000000',
                    profileBackground: biositeData.biosite.theme.config.colors.profileBackground || '#ffffff'
                },
                fonts: {
                    primary: biositeData.biosite.theme.config.fonts.primary || 'Inter',
                    secondary: biositeData.biosite.theme.config.fonts.secondary || 'Lato'
                },
                isDark: biositeData.biosite.theme.config.isDark || false,
                isAnimated: biositeData.biosite.theme.config.isAnimated || false
            };
        }

        // Fallback a colores básicos
        const defaultColors = { primary: '#3B82F6', secondary: '#1F2937' };
        const parsedColors = biositeData.biosite.colors
            ? (typeof biositeData.biosite.colors === 'string'
                ? JSON.parse(biositeData.biosite.colors)
                : biositeData.biosite.colors)
            : defaultColors;

        return {
            colors: {
                primary: parsedColors.primary || defaultColors.primary,
                secondary: parsedColors.secondary || defaultColors.secondary,
                accent: parsedColors.accent || parsedColors.primary || defaultColors.primary,
                background: parsedColors.background || '#ffffff',
                text: parsedColors.text || '#000000',
                profileBackground: parsedColors.profileBackground || '#ffffff'
            },
            fonts: {
                primary: biositeData.biosite.fonts || 'Inter',
                secondary: 'Lato'
            },
            isDark: false,
            isAnimated: false
        };
    };

    const themeConfig = getThemeConfig();
    const isExposedRoute = true;
    const validBackgroundImage = isValidImageUrl(biositeData.biosite?.backgroundImage) ? biositeData.biosite?.backgroundImage : null;
    const validAvatarImage = isValidImageUrl(biositeData.biosite?.avatarImage) ? biositeData.biosite?.avatarImage : null;
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    const isSecondTemplate = currentTemplate.id === 'bc1452d1-a688-4567-a424-2a0f09103499' ||
        currentTemplate.index === 1 ||
        currentTemplate.name?.toLowerCase().includes('square') ||
        currentTemplate.name?.toLowerCase().includes('dos');

    const findPlatformForLink = (link: SocialLink) => {
        return socialMediaPlatforms.find(platform => {
            const linkLabelLower = link.label.toLowerCase();
            const platformNameLower = platform.name.toLowerCase();
            const platformIdLower = platform.id.toLowerCase();

            return (
                linkLabelLower === platformNameLower ||
                linkLabelLower.includes(platformIdLower) ||
                link.icon === platform.icon ||
                linkLabelLower.replace(/[^a-z0-9]/g, '') === platformNameLower.replace(/[^a-z0-9]/g, '')
            );
        });
    };

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

    const socialLinksData = biositeData.socialLinks.filter(link => link.isActive);
    const regularLinksData = biositeData.regularLinks.filter(link => link.isActive);

    // Usar los embeds del estado local en lugar de los hooks de PreviewContext
    const musicEmbed = biositeData.musicEmbed;
    const socialPost = biositeData.socialPost;
    const videoEmbed = biositeData.videoEmbed;

    const description = user?.description || user?.name || biositeData.biosite.title || 'Bio Site';

    return (
        <div className={`w-full min-h-screen flex items-center justify-center`}
             style={{
                 backgroundColor: themeConfig.colors.background,
                 fontFamily: themeConfig.fonts.primary,
                 color: themeConfig.colors.text
             }}>

            <div className={`w-full max-w-full min-h-screen mx-auto`}>
                {/* Layout condicional basado en la plantilla */}
                {isSecondTemplate ? (
                    // Template 2: Dos imágenes cuadradas
                    <>
                        <div className="w-full h-24" style={{ backgroundColor: themeConfig.colors.background }}></div>
                        <TwoSquareImagesSection
                            isExposedRoute={isExposedRoute}
                            validBackgroundImage={validBackgroundImage}
                            validAvatarImage={validAvatarImage}
                            imageLoadStates={imageLoadStates}
                            handleImageLoadStart={handleImageLoadStart}
                            handleImageLoad={handleImageLoad}
                            handleImageError={handleImageError}
                            biosite={biositeData.biosite}
                            themeConfig={themeConfig}
                            defaultAvatar={defaultAvatar}
                        />
                    </>
                ) : (
                    // Template 1: Layout por defecto
                    <>
                        <BackgroundSection
                            isExposedRoute={isExposedRoute}
                            validBackgroundImage={validBackgroundImage}
                            imageLoadStates={imageLoadStates}
                            handleImageLoadStart={handleImageLoadStart}
                            handleImageLoad={handleImageLoad}
                            handleImageError={handleImageError}
                            biosite={biositeData.biosite}
                            themeConfig={themeConfig}
                        />

                        <AvatarSection
                            isExposedRoute={isExposedRoute}
                            validAvatarImage={validAvatarImage}
                            imageLoadStates={imageLoadStates}
                            handleImageLoadStart={handleImageLoadStart}
                            handleImageLoad={handleImageLoad}
                            handleImageError={handleImageError}
                            biosite={biositeData.biosite}
                            themeConfig={themeConfig}
                            defaultAvatar={defaultAvatar}
                        />
                    </>
                )}

                {/* Contenido principal */}
                <div className={`w-full max-w-md mx-auto`}>
                    {/* Información del usuario */}
                    <UserInfoSection
                        biosite={biositeData.biosite}
                        user={user}
                        description={description}
                        themeConfig={themeConfig}
                    />

                    {/* Links sociales */}
                    <SocialLinksSection
                        realSocialLinks={socialLinksData}
                        findPlatformForLink={findPlatformForLink}
                        isExposedRoute={isExposedRoute}
                        themeConfig={themeConfig}
                    />

                    {/* Links regulares */}
                    <RegularLinksSection
                        regularLinksData={regularLinksData}
                        isExposedRoute={isExposedRoute}
                        themeConfig={themeConfig}
                    />


                    <VCardButton
                        themeConfig={themeConfig}
                        userId={biositeData.biosite.ownerId}// ✅ Este es el propietario del biosite público
                    />

                    {/* MÚSICA EMBED */}
                    {musicEmbed && musicEmbed.isActive && (
                        <div className="px-4 mb-4">
                            <div className="relative rounded-lg shadow-md overflow-hidden"
                                 style={{ backgroundColor:  '#ffffff' }}>

                                {getSpotifyEmbedUrl(musicEmbed.url) ? (
                                    <div className="embed-container spotify-embed">
                                        <iframe
                                            src={getSpotifyEmbedUrl(musicEmbed.url)!}
                                            width="100%"
                                            height={isExposedRoute ? "80" : "80"}
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
                            </div>
                        </div>
                    )}

                    {/* SOCIAL POST EMBED */}
                    {socialPost && socialPost.isActive && (
                        <div className="px-4 mb-4">
                            <div className="relative rounded-lg shadow-md overflow-hidden"
                                 style={{ backgroundColor: themeConfig.colors.profileBackground || '#ffffff' }}>

                                {isInstagramUrl(socialPost.url) ? (
                                    <div className="embed-container instagram-embed">
                                        <iframe
                                            src={getInstagramEmbedUrl(socialPost.url)!}
                                            width="100%"
                                            height={isExposedRoute ? "700" : "400"}
                                            frameBorder="0"
                                            scrolling="no"
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
                            </div>
                        </div>
                    )}

                    {/* VIDEO EMBED */}
                    {videoEmbed && videoEmbed.isActive && (
                        <div className="px-4 mb-4">
                            <div className="relative rounded-lg shadow-md overflow-hidden"
                                 style={{ backgroundColor: themeConfig.colors.profileBackground || '#ffffff' }}>

                                {getYouTubeEmbedUrl(videoEmbed.url) ? (
                                    <div className="embed-container video-embed">
                                        <iframe
                                            src={getYouTubeEmbedUrl(videoEmbed.url)!}
                                            width="100%"
                                            height={isExposedRoute ? "200" : "150"}
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
                            </div>
                        </div>
                    )}
                    <div className="mt-12">
                        <div className="flex flex-wrap gap-2 w-full max-w-md mx-auto">
                            {biositeData.appLinks.map((appLink) => (
                                <a
                                    key={appLink.id}
                                    href={appLink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex-1 bg-black hover:bg-gray-800 transition-colors rounded-lg p-0 flex flex-col items-center space-x-3 border border-gray-600 ${
                                        appLink.store === 'appstore' ? 'ml-2' : 'mr-2'
                                    }`}
                                >
                                    <div className="flex-shrink-0">
                                        {appLink.store === 'appstore' ? (
                                            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                            </svg>
                                        ) : (
                                            <svg className="w-8 h-8" viewBox="0 0 24 24">
                                                <defs>
                                                    <linearGradient id="playGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#00D4FF"/>
                                                        <stop offset="100%" stopColor="#0080FF"/>
                                                    </linearGradient>
                                                    <linearGradient id="playGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#FFCE00"/>
                                                        <stop offset="100%" stopColor="#FF8C00"/>
                                                    </linearGradient>
                                                    <linearGradient id="playGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#FF0080"/>
                                                        <stop offset="100%" stopColor="#FF0040"/>
                                                    </linearGradient>
                                                    <linearGradient id="playGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#40FF00"/>
                                                        <stop offset="100%" stopColor="#00C000"/>
                                                    </linearGradient>
                                                </defs>
                                                <path d="M3,20.5V3.5c0-0.6,0.4-1,1-1c0.2,0,0.3,0,0.4,0.1l11,8.5c0.4,0.3,0.5,0.8,0.2,1.2c-0.1,0.1-0.1,0.2-0.2,0.2l-11,8.5 C4.1,21.1,3.5,21,3.1,20.6C3,20.6,3,20.5,3,20.5z" fill="url(#playGradient1)"/>
                                                <path d="M20,12L15.5,9.5l-11-8.5C4.8,0.8,5.2,0.8,5.5,1l11.5,8.9C18.3,10.6,19.3,11.3,20,12z" fill="url(#playGradient2)"/>
                                                <path d="M20,12c-0.7,0.7-1.7,1.4-3,2.1L5.5,23c-0.3,0.2-0.7,0.2-1,0l11-8.5L20,12z" fill="url(#playGradient3)"/>
                                                <path d="M15.5,14.5L4.5,21c-0.2,0.1-0.4,0.1-0.6,0C4.1,20.9,4.2,20.7,4.4,20.5L15.5,9.5l4.5,2.5L15.5,14.5z" fill="url(#playGradient4)"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="text-lg font-semibold text-white">
                                            {appLink.store === 'appstore' ? 'App Store' : 'Google Play'}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <ConditionalNavButton
                        themeConfig={themeConfig}
                    />

                    {/* Espacio final */}
                    <div className="h-8"></div>
                </div>
            </div>
        </div>
    );
};

export default PublicBiositeView;
