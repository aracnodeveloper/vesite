import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type {BiositeFull} from "../interfaces/Biosite";
import type { PreviewContextType, SocialLink, RegularLink } from "../interfaces/PreviewContext.ts";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import { useFetchLinks } from "../hooks/useFetchLinks";
import Cookies from "js-cookie";
import { useBiositeOperations } from "../hooks/useBiositeManagement.ts";
import { useLinkOperations } from "../hooks/useLinksManagement.ts";

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
    const [initialized, setInitialized] = useState(false);

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

    // Initialize biosite on mount or when userId changes
    useEffect(() => {
        const initializeBiosite = async () => {
            if (!userId || initialized) return;

            try {
                const activeBiositeId = Cookies.get('activeBiositeId') || Cookies.get('biositeId');

                if (activeBiositeId) {
                    // Try to load the active biosite
                    console.log('Attempting to load active biosite:', activeBiositeId);
                    await loadBiositeById(activeBiositeId);
                } else {
                    // Fetch user's first biosite
                    console.log('No active biosite, fetching user biosites');
                    const userBiosites = await fetchUserBiosites();
                    if (userBiosites && userBiosites.length > 0) {
                        const firstBiosite = userBiosites[0];
                        await switchBiosite(firstBiosite.id);
                        Cookies.set('activeBiositeId', firstBiosite.id);
                        Cookies.set('biositeId', firstBiosite.id);
                    }
                }

                setInitialized(true);
            } catch (error) {
                console.error('Error initializing biosite:', error);
                setInitialized(true);
            }
        };

        initializeBiosite();
    }, [userId, initialized, fetchUserBiosites]);

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

    const clearError = useCallback(() => {
        clearBiositeError();
        clearLinksError();
    }, [clearBiositeError, clearLinksError]);

    // Import biosite operations
    const biositeOperations = useBiositeOperations({
        biositeData,
        fontFamily,
        themeColor,
        setThemeColorState,
        setFontFamilyState,
        updateBiositeHook,
        setBiosite,
        createBiosite,
        fetchUserBiosites,
        switchBiosite,
        fetchChildBiosites,
        resetState
    });

    // Extract loadBiositeById for initialization
    const { loadBiositeById } = biositeOperations;

    // Import link operations
    const linkOperations = useLinkOperations({
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
    });

    const contextValue: PreviewContextType = {
        biosite,
        socialLinks,
        regularLinks,
        loading,
        error,
        themeColor,
        fontFamily,
        updatePreview,
        clearError,
        // Biosite operations
        ...biositeOperations,
        // Link operations
        ...linkOperations
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
