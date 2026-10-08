import { useLivePreviewLogic } from "../hooks/useLivePreviewLogic.ts";
import { useEffect, useMemo, useState } from "react";
import {
  LoadingComponent,
  ErrorComponent,
  NoBiositeComponent,
  BackgroundSection,
  AvatarSection,
  UserInfoSection,
  SocialLinksSection,
  RegularLinksSection,
  TwoSquareImagesSection,
} from "./LivePreviewComponents";
import { ImageGallerySection } from "../../biosite-public/ImageGallerySection.tsx";
import HistoriesPreview from "./HistoriesPreview";
import VCardButton from "../../vcard/components/VCard.tsx";
import ConditionalNavButton from "../../../shared/ui/ConditionalNavButton.tsx";
import { useTemplates } from "../hooks/useTemplates.ts";
import Cookie from "js-cookie";
import AppDownloadButtons from "../../links/app/AppDownloadButtons.tsx";
import WhatsAppButton from "../../links/whatsapp/whatsAppButton.tsx";
import { useNavigate } from "react-router-dom";
import { useSectionsContext } from "../../sections/context/SectionsContext.tsx";
import { useTextBlocks } from "../../text-blocks/hooks/useTextBlocks.ts";
import PreviewEmbedCard from "./PreviewEmbedCard.tsx";
import {
  getInstagramEmbedUrl,
  getSpotifyEmbedUrl,
  getYouTubeEmbedUrl,
  isInstagramUrl,
} from "../../../shared/utils/biositeUtils.ts";

