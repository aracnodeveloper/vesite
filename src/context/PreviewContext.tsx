import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type {BiositeColors, BiositeFull, BiositeUpdateDto} from "../interfaces/Biosite";
import type { PreviewContextType, SocialLink, RegularLink } from "../interfaces/PreviewContext.ts";
import { useFetchBiosite, } from "../hooks/useFetchBiosite";
import type {CreateBiositeDto, CreateUserDto} from "../interfaces/User.ts"
import { useFetchLinks } from "../hooks/useFetchLinks";
import Cookies from "js-cookie";

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider = ({ children }: { children: React.ReactNode }) => {
    const userId = Cookies.get('userId');
    const {
        biositeData,
        loading: biositeLoading,
        error: biositeError,
        fetchBiosite,
        fetchUserBiosites,
        createBiosite,
        updateBiosite: updateBiositeHook,
        fetchChildBiosites,
        switchBiosite,
        clearError: clearBiositeError,
        resetState
    } = useFetchBiosite(userId);

    const {
        links,
        loading: linksLoading,
        error: linksError,
        fetchLinks,
        createLink,
        updateLink,
        deleteLink,
        reorderLinks,
        getSocialLinks,
        getRegularLinks,
        clearError: clearLinksError
    } = useFetchLinks(biositeData?.id);

    const [biosite, setBiosite] = useState<BiositeFull | null>(null);
    const [socialLinks, setSocialLinksState] = useState<SocialLink[]>([]);
    const [regularLinks, setRegularLinksState] = useState<RegularLink[]>([]);
    const [themeColor, setThemeColorState] = useState<string>('#ffffff');
    const [fontFamily, setFontFamilyState] = useState<string>('Inter');
    const initializationRef = useRef<{ [key: string]: boolean }>({});

    const loading = biositeLoading || linksLoading;
    const error = biositeError || linksError;

    const getIconIdentifier = useCallback((iconPath: string): string => {
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
            '/assets/icons/onlyfans.svg': 'onlyfans'
        };

        const fullPath = Object.keys(iconMap).find(path => path.includes(iconPath));
        if (fullPath) return iconMap[fullPath];

        const fileName = iconPath.split('/').pop()?.replace('.svg', '') || 'link';
        return fileName.toLowerCase();
    }, []);



    useEffect(() => {
        if (biositeData) {
            setBiosite(biositeData);

            // Set theme color and font family from biosite data
            if (biositeData.colors) {
                if (typeof biositeData.colors === 'string') {
                    setThemeColorState(biositeData.colors);
                } else if (biositeData.colors.background) {
                    setThemeColorState(biositeData.colors.background);
                }
            }

            if (biositeData.fonts) {
                setFontFamilyState(biositeData.fonts);
            }
        }
    }, [biositeData]);

    useEffect(() => {
        if (biositeData?.id) {
            fetchLinks();
        }
    }, [biositeData?.id, fetchLinks]);

    useEffect(() => {
        if (links && Array.isArray(links)) {
            const socialLinksFromAPI = getSocialLinks();
            const socialLinksFormatted = socialLinksFromAPI.map(link => ({
                id: link.id,
                label: link.label,
                name: link.label,
                url: link.url,
                icon: link.icon,
                color: link.color || '#3B82F6',
                isActive: link.isActive
            }));
            const regularLinksFromAPI = getRegularLinks();
            const regularLinksFormatted = regularLinksFromAPI.map(link => ({
                id: link.id,
                title: link.label,
                url: link.url,
                image: undefined,
                orderIndex: link.orderIndex,
                isActive: link.isActive
            }));

            setSocialLinksState(socialLinksFormatted);
            setRegularLinksState(regularLinksFormatted.sort((a, b) => a.orderIndex - b.orderIndex));
        }
    }, [links, getSocialLinks, getRegularLinks, biositeData?.id]);


    const updatePreview = useCallback((data: Partial<BiositeFull>) => {
        setBiosite(prevBiosite => {
            if (!prevBiosite) return null;
            const updated = { ...prevBiosite, ...data };
            console.log("Preview updated:", updated);
            return updated;
        });
    }, []);

    const updateBiosite = useCallback(async (data: BiositeUpdateDto): Promise<BiositeFull | null> => {
        try {
            const result = await updateBiositeHook(data);
            if (result) {
                setBiosite(result);
            }

            return result;
        } catch (error) {
            console.error("PreviewContext: updateBiosite error:", error);
            throw error;
        }
    }, [updateBiositeHook]);

    const refreshBiosite = useCallback(async () => {
        try {
            const refreshedBiosite = await fetchBiosite();
            if (refreshedBiosite) {
                setBiosite(refreshedBiosite);
            }
        } catch (error) {
            console.error("Error refreshing biosite:", error);
        }
    }, [fetchBiosite]);

    const setThemeColor = useCallback(async (color: string) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }
        try {
            setThemeColorState(color);

            const colorsObject: BiositeColors = {
                primary: color,
                secondary: color,
                background: color,
                text: '#000000',
                accent: color,
                profileBackground: color
            };
            const updateData: BiositeUpdateDto = {
                ownerId: biositeData.ownerId,
                title: biositeData.title,
                slug: biositeData.slug,
                themeId: biositeData.themeId,
                colors:JSON.stringify(colorsObject),
                fonts: biositeData.fonts || fontFamily,
                avatarImage: biositeData.avatarImage || '',
                backgroundImage: biositeData.backgroundImage || '',
                isActive: biositeData.isActive
            };

            await updateBiosite(updateData);
        } catch (error) {
            console.error("Error updating theme color:", error);
            if (biositeData.colors) {
                const previousColor = typeof biositeData.colors === 'string'
                    ? biositeData.colors
                    : biositeData.colors.background || '#ffffff';
                setThemeColorState(previousColor);
            }
            throw error;
        }
    }, [biositeData, fontFamily, updateBiosite]);
    const setFontFamily = useCallback(async (font: string) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }

        try {
            console.log("Setting font family:", font);
            setFontFamilyState(font);

            let colorsString: string;
            if (typeof biositeData.colors === 'string') {
                colorsString = biositeData.colors;
            } else {
                colorsString = JSON.stringify(biositeData.colors);
            }
            const updateData: BiositeUpdateDto = {
                ownerId: biositeData.ownerId,
                title: biositeData.title,
                slug: biositeData.slug,
                themeId: biositeData.themeId,
                colors: colorsString,
                fonts: font,
                avatarImage: biositeData.avatarImage || '',
                backgroundImage: biositeData.backgroundImage || '',
                isActive: biositeData.isActive
            };

            await updateBiosite(updateData);
        } catch (error) {
            console.error("Error updating font family:", error);
            setFontFamilyState(biositeData.fonts || 'Inter');
            throw error;
        }
    }, [biositeData, updateBiosite]);
    const createNewBiosite = useCallback(async (data: CreateBiositeDto): Promise<BiositeFull | null> => {
        try {
            const result = await createBiosite(data);
            return result;
        } catch (error) {
            console.error("Error creating biosite:", error);
            throw error;
        }
    }, [createBiosite]);
    const getUserBiosites = useCallback(async (): Promise<BiositeFull[]> => {
        try {
            const result = await fetchUserBiosites();
            return result;
        } catch (error) {
            console.error("Error fetching user biosites:", error);
            throw error;
        }
    }, [fetchUserBiosites]);

    const switchToAnotherBiosite = useCallback(async (biositeId: string): Promise<BiositeFull | null> => {
        try {
            const result = await switchBiosite(biositeId);
            if (result) {
                setBiosite(result);
                Cookies.set('activeBiositeId', biositeId);
                Cookies.set('biositeId', result.id);
                Cookies.set('userId', result.ownerId);
                Cookies.set("roleName", use)
                resetState();

            }
            return result;
        } catch (error) {
            console.error("Error switching biosite:", error);
            throw error;
        }
    }, [switchBiosite, resetState]);
    const getChildBiosites = useCallback(async (): Promise<BiositeFull[]> => {
        const currentUserId = Cookies.get('userId');
        if (!currentUserId) throw new Error('No hay userId');
        return await fetchChildBiosites(currentUserId);
    }, [fetchChildBiosites]);

    const setSocialLinks = useCallback((links: SocialLink[]) => {
        console.log("Setting social links:", links);
        setSocialLinksState(links);
    }, []);
    const addSocialLink = useCallback(async (link: SocialLink) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }

        try {
            console.log("Adding social link:", link);
            const maxOrderIndex = Math.max(...links.map(l => l.orderIndex), -1);
            const iconIdentifier = getIconIdentifier(link.icon);

            const newLink = await createLink({
                biositeId: biositeData.id,
                label: link.label,
                url: link.url,
                icon: iconIdentifier,
                orderIndex: maxOrderIndex + 1,
                isActive: true
            });

            console.log("Social link added:", newLink);
            await fetchLinks();
        } catch (error) {
            console.error("Error adding social link:", error);
            throw error;
        }
    }, [biositeData?.id, createLink, links, getIconIdentifier, fetchLinks]);

    const removeSocialLink = useCallback(async (linkId: string) => {
        try {
            console.log("Removing social link:", linkId);
            if (!linkId) {
                throw new Error("ID del enlace no proporcionado");
            }

            const linkExists = socialLinks.find(link => link.id === linkId);
            if (!linkExists) {
                console.warn("Link not found in local state, but attempting to delete from backend");
            }

            console.log("Calling backend to delete link:", linkId);
            const success = await deleteLink(linkId);

            if (success) {
                console.log("Social link removed successfully from backend");
                setSocialLinksState(prev => {
                    const updated = prev.filter(link => link.id !== linkId);
                    console.log("Local social links updated after deletion:", updated);
                    return updated;
                });
                await fetchLinks();
            } else {
                console.log("Delete operation returned false, checking if link still exists...");
                await fetchLinks();
                const stillExists = links.some(link => link.id === linkId);

                if (!stillExists) {
                    console.log("Link was actually deleted despite returning false");
                    setSocialLinksState(prev => prev.filter(link => link.id !== linkId));
                } else {
                    throw new Error("No se pudo eliminar el enlace del servidor");
                }
            }
        } catch (error) {
            console.error("Error removing social link:", error);
        }
    }, [deleteLink, socialLinks, fetchLinks, setSocialLinksState, links]);

    const updateSocialLink = useCallback(async (linkId: string, updateData: Partial<SocialLink>) => {
        try {
            const updatePayload: any = {
                label: updateData.label,
                url: updateData.url,
                isActive: updateData.isActive,
            };

            if (updateData.icon) {
                updatePayload.icon = getIconIdentifier(updateData.icon);
            }

            const updatedLink = await updateLink(linkId, updatePayload);
            console.log("Social link updated:", updatedLink);
            await fetchLinks();
        } catch (error) {
            console.error("Error updating social link:", error);
            throw error;
        }
    }, [updateLink, getIconIdentifier, fetchLinks]);

    const setRegularLinks = useCallback((links: RegularLink[]) => {
        console.log("Setting regular links:", links);
        setRegularLinksState(links);
    }, []);

    const addRegularLink = useCallback(async (link: Omit<RegularLink, 'id'>) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }

        try {
            const newLink = await createLink({
                biositeId: biositeData.id,
                label: link.title,
                url: link.url,
                icon: 'link',
                orderIndex: link.orderIndex,
                isActive: link.isActive
            });

            console.log("Regular link added:", newLink);
            await fetchLinks();
        } catch (error) {
            console.error("Error adding regular link:", error);
            throw error;
        }
    }, [biositeData?.id, createLink, fetchLinks]);

    const removeRegularLink = useCallback(async (linkId: string) => {
        try {
            console.log("Removing regular link:", linkId);
            await deleteLink(linkId);
            setRegularLinksState(prev => prev.filter(link => link.id !== linkId));
            console.log("Regular link removed successfully");
            await fetchLinks();
        } catch (error) {
            console.error("Error removing regular link:", error);
            await fetchLinks();
            throw error;
        }
    }, [deleteLink, fetchLinks]);

    const updateRegularLink = useCallback(async (linkId: string, updateData: Partial<RegularLink>) => {
        try {
            const updatePayload: any = {
                label: updateData.title,
                url: updateData.url,
                isActive: updateData.isActive,
                orderIndex: updateData.orderIndex
            };
            if (updateData.image !== undefined) {
                updatePayload.image = updateData.image;
            }
            const updatedLink = await updateLink(linkId, updatePayload);
            console.log("Regular link updated:", updatedLink);
            await fetchLinks();
        } catch (error) {
            console.error("Error updating regular link:", error);
            throw error;
        }
    }, [updateLink, fetchLinks]);

    const reorderRegularLinks = useCallback(async (reorderedLinks: RegularLink[]) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }
        try {
            setRegularLinksState(reorderedLinks);
            const reorderData = reorderedLinks.map((link, index) => ({
                id: link.id,
                orderIndex: index
            }));
            await reorderLinks(biositeData.id, reorderData);
            await fetchLinks();
        } catch (error) {
            console.error("Error reordering regular links:", error);
            await fetchLinks();
            throw error;
        }
    }, [biositeData?.id, reorderLinks, fetchLinks]);

    // Special content management functions
    const getMusicEmbed = useCallback(() => {
        return links.find(link => link.icon === 'music-embed' && link.isActive);
    }, [links]);

    const setMusicEmbed = useCallback(async (url: string, note?: string) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }

        try {
            const existingMusic = getMusicEmbed();
            const label = note || 'Music/Podcast';

            if (existingMusic) {
                await updateLink(existingMusic.id, {
                    label,
                    url,
                    isActive: !!url
                });
            } else {
                const maxOrderIndex = Math.max(...links.map(l => l.orderIndex), -1);
                await createLink({
                    biositeId: biositeData.id,
                    label,
                    url,
                    icon: 'music-embed',
                    orderIndex: maxOrderIndex + 1,
                    isActive: !!url
                });
            }
            await fetchLinks();
        } catch (error) {
            console.error("Error setting music embed:", error);
            throw error;
        }
    }, [biositeData?.id, getMusicEmbed, updateLink, createLink, fetchLinks, links]);

    const getSocialPost = useCallback(() => {
        return links.find(link => link.icon === 'social-post' && link.isActive);
    }, [links]);

    const setSocialPost = useCallback(async (url: string, note?: string) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }

        try {
            const existingPost = getSocialPost();
            const label = note || 'Social Post';

            if (existingPost) {
                await updateLink(existingPost.id, {
                    label,
                    url,
                    isActive: !!url
                });
            } else {
                const maxOrderIndex = Math.max(...links.map(l => l.orderIndex), -1);
                await createLink({
                    biositeId: biositeData.id,
                    label,
                    url,
                    icon: 'social-post',
                    orderIndex: maxOrderIndex + 1,
                    isActive: !!url
                });
            }

            await fetchLinks();
        } catch (error) {
            console.error("Error setting social post:", error);
            throw error;
        }
    }, [biositeData?.id, getSocialPost, updateLink, createLink, fetchLinks, links]);

    const getVideoEmbed = useCallback(() => {
        return links.find(link => link.icon === 'video-embed' && link.isActive);
    }, [links]);

    const setVideoEmbed = useCallback(async (url: string, title?: string) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }
        try {
            const existingVideo = getVideoEmbed();
            const label = title || 'Video';

            if (existingVideo) {
                await updateLink(existingVideo.id, {
                    label,
                    url,
                    isActive: !!url
                });
            } else {
                const maxOrderIndex = Math.max(...links.map(l => l.orderIndex), -1);
                await createLink({
                    biositeId: biositeData.id,
                    label,
                    url,
                    icon: 'video-embed',
                    orderIndex: maxOrderIndex + 1,
                    isActive: !!url
                });
            }

            await fetchLinks();
        } catch (error) {
            console.error("Error setting video embed:", error);
            throw error;
        }
    }, [biositeData?.id, getVideoEmbed, updateLink, createLink, fetchLinks, links]);

    const clearError = useCallback(() => {
        clearBiositeError();
        clearLinksError();
    }, [clearBiositeError, clearLinksError]);

    const contextValue: PreviewContextType = {
        biosite,
        socialLinks,
        regularLinks,
        loading,
        error,
        themeColor,
        setThemeColor,
        fontFamily,
        setFontFamily,
        updatePreview,
        updateBiosite,
        refreshBiosite,
        // Biosite management
        createBiosite,
        getUserBiosites,
        switchToAnotherBiosite,
        getChildBiosites,
        // Social links management
        setSocialLinks,
        addSocialLink,
        removeSocialLink,
        updateSocialLink,
        // Regular links management
        setRegularLinks,
        addRegularLink,
        removeRegularLink,
        updateRegularLink,
        reorderRegularLinks,
        // Special content methods
        getMusicEmbed,
        setMusicEmbed,
        getSocialPost,
        setSocialPost,
        getVideoEmbed,
        setVideoEmbed,
        clearError
    };

    return (
        <PreviewContext.Provider value={contextValue}>
            {children}
        </PreviewContext.Provider>
    );
};

export const usePreview = (): PreviewContextType => {
    const context = useContext(PreviewContext);
    if (context === undefined) {
        throw new Error('usePreview must be used within a PreviewProvider');
    }
    return context;
};
