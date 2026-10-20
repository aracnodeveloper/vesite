import {createContext, useContext, useEffect, useState, useCallback} from "react";
import type { BiositeFull } from "../types/Biosite";
import type {PreviewContextType, SocialLink, RegularLink, AppLink, WhatsAppLink} from "../types/PreviewContext";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import { useFetchLinks } from "../../links/hooks/useFetchLinks";
import { useBiositeOperations } from "../hooks/useBiositeManagement";
import { useLinkOperations } from "../../links/hooks/useLinksManagement";
import { useAppLinkOperations } from "../../links/hooks/useAppLinkOperations";
import { useWhatsAppLinkOperations } from "../../links/hooks/useWhatsAppLinkOperations";
import {
    getIconIdentifier,
    toAppLink,
    toRegularLink,
    toSocialLink,
    toWhatsAppLink,
} from "../../links/utils/linkMappers";
import Cookie from "js-cookie";

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

/**
 * Estado del biosite que se está editando: datos, links agrupados por tipo,
 * tema/tipografía y todas las operaciones de edición.
 */
export const PreviewProvider = ({ children }: { children: React.ReactNode }) => {
    const userId = Cookie.get('userId');
    const biositeId = Cookie.get('biositeId')
    const {
        biositeData,
        loading: biositeLoading,
        error: biositeError,
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
        getAppLinks,
        getWhatsAppLinks,
        getMusicLinks,
        getVideoLinks,
        getSocialPostLinks,
        clearError: clearLinksError
    } = useFetchLinks(biositeData?.id);

    const [biosite, setBiosite] = useState<BiositeFull | null>(null);
    const [socialLinks, setSocialLinksState] = useState<SocialLink[]>([]);
    const [regularLinks, setRegularLinksState] = useState<RegularLink[]>([]);
    const [appLinks, setAppLinksState] = useState<AppLink[]>([]);
    const [whatsAppLinks, setWhatsAppLinksState] = useState<WhatsAppLink[]>([]);
    const [themeColor, setThemeColorState] = useState<string>('#ffffff');
    const [fontFamily, setFontFamilyState] = useState<string>('Inter');
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!biositeId) {
            setBiosite(null);
            setSocialLinksState([]);
            setRegularLinksState([]);
            setWhatsAppLinksState([]);
            setFontFamilyState('Inter');
            resetState();
        }
    }, [biositeId, resetState]);

    // Carga el biosite de la cookie o, si no hay, el primero del usuario
    useEffect(() => {
        const initializeBiosite = async () => {
            if (!userId || initialized) return;

            try {
                const biositeId = Cookie.get('biositeId');

                if (biositeId) {
                    await switchBiosite(biositeId);
                } else {
                    const userBiosites = await fetchUserBiosites();
                    if (userBiosites && userBiosites.length > 0) {
                        const firstBiosite = userBiosites[0];
                        await switchBiosite(firstBiosite.id);
                        Cookie.set('biositeId', firstBiosite.id);
                    }
                }
            } catch (error) {
                console.error('Error initializing biosite:', error);
            } finally {
                setInitialized(true);
            }
        };

        initializeBiosite();
    }, [userId, initialized, fetchUserBiosites, switchBiosite]);

    useEffect(() => {
        if (!biositeData) return;

        setBiosite(biositeData);
        if (typeof biositeData.colors === 'string') {
            setThemeColorState(biositeData.colors);
        }
        if (biositeData.fonts) {
            setFontFamilyState(biositeData.fonts);
        }
    }, [biositeData]);

    useEffect(() => {
        if (biositeData?.id) {
            fetchLinks();
        }
    }, [biositeData?.id, fetchLinks]);

    // Separa los links del biosite por tipo para las pantallas de edición
    useEffect(() => {
        if (!Array.isArray(links)) return;

        setSocialLinksState(getSocialLinks().map(toSocialLink));
        setRegularLinksState(getRegularLinks().map(toRegularLink).sort((a, b) => a.orderIndex - b.orderIndex));
        setAppLinksState(getAppLinks().map(toAppLink));
        setWhatsAppLinksState(getWhatsAppLinks().map(toWhatsAppLink));
    }, [links, getSocialLinks, getRegularLinks, getAppLinks, getWhatsAppLinks]);

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
        getIconIdentifier,
    });

    const linkCrud = { biositeId: biositeData?.id, links, createLink, updateLink, deleteLink };
    const appLinkOperations = useAppLinkOperations(linkCrud);
    const whatsAppLinkOperations = useWhatsAppLinkOperations(linkCrud);

    const contextValue: PreviewContextType = {
        biosite,
        socialLinks,
        regularLinks,
        appLinks,
        whatsAppLinks,
        loading: biositeLoading || linksLoading,
        error: biositeError || linksError,
        themeColor,
        fontFamily,
        updatePreview,
        clearError,
        getMusicLinks,
        getSocialPostLinks,
        getVideoLinks,
        ...biositeOperations,
        ...linkOperations,
        ...appLinkOperations,
        ...whatsAppLinkOperations,
        setAppLinks: setAppLinksState,
        setWhatsAppLinks: setWhatsAppLinksState,
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