const LivePreviewContent = () => {
  const navigate = useNavigate();
  const maxReloadAttempts = 2;
  const storageKey = "biositeReloadAttempts";
  const [canStartChecking, setCanStartChecking] = useState(false);

  // Get sections from context
  const { sections: contextSections } = useSectionsContext();

  // Get text blocks for gallery
  const { blocks: textBlocks, getBlocksByBiosite } = useTextBlocks();
  const biositeId = Cookie.get("biositeId");

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
    themeConfig,
    musicEmbed,
    socialPost,
    videoEmbed,
    description,
    defaultAvatar,
    handleMusicClick,
    handleVideoClick,
    handleSocialPostClick,
    handleLinksClick,
    handleSocialClick,
    handleImageClick,
    handleUserInfoClick,
    handleAppClick,
    handleVCardClick,
    handleWhatsAppClick,
  } = useLivePreviewLogic();

  const { templates, getTemplateById, getDefaultTemplate, isTemplatesLoaded } =
    useTemplates();

  // Load text blocks for gallery
  useEffect(() => {
    if (biositeId) {
      getBlocksByBiosite(biositeId);
    }
  }, [biositeId, getBlocksByBiosite]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanStartChecking(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canStartChecking) return;

    if (!loading && !userLoading && !biosite) {
      const currentAttempts = parseInt(
        localStorage.getItem(storageKey) || "0",
        10,
      );

      if (currentAttempts >= maxReloadAttempts) {
        console.log("Máximo de recargas alcanzado, navegando a /login");
        localStorage.removeItem(storageKey);
        navigate("/login");
        return;
      }

      const newAttempts = currentAttempts + 1;
      localStorage.setItem(storageKey, newAttempts.toString());
      console.log(`Intento de recarga ${newAttempts} de ${maxReloadAttempts}`);

      const timer = setTimeout(() => {
        window.location.reload();
      }, 100);

      return () => clearTimeout(timer);
    } else if (biosite) {
      localStorage.removeItem(storageKey);
    }
  }, [loading, userLoading, biosite, navigate, canStartChecking]);

  const currentTemplate = useMemo(() => {
    if (!isTemplatesLoaded || !templates.length) {
      return undefined;
    }

    if (
      biosite?.themeId &&
      biosite.themeId !== "null" &&
      biosite.themeId !== null &&
      biosite.themeId !== undefined &&
      biosite.themeId.trim() !== ""
    ) {
      const template = getTemplateById(biosite.themeId);

      if (template) {
        return template;
      }
    }

    const defaultTemplate = getDefaultTemplate();
    return defaultTemplate;
  }, [
    biosite?.themeId,
    templates,
    isTemplatesLoaded,
    getTemplateById,
    getDefaultTemplate,
  ]);

  const getSectionOrderIndex = (sectionTitle: string): number => {
    const section = contextSections.find((s) => s.titulo === sectionTitle);
    return section?.orderIndex || 999;
  };

  const orderedContentSections = useMemo(() => {
    const sections = [];

    // Social Links Section
    if (realSocialLinks.length > 0) {
      sections.push({
        type: "social",
        orderIndex: getSectionOrderIndex("Social"),
        component: (
          <SocialLinksSection
            key="social-section"
            realSocialLinks={realSocialLinks}
            findPlatformForLink={findPlatformForLink}
            handleSocialClick={handleSocialClick}
            themeConfig={themeConfig}
          />
        ),
      });
    }

    // Regular Links Section
    if (regularLinksData.length > 0) {
      sections.push({
        type: "regular",
        orderIndex: getSectionOrderIndex("Links"),
        component: (
          <RegularLinksSection
            key="regular-section"
            regularLinksData={regularLinksData}
            handleLinksClick={handleLinksClick}
            themeConfig={themeConfig}
          />
        ),
      });
    }

    // WhatsApp Section
    sections.push({
      type: "whatsapp",
      orderIndex: getSectionOrderIndex("Contactame"),
      component: (
        <WhatsAppButton
          key="whatsapp-section"
          onWhatsAppClick={handleWhatsAppClick}
          themeConfig={themeConfig}
        />
      ),
    });

    // App Download Section
    sections.push({
      type: "app",
      orderIndex: getSectionOrderIndex("Link de mi App"),
      component: (
        <div
          key="app-section"
          onClick={handleAppClick}
        >
          <AppDownloadButtons themeConfig={themeConfig} />
        </div>
      ),
    });

    // VCard Section
    sections.push({
      type: "vcard",
      orderIndex: getSectionOrderIndex("VCard"),
      component: (
        <VCardButton
          key="vcard-section"
          themeConfig={themeConfig}
          userId={user?.id || Cookie.get("userId")}
          onVcardClick={handleVCardClick}
        />
      ),
    });

    // Video Section
    if (videoEmbed) {
      sections.push({
        type: "video",
        orderIndex: getSectionOrderIndex("Video"),
        component: (
          <PreviewEmbedCard
            key="video-section"
            embedUrl={getYouTubeEmbedUrl(videoEmbed.url)}
            label={videoEmbed.label}
            url={videoEmbed.url}
            kindLabel="Video"
            fallbackAccent="#ef4444"
            embedClassName="video-embed"
            iframeProps={{
              height: "150",
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              allowFullScreen: true,
            }}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            }
            themeConfig={themeConfig}
            onClick={handleVideoClick}
          />
        ),
      });
    }

    // Music/Podcast Section
    if (musicEmbed) {
      sections.push({
        type: "music",
        orderIndex: getSectionOrderIndex("Music / Podcast"),
        component: (
          <PreviewEmbedCard
            key="music-section"
            embedUrl={getSpotifyEmbedUrl(musicEmbed.url)}
            label={musicEmbed.label}
            url={musicEmbed.url}
            kindLabel="Música"
            fallbackAccent="#10b981"
            embedClassName="spotify-embed"
            withBackground={false}
            iframeProps={{
              height: "80",
              allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
            }}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98L6 3.75c-.553.138-.954.63-.954 1.188V8.5a2.5 2.5 0 11-1.5 2.292V4.938A2.5 2.5 0 016.094 2.5L17.5 1a1 1 0 01.5.98v8.52a2.5 2.5 0 11-1.5 2.292V3z" />
              </svg>
            }
            themeConfig={themeConfig}
            onClick={handleMusicClick}
          />
        ),
      });
    }

    // Social Post Section
    if (socialPost) {
      sections.push({
        type: "socialpost",
        orderIndex: getSectionOrderIndex("Social Post"),
        component: (
          <PreviewEmbedCard
            key="socialpost-section"
            embedUrl={isInstagramUrl(socialPost.url) ? getInstagramEmbedUrl(socialPost.url) : null}
            label={socialPost.label}
            url={socialPost.url}
            kindLabel="Post"
            fallbackAccent="#8b5cf6"
            embedClassName="instagram-embed"
            iframeProps={{ height: "400", scrolling: "no" }}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            }
            themeConfig={themeConfig}
            onClick={handleSocialPostClick}
          />
        ),
      });
    }

    // Gallery Section
    if (textBlocks.length > 0) {
      const blocksWithImages = textBlocks.filter((block) => block.image);
      if (blocksWithImages.length > 0) {
        sections.push({
          type: "gallery",
          orderIndex: getSectionOrderIndex("Gallery"),
          component: (
            <ImageGallerySection
              key="gallery-section"
              textBlocks={textBlocks}
              themeConfig={themeConfig}
              handleGalleryClick={() => navigate("/gallery")}
            />
          ),
        });
      }
    }

    // Sort sections by orderIndex
    return sections.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [
    realSocialLinks,
    regularLinksData,
    musicEmbed,
    socialPost,
    videoEmbed,
    textBlocks,
    themeConfig,
    findPlatformForLink,
    handleSocialClick,
    handleWhatsAppClick,
    handleLinksClick,
    handleMusicClick,
    handleSocialPostClick,
    handleVideoClick,
    handleAppClick,
    handleVCardClick,
    contextSections,
    getSectionOrderIndex,
    user?.id,
    navigate,
  ]);

  if (loading || userLoading || !isTemplatesLoaded) {
    return <LoadingComponent themeConfig={themeConfig} />;
  }

  if (error || userError) {
    return (
      <ErrorComponent error={error || userError} themeConfig={themeConfig} />
    );
  }

  if (!biosite) {
    return <NoBiositeComponent themeConfig={themeConfig} />;
  }

  if (!currentTemplate) {
    console.log("No template available, showing loading...");
    return <LoadingComponent themeConfig={themeConfig} />;
  }

  const isSecondTemplate =
    currentTemplate.id === "bc1452d1-a688-4567-a424-2a0f09103499" ||
    currentTemplate.index === 1 ||
    currentTemplate.name?.toLowerCase().includes("square") ||
    currentTemplate.name?.toLowerCase().includes("dos");

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center`}
      style={{
        background: themeConfig.colors.background,
        backgroundColor: themeConfig.colors.background.startsWith(
          "linear-gradient",
        )
          ? undefined
          : themeConfig.colors.background,
        fontFamily: themeConfig.fonts.primary,
        color: themeConfig.colors.text,
      }}
    >
      <div className="w-full max-w-sm min-h-screen mx-auto">
        {isSecondTemplate ? (
          <>
            <div
              className="w-full h-24"
              style={{ backgroundColor: themeConfig.colors.background }}
            ></div>

            <TwoSquareImagesSection
              validBackgroundImage={validBackgroundImage}
              validAvatarImage={validAvatarImage}
              imageLoadStates={imageLoadStates}
              handleImageLoadStart={handleImageLoadStart}
              handleImageLoad={handleImageLoad}
              handleImageError={handleImageError}
              biosite={biosite}
              themeConfig={themeConfig}
              defaultAvatar={defaultAvatar}
              handleImageClick={handleImageClick}
            />
          </>
        ) : (
          <>
            <BackgroundSection
              validBackgroundImage={validBackgroundImage}
              imageLoadStates={imageLoadStates}
              handleImageLoadStart={handleImageLoadStart}
              handleImageLoad={handleImageLoad}
              handleImageError={handleImageError}
              biosite={biosite}
              themeConfig={themeConfig}
              handleImageClick={handleImageClick}
            />

            <AvatarSection
              validAvatarImage={validAvatarImage}
              imageLoadStates={imageLoadStates}
              handleImageLoadStart={handleImageLoadStart}
              handleImageLoad={handleImageLoad}
              handleImageError={handleImageError}
              biosite={biosite}
              themeConfig={themeConfig}
              defaultAvatar={defaultAvatar}
              handleImageClick={handleImageClick}
              historyIndicator={
                <HistoriesPreview
                  biositeId={biosite?.id}
                  accentColor={themeConfig.colors.accent}
                  textColor={themeConfig.colors.text}
                  display="avatar-trigger"
                />
              }
            />
          </>
        )}

        {/* Main content */}
        <div className="w-full max-w-sm mx-auto">
          {/* User info section */}
          <UserInfoSection
            biosite={biosite}
            user={user}
            description={description}
            themeConfig={themeConfig}
            handleUserInfoClick={handleUserInfoClick}
          />

          {/* Render ordered content sections */}
          {orderedContentSections.map((section, index) => (
            <div key={`${section.type}-${index}`}>{section.component}</div>
          ))}

          <ConditionalNavButton themeConfig={themeConfig} />

          {/* Final spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default LivePreviewContent;
