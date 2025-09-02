import { useCallback, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { BiositeFull } from "../interfaces/Biosite";
import type { SocialLink, RegularLink, AppLink, WhatsAppLink } from "../interfaces/PreviewContext";
import type { Section } from "../interfaces/sections.ts";
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
import { useUser } from "../hooks/useUser.ts";
import { useAnalytics } from "../hooks/useAnalytics.ts";
import PublicWhatsAppButton from "../components/layers/AddMoreSections/WhattsApp/PublicWhatsAppButton.tsx";
import { useLinkProcessing } from "../hooks/useLinkProcessing.ts";
import {
    isValidImageUrl,
    getThemeConfig,
    getSpotifyEmbedUrl,
    getYouTubeEmbedUrl,
    getInstagramEmbedUrl,
    isInstagramUrl,
    hasCustomUrls
} from "../Utils/biositeUtils.ts";
import { getSectionsByBiositeApi } from '../constants/EndpointsRoutes';

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
    const [sections, setSections] = useState<Section[]>([]);
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageLoadStates, setImageLoadStates] = useState<{ [key: string]: 'loading' | 'loaded' | 'error' }>({});
    const isPublicView = true;
    const { templates, getTemplateById, getDefaultTemplate, isTemplatesLoaded } = useTemplates();
    const { processLinks, findPlatformForLink, filterRealSocialLinks } = useLinkProcessing();

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

    const analytics = useAnalytics({
        biositeId: biositeData?.biosite?.id,
        isPublicView: true,
        debug: true
    });

    const fetchSections = useCallback(async (biositeId: string) => {
        try {
            const fetchedSections = await apiService.getAll<Section[]>(
                `${getSectionsByBiositeApi}/${biositeId}`
            );
            setSections(fetchedSections);
            return fetchedSections;
        } catch (err) {
            console.error('Error fetching sections:', err);
        }
    }, []);

    const handleEmbedClick = useCallback(async (embedId: string, embedType: 'music' | 'video' | 'social-post') => {
        console.log('Handling embed click', { embedId, embedType, isPublicView });

        if (isPublicView) {
            await analytics.trackLinkClick(embedId);
            await analytics.trackVisit();
        }
    }, [analytics.trackLinkClick, isPublicView, analytics.trackVisit]);

    const handleImageLoad = (imageType: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'loaded' }));
    };

    const handleImageError = (imageType: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'error' }));
    };

    const handleImageLoadStart = (imageType: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'loading' }));
    };

    const getSectionOrderIndex = (sectionTitle: string): number => {
        const section = sections.find(s => s.titulo === sectionTitle);
        return section?.orderIndex || 999;
    };

    const orderedContentSections = useMemo(() => {
        if (!biositeData) return [];

        const sectionsArray = [];
        const socialLinksData = biositeData.socialLinks.filter(link => link.isActive);
        const regularLinksData = biositeData.regularLinks.filter(link => link.isActive);
        const realsocialLinks = filterRealSocialLinks(socialLinksData);
        const themeConfig = getThemeConfig(biositeData.biosite);
        const musicEmbed = biositeData.musicEmbed;
        const socialPost = biositeData.socialPost;
        const isExposedRoute = true;

        if (realsocialLinks.length > 0) {
            sectionsArray.push({
                type: 'social',
                orderIndex: getSectionOrderIndex('Social'),
                component: (
                    <SocialLinksSection
                        key="social-section"
                        realSocialLinks={realsocialLinks}
                        isExposedRoute={isExposedRoute}
                        findPlatformForLink={findPlatformForLink}
                        handleSocialLinkClick={analytics.handleSocialLinkClick}
                        themeConfig={themeConfig}
                    />
                )
            });
        }

        sectionsArray.push({
            type: 'whatsapp',
            orderIndex: getSectionOrderIndex('Contactame'),
            component: (
                <PublicWhatsAppButton
                    whatsAppLinks={biositeData.whatsApplinks}
                    themeConfig={themeConfig}
                    onLinkClick={analytics.trackLinkClick}
                />
            )
        });

        if (regularLinksData.length > 0) {
            sectionsArray.push({
                type: 'regular',
                orderIndex: getSectionOrderIndex('Links'),
                component: (
                    <RegularLinksSection
                        key="regular-section"
                        regularLinksData={regularLinksData}
                        isExposedRoute={isExposedRoute}
                        handleLinkClick={analytics.handleLinkClick}
                        themeConfig={themeConfig}
                    />
                )
            });
        }

        sectionsArray.push({
            type: 'app',
            orderIndex: getSectionOrderIndex('Link de mi App'),
            component: (
                <div >
                    <div className="px-4 pb-2 space-y-3">
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
                                className="w-full p-2 mb-3 text-center shadow-lg transition-all h-14 flex items-center duration-200 hover:shadow-md cursor-pointer"
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
                                        <div className={`${hasCustomUrls(biositeData.appLinks) ? 'text-lg' : 'text-sm'} font-bold`} style={{
                                            color: themeConfig.colors.text,
                                            fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                                        }}>
                                            {appLink.store === 'appstore' ? 'App Store' : 'Google Play'}
                                        </div>
                                        {!hasCustomUrls(biositeData.appLinks) && (
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
                                    {!hasCustomUrls(biositeData.appLinks) && (
                                        <div className="ml-4">
                                            <svg width="50" height="50" viewBox="0 0 534 349" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                {/* SVG content truncated for brevity */}
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )
        });

        if (musicEmbed) {
            sectionsArray.push({
                type: 'music',
                orderIndex: getSectionOrderIndex('Music / Podcast'),
                component: (
                    <div key="music-section" className="px-4 mb-4">
                        <div className="relative rounded-lg shadow-md overflow-hidden">
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
                )
            });
        }

        if (socialPost) {
            sectionsArray.push({
                type: 'socialpost',
                orderIndex: getSectionOrderIndex('Social Post'),
                component: (
                    <div key="socialpost-section" className="px-4 mb-4">
                        <div className="relative rounded-lg shadow-md overflow-hidden"
                             style={{ backgroundColor: themeConfig.colors.profileBackground || '#ffffff' }}>

                            {isInstagramUrl(socialPost.url) ? (
                                <div className="embed-container instagram-embed">
                                    <iframe
                                        src={getInstagramEmbedUrl(socialPost.url)!}
                                        width="100%"
                                        height={isExposedRoute ?"700" : "400"}
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
                )
            });
        }

        return sectionsArray.sort((a, b) => a.orderIndex - b.orderIndex);
    }, [
        biositeData, sections, findPlatformForLink, filterRealSocialLinks,
        analytics.handleSocialLinkClick, analytics.trackLinkClick, analytics.handleLinkClick,
        getSectionOrderIndex
    ]);

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

                // Fetch sections for this biosite
                await fetchSections(biosite.id);

                const { socialLinks, regularLinks, appLinks, musicEmbed, socialPost, videoEmbed, whatsApplinks } = processLinks(biosite.links);

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
                console.error('⚠️ Error fetching biosite by slug:', error);
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

    // Early returns after all hooks are called
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

    // Render logic
    const themeConfig = getThemeConfig(biositeData.biosite);
    const isExposedRoute = true;
    const validBackgroundImage = isValidImageUrl(biositeData.biosite?.backgroundImage) ? biositeData.biosite?.backgroundImage : null;
    const validAvatarImage = isValidImageUrl(biositeData.biosite?.avatarImage) ? biositeData.biosite?.avatarImage : null;
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    const isSecondTemplate = currentTemplate.id === 'bc1452d1-a688-4567-a424-2a0f09103499' ||
        currentTemplate.index === 1 ||
        currentTemplate.name?.toLowerCase().includes('square') ||
        currentTemplate.name?.toLowerCase().includes('dos');

    const description = biositeData.biosite.owner.description || user?.description;
    const videoEmbed = biositeData.videoEmbed;

    return (
        <div className={`w-full min-h-screen flex items-center justify-center`}
             style={{
                 background: themeConfig.colors.background.startsWith('linear-gradient') ? themeConfig.colors.background : themeConfig.colors.background,
                 backgroundColor: themeConfig.colors.background.startsWith('linear-gradient') ? undefined : themeConfig.colors.background,
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

                    {/* Ordered content sections */}
                    {orderedContentSections.map((section, index) => (
                        <div key={`${section.type}-${index}`}>
                            {section.component}
                        </div>
                    ))}

                    <VCardButton
                        themeConfig={themeConfig}
                        userId={biositeData.biosite.ownerId}
                        biosite={biositeData.biosite}
                        isExposedRoute={isExposedRoute}
                    />

                    {/* Video embed section */}
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

                    <ConditionalNavButton
                        themeConfig={themeConfig}
                    />

                    {/* Bottom spacing */}
                    <div className="h-8"></div>
                </div>
            </div>
        </div>
    );
};

export default PublicBiositeView;