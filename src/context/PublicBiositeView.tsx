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
    const activeWhatsAppLinks = biositeData.whatsApplinks.filter(link => link.isActive);

    const DEFAULT_APP_STORE_URL = "https://apps.apple.com/ec/app/visitaecuador-com/id1385161516";
    const DEFAULT_GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.visitaEcuador&hl=es";

   const isDefaultUrl = (url: string, store: 'appstore' | 'googleplay'): boolean => {
        if (store === 'appstore') {
            return url === DEFAULT_APP_STORE_URL;
        } else {
            return url === DEFAULT_GOOGLE_PLAY_URL;
        }
    };

    const hasCustomUrls = (): boolean => {
        const activeAppLinks = biositeData.appLinks.filter(link => link.isActive);

        return activeAppLinks.some(appLink => {
            return !isDefaultUrl(appLink.url, appLink.store);
        });
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

                    <div className="mt-12">
                        <div className="flex flex-wrap gap-0 w-full max-w-sm mx-auto">
                            {biositeData.appLinks.filter(link => link.isActive).map((appLink) => (
                                <a
                                    key={appLink.id}
                                    href={appLink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => analytics.trackLinkClick(appLink.id)}
                                    style={{
                                        transform: themeConfig.isAnimated ? 'scale(1)' : 'none',
                                        backgroundColor: themeConfig.colors.accent,
                                        background: themeConfig.colors.accent
                                    }}
                                    className="w-full p-2 mb-3 text-center shadow-lg transition-all h-14 flex items-center duration-200 hover:shadow-md cursor-pointer rounded-lg"

                                >


                                    <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg overflow-hidden mr-3 flex-shrink-0">

                                    {appLink.store === 'appstore' ? (

                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 256 256">
                                            <defs>
                                                <linearGradient id="logosAppleAppStore0" x1="50%" x2="50%" y1="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#17C9FB"/>
                                                    <stop offset="100%" stopColor="#1A74E8"/>
                                                </linearGradient>
                                            </defs>
                                            <path fill="url(#logosAppleAppStore0)" d="M56.064 0h143.872C230.9 0 256 25.1 256 56.064v143.872C256 230.9 230.9 256 199.936 256H56.064C25.1 256 0 230.9 0 199.936V56.064C0 25.1 25.1 0 56.064 0Z"/>
                                            <path fill="#FFF" d="m82.042 185.81l.024.008l-8.753 15.16c-3.195 5.534-10.271 7.43-15.805 4.235c-5.533-3.195-7.43-10.271-4.235-15.805l6.448-11.168l.619-1.072c1.105-1.588 3.832-4.33 9.287-3.814c0 0 12.837 1.393 13.766 8.065c0 0 .126 2.195-1.351 4.391Zm124.143-38.72h-27.294c-1.859-.125-2.67-.789-2.99-1.175l-.02-.035l-29.217-50.606l-.038.025l-1.752-2.512c-2.872-4.392-7.432 6.84-7.432 6.84c-5.445 12.516.773 26.745 2.94 31.046l40.582 70.29c3.194 5.533 10.27 7.43 15.805 4.234c5.533-3.195 7.43-10.271 4.234-15.805l-10.147-17.576c-.197-.426-.539-1.582 1.542-1.587h13.787c6.39 0 11.57-5.18 11.57-11.57c0-6.39-5.18-11.57-11.57-11.57Zm-53.014 15.728s1.457 7.411-4.18 7.411H48.092c-6.39 0-11.57-5.18-11.57-11.57c0-6.39 5.18-11.57 11.57-11.57h25.94c4.188-.242 5.18-2.66 5.18-2.66l.024.012l33.86-58.648l-.01-.002c.617-1.133.103-2.204.014-2.373l-11.183-19.369c-3.195-5.533-1.299-12.61 4.235-15.804c5.534-3.195 12.61-1.3 15.805 4.234l5.186 8.983l5.177-8.967c3.195-5.533 10.271-7.43 15.805-4.234c5.534 3.195 7.43 10.27 4.235 15.804l-47.118 81.61c-.206.497-.269 1.277 1.264 1.414h28.164l.006.275s16.278.253 18.495 15.454Z"/>
                                        </svg>

                                    ) : (

                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 256 283">
                                            <path fill="#EA4335" d="M119.553 134.916L1.06 259.061a32.14 32.14 0 0 0 47.062 19.071l133.327-75.934l-61.896-67.282Z"/>
                                            <path fill="#FBBC04" d="M239.37 113.814L181.715 80.79l-64.898 56.95l65.162 64.28l57.216-32.67a31.345 31.345 0 0 0 0-55.537h.177Z"/>
                                            <path fill="#4285F4" d="M1.06 23.487A30.565 30.565 0 0 0 0 31.61v219.327a32.333 32.333 0 0 0 1.06 8.124l122.555-120.966L1.06 23.487Z"/>
                                            <path fill="#34A853" d="m120.436 141.274l61.278-60.483L48.564 4.503A32.847 32.847 0 0 0 32.051 0C17.644-.028 4.978 9.534 1.06 23.399l119.376 117.875Z"/>
                                        </svg>


                                    )}
                                    </div>
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="flex flex-col items-start">
                                            <div style={{
                                                color: themeConfig.colors.text,
                                                fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                                            }}     className="text-lg font-medium">
                                                <div className={`${hasCustomUrls ? 'text-lg' : 'text-sm' } font-semibold text-black`}>
                                                    {appLink.store === 'appstore' ? 'App Store' : 'Google Play'}
                                                </div>
                                            </div>

                                            {!hasCustomUrls() && (
                                                <div
                                                    style={{
                                                        color: themeConfig.colors.text,
                                                        fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                                                    }}
                                                    className="text-sm opacity-80 -mt-1"
                                                >
                                                    visitaecuador.com
                                                </div>
                                            )}
                                        </div>
                                        {!hasCustomUrls() && (
                                            <div className="ml-4">
                                                <svg width="50" height="50" viewBox="0 0 534 349" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M210.268 348.986H209.851C199.004 348.386 192.225 328.381 181.274 292.97C179.918 288.569 178.458 283.968 176.998 279.266C162.813 234.554 142.475 180.338 110.978 157.632C109.935 157.031 109.726 155.731 110.352 154.731C110.873 153.931 111.916 153.63 112.855 153.931C113.272 154.031 123.493 156.831 141.328 169.535C169.175 189.541 194.728 219.249 212.041 241.956C214.753 232.453 222.993 208.646 246.042 174.637C263.356 148.929 285.571 122.822 311.854 96.8142C344.707 64.505 384.34 32.3957 429.396 1.38686C430.335 0.686664 431.691 0.98675 432.421 1.88701C433.047 2.78727 432.942 3.98761 432.004 4.68781C431.899 4.78784 416.672 16.1911 394.77 38.2974C364.732 69.0062 338.136 102.716 315.504 138.826C287.031 184.139 260.122 243.556 233.214 320.478L233.109 320.578C224.453 340.184 217.361 348.986 210.268 348.986ZM124.641 163.933C150.923 190.641 168.445 238.155 181.17 278.166C182.63 282.868 184.09 287.369 185.446 291.87C193.79 318.878 201.716 344.385 210.06 344.885C213.502 345.085 219.655 340.784 229.146 319.178C256.055 241.956 283.172 182.239 311.749 136.726C334.59 100.315 361.395 66.3055 391.745 35.3966C394.04 33.0959 396.23 30.8953 398.316 28.8947C368.904 50.701 341.161 74.3078 315.087 99.715C288.908 125.422 267.006 151.33 249.797 176.737C226.33 211.347 216.839 238.055 215.17 247.357C215.066 248.158 214.336 248.858 213.502 249.058C212.667 249.258 211.729 248.958 211.207 248.258C194.102 225.551 167.715 194.142 138.929 173.336C134.34 169.835 129.647 166.734 124.641 163.933Z" fill="#96C121"/>
                                                    <path d="M434.611 71.2069L428.979 78.509L433.255 74.7079C439.2 76.8085 433.672 81.3098 432.004 82.7102C440.452 79.6093 433.881 74.9079 434.611 71.2069Z" fill="#96C121"/>
                                                    <path d="M422.2 78.3089C417.819 78.709 419.905 82.4101 421.991 83.3103C421.887 81.6099 424.286 79.2092 422.2 78.3089Z" fill="#96C121"/>
                                                    <path d="M213.293 235.354C214.545 234.454 215.588 233.253 216.735 233.753C215.9 232.153 215.066 231.653 213.293 235.354Z" fill="#96C121"/>
                                                    <path d="M216.631 233.853L217.048 234.854V233.954L216.631 233.853Z" fill="#96C121"/>
                                                    <path d="M300.381 184.339C300.172 179.338 303.197 178.738 304.448 174.837L309.872 176.337C311.436 172.536 307.682 172.436 307.786 168.635C313.105 168.035 316.443 160.532 317.903 159.432C320.51 160.232 319.154 162.733 319.884 164.134C321.97 159.632 318.216 156.331 322.596 152.03L323.639 152.93C330.627 138.726 347.523 128.623 361.603 117.82C360.456 118.12 360.143 117.02 359.204 116.42C374.745 105.517 396.438 100.115 408.328 84.2106C398.107 87.5115 377.561 87.0114 370.364 98.4147C364.732 96.214 361.603 103.816 357.744 100.115C342.725 105.817 340.744 115.019 329.167 123.622C326.872 124.122 326.142 121.521 324.265 120.021C327.081 117.22 329.48 113.719 332.817 111.418C330.314 111.919 327.811 112.719 325.412 113.719C326.455 109.618 334.59 107.617 332.817 103.316C325.934 112.219 310.185 120.221 306.847 130.024C311.123 128.423 314.565 124.222 318.946 121.521C321.762 121.521 325.308 120.421 326.664 122.522C319.676 136.226 307.89 139.827 299.964 151.93C297.878 154.731 294.227 157.832 291.829 156.731C292.872 154.531 289.951 154.531 290.473 152.43C288.491 157.332 297.043 158.432 291.203 162.833L285.049 156.931C290.368 164.534 278.27 163.133 279.417 170.335C275.35 169.935 275.871 166.034 278.166 162.633C274.098 165.434 278.061 168.635 275.663 171.436L271.595 164.534C275.037 171.536 266.172 169.435 262.73 170.035C264.086 171.236 270.135 172.536 266.797 176.237C264.711 177.437 263.773 175.637 262.521 175.437C263.877 176.637 265.65 179.638 264.294 182.539C261.791 181.839 262.104 178.838 260.018 177.437C258.871 179.638 258.349 181.639 255.533 182.239C255.116 187.04 258.766 183.739 259.809 187.24C254.907 192.242 251.883 183.839 245.938 183.539C245.521 177.437 247.815 170.735 247.92 167.434L244.269 177.237C241.975 175.337 236.238 181.038 236.551 174.837C228.625 182.739 225.183 195.342 223.827 205.245C225.287 204.345 226.643 202.945 228.207 203.845C227.79 209.046 224.557 207.246 222.158 207.446C222.471 211.647 227.373 212.947 229.981 216.348C222.784 221.85 225.183 223.751 217.152 227.952L222.054 229.052C216.631 232.153 223.827 235.054 219.342 238.755C218.195 238.755 217.569 236.554 216.943 234.854C217.152 239.455 211.52 237.555 212.041 242.156L207.661 237.455C206.618 240.755 207.035 246.057 202.759 243.156C206.931 250.358 201.716 259.961 203.385 267.863L199.213 266.563C201.612 269.064 200.256 272.565 199.63 276.066C189.305 258.861 175.225 243.256 158.433 233.753C155.304 230.753 146.126 231.653 140.494 230.352C144.144 235.354 146.752 233.653 151.236 237.755C153.322 241.956 150.089 247.057 149.672 251.859L152.071 247.457C159.163 249.258 152.592 251.959 159.684 252.559L153.218 257.06C157.598 255.86 157.39 260.961 156.451 263.362L161.875 261.661C161.457 266.163 161.666 268.663 157.807 272.064L161.979 269.364C159.893 272.064 169.697 280.967 159.789 281.167C161.353 281.567 164.065 281.267 164.691 283.568L160.31 286.068C163.022 288.469 165.734 291.37 163.543 293.271C161.562 292.17 159.372 292.57 157.077 292.97C162.605 305.874 173.452 288.969 179.709 300.473L176.581 301.573L181.274 303.273L178.875 308.075C185.133 308.275 186.697 312.376 188.157 317.678C190.139 321.879 190.973 325.48 195.041 330.181C197.544 334.082 212.772 337.883 219.864 332.682C227.269 328.08 224.974 328.181 226.226 326.68C227.269 324.379 227.999 321.979 228.103 319.478C229.459 312.976 235.925 311.776 236.864 304.474L231.754 304.074C237.698 299.972 244.373 282.968 256.889 281.267C253.969 276.266 255.742 281.467 251.779 280.667C248.337 271.264 256.576 272.465 260.54 268.964C259.392 263.562 257.619 272.264 254.699 268.863C260.54 262.262 250.11 261.161 256.159 252.759C259.184 252.659 257.202 255.56 258.871 257.06C256.159 249.458 262.625 238.055 265.963 228.752C273.368 219.349 282.755 205.545 293.289 197.043L291.829 195.943C298.921 194.042 298.712 187.44 304.136 183.739L300.381 184.339Z" fill="#96C121"/>
                                                    <path d="M333.13 97.0143L329.793 94.1134L324.682 99.9151C329.271 101.316 328.958 98.2146 333.13 97.0143Z" fill="#96C121"/>
                                                    <path d="M338.554 108.418L340.744 105.017L335.633 108.017L338.554 108.418Z" fill="#96C121"/>
                                                    <path d="M267.006 160.833L268.153 160.432L273.472 147.729L267.006 160.833Z" fill="#96C121"/>
                                                    <path d="M209.225 233.653C207.557 231.553 209.225 229.652 208.287 227.652V234.354L209.225 233.653Z" fill="#96C121"/>
                                                    <path d="M177.311 289.269C184.611 292.77 176.372 293.771 183.986 291.87C183.36 288.169 179.709 290.77 177.311 289.269Z" fill="#96C121"/>
                                                    <path d="M186.176 303.273C186.802 301.673 185.863 300.473 184.82 299.372C180.961 300.873 184.924 301.673 186.176 303.273Z" fill="#96C121"/>
                                                    <path d="M174.39 343.085C169.28 347.986 160.936 347.986 155.825 343.085C153.322 340.684 151.966 337.483 151.966 334.182C151.966 327.18 157.911 321.579 165.108 321.679C168.55 321.679 171.887 322.979 174.286 325.38C176.789 327.68 178.145 330.881 178.145 334.282C178.249 337.483 176.893 340.684 174.39 343.085ZM157.077 326.48C154.991 328.481 153.74 331.281 153.844 334.182C153.74 337.083 154.991 339.884 157.077 341.884C161.457 346.086 168.55 346.186 173.034 341.984C173.034 341.984 173.034 341.984 173.139 341.884C175.329 339.884 176.476 337.083 176.476 334.182C176.476 328.181 171.47 323.379 165.316 323.279C162.188 323.279 159.267 324.379 157.077 326.48ZM164.795 327.18C166.151 327.08 167.507 327.28 168.758 327.68C170.218 328.281 171.157 329.681 171.053 331.181C171.157 332.282 170.636 333.282 169.697 333.882C169.071 334.282 168.341 334.482 167.611 334.582C168.55 334.682 169.488 335.183 170.114 335.983C170.636 336.583 170.844 337.383 170.948 338.083V339.084C170.948 339.384 170.948 339.784 170.948 340.084C170.948 340.284 170.948 340.584 171.053 340.784L171.157 340.984H168.863V340.884V340.784V340.384V339.284C168.863 337.683 168.445 336.683 167.507 336.083C166.568 335.683 165.629 335.583 164.691 335.583H162.605V341.084H160.102V327.28H164.795V327.18ZM167.611 329.381C166.672 328.981 165.525 328.781 164.482 328.881H162.396V333.882H164.691C165.525 333.882 166.359 333.782 167.09 333.582C168.341 332.982 168.967 331.481 168.341 330.281C168.132 329.881 167.82 329.581 167.611 329.381Z" fill="#96C121"/>
                                                </svg>
                                            </div>
                                        )}
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