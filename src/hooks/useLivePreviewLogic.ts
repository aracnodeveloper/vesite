// hooks/useLivePreviewLogic.ts
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useLivePreview } from "./useLivePreview.ts";
import { usePreview } from "../context/PreviewContext.tsx";
import { useUser } from "./useUser.ts";
import type { SocialLink } from "../interfaces/PreviewContext.ts";

export const useLivePreviewLogic = () => {
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
                colors: {
                    primary: biosite.theme.config.colors.primary,
                    secondary: biosite.theme.config.colors.secondary,
                    accent: biosite.theme.config.colors.accent || biosite.theme.config.colors.primary,
                    background: biosite.theme.config.colors.background || themeColor || '#ffffff',
                    text: biosite.theme.config.colors.text || '#000000',
                    profileBackground: biosite.theme.config.colors.profileBackground || themeColor || '#ffffff'
                },
                fonts: {
                    primary: biosite.theme.config.fonts.primary || fontFamily || 'Inter',
                    secondary: biosite.theme.config.fonts.secondary || fontFamily || 'Lato'
                },
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
                secondary: fontFamily || 'Lato'
            },
            isDark: false,
            isAnimated: false
        };
    };

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

    const themeConfig = getThemeConfig();
    const musicEmbed = getMusicEmbed();
    const socialPost = getSocialPost();
    const videoEmbed = getVideoEmbed();
    const realSocialLinks = filterRealSocialLinks(socialLinksData);
    const description = user?.description || user?.name || 'Tu descripción aquí';

    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    return {
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
        handleSocialClick
    };
};