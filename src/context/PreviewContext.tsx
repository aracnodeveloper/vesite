import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { BiositeFull, BiositeUpdateDto } from "../interfaces/Biosite";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import { useFetchLinks } from "../hooks/useFetchLinks";
import Cookies from "js-cookie";

interface SocialLink {
    id: string;
    name: string;
    url: string;
    icon: string;
    color: string;
}

interface PreviewContextType {
    biosite: BiositeFull | null;
    socialLinks: SocialLink[];
    loading: boolean;
    error: string | null;
    updatePreview: (data: Partial<BiositeFull>) => void;
    updateBiosite: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    refreshBiosite: () => Promise<void>;
    setSocialLinks: (links: SocialLink[]) => void;
    addSocialLink: (link: SocialLink) => Promise<void>;
    removeSocialLink: (linkId: string) => Promise<void>;
    updateSocialLink: (linkId: string, updateData: Partial<SocialLink>) => Promise<void>;
    clearError: () => void;
}

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

    // Combined loading and error states
    const loading = biositeLoading || linksLoading;
    const error = biositeError || linksError;

    // Reset state when userId changes
    useEffect(() => {
        if (!userId) {
            setBiosite(null);
            setSocialLinksState([]);
            resetState();
            initializationRef.current = {};
            return;
        }

        // Initialize biosite if not already done for this user
        if (userId && !initializationRef.current[userId]) {
            console.log("Initializing biosite for user:", userId);
            initializationRef.current[userId] = true;
            fetchBiosite();
        }
    }, [userId, fetchBiosite, resetState]);

    // Sync with biosite hook data
    useEffect(() => {
        if (biositeData) {
            console.log("Updating biosite state with new data:", biositeData);
            setBiosite(biositeData);
        }
    }, [biositeData]);

    // Fetch links when biosite is loaded
    useEffect(() => {
        if (biositeData?.id) {
            console.log("Fetching links for biosite:", biositeData.id);
            fetchLinks();
        }
    }, [biositeData?.id, fetchLinks]);

    // Convert backend links to social links format
    useEffect(() => {
        if (links && links.length > 0) {
            const socialLinksFormatted = links
                .filter(link => link.isActive)
                .map(link => ({
                    id: link.id,
                    name: link.label,
                    url: link.url,
                    icon: link.icon,
                    color: getSocialMediaColor(link.label) // Helper function to get color
                }));

            console.log("Converting links to social format:", socialLinksFormatted);
            setSocialLinksState(socialLinksFormatted);
        } else {
            setSocialLinksState([]);
        }
    }, [links]);

    const updatePreview = useCallback((data: Partial<BiositeFull>) => {
        console.log("Updating preview with:", data);
        setBiosite((prev) => {
            if (prev) {
                const updated: BiositeFull = {
                    ...prev,
                    ...data,
                    colors: data.colors ?? prev.colors
                };
                console.log("Preview updated:", updated);
                return updated;
            }
            return null;
        });
    }, []);

    const updateBiosite = useCallback(async (data: BiositeUpdateDto): Promise<BiositeFull | null> => {
        console.log("Updating biosite through context:", data);
        const updated = await updateBiositeHook(data);
        if (updated) {
            setBiosite(updated);
            console.log("Biosite updated successfully:", updated);
        }
        return updated;
    }, [updateBiositeHook]);

    const refreshBiosite = useCallback(async (): Promise<void> => {
        if (userId) {
            console.log("Refreshing biosite data");
            if (initializationRef.current[userId]) {
                initializationRef.current[userId] = false;
            }
            await fetchBiosite();
            if (biositeData?.id) {
                await fetchLinks();
            }
        }
    }, [userId, fetchBiosite, fetchLinks, biositeData?.id]);

    const setSocialLinks = useCallback((newLinks: SocialLink[]) => {
        console.log("Setting social links:", newLinks);
        setSocialLinksState(newLinks);
    }, []);

    const addSocialLink = useCallback(async (link: SocialLink): Promise<void> => {
        if (!biositeData?.id) {
            console.error("No biosite ID available for adding link");
            return;
        }

        try {
            const linkData = {
                biositeId: biositeData.id,
                label: link.name,
                url: link.url,
                icon: link.icon,
                orderIndex: socialLinks.length,
                isActive: true
            };

            console.log("Adding social link:", linkData);
            const newLink = await createLink(linkData);

            if (newLink) {
                const socialLinkFormatted = {
                    id: newLink.id,
                    name: newLink.label,
                    url: newLink.url,
                    icon: newLink.icon,
                    color: link.color
                };

                setSocialLinksState(prev => [...prev, socialLinkFormatted]);
            }
        } catch (error) {
            console.error("Error adding social link:", error);
        }
    }, [biositeData?.id, socialLinks.length, createLink]);

    const removeSocialLink = useCallback(async (linkId: string): Promise<void> => {
        try {
            console.log("Removing social link:", linkId);
            await deleteLink(linkId);
            setSocialLinksState(prev => prev.filter(link => link.id !== linkId));
        } catch (error) {
            console.error("Error removing social link:", error);
        }
    }, [deleteLink]);

    const updateSocialLink = useCallback(async (linkId: string, updateData: Partial<SocialLink>): Promise<void> => {
        try {
            console.log("Updating social link:", linkId, updateData);

            const linkUpdateData = {
                label: updateData.name,
                url: updateData.url,
                icon: updateData.icon
            };

            const updatedLink = await updateLink(linkId, linkUpdateData);

            if (updatedLink) {
                setSocialLinksState(prev =>
                    prev.map(link =>
                        link.id === linkId
                            ? { ...link, ...updateData }
                            : link
                    )
                );
            }
        } catch (error) {
            console.error("Error updating social link:", error);
        }
    }, [updateLink]);

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

export const usePreview = () => {
    const context = useContext(PreviewContext);
    if (!context) {
        throw new Error("usePreview debe usarse dentro de PreviewProvider");
    }
    return context;
};

// Helper function to get social media colors
const getSocialMediaColor = (platform: string): string => {
    const colorMap: { [key: string]: string } = {
        'Instagram': 'bg-gradient-to-r from-purple-500 to-pink-500',
        'TikTok': 'bg-black',
        'Twitter/X': 'bg-black',
        'YouTube': 'bg-red-600',
        'Facebook': 'bg-blue-600',
        'Twitch': 'bg-purple-600',
        'LinkedIn': 'bg-blue-700',
        'Snapchat': 'bg-yellow-400',
        'Threads': 'bg-black',
        'Email': 'bg-gray-600',
        'Pinterest': 'bg-red-500',
        'Spotify': 'bg-green-500',
        'Apple Music': 'bg-gray-800',
        'Discord': 'bg-indigo-600',
        'Tumblr': 'bg-blue-800',
        'WhatsApp': 'bg-green-600',
        'Telegram': 'bg-blue-500',
        'Amazon': 'bg-orange-400',
        'OnlyFans': 'bg-blue-500'
    };

    return colorMap[platform] || 'bg-gray-500';
};