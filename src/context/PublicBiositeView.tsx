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
import {WhatsAppOutlined} from "@ant-design/icons";
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

    const DEFAULT_APP_STORE_URL = "https://apps.apple.com/us/app/visitaecuador-com/id1385161516?ls=1";
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
                        <div className="flex flex-wrap gap-0 w-full max-w-md mx-auto">
                            {biositeData.appLinks.filter(link => link.isActive).map((appLink) => (
                                <a
                                    key={appLink.id}
                                    href={appLink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => analytics.trackLinkClick(appLink.id)}
                                    className={`flex-1 h-16  bg-white hover:bg-gray-800 transition-colors rounded-lg p-0 flex flex-col items-center space-x-3 border border-gray-600 ${
                                        appLink.store === 'appstore' ? 'ml-2' : 'mr-2'
                                    }`}
                                >
                                    <div className="flex-shrink-0 gap-1">
                                        {appLink.store === 'appstore' ? (
                                            <svg width="20" height="20" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6.71454 7.34639C6.36912 7.86677 6.00189 8.37485 5.44363 8.38364C4.88537 8.39595 4.70655 8.05225 4.07327 8.05225C3.43563 8.05225 3.24024 8.37573 2.71077 8.39682C2.16472 8.41792 1.753 7.84304 1.40234 7.33497C0.689685 6.29772 0.144508 4.38848 0.877226 3.10335C1.23922 2.46518 1.88907 2.06258 2.59388 2.0494C3.12684 2.04061 3.63538 2.41419 3.96424 2.41419C4.28872 2.41419 4.90543 1.96501 5.55092 2.03182C5.82133 2.04413 6.58021 2.14082 7.06695 2.86337C7.02944 2.88887 6.16326 3.40046 6.17111 4.46232C6.18332 5.72987 7.27542 6.15444 7.28763 6.15795C7.27542 6.18696 7.11231 6.76272 6.7128 7.34551M4.33583 0.629777C4.64026 0.281684 5.14356 0.0170982 5.56051 0.000396729C5.6146 0.491771 5.4192 0.986661 5.12699 1.33915C4.83914 1.69603 4.36461 1.97292 3.89794 1.93513C3.83514 1.45254 4.06891 0.948863 4.33496 0.629777H4.33583Z" fill="black"/>
                                            </svg>
                                        ) : (
                                            <svg width="18" height="20" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M0.734261 0.325967C0.654013 0.413071 0.606911 0.548666 0.606911 0.72467V6.99796C0.606911 7.17396 0.654013 7.30955 0.734261 7.39666L0.754323 7.41731L4.16835 3.90262V3.82001L0.754323 0.305313L0.734261 0.325967Z" fill="black"/>
                                                <path d="M5.78814 5.07448L4.65071 3.90262V3.82001L5.78901 2.64814L5.81431 2.66341L7.16282 3.45183C7.54748 3.67723 7.54748 4.0454 7.16282 4.27079L5.81431 5.05922L5.78814 5.07448Z" fill="black"/>
                                                <path d="M5.57269 5.29628L4.40909 4.09838L0.975006 7.63373C1.10236 7.77201 1.3117 7.78908 1.54721 7.65079L5.57269 5.29628Z" fill="black"/>
                                                <path d="M5.57269 2.44969L1.54721 0.0951857C1.31083 -0.0431032 1.10148 -0.0260416 0.975006 0.112247L4.40909 3.64759L5.57269 2.44969Z" fill="black"/>
                                            </svg>

                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="text-lg font-semibold text-black">
                                            {appLink.store === 'appstore' ? 'App Store' : 'Google Play'}
                                        </div>
                                    </div>

                                    {!hasCustomUrls() && (
                                    <div className="flex-1">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.06331 1.98115H0.717889L0 0.178268H0.43178L0.895835 1.43879L1.35989 0.178268H1.7812L1.06331 1.98115Z" fill="black"/>
                                            <path d="M2.02195 0.447247V0.101791H2.42756V0.447247H2.02195ZM2.03242 1.96884V0.59844H2.41797V1.96884H2.03242Z" fill="black"/>
                                            <path d="M3.73861 1.74996C3.71244 1.80534 3.6758 1.85105 3.6287 1.88709C3.58072 1.92225 3.52577 1.9495 3.46296 1.96796C3.39929 1.98554 3.33125 1.99433 3.25885 1.99433C3.1629 1.99433 3.06346 1.97675 2.96315 1.94422C2.86283 1.91082 2.76601 1.85808 2.67529 1.78688L2.84015 1.53108C2.9143 1.58558 2.98844 1.62602 3.06171 1.65415C3.13499 1.68052 3.20477 1.69458 3.26845 1.69458C3.32427 1.69458 3.36527 1.68491 3.39144 1.66733C3.41761 1.64887 3.43069 1.62338 3.43069 1.59261V1.58734C3.43069 1.56712 3.42284 1.54954 3.40801 1.53372C3.39318 1.5179 3.37225 1.50471 3.34608 1.49328C3.31991 1.48274 3.28938 1.47219 3.25536 1.46164C3.22134 1.45109 3.18558 1.44054 3.14894 1.42912C3.10184 1.41505 3.05386 1.39835 3.00502 1.37813C2.95704 1.35967 2.91343 1.3333 2.87417 1.30166C2.83579 1.27001 2.80352 1.23134 2.77909 1.18563C2.75467 1.13904 2.74246 1.08278 2.74246 1.01685V1.01158C2.74246 0.942137 2.75554 0.880605 2.78171 0.826106C2.80788 0.772485 2.84364 0.726777 2.88813 0.689858C2.93262 0.65206 2.98583 0.623931 3.04601 0.604593C3.10533 0.586133 3.17075 0.577343 3.23966 0.577343C3.32602 0.577343 3.41324 0.591408 3.50222 0.619536C3.59119 0.647665 3.67231 0.686342 3.74733 0.735567L3.59991 1.00455C3.53188 0.964992 3.46645 0.934226 3.40191 0.911371C3.33736 0.889395 3.28066 0.87709 3.23181 0.87709C3.18471 0.87709 3.14894 0.886759 3.12539 0.903461C3.10184 0.92192 3.08963 0.944775 3.08963 0.971145V0.97642C3.08963 0.994879 3.09748 1.01246 3.11231 1.02652C3.12801 1.04147 3.14807 1.05465 3.17337 1.06784C3.19866 1.08102 3.22745 1.09245 3.26147 1.10476C3.29461 1.11706 3.32951 1.12849 3.36701 1.1408C3.41412 1.15662 3.46209 1.1742 3.51181 1.1953C3.56066 1.21639 3.60427 1.24276 3.64353 1.27353C3.68278 1.30429 3.71505 1.34121 3.74035 1.38604C3.76565 1.43087 3.77786 1.48362 3.77786 1.54778V1.55306C3.77786 1.62953 3.76477 1.69458 3.73861 1.74996Z" fill="black"/>
                                            <path d="M4.06222 0.447247V0.101791H4.46784V0.447247H4.06222ZM4.07182 1.96884V0.59844H4.45737V1.96884H4.07182Z" fill="black"/>
                                            <path d="M5.45003 1.96972C5.40118 1.98466 5.34448 1.99169 5.27993 1.99169C5.22061 1.99169 5.16741 1.98466 5.11856 1.97235C5.07058 1.96005 5.02871 1.93719 4.99382 1.90555C4.95893 1.87302 4.93189 1.83083 4.9127 1.77809C4.89351 1.72623 4.88304 1.6603 4.88304 1.57943V0.930711H4.7208V0.59844H4.88304V0.247709H5.26859V0.59844H5.58872V0.930711H5.26859V1.51614C5.26859 1.60492 5.31046 1.64887 5.39333 1.64887C5.46136 1.64887 5.52417 1.63217 5.58348 1.59965V1.91082C5.54336 1.93455 5.498 1.95477 5.44915 1.96796L5.45003 1.96972Z" fill="black"/>
                                            <path d="M6.67035 1.96884V1.82028C6.62237 1.8739 6.56568 1.91522 6.50026 1.94774C6.43483 1.97851 6.35458 1.99521 6.25951 1.99521C6.19496 1.99521 6.13477 1.98554 6.07807 1.96884C6.02137 1.95038 5.97165 1.92313 5.92978 1.88797C5.88791 1.85193 5.85389 1.80798 5.82947 1.75611C5.80505 1.70425 5.79283 1.64448 5.79283 1.57591V1.57064C5.79283 1.49592 5.80679 1.43175 5.83383 1.37638C5.86087 1.32188 5.89838 1.27705 5.94636 1.24101C5.99433 1.20497 6.0519 1.1786 6.11907 1.16014C6.18623 1.14168 6.26038 1.13376 6.34063 1.13376C6.41041 1.13376 6.4706 1.13904 6.52206 1.14959C6.57353 1.16014 6.62412 1.17332 6.67297 1.1909V1.16805C6.67297 1.08542 6.64854 1.02389 6.5997 0.980815C6.55085 0.938622 6.47758 0.917525 6.38162 0.917525C6.30748 0.917525 6.24206 0.923678 6.18536 0.935984C6.12866 0.948291 6.06935 0.96675 6.00654 0.990484L5.90972 0.694253C5.98386 0.661729 6.06237 0.635359 6.14349 0.614263C6.22461 0.594924 6.32231 0.584375 6.43745 0.584375C6.64854 0.584375 6.80207 0.636238 6.89889 0.739963C6.99484 0.843687 7.04369 0.988727 7.04369 1.17508V1.96972H6.67122L6.67035 1.96884ZM6.67733 1.41681C6.64331 1.40099 6.6058 1.38868 6.5648 1.37901C6.52381 1.37022 6.47932 1.36495 6.43222 1.36495C6.34935 1.36495 6.28393 1.38165 6.23683 1.41417C6.18972 1.44582 6.1653 1.49329 6.1653 1.55394V1.55921C6.1653 1.61283 6.18449 1.65327 6.22374 1.68228C6.26212 1.71128 6.31359 1.72623 6.37639 1.72623C6.46711 1.72623 6.54038 1.70425 6.59533 1.6603C6.65029 1.61547 6.67733 1.55745 6.67733 1.48625V1.41681Z" fill="black"/>
                                            <path d="M7.41615 1.96884V0.179146H8.75336V0.528998H7.8017V0.892034H8.63909V1.24189H7.8017V1.61811H8.76557V1.96796H7.41615V1.96884Z" fill="black"/>
                                            <path d="M10.0478 1.92928C9.96322 1.97587 9.85331 1.9996 9.71811 1.9996C9.61692 1.9996 9.52184 1.98114 9.43549 1.94334C9.34826 1.90643 9.27324 1.85456 9.21131 1.79128C9.14938 1.72799 9.09966 1.65239 9.0639 1.56624C9.02813 1.4801 9.01069 1.38868 9.01069 1.29199V1.28671C9.01069 1.19002 9.029 1.09685 9.0639 1.0107C9.09966 0.923679 9.14851 0.847203 9.21131 0.783034C9.27412 0.718866 9.34826 0.667004 9.43549 0.629206C9.52272 0.592287 9.61867 0.573828 9.72334 0.573828C9.85157 0.573828 9.95886 0.594045 10.0435 0.634481C10.1281 0.675795 10.2022 0.731173 10.2668 0.803253L10.0304 1.05905C9.98677 1.01246 9.94054 0.975541 9.89431 0.949171C9.84808 0.921921 9.78963 0.907856 9.72072 0.907856C9.67188 0.907856 9.62739 0.917526 9.58727 0.936864C9.54801 0.956203 9.51312 0.983452 9.48346 1.01773C9.45381 1.05202 9.43113 1.09157 9.41455 1.13728C9.39885 1.18211 9.391 1.22958 9.391 1.28144V1.28671C9.391 1.33946 9.39885 1.38868 9.41455 1.43439C9.43113 1.48098 9.45381 1.52141 9.48434 1.55482C9.51487 1.5891 9.5515 1.61635 9.59337 1.63569C9.63611 1.65503 9.68322 1.66557 9.73555 1.66557C9.8001 1.66557 9.85593 1.65151 9.9039 1.62514C9.95188 1.59965 9.99986 1.56361 10.0478 1.51966L10.2738 1.74996C10.2075 1.82292 10.1324 1.88181 10.0478 1.92928Z" fill="black"/>
                                            <path d="M11.3746 1.96884V1.77282C11.3528 1.80182 11.3283 1.82907 11.3022 1.85632C11.276 1.88269 11.2472 1.90731 11.2141 1.92752C11.1818 1.94774 11.146 1.96444 11.1077 1.97675C11.0693 1.98905 11.0248 1.99521 10.9759 1.99521C10.8294 1.99521 10.7151 1.9495 10.6349 1.85984C10.5546 1.7693 10.5145 1.64536 10.5145 1.48625V0.599319H10.9001V1.36143C10.9001 1.45285 10.9201 1.52317 10.9611 1.56888C11.0012 1.61635 11.0588 1.6392 11.1338 1.6392C11.208 1.6392 11.2664 1.61635 11.31 1.56888C11.3528 1.52229 11.3746 1.45285 11.3746 1.36143V0.599319H11.7601V1.96972L11.3746 1.96884Z" fill="black"/>
                                            <path d="M12.9019 1.96884V1.82028C12.854 1.8739 12.7973 1.91522 12.7318 1.94774C12.6664 1.97851 12.5862 1.99521 12.4911 1.99521C12.4265 1.99521 12.3664 1.98554 12.3097 1.96884C12.253 1.95038 12.2032 1.92313 12.1614 1.88797C12.1195 1.85193 12.0855 1.80798 12.0611 1.75611C12.0366 1.70425 12.0244 1.64448 12.0244 1.57591V1.57064C12.0244 1.49592 12.0384 1.43175 12.0654 1.37638C12.0925 1.32188 12.13 1.27705 12.1779 1.24101C12.2259 1.20497 12.2835 1.1786 12.3507 1.16014C12.4178 1.14168 12.492 1.13376 12.5722 1.13376C12.642 1.13376 12.7022 1.13904 12.7537 1.14959C12.8051 1.16014 12.8557 1.17332 12.9046 1.1909V1.16805C12.9046 1.08542 12.8801 1.02389 12.8313 0.980815C12.7824 0.938622 12.7092 0.917525 12.6132 0.917525C12.5391 0.917525 12.4737 0.923678 12.417 0.935984C12.3603 0.948291 12.3009 0.96675 12.2381 0.990484L12.1413 0.694253C12.2155 0.661729 12.294 0.635359 12.3751 0.614263C12.4562 0.594924 12.5539 0.584375 12.669 0.584375C12.8801 0.584375 13.0345 0.636238 13.1305 0.739963C13.2264 0.843687 13.2744 0.988727 13.2744 1.17508V1.96972L12.9019 1.96884ZM12.9098 1.41681C12.8758 1.40099 12.8383 1.38868 12.7964 1.37901C12.7554 1.37022 12.7109 1.36495 12.6638 1.36495C12.5809 1.36495 12.5155 1.38165 12.4684 1.41417C12.4213 1.44582 12.3969 1.49329 12.3969 1.55394V1.55921C12.3969 1.61283 12.4161 1.65327 12.4553 1.68228C12.4937 1.71128 12.5452 1.72623 12.608 1.72623C12.6987 1.72623 12.772 1.70425 12.8269 1.6603C12.8819 1.61547 12.9098 1.55745 12.9098 1.48625V1.41681Z" fill="black"/>
                                            <path d="M14.5889 1.96884V1.77369C14.5418 1.83786 14.4851 1.89061 14.418 1.93192C14.3517 1.97411 14.2671 1.99433 14.1659 1.99433C14.0856 1.99433 14.0089 1.97851 13.9347 1.94774C13.8597 1.91698 13.7943 1.87127 13.7358 1.81149C13.6791 1.75084 13.6329 1.677 13.598 1.5891C13.5631 1.50032 13.5457 1.40011 13.5457 1.28584V1.28056C13.5457 1.16629 13.5631 1.0652 13.598 0.9773C13.6329 0.889398 13.6783 0.81468 13.735 0.754907C13.7908 0.694254 13.8571 0.648545 13.9321 0.617779C14.0063 0.587892 14.0839 0.57207 14.1659 0.57207C14.2688 0.57207 14.3543 0.591409 14.4206 0.632723C14.4878 0.673158 14.5444 0.720624 14.5889 0.774245V0.100914H14.9745V1.96708H14.5889V1.96884ZM14.5933 1.28056C14.5933 1.2243 14.5846 1.17156 14.5671 1.1241C14.5497 1.07663 14.5253 1.03619 14.4956 1.00279C14.4668 0.969388 14.4319 0.943897 14.3918 0.925438C14.3525 0.907857 14.3098 0.899066 14.2644 0.899066C14.2191 0.899066 14.1755 0.908736 14.1371 0.925438C14.097 0.943897 14.0621 0.969388 14.0315 1.00279C14.001 1.03619 13.9775 1.07663 13.9591 1.12322C13.9408 1.16981 13.933 1.22167 13.933 1.28056V1.28584C13.933 1.34209 13.9417 1.39396 13.9591 1.44142C13.9766 1.48889 14.001 1.52933 14.0315 1.56273C14.0621 1.59613 14.097 1.62162 14.1371 1.64008C14.1763 1.65854 14.2191 1.66733 14.2644 1.66733C14.3098 1.66733 14.3534 1.65766 14.3918 1.64008C14.4319 1.62162 14.4668 1.59613 14.4956 1.56273C14.5253 1.52933 14.5497 1.48889 14.5671 1.44142C14.5846 1.39396 14.5933 1.34297 14.5933 1.28584V1.28056Z" fill="black"/>
                                            <path d="M16.6693 1.56361C16.6318 1.64975 16.5804 1.72535 16.5141 1.79039C16.4486 1.85456 16.371 1.90643 16.2803 1.94334C16.1904 1.98114 16.0928 1.9996 15.9863 1.9996C15.8817 1.9996 15.7848 1.98114 15.6941 1.9451C15.6043 1.90818 15.5275 1.8572 15.4621 1.79391C15.3967 1.73062 15.3452 1.65503 15.3086 1.56888C15.2711 1.48274 15.2527 1.39044 15.2527 1.29199V1.28671C15.2527 1.18826 15.2711 1.09509 15.3086 1.00982C15.3452 0.9228 15.3975 0.847203 15.463 0.783034C15.5293 0.718866 15.6069 0.667004 15.6967 0.629206C15.7875 0.592287 15.8852 0.573828 15.9916 0.573828C16.0962 0.573828 16.1931 0.592287 16.2829 0.628327C16.3736 0.665246 16.4495 0.71535 16.5158 0.779519C16.5804 0.842808 16.6318 0.917526 16.6693 1.00455C16.7068 1.09069 16.7252 1.18299 16.7252 1.28144V1.28671C16.7252 1.38517 16.7068 1.47834 16.6693 1.56361ZM16.3448 1.28584C16.3448 1.23397 16.3361 1.18651 16.3195 1.1408C16.3021 1.09597 16.2777 1.05553 16.2463 1.02037C16.214 0.986089 16.1756 0.95796 16.132 0.937743C16.0875 0.917525 16.0395 0.906977 15.9872 0.906977C15.9314 0.906977 15.8817 0.916646 15.8389 0.935984C15.7953 0.955323 15.7587 0.982573 15.7281 1.01686C15.6976 1.05114 15.6741 1.09069 15.6584 1.1364C15.6418 1.18123 15.6348 1.2287 15.6348 1.28056V1.28584C15.6348 1.33682 15.6435 1.38429 15.6601 1.43C15.6767 1.4757 15.7011 1.51526 15.7334 1.55042C15.7656 1.58558 15.8032 1.61283 15.8468 1.63393C15.8895 1.65415 15.9375 1.66469 15.9924 1.66469C16.0474 1.66469 16.0971 1.65415 16.1407 1.63481C16.1843 1.61635 16.221 1.58822 16.2515 1.55394C16.2812 1.52054 16.3056 1.48098 16.3213 1.43527C16.337 1.38956 16.3448 1.34209 16.3448 1.29111V1.28584Z" fill="black"/>
                                            <path d="M17.8033 0.979057C17.6751 0.979057 17.573 1.01861 17.4997 1.09685C17.4256 1.17596 17.389 1.29814 17.389 1.46252V1.96884H17.0043V0.598441H17.389V0.873575C17.4282 0.780399 17.4806 0.705681 17.5495 0.648545C17.6166 0.593166 17.7091 0.566796 17.8234 0.57207V0.978179L17.8033 0.979057Z" fill="black"/>
                                            <path d="M18.0493 1.96884V1.55921H18.4575V1.96884H18.0493Z" fill="black"/>
                                            <path d="M19.7616 1.92928C19.677 1.97587 19.5671 1.9996 19.4319 1.9996C19.3307 1.9996 19.2356 1.98114 19.1492 1.94334C19.062 1.90643 18.987 1.85456 18.9242 1.79128C18.8623 1.72799 18.8125 1.65239 18.7776 1.56624C18.7419 1.4801 18.7236 1.38868 18.7236 1.29199V1.28671C18.7236 1.19002 18.7419 1.09685 18.7776 1.0107C18.8125 0.923679 18.8623 0.847203 18.9242 0.783034C18.987 0.718866 19.062 0.667004 19.1492 0.629206C19.2365 0.592287 19.3324 0.573828 19.4371 0.573828C19.5653 0.573828 19.6726 0.594045 19.7563 0.634481C19.8418 0.675795 19.916 0.731173 19.9796 0.803253L19.7433 1.05905C19.6996 1.01246 19.6543 0.975541 19.6081 0.949171C19.561 0.921921 19.5034 0.907856 19.4345 0.907856C19.3848 0.907856 19.3411 0.917526 19.3019 0.936864C19.2618 0.956203 19.2269 0.983452 19.1981 1.01773C19.1684 1.05202 19.1449 1.09157 19.1292 1.13728C19.1126 1.18211 19.1056 1.22958 19.1056 1.28144V1.28671C19.1056 1.33946 19.1135 1.38868 19.1292 1.43439C19.1457 1.48098 19.1684 1.52141 19.199 1.55482C19.2295 1.5891 19.2652 1.61635 19.308 1.63569C19.3507 1.65503 19.3978 1.66557 19.4502 1.66557C19.5138 1.66557 19.5705 1.65151 19.6185 1.62514C19.6674 1.59965 19.7145 1.56361 19.7616 1.51966L19.9875 1.74996C19.9221 1.82292 19.8471 1.88181 19.7616 1.92928Z" fill="black"/>
                                            <path d="M21.589 1.56361C21.5515 1.64975 21.5 1.72535 21.4337 1.79039C21.3683 1.85456 21.2907 1.90643 21.2 1.94334C21.1101 1.98114 21.0124 1.9996 20.906 1.9996C20.8013 1.9996 20.7045 1.98114 20.6138 1.9451C20.524 1.90818 20.4472 1.8572 20.3818 1.79391C20.3163 1.73062 20.2649 1.65503 20.2282 1.56888C20.1907 1.48274 20.1724 1.39044 20.1724 1.29199V1.28671C20.1724 1.18826 20.1907 1.09509 20.2282 1.00982C20.2649 0.9228 20.3172 0.847203 20.3826 0.783034C20.4489 0.718866 20.5266 0.667004 20.6164 0.629206C20.7071 0.592287 20.8048 0.573828 20.9112 0.573828C21.0159 0.573828 21.1127 0.592287 21.2026 0.628327C21.2933 0.665246 21.3692 0.71535 21.4355 0.779519C21.5 0.842808 21.5515 0.917526 21.589 1.00455C21.6265 1.09069 21.6448 1.18299 21.6448 1.28144V1.28671C21.6448 1.38517 21.6265 1.47834 21.589 1.56361ZM21.2645 1.28584C21.2645 1.23397 21.2558 1.18651 21.2392 1.1408C21.2218 1.09597 21.1974 1.05553 21.166 1.02037C21.1337 0.986089 21.0953 0.95796 21.0517 0.937743C21.0072 0.917525 20.9592 0.906977 20.9069 0.906977C20.8511 0.906977 20.8013 0.916646 20.7586 0.935984C20.715 0.955323 20.6783 0.982573 20.6478 1.01686C20.6173 1.05114 20.5937 1.09069 20.578 1.1364C20.5615 1.18123 20.5545 1.2287 20.5545 1.28056V1.28584C20.5545 1.33682 20.5632 1.38429 20.5798 1.43C20.5964 1.4757 20.6208 1.51526 20.653 1.55042C20.6853 1.58558 20.7228 1.61283 20.7664 1.63393C20.8092 1.65415 20.8572 1.66469 20.9121 1.66469C20.9671 1.66469 21.0168 1.65415 21.0604 1.63481C21.104 1.61635 21.1407 1.58822 21.1712 1.55394C21.2008 1.52054 21.2253 1.48098 21.241 1.43527C21.2567 1.38956 21.2645 1.34209 21.2645 1.29111V1.28584Z" fill="black"/>
                                            <path d="M23.6136 1.96884V1.20672C23.6136 1.11531 23.5944 1.04498 23.556 0.998396C23.5168 0.951808 23.4609 0.928953 23.3885 0.928953C23.3161 0.928953 23.2594 0.951808 23.2176 0.998396C23.1757 1.04586 23.1556 1.11531 23.1556 1.20672V1.96884H22.7701V1.20672C22.7701 1.11531 22.7518 1.04498 22.7125 0.998396C22.6733 0.951808 22.6183 0.928953 22.545 0.928953C22.4726 0.928953 22.4159 0.951808 22.3741 0.998396C22.3331 1.04586 22.3121 1.11531 22.3121 1.20672V1.96884H21.9275V0.59844H22.3121V0.794462C22.3339 0.765455 22.3584 0.737325 22.3845 0.710075C22.4107 0.682826 22.4395 0.659971 22.4726 0.639754C22.5058 0.619536 22.5407 0.602835 22.5799 0.590529C22.62 0.578222 22.6645 0.572069 22.7134 0.572069C22.8032 0.572069 22.88 0.59053 22.9454 0.628328C23.0108 0.666126 23.0614 0.719746 23.0972 0.790946C23.1556 0.718867 23.2228 0.663488 23.2952 0.626569C23.3676 0.58965 23.4513 0.572069 23.5438 0.572069C23.6877 0.572069 23.8002 0.614262 23.8814 0.700406C23.9625 0.785672 24.0035 0.910493 24.0035 1.07663V1.96884H23.6179H23.6136Z" fill="black"/>
                                        </svg>
                                    </div>
                                    )}
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