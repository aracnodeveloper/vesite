import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { BiositeFull } from "../interfaces/Biosite";
import type { PreviewContextType, SocialLink, RegularLink, AppLink } from "../interfaces/PreviewContext";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import { useFetchLinks } from "../hooks/useFetchLinks";
import Cookies from "js-cookie";
import { useBiositeOperations } from "../hooks/useBiositeManagement";
import { useLinkOperations } from "../hooks/useLinksManagement";

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
    const [appLinks, setAppLinksState] = useState<AppLink[]>([]);
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
            '/assets/icons/onlyfans.svg': 'onlyfans',
            '/assets/icons/appstore.svg': 'appstore',
            '/assets/icons/googleplay.svg': 'googleplay'
        };

        const fullPath = Object.keys(iconMap).find(path => path.includes(iconPath));
        if (fullPath) return iconMap[fullPath];

        const fileName = iconPath.split('/').pop()?.replace('.svg', '') || 'link';
        return fileName.toLowerCase();
    }, []);

    // Función para identificar si un enlace es de app store
    const isAppStoreLink = useCallback((link: any): boolean => {
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
    }, []);

    // Función para determinar el tipo de store
    const getStoreType = useCallback((link: any): 'appstore' | 'googleplay' => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (labelLower.includes('google play') || urlLower.includes('play.google.com')) {
            return 'googleplay';
        }
        return 'appstore';
    }, []);

    // Función para obtener app links desde los links generales
    const getAppLinks = useCallback(() => {
        return links
            .filter(isAppStoreLink)
            .map(link => ({
                id: link.id,
                store: getStoreType(link),
                url: link.url,
                isActive: link.isActive
            }));
    }, [links, isAppStoreLink, getStoreType]);

    // Simplificación de la inicialización - solo usar userId y biositeId
    useEffect(() => {
        const initializeBiosite = async () => {
            if (!userId || initialized) return;

            try {
                const biositeId = Cookies.get('biositeId');

                if (biositeId) {
                    // Cargar biosite específico por ID
                    await loadBiositeById(biositeId);
                } else {
                    // Cargar el primer biosite del usuario
                    const userBiosites = await fetchUserBiosites();
                    if (userBiosites && userBiosites.length > 0) {
                        const firstBiosite = userBiosites[0];
                        await switchBiosite(firstBiosite.id);
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
            const socialLinksFormatted = socialLinksFromAPI
                .filter(link => !isAppStoreLink(link))
                .map(link => ({
                    id: link.id,
                    label: link.label,
                    name: link.label,
                    url: link.url,
                    icon: link.icon,
                    color: link.color || '#3B82F6',
                    isActive: link.isActive
                }));

            const regularLinksFromAPI = getRegularLinks();
            const regularLinksFormatted = regularLinksFromAPI
                .filter(link => !isAppStoreLink(link))
                .map(link => ({
                    id: link.id,
                    title: link.label,
                    url: link.url,
                    image: undefined,
                    orderIndex: link.orderIndex,
                    isActive: link.isActive
                }));

            const appLinksFromAPI = getAppLinks();

            setSocialLinksState(socialLinksFormatted);
            setRegularLinksState(regularLinksFormatted.sort((a, b) => a.orderIndex - b.orderIndex));
            setAppLinksState(appLinksFromAPI);
        }
    }, [links, getSocialLinks, getRegularLinks, getAppLinks, isAppStoreLink, biositeData?.id]);

    const updatePreview = useCallback((data: Partial<BiositeFull>) => {
        setBiosite(prev => prev ? { ...prev, ...data } : null);
    }, []);

    const clearError = useCallback(() => {
        clearBiositeError();
        clearLinksError();
    }, [clearBiositeError, clearLinksError]);

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

    const { loadBiositeById } = biositeOperations;

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

    // Implementación de app links sin complejidad adicional
    const addAppLink = async (link: Omit<AppLink, 'id'>) => {
        if (!biositeData?.id) {
            throw new Error('Biosite ID is required');
        }

        try {
            const icon = link.store === 'appstore' ? 'appstore' : 'googleplay';
            const label = link.store === 'appstore' ? 'App Store' : 'Google Play';

            const linkData = {
                biositeId: biositeData.id,
                label,
                url: link.url,
                icon,
                orderIndex: links.length,
                isActive: link.isActive
            };

            const newLink = await createLink(linkData);
            if (newLink) {
                console.log('App link created successfully:', newLink);
            }
        } catch (error) {
            console.error('Error creating app link:', error);
            throw error;
        }
    };

    const removeAppLink = async (id: string) => {
        try {
            const success = await deleteLink(id);
            if (success) {
                console.log('App link deleted successfully:', id);
            }
        } catch (error) {
            console.error('Error deleting app link:', error);
            throw error;
        }
    };

    const updateAppLink = async (id: string, data: Partial<AppLink>) => {
        try {
            const updateData: any = {};

            if (data.url !== undefined) {
                updateData.url = data.url;
            }

            if (data.isActive !== undefined) {
                updateData.isActive = data.isActive;
            }

            if (data.store !== undefined) {
                updateData.icon = data.store === 'appstore' ? 'appstore' : 'googleplay';
                updateData.label = data.store === 'appstore' ? 'App Store' : 'Google Play';
            }

            const updatedLink = await updateLink(id, updateData);
            if (updatedLink) {
                console.log('App link updated successfully:', updatedLink);
            }
        } catch (error) {
            console.error('Error updating app link:', error);
            throw error;
        }
    };

    const contextValue: PreviewContextType = {
        biosite,
        socialLinks,
        regularLinks,
        appLinks,
        loading,
        error,
        themeColor,
        fontFamily,
        updatePreview,
        clearError,
        ...biositeOperations,
        ...linkOperations,
        setAppLinks: setAppLinksState,
        addAppLink,
        removeAppLink,
        updateAppLink
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