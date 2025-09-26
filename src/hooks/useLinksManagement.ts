import { useCallback } from "react";
import type { BiositeFull } from "../interfaces/Biosite";
import type { SocialLink, RegularLink } from "../interfaces/PreviewContext.ts";
import type { Link } from "../interfaces/Links.ts";
import { adminLinkMethods } from "../service/apiService";
import Cookie from "js-cookie";

// Link type constants
const LINK_TYPES = {
    SOCIAL: 'social',
    REGULAR: 'regular',
    APP: 'app',
    WHATSAPP: 'whatsapp',
    MUSIC: 'music',
    VIDEO: 'video',
    SOCIAL_POST: 'social_post'
} as const;

interface UseLinkOperationsProps {
    biositeData: BiositeFull | null;
    links: any[];
    socialLinks: SocialLink[];
    setSocialLinksState: (links: SocialLink[] | ((prev: SocialLink[]) => SocialLink[])) => void;
    setRegularLinksState: (links: RegularLink[] | ((prev: RegularLink[]) => RegularLink[])) => void;
    createLink: (data: any) => Promise<any>;
    updateLink: (linkId: string, data: any) => Promise<any>;
    deleteLink: (linkId: string) => Promise<boolean>;
    reorderLinks: (biositeId: string, data: any) => Promise<any>;
    fetchLinks: () => Promise<Link[]>;
    getIconIdentifier: (iconPath: string) => string;
}

