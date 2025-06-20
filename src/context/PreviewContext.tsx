import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { BiositeFull, BiositeUpdateDto } from "../interfaces/Biosite";
import type { PreviewContextType, SocialLink } from "../interfaces/PreviewContext.ts";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
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
        updateBiosite: updateBiositeHook,
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
        clearError: clearLinksError
    } = useFetchLinks(biositeData?.id);

    const [biosite, setBiosite] = useState<BiositeFull | null>(null);
    const [socialLinks, setSocialLinksState] = useState<SocialLink[]>([]);
    const initializationRef = useRef<{ [key: string]: boolean }>({});

    const loading = biositeLoading || linksLoading;
    const error = biositeError || linksError;

    useEffect(() => {
        if (!userId) {
            setBiosite(null);
            setSocialLinksState([]);
            resetState();
            initializationRef.current = {};
            return;
        }

        if (userId && !initializationRef.current[userId]) {

            initializationRef.current[userId] = true;
            fetchBiosite();
        }
    }, [userId, fetchBiosite, resetState]);

    useEffect(() => {
        if (biositeData) {
            setBiosite(biositeData);
        }
    }, [biositeData]);

    useEffect(() => {
        if (biositeData?.id) {
            fetchLinks();
        }
    }, [biositeData?.id, fetchLinks]);

    useEffect(() => {
        if (links && Array.isArray(links)) {
            const transformedLinks: SocialLink[] = links.map(link => ({
                id: link.id,
                name: link.label || link.title || 'Unnamed Link',
                url: link.url,
                icon: link.icon || '🔗',
                color: link.color || '#3B82F6'
            }));
            setSocialLinksState(transformedLinks);
        }
    }, [links]);

    const updatePreview = useCallback((data: Partial<BiositeFull>) => {

        setBiosite(prevBiosite => {
            if (!prevBiosite) return null;
            const updated = { ...prevBiosite, ...data };
            console.log("Preview updated:", updated);
            return updated;
        });
    }, []);

    const updateBiosite = useCallback(async (data: BiositeUpdateDto): Promise<BiositeFull | null> => {
        console.log("PreviewContext: updateBiosite called with:", data);
        try {
            const result = await updateBiositeHook(data);
            console.log("PreviewContext: updateBiosite result:", result);

            if (result) {
                setBiosite(result);
                console.log("PreviewContext: biosite state updated");
            }

            return result;
        } catch (error) {
            console.error("PreviewContext: updateBiosite error:", error);
            throw error;
        }
    }, [updateBiositeHook]);

    // Refresh biosite function
    const refreshBiosite = useCallback(async () => {
        console.log("Refreshing biosite...");
        try {
            const refreshedBiosite = await fetchBiosite();
            if (refreshedBiosite) {
                setBiosite(refreshedBiosite);
                console.log("Biosite refreshed successfully");
            }
        } catch (error) {
            console.error("Error refreshing biosite:", error);
        }
    }, [fetchBiosite]);

    // Social links management functions
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
            const newLink = await createLink({
                biositeId: biositeData.id,
                label: link.name,
                url: link.url,
                icon: link.icon,
                color: link.color,
                isActive: true,
                orderIndex: socialLinks.length
            });

            console.log("Social link added:", newLink);
            // The useEffect will handle updating the state when links change
        } catch (error) {
            console.error("Error adding social link:", error);
            throw error;
        }
    }, [biositeData?.id, createLink, socialLinks.length]);

    const removeSocialLink = useCallback(async (linkId: string) => {
        try {
            console.log("Removing social link:", linkId);
            await deleteLink(linkId);
            console.log("Social link removed successfully");
            // The useEffect will handle updating the state when links change
        } catch (error) {
            console.error("Error removing social link:", error);
            throw error;
        }
    }, [deleteLink]);

    const updateSocialLink = useCallback(async (linkId: string, updateData: Partial<SocialLink>) => {
        try {
            console.log("Updating social link:", linkId, updateData);
            const updatedLink = await updateLink(linkId, {
                label: updateData.name,
                url: updateData.url,
                icon: updateData.icon,
                color: updateData.color
            });
            console.log("Social link updated:", updatedLink);
            // The useEffect will handle updating the state when links change
        } catch (error) {
            console.error("Error updating social link:", error);
            throw error;
        }
    }, [updateLink]);

    // Clear error function
    const clearError = useCallback(() => {
        clearBiositeError();
        clearLinksError();
    }, [clearBiositeError, clearLinksError]);

    const contextValue: PreviewContextType = {
        biosite,
        socialLinks,
        loading,
        error,
        updatePreview,
        updateBiosite,
        refreshBiosite,
        setSocialLinks,
        addSocialLink,
        removeSocialLink,
        updateSocialLink,
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