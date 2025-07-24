import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type {BiositeFull, BiositeLink} from "../interfaces/Biosite";
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
import {usePreview} from "./PreviewContext.tsx";
import {useUser} from "../hooks/useUser.ts";

interface PublicBiositeData {
    biosite: BiositeFull;
    socialLinks: SocialLink[];
    regularLinks: RegularLink[];
    appLinks: AppLink[];
}

interface PublicUser {
    id: string;
    name: string;
    description?: string;
}

const PublicBiositeView = () => {
    const { slug } = useParams<{ slug: string }>();
    const [biositeData, setBiositeData] = useState<PublicBiositeData | null>(null);
    const {user}= useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageLoadStates, setImageLoadStates] = useState<{[key: string]: 'loading' | 'loaded' | 'error'}>({});
    const {socialLinks, regularLinks,getMusicEmbed, getSocialPost, getVideoEmbed} = usePreview()

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

    const processLinks = (links: any) => {
        const socialLinks: SocialLink[] = [];
        const regularLinks: RegularLink[] = [];
        const appLinks: AppLink[] = [];
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
        links.forEach(link => {
            const iconIdentifier = getIconIdentifier(link.icon);
            if (isAppStoreLink(link)) {
                appLinks.push({
                    id: link.id,
                    store: getStoreType(link),
                    url: link.url,
                    isActive: link.isActive
                });
            } else if (link.type === 'social') {
                socialLinks.push({
                    id: link.id,
                    label: link.label,
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
            appLinks
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

                // Procesar los links
                const { socialLinks, regularLinks, appLinks } = processLinks(biosite.links);

                setBiositeData({
                    biosite,
                    socialLinks,
                    regularLinks,
                    appLinks
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
    const isExposedRoute = true; // En vista pública siempre es true
    const validBackgroundImage = isValidImageUrl(biositeData.biosite?.backgroundImage) ? biositeData.biosite?.backgroundImage : null;
    const validAvatarImage = isValidImageUrl(biositeData.biosite?.avatarImage) ? biositeData.biosite?.avatarImage : null;
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    // Determinar si es el segundo template
    const isSecondTemplate = currentTemplate.id === 'bc1452d1-a688-4567-a424-2a0f09103499' ||
        currentTemplate.index === 1 ||
        currentTemplate.name?.toLowerCase().includes('square') ||
        currentTemplate.name?.toLowerCase().includes('dos');

    const getSocialLinks = () => {
        if (!socialLinks || socialLinks.length === 0) return [];
        return socialLinks.filter(link => link.isActive);
    };
    const getRegularLinks = () => {
        if (!regularLinks || regularLinks.length === 0) return [];
        return regularLinks.filter(link => link.isActive).sort((a, b) => a.orderIndex - b.orderIndex);
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
    // Filtrar links reales (excluir embeds)
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

            return !isExcluded;
        });
    };

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
    const regularLinksData = getRegularLinks();
    const socialLinksData = getSocialLinks();
    const musicEmbed = getMusicEmbed();
    const socialPost = getSocialPost();
    const videoEmbed = getVideoEmbed();
    const realSocialLinks = filterRealSocialLinks(socialLinksData);
    const description = user?.description || user?.name || biositeData.biosite.title || 'Bio Site';
    const isInstagramUrl = (url: string) => {
        return url.includes('instagram.com') && (url.includes('/p/') || url.includes('/reel/'));
    };
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
                        realSocialLinks={realSocialLinks}
                        findPlatformForLink={findPlatformForLink}
                        isExposedRoute={isExposedRoute}
                        themeConfig={themeConfig}
                    />

                    {/* Links regulares */}
                    <RegularLinksSection
                        regularLinksData={biositeData.regularLinks.filter(link => link.isActive)}
                        isExposedRoute={isExposedRoute}
                        themeConfig={themeConfig}
                    />

                    {/* V-Card Button */}
                    <VCardButton
                        themeConfig={themeConfig}
                        userId={user?.id}
                    />
                    {/* MÚSICA EMBED */}
                    {musicEmbed && (
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

                    <ConditionalNavButton
                        isExposedRoute={isExposedRoute}
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