export const useLinkOperations = ({
                                      biositeData,
                                      links,
                                      socialLinks,
                                      setSocialLinksState,
                                      setRegularLinksState,
                                      createLink,
                                      updateLink,
                                      deleteLink,
                                      reorderLinks,
                                      fetchLinks,
                                      getIconIdentifier
                                  }: UseLinkOperationsProps) => {

    // Get user role from cookies or context
    const getUserRole = useCallback((): 'USER' | 'ADMIN' | 'SUPER_ADMIN' => {
        const role = Cookie.get('roleName');
        return role as 'USER' | 'ADMIN' | 'SUPER_ADMIN' || 'USER';
    }, []);

    const getUserId = useCallback((): string | null => {
        return Cookie.get('userId') || null;
    }, []);

    const isAdmin = useCallback(() => {
        const role = getUserRole();
        return role === 'ADMIN' || role === 'SUPER_ADMIN';
    }, [getUserRole]);

    // Admin-specific methods
    const toggleAdminLink = useCallback(async (linkId: string, isSelected: boolean) => {
        if (!isAdmin() || !biositeData?.id) {
            throw new Error("No admin permissions or biosite data");
        }

        const userId = getUserId();
        if (!userId) {
            throw new Error("No user ID found");
        }

        try {
            const link = links.find(l => l.id === linkId);
            if (!link) {
                throw new Error("Link not found");
            }

            if (isSelected) {
                // Apply link to children
                const linkData = {
                    icon:  'link',
                    url: link.url,
                    label: link.label,
                    link_type: link.link_type || LINK_TYPES.REGULAR,
                    orderIndex: link.orderIndex || 0,
                };

                await adminLinkMethods.updateAdminLink(userId, linkData);

                // Update local state to mark as selected
                await updateLink(linkId, {
                    ...link,
                    isSelected: true
                });
            } else {
                // Remove from children - just update local state
                await updateLink(linkId, {
                    ...link,
                    isSelected: false
                });
            }

            // Refresh links to get updated state
            await fetchLinks();
        } catch (error) {
            console.error("Error toggling admin link:", error);
            throw error;
        }
    }, [isAdmin, biositeData, links, getUserId, getIconIdentifier, updateLink, fetchLinks]);

    const updateAdminLink = useCallback(async (linkId: string, linkData: any) => {
        if (!isAdmin() || !biositeData?.id) {
            throw new Error("No admin permissions or biosite data");
        }

        const userId = getUserId();
        if (!userId) {
            throw new Error("No user ID found");
        }

        try {
            // Update the link to children
            await adminLinkMethods.updateAdminLink(userId, linkData);

            // Update local link
            await updateLink(linkId, linkData);

            // Refresh links
            await fetchLinks();
        } catch (error) {
            console.error("Error updating admin link:", error);
            throw error;
        }
    }, [isAdmin, biositeData, getUserId, updateLink, fetchLinks]);

    // Original methods with admin checks
    const setSocialLinks = useCallback((links: SocialLink[]) => {
        console.log("Setting social links:", links);
        setSocialLinksState(links);
    }, [setSocialLinksState]);

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
                isActive: true,
                link_type: LINK_TYPES.SOCIAL,
                isSelected: false // New links start as not selected
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

            // Check if link is admin-selected
            const linkToRemove = links.find(l => l.id === linkId);
            if (linkToRemove?.isSelected && !isAdmin()) {
                throw new Error("No puedes eliminar un enlace asignado por administrador");
            }

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
                setSocialLinksState((prev: SocialLink[]) => {
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
                    setSocialLinksState((prev: SocialLink[]) => prev.filter(link => link.id !== linkId));
                } else {
                    throw new Error("No se pudo eliminar el enlace del servidor");
                }
            }
        } catch (error) {
            console.error("Error removing social link:", error);
            throw error;
        }
    }, [deleteLink, socialLinks, fetchLinks, setSocialLinksState, links, isAdmin]);

    const updateSocialLink = useCallback(async (linkId: string, updateData: Partial<SocialLink>) => {
        try {
            // Check if link is admin-selected
            const linkToUpdate = links.find(l => l.id === linkId);
            if (linkToUpdate?.isSelected && !isAdmin()) {
                throw new Error("No puedes editar un enlace asignado por administrador");
            }

            const updatePayload: any = {
                label: updateData.label,
                url: updateData.url,
                isActive: updateData.isActive,
                link_type: LINK_TYPES.SOCIAL
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
    }, [updateLink, getIconIdentifier, fetchLinks, links, isAdmin]);

    const setRegularLinks = useCallback((links: RegularLink[]) => {
        console.log("Setting regular links:", links);
        setRegularLinksState(links);
    }, [setRegularLinksState]);

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
                isActive: link.isActive,
                link_type: LINK_TYPES.REGULAR,
                isSelected: false // New links start as not selected
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
            // Check if link is admin-selected
            const linkToRemove = links.find(l => l.id === linkId);
            if (linkToRemove?.isSelected && !isAdmin()) {
                throw new Error("No puedes eliminar un enlace asignado por administrador");
            }

            console.log("Removing regular link:", linkId);
            await deleteLink(linkId);
            setRegularLinksState((prev: RegularLink[]) => prev.filter(link => link.id !== linkId));
            console.log("Regular link removed successfully");
            await fetchLinks();
        } catch (error) {
            console.error("Error removing regular link:", error);
            await fetchLinks();
            throw error;
        }
    }, [deleteLink, fetchLinks, setRegularLinksState, links, isAdmin]);

    const updateRegularLink = useCallback(async (linkId: string, updateData: Partial<RegularLink>) => {
        try {
            // Check if link is admin-selected
            const linkToUpdate = links.find(l => l.id === linkId);
            if (linkToUpdate?.isSelected && !isAdmin()) {
                throw new Error("No puedes editar un enlace asignado por administrador");
            }

            const updatePayload: any = {
                label: updateData.title,
                url: updateData.url,
                isActive: updateData.isActive,
                orderIndex: updateData.orderIndex,
                link_type: LINK_TYPES.REGULAR
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
    }, [updateLink, fetchLinks, links, isAdmin]);

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
    }, [biositeData?.id, reorderLinks, fetchLinks, setRegularLinksState]);

    // Other methods remain the same...
    const getMusicEmbed = useCallback(() => {
        return links.find(link =>
            (link.link_type === LINK_TYPES.MUSIC || link.icon === 'music-embed') &&
            link.isActive
        );
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
                    isActive: !!url,
                    link_type: LINK_TYPES.MUSIC
                });
            } else {
                const maxOrderIndex = Math.max(...links.map(l => l.orderIndex), -1);
                await createLink({
                    biositeId: biositeData.id,
                    label,
                    url,
                    icon: 'music-embed',
                    orderIndex: maxOrderIndex + 1,
                    isActive: !!url,
                    link_type: LINK_TYPES.MUSIC,
                    isSelected: false
                });
            }
            await fetchLinks();
        } catch (error) {
            console.error("Error setting music embed:", error);
            throw error;
        }
    }, [biositeData?.id, getMusicEmbed, updateLink, createLink, fetchLinks, links]);

    const getSocialPost = useCallback(() => {
        return links.find(link =>
            (link.link_type === LINK_TYPES.SOCIAL_POST || link.icon === 'social-post') &&
            link.isActive
        );
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
                    isActive: !!url,
                    link_type: LINK_TYPES.SOCIAL_POST
                });
            } else {
                const maxOrderIndex = Math.max(...links.map(l => l.orderIndex), -1);
                await createLink({
                    biositeId: biositeData.id,
                    label,
                    url,
                    icon: 'social-post',
                    orderIndex: maxOrderIndex + 1,
                    isActive: !!url,
                    link_type: LINK_TYPES.SOCIAL_POST,
                    isSelected: false
                });
            }

            await fetchLinks();
        } catch (error) {
            console.error("Error setting social post:", error);
            throw error;
        }
    }, [biositeData?.id, getSocialPost, updateLink, createLink, fetchLinks, links]);

    const getVideoEmbed = useCallback(() => {
        return links.find(link =>
            (link.link_type === LINK_TYPES.VIDEO || link.icon === 'video-embed') &&
            link.isActive
        );
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
                    isActive: !!url,
                    link_type: LINK_TYPES.VIDEO
                });
            } else {
                const maxOrderIndex = Math.max(...links.map(l => l.orderIndex), -1);
                await createLink({
                    biositeId: biositeData.id,
                    label,
                    url,
                    icon: 'video-embed',
                    orderIndex: maxOrderIndex + 1,
                    isActive: !!url,
                    link_type: LINK_TYPES.VIDEO,
                    isSelected: false
                });
            }

            await fetchLinks();
        } catch (error) {
            console.error("Error setting video embed:", error);
            throw error;
        }
    }, [biositeData?.id, getVideoEmbed, updateLink, createLink, fetchLinks, links]);

    return {
        // Social links methods
        setSocialLinks,
        addSocialLink,
        removeSocialLink,
        updateSocialLink,
        // Regular links methods
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
        // Admin methods
        toggleAdminLink,
        updateAdminLink,
        getUserRole,
        isAdmin,
        // Constants
        LINK_TYPES
    };
};