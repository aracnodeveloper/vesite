import { useLivePreviewLogic } from '../../hooks/useLivePreviewLogic.ts';
import { useEffect, useMemo } from 'react';
import {
    LoadingComponent,
    ErrorComponent,
    NoBiositeComponent,
    BackgroundSection,
    AvatarSection,
    UserInfoSection,
    SocialLinksSection,
    RegularLinksSection, TwoSquareImagesSection, WhatsAppSection,
} from './LivePreviewComponents';
import VCardButton from "../global/VCard/VCard.tsx";

import Cookie from "js-cookie";
import ConditionalNavButton from "../ConditionalNavButton.tsx";
import {useTemplates} from "../../hooks/useTemplates.ts";

const LivePreviewContent = () => {
    const {
        biosite,
        loading,
        error,
        userLoading,
        userError,
        user,
        imageLoadStates,
        handleImageLoad,
        handleImageError,
        handleImageLoadStart,
        regularLinksData,
        realSocialLinks,
        validBackgroundImage,
        validAvatarImage,
        findPlatformForLink,
        isExposedRoute,
        themeConfig,
        musicEmbed,
        socialPost,
        videoEmbed,
        description,
        defaultAvatar,
        getSpotifyEmbedUrl,
        getYouTubeEmbedUrl,
        getInstagramEmbedUrl,
        isInstagramUrl,
        handleMusicClick,
        handleVideoClick,
        handleSocialPostClick,
        handleLinksClick,
        handleSocialClick,
        whatsAppLink,
        whatsAppData,
    } = useLivePreviewLogic();

    const { templates, getTemplateById, getDefaultTemplate, isTemplatesLoaded } = useTemplates();
    useEffect(() => {
        if (!loading && !userLoading && !biosite) {
            const timer = setTimeout(() => {
                window.location.reload();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [loading, userLoading, biosite]);


    const currentTemplate = useMemo(() => {

        if (!isTemplatesLoaded || !templates.length) {
            console.log('Templates not loaded or empty');
            return undefined;
        }

        if (biosite?.themeId &&
            biosite.themeId !== 'null' &&
            biosite.themeId !== null &&
            biosite.themeId !== undefined &&
            biosite.themeId.trim() !== '') {

            const template = getTemplateById(biosite.themeId);

            if (template) {
                return template;
            } else {
                console.log('Template not found, available template IDs:', templates.map(t => t.id));
            }
        }

        const defaultTemplate = getDefaultTemplate();
        console.log('Using default template:', defaultTemplate);
        return defaultTemplate;
    }, [biosite?.themeId, templates, isTemplatesLoaded, getTemplateById, getDefaultTemplate]);

    if (loading || userLoading || !isTemplatesLoaded) {
        return <LoadingComponent themeConfig={themeConfig} />;
    }

    if (error || userError) {
        return <ErrorComponent error={error || userError} themeConfig={themeConfig} />;
    }

    if (!biosite) {
        return <NoBiositeComponent themeConfig={themeConfig} />;
    }

    // If we still don't have a template, show loading
    if (!currentTemplate) {
        console.log('No template available, showing loading...');
        return <LoadingComponent themeConfig={themeConfig} />;
    }

    // Fixed template layout determination
    // Check by template ID or index to determine layout
    const isSecondTemplate = currentTemplate.id === 'bc1452d1-a688-4567-a424-2a0f09103499' ||
        currentTemplate.index === 1 ||
        currentTemplate.name?.toLowerCase().includes('square') ||
        currentTemplate.name?.toLowerCase().includes('dos');


    return (
        <div className={`w-full ${isExposedRoute ? 'min-h-screen flex items-center justify-center' : 'min-h-screen flex items-center justify-center'} `}
             style={{
                 backgroundColor: themeConfig.colors.background,
                 fontFamily: themeConfig.fonts.primary,
                 color: themeConfig.colors.text
             }}>

            <div className={`w-full ${isExposedRoute ? 'max-w-full' : 'max-w-sm'} min-h-screen mx-auto`}>

                {/* Layout condicional basado en la plantilla */}
                {isSecondTemplate ? (
                    // Template 2: Dos imágenes cuadradas
                    <>
                        {/* Fondo sólido para la segunda plantilla */}
                        <div className="w-full h-24" style={{ backgroundColor: themeConfig.colors.background }}></div>

                        {/* Dos imágenes cuadradas */}
                        <TwoSquareImagesSection
                            isExposedRoute={isExposedRoute}
                            validBackgroundImage={validBackgroundImage}
                            validAvatarImage={validAvatarImage}
                            imageLoadStates={imageLoadStates}
                            handleImageLoadStart={handleImageLoadStart}
                            handleImageLoad={handleImageLoad}
                            handleImageError={handleImageError}
                            biosite={biosite}
                            themeConfig={themeConfig}
                            defaultAvatar={defaultAvatar}
                        />
                    </>
                ) : (
                    // Template 1: Layout por defecto
                    <>
                        {/* Sección de fondo */}
                        <BackgroundSection
                            isExposedRoute={isExposedRoute}
                            validBackgroundImage={validBackgroundImage}
                            imageLoadStates={imageLoadStates}
                            handleImageLoadStart={handleImageLoadStart}
                            handleImageLoad={handleImageLoad}
                            handleImageError={handleImageError}
                            biosite={biosite}
                            themeConfig={themeConfig}
                        />

                        {/* Avatar circular */}
                        <AvatarSection
                            isExposedRoute={isExposedRoute}
                            validAvatarImage={validAvatarImage}
                            imageLoadStates={imageLoadStates}
                            handleImageLoadStart={handleImageLoadStart}
                            handleImageLoad={handleImageLoad}
                            handleImageError={handleImageError}
                            biosite={biosite}
                            themeConfig={themeConfig}
                            defaultAvatar={defaultAvatar}
                        />
                    </>
                )}

                {/* Contenido principal */}
                <div className={`w-full ${isExposedRoute ? 'max-w-md' : 'max-w-sm'} mx-auto`}>

                    {/* Información del usuario */}
                    <UserInfoSection
                        biosite={biosite}
                        user={user}
                        description={description}
                        themeConfig={themeConfig}
                    />

                    {/* WhatsApp Link */}
                    <WhatsAppSection
                        whatsAppLink={whatsAppLink}
                        whatsAppData={whatsAppData}
                        isExposedRoute={isExposedRoute}
                        themeConfig={themeConfig}
                    />

                    {/* Links sociales */}
                    <SocialLinksSection
                        realSocialLinks={realSocialLinks}
                        isExposedRoute={isExposedRoute}
                        findPlatformForLink={findPlatformForLink}
                        handleSocialClick={handleSocialClick}
                        themeConfig={themeConfig}
                    />

                    {/* Links regulares */}
                    <RegularLinksSection
                        regularLinksData={regularLinksData}
                        isExposedRoute={isExposedRoute}
                        handleLinksClick={handleLinksClick}
                        themeConfig={themeConfig}
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

                    {/* V-Card Button */}
                    <VCardButton
                        themeConfig={themeConfig} // Pasar el userId del biosite público
                    />

                    {/* VIDEO EMBED */}
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

export default LivePreviewContent;
