import {useCallback, useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import type {BiositeFull} from "../interfaces/Biosite";
import type {SocialLink, RegularLink, AppLink, WhatsAppLink} from "../interfaces/PreviewContext";
import apiService, {trackVisit} from "../service/apiService";
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
import {useUser} from "../hooks/useUser.ts";
//import {WhatsAppOutlined} from "@ant-design/icons";
import { useAnalytics } from "../hooks/useAnalytics.ts";
import PublicWhatsAppButton from "../components/layers/AddMoreSections/WhattsApp/PublicWhatsAppButton.tsx";
import AppDownloadButtons from "../components/layers/AddMoreSections/App/AppDownloadButtons.tsx";

interface PublicBiositeData {
    biosite: BiositeFull;
    socialLinks: SocialLink[];
    regularLinks: RegularLink[];
    appLinks: AppLink[];
    whatsApplinks: WhatsAppLink[];
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
    const isPublicView = true
    const { templates, getTemplateById, getDefaultTemplate, isTemplatesLoaded } = useTemplates();

    const analytics = useAnalytics({
        biositeId: biositeData?.biosite?.id,
        isPublicView: true,
        debug: true
    });

    const handleEmbedClick = useCallback(async (embedId: string, embedType: 'music' | 'video' | 'social-post') => {
        console.log('Handling embed click', { embedId, embedType, isPublicView });

        if (isPublicView) {

            await analytics.trackLinkClick(embedId);
            await analytics.trackVisit();
        }
    }, [analytics.trackLinkClick, isPublicView,trackVisit]);

    const handleTrackVist= useCallback(async () =>{
        if (isPublicView) {

            await analytics.trackVisit();
        }
    }, [analytics,isPublicView, trackVisit]);

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

        if (iconPath === 'link') return 'link';
        if (iconPath === 'social-post') return 'social-post';
        if (iconPath === 'music-embed') return 'music-embed';
        if (iconPath === 'video-embed') return 'video-embed';

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

    const isWhatsAppLink = useCallback((link: any): boolean => {
        const urlLower = link.url?.toLowerCase() || '';
        const icon = link.icon?.toLowerCase() || '';

        return (
            icon === 'whatsapp' ||
            urlLower.includes('api.whatsapp.com')
        );
    }, [])

    const getStoreType = (link: any): 'appstore' | 'googleplay' => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (labelLower.includes('google play') || urlLower.includes('play.google.com')) {
            return 'googleplay';
        }
        return 'appstore';
    };

    const parseWhatsAppFromUrl = useCallback((url: string, label?:string): { phone: string; message: string; description?:string; } => {
        try {
            let phone = '';
            let message = '';
            let description = label || 'WhatsApp';

            if (url.includes('api.whatsapp.com/send')) {
                // Extraer parámetros de la URL de WhatsApp API
                const urlParams = new URLSearchParams(url.split('?')[1] || '');
                phone = urlParams.get('phone') || '';
                message = decodeURIComponent(urlParams.get('text') || '');
                description = label || 'WhatsApp';

            }

            phone = phone.replace(/[^\d+]/g, '');

            if (message) {
                try {
                    let decodedMessage = message;
                    let previousMessage = '';

                    while (decodedMessage !== previousMessage) {
                        previousMessage = decodedMessage;
                        decodedMessage = decodeURIComponent(decodedMessage);
                    }

                    message = decodedMessage;
                } catch (decodeError) {
                    console.warn('Error decoding message:', decodeError);
                }
            }

            return { phone, message, description };
        } catch (error) {
            console.error('Error parsing WhatsApp URL:', error);
            return {
                phone: '',
                message: '',
                description: label || 'WhatsApp'
            };
        }
    }, []);

    const isSocialLink = (link: any): boolean => {
        const iconIdentifier = getIconIdentifier(link.icon);
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        const socialPlatforms = [
            'instagram', 'tiktok', 'x', 'facebook', 'twitch',
            'linkedin', 'snapchat', 'threads', 'pinterest', 'discord',
            'tumblr', 'whatsapp', 'telegram', 'onlyfans','amazon','gmail','spotify'
        ];

        if (socialPlatforms.includes(iconIdentifier)) {
            return true;
        }

        const socialDomains = [
            'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'facebook.com',
            'twitch.tv', 'linkedin.com', 'snapchat.com', 'threads.net',
            'pinterest.com', 'discord.gg', 'discord.com', 'tumblr.com',
            'wa.me', 'whatsapp.com', 't.me', 'telegram.me', 'onlyfans.com','amazon.com','gmail.com','spotify.com'
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
            'tumblr', 'whatsapp', 'telegram', 'onlyfans','amazon','gmail', 'spotify'
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
            'spotify track', 'youtube video','youtube.com/watch' ,'instagram post', 'music/podcast','open.spotify.com/embed'
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
        const whatsApplinks: WhatsAppLink[] = [];
        let musicEmbed: any = null;
        let socialPost: any = null;
        let videoEmbed: any = null;

        console.log('Processing links:', links);

        links.forEach(link => {
            console.log('Processing link:', link);

            const iconIdentifier = getIconIdentifier(link.icon);

            if (isWhatsAppLink(link)) {
                console.log('WhatsApp link detected:', link);
                const {phone, message} = parseWhatsAppFromUrl(link.url);
                whatsApplinks.push({
                    id: link.id,
                    phone,
                    message,
                    description:link.label,
                    isActive: link.isActive
                });
            } else if (isAppStoreLink(link)) {
                appLinks.push({
                    id: link.id,
                    store: getStoreType(link),
                    url: link.url,
                    isActive: link.isActive
                });
            } else if (isEmbedLink(link)) {
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
                    color: link.color || '#f3f4f6',
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

        console.log('WhatsApp links processed:', whatsApplinks);

        return {
            socialLinks,
            regularLinks: regularLinks.sort((a, b) => a.orderIndex - b.orderIndex),
            appLinks,
            musicEmbed,
            socialPost,
            videoEmbed,
            whatsApplinks
        };
    };


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

                console.log('🔍 Fetching biosite by slug:', slug);
                const biosite = await apiService.getById<BiositeFull>('/biosites/slug', slug);

                if (!biosite) {
                    setError("Biosite no encontrado");
                    setLoading(false);
                    return;
                }

                console.log('✅ Biosite loaded:', biosite);
                const { socialLinks, regularLinks, appLinks, musicEmbed, socialPost, videoEmbed,whatsApplinks } = processLinks(biosite.links);

                setBiositeData({
                    biosite,
                    socialLinks,
                    regularLinks,
                    appLinks,
                    whatsApplinks,
                    musicEmbed,
                    socialPost,
                    videoEmbed
                });

            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar el biosite";
                setError(errorMessage);
                console.error('❌ Error fetching biosite by slug:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBiositeBySlug();
    }, [slug]);


    useEffect(() => {
        if (biositeData) {
            console.log('📊 Biosite data updated, analytics will be initialized:', {
                biositeId: biositeData.biosite.id,
                slug: biositeData.biosite.slug
            });
        }
    }, [biositeData]);

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

    const getThemeConfig = () => {
        if (biositeData.biosite?.theme?.config) {
            return {
                colors: {
                    primary: biositeData.biosite.theme.config.colors.primary,
                    secondary: biositeData.biosite.theme.config.colors.secondary,
                    accent: biositeData.biosite.theme.config.colors.accent ,
                    background: biositeData.biosite.theme.config.colors.background || '#ffffff',
                    text: biositeData.biosite.theme.config.colors.text || '#000000',
                    profileBackground: biositeData.biosite.theme.config.colors.profileBackground || '#ffffff'
                },
                fonts: {
                    primary: biositeData.biosite.theme.config.fonts.primary  || biositeData.biosite?.fonts|| 'Inter',
                    secondary: biositeData.biosite.theme.config.fonts.secondary || biositeData.biosite?.fonts || 'Lato'
                },
                isDark: biositeData.biosite.theme.config.isDark || false,
                isAnimated: biositeData.biosite.theme.config.isAnimated || false
            };
        }

        const defaultColors = { primary: '#f3f4f6', secondary: '#f3f4f6' };
        const parsedColors = biositeData.biosite.colors
            ? (typeof biositeData.biosite.colors === 'string'
                ? JSON.parse(biositeData.biosite.colors)
                : biositeData.biosite.colors)
            : defaultColors;

        return {
            colors: {
                primary: parsedColors.primary || defaultColors.primary,
                secondary: parsedColors.secondary || defaultColors.secondary,
                accent: parsedColors.accent,
                background: parsedColors.background || '#ffffff',
                text: parsedColors.text || '#000000',
                profileBackground: parsedColors.profileBackground || '#ffffff'
            },
            fonts: {
                primary: biositeData.biosite?.fonts || 'Inter',
                secondary: biositeData.biosite?.fonts || 'Lato'
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

    const filterRealSocialLinks = (links: SocialLink[]) => {
        return links.filter(link => {
            if (!link.isActive) return false;

            const excludedKeywords = [
                'open.spotify.com/embed', 'music', 'apple music', 'soundcloud', 'audio',
                'youtube.com/watch', 'video', 'vimeo', 'tiktok video',
                'post', 'publicacion', 'contenido','api.whatsapp.com',
                'music embed', 'video embed', 'social post',
                'embed', 'player'
            ];

            const labelLower = link.label.toLowerCase();
            const urlLower = link.url.toLowerCase();

            const isExcluded = excludedKeywords.some(keyword =>
                labelLower.includes(keyword) || urlLower.includes(keyword)
            );

            if (isExcluded) return false;

            if (urlLower.includes("api.whatsapp.com")) {
                return false;
            }

            if (urlLower.includes("wa.me/") || urlLower.includes("whatsapp.com")) {
                return true;
            }

            const platform = findPlatformForLink(link);
            return platform !== undefined && platform !== null;
        });
    };

    const socialLinksData = biositeData.socialLinks.filter(link => link.isActive);
    const regularLinksData = biositeData.regularLinks.filter(link => link.isActive);
    const realsocialLinks = filterRealSocialLinks(socialLinksData);

    const musicEmbed = biositeData.musicEmbed;
    const socialPost = biositeData.socialPost;
    const videoEmbed = biositeData.videoEmbed;

    const description = biositeData.biosite.owner.description || user?.description ;

    const DEFAULT_APP_STORE_URL = "https://apps.apple.com/us/app/visitaecuador-com/id1385161516";
    const DEFAULT_GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.visitaEcuador&hl=es";

   const isDefaultUrl = (url: string, store: 'appstore' | 'googleplay'): boolean => {
        if (store === 'appstore') {
            return url === DEFAULT_APP_STORE_URL;
        } else {
            return url === DEFAULT_GOOGLE_PLAY_URL;
        }
    };

    return (
        <div className={`w-full min-h-screen flex items-center justify-center`}
             style={{
                 background: themeConfig.colors.background.startsWith('linear-gradient') ? themeConfig.colors.background : themeConfig.colors.background,
                 backgroundColor: themeConfig.colors.background.startsWith('linear-gradient') ? undefined: themeConfig.colors.background,
                 fontFamily: themeConfig.fonts.primary,
                 color: themeConfig.colors.text
             }}>

            <div className={`w-full max-w-full min-h-screen mx-auto`}>
                {isSecondTemplate ? (
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

                <div className={`w-full max-w-md mx-auto`}>
                    <UserInfoSection
                        biosite={biositeData.biosite}
                        user={user}
                        description={description}
                        themeConfig={themeConfig}
                    />

                    {/* Links sociales con analytics */}
                    <SocialLinksSection
                        realSocialLinks={realsocialLinks}
                        findPlatformForLink={findPlatformForLink}
                        isExposedRoute={isExposedRoute}
                        themeConfig={themeConfig}
                        handleSocialLinkClick={analytics.handleSocialLinkClick} // Usar el handler con analytics
                    />

                    <PublicWhatsAppButton
                        whatsAppLinks={biositeData.whatsApplinks}
                        themeConfig={themeConfig}
                        onLinkClick={analytics.trackLinkClick}
                    />

                    {/* Links regulares con analytics */}
                    <RegularLinksSection
                        regularLinksData={regularLinksData}
                        isExposedRoute={isExposedRoute}
                        themeConfig={themeConfig}
                        handleLinkClick={analytics.handleLinkClick}
                    />

                    <VCardButton
                        themeConfig={themeConfig}
                        userId={biositeData.biosite.ownerId}
                        biosite={biositeData.biosite}
                        isExposedRoute={isExposedRoute}
                    />

                    {musicEmbed && musicEmbed.isActive && (
                        <div className="px-4 mb-5"  >
                            <div className="relative rounded-lg shadow-md overflow-hidden"
                                  >

                                {getSpotifyEmbedUrl(musicEmbed.url) ? (
                                    <div className="embed-container spotify-embed"  >
                                        <iframe
                                            src={getSpotifyEmbedUrl(musicEmbed.url)!}
                                            width="100%"
                                            height={isExposedRoute ? "80" : "80"}
                                            frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            loading="lazy"
                                            title={musicEmbed.label}
                                            onClick={() => {
                                                handleEmbedClick(musicEmbed.id, 'music');
                                            }}
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div
                                        className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            handleEmbedClick(musicEmbed.id, 'music');
                                            window.open(musicEmbed.url, '_blank');
                                        }}
                                    >
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

                    {socialPost && socialPost.isActive && (
                        <div className="px-4 mb-4" onClick={() => handleEmbedClick(socialPost.id, 'social-post')}>
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
                                    <div
                                        className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            handleEmbedClick(socialPost.id, 'social-post');
                                            window.open(socialPost.url, '_blank');
                                        }}
                                    >
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
                                            onLoad={() => handleEmbedClick(videoEmbed.id, 'video')}
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div
                                        className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            handleEmbedClick(videoEmbed.id, 'video');
                                            window.open(videoEmbed.url, '_blank');
                                        }}
                                    >
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

                    <AppDownloadButtons/>

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