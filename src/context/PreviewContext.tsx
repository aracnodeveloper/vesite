import {createContext, useContext, useEffect, useState, useCallback, useRef} from "react";
import type { BiositeFull } from "../interfaces/Biosite";
import type {PreviewContextType, SocialLink, RegularLink, AppLink, WhatsAppLink} from "../interfaces/PreviewContext";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import { useFetchLinks } from "../hooks/useFetchLinks";
import { useBiositeOperations } from "../hooks/useBiositeManagement";
import { useLinkOperations } from "../hooks/useLinksManagement";
import Cookie from "js-cookie";

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider = ({ children }: { children: React.ReactNode }) => {
    const userId = Cookie.get('userId');
    const biositeId = Cookie.get('biositeId')
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
    const [whatsAppLinks, setWhatsAppLinksState] = useState<WhatsAppLink[]>([]);
    const [themeColor, setThemeColorState] = useState<string>('#ffffff');
    const [fontFamily, setFontFamilyState] = useState<string>('Inter');
    const [initialized, setInitialized] = useState(false);
    const initializationRef = useRef<{ [key: string]: boolean }>({});

    const loading = biositeLoading || linksLoading;
    const error = biositeError || linksError;



    const getIconIdentifier = useCallback((iconPath: string): string => {
        const iconMap: { [key: string]: string } = {
            '/assets/icons/instagram.svg': 'instagram',
            '/assets/icons/tiktok.svg': 'tiktok',
            '/assets/icons/X.svg': 'twitter',
            '/assets/icons/youtube.svg': 'youtube',
            '/assets/icons/facebook.svg': 'facebook',
            '/assets/icons/twitch.svg': 'twitch',
            '/assets/icons/linkdl.svg': 'linkedin',
            '/assets/icons/snapchat.svg': 'snapchat',
            '/assets/icons/threads.svg': 'threads',
            '/assets/icons/gmail.svg': 'email',
            '/assets/icons/pinterest.svg': 'pinterest',
            '/assets/icons/spottufy.svg': 'spotify',
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

    {/* */}
        const isWhatsAppLink = useCallback((link: any): boolean => {
            const labelLower = link.label?.toLowerCase() || '';
            const urlLower = link.url?.toLowerCase() || '';
            const icon = link.icon?.toLowerCase() || '';

            return (
                icon === 'whatsapp' ||
                labelLower.includes('whatsapp') ||
                urlLower.includes('api.whatsapp.com')
            );
        }, [])



    const getStoreType = useCallback((link: any): 'appstore' | 'googleplay' => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (labelLower.includes('google play') || urlLower.includes('play.google.com')) {
            return 'googleplay';
        }
        return 'appstore';
    }, []);

    {/*  */ }
        const parseWhatsAppFromUrl = useCallback((url: string): { phone: string; message: string } => {
            try {
                let phone = '';
                let message = '';

                if (url.includes('api.whatsapp.com/send')) {
                    const urlParams = new URLSearchParams(url.split('?')[1] || '');
                    phone = urlParams.get('phone') || '';
                    message = decodeURIComponent(urlParams.get('text') || '');
                }


                return {phone, message};
            } catch (error) {
                console.error('Error parsing WhatsApp URL:', error);
                return {phone: '', message: ''};
            }
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
    {/**/}
        const getWhatsAppLinks = useCallback(() => {
            return links
                .filter(isWhatsAppLink)
                .map(link => {
                    const {phone, message} = parseWhatsAppFromUrl(link.url);
                    return {
                        id: link.id,
                        phone,
                        message,
                        isActive: link.isActive
                    };
                });
        }, [links, isWhatsAppLink, parseWhatsAppFromUrl]);


    // Función para obtener enlaces de música
    const getMusicEmbed = useCallback(() => {
        if (!links || !Array.isArray(links)) return null;

        const musicLink = links.find(link => {
            if (!link.isActive) return false;

            const labelLower = link.label?.toLowerCase() || '';
            const urlLower = link.url?.toLowerCase() || '';

            return (
                labelLower.includes('music') ||
                labelLower.includes('spotify') ||
                labelLower.includes('apple music') ||
                labelLower.includes('soundcloud') ||
                urlLower.includes('spotify.com') ||
                urlLower.includes('music.apple.com') ||
                urlLower.includes('soundcloud.com')
            );
        });

        return musicLink || null;
    }, [links]);

    // Función para obtener posts sociales
    const getSocialPost = useCallback(() => {
        if (!links || !Array.isArray(links)) return null;

        const socialPostLink = links.find(link => {
            if (!link.isActive) return false;

            const labelLower = link.label?.toLowerCase() || '';
            const urlLower = link.url?.toLowerCase() || '';

            return (
                labelLower.includes('post') ||
                labelLower.includes('publicacion') ||
                (urlLower.includes('instagram.com') && (urlLower.includes('/p/') || urlLower.includes('/reel/')))
            );
        });

        return socialPostLink || null;
    }, [links]);

    // Función para obtener videos
    const getVideoEmbed = useCallback(() => {
        if (!links || !Array.isArray(links)) return null;

        const videoLink = links.find(link => {
            if (!link.isActive) return false;

            const labelLower = link.label?.toLowerCase() || '';
            const urlLower = link.url?.toLowerCase() || '';

            return (
                labelLower.includes('video') ||
                labelLower.includes('vimeo') ||
                urlLower.includes('youtube.com/watch') ||
                urlLower.includes('vimeo.com')
            );
        });

        return videoLink || null;
    }, [links]);

    useEffect(() => {
        if (!biositeId) {
            setBiosite(null);
            setSocialLinksState([]);
            setRegularLinksState([]);
            setWhatsAppLinksState([]);
            setThemeColorState('#ffffff');
            setFontFamilyState('Inter');
            resetState();
            initializationRef.current = {};
            return;
        }

        if (biositeId && !initializationRef.current[biositeId]) {
            initializationRef.current[biositeId] = true;
            fetchBiosite();
        }
    }, [biositeId, fetchBiosite, resetState]);

    // Simplificación de la inicialización - solo usar userId y biositeId
    useEffect(() => {
        const initializeBiosite = async () => {
            if (!userId || initialized) return;

            try {
                const biositeId = Cookie.get('biositeId');

                if (biositeId) {
                    // Cargar biosite específico por ID
                    await loadBiositeById(biositeId);
                } else {
                    // Cargar el primer biosite del usuario
                    const userBiosites = await fetchUserBiosites();
                    if (userBiosites && userBiosites.length > 0) {
                        const firstBiosite = userBiosites[0];
                        await switchBiosite(firstBiosite.id);
                        Cookie.set('biositeId', firstBiosite.id);
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

            if (biositeData.fonts && biositeData.fonts !== fontFamily) {
                console.log('Updating font from BD:', biositeData.fonts);
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
            console.log('Processing links:', links.length);

            const socialLinksFromAPI = getSocialLinks();
            console.log('Social links from API:', socialLinksFromAPI.length);

            // Filtrar enlaces sociales excluyendo WhatsApp y app stores
            const socialLinksFormatted = socialLinksFromAPI
                .filter(link => !isAppStoreLink(link) )
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

            // Filtrar enlaces regulares excluyendo app stores y WhatsApp
            const regularLinksFormatted = regularLinksFromAPI
                .filter(link => !isAppStoreLink(link) )
                .map(link => ({
                    id: link.id,
                    title: link.label,
                    url: link.url,
                    image: link.image,
                    orderIndex: link.orderIndex,
                    isActive: link.isActive
                }));

            const appLinksFromAPI = getAppLinks();
          const whatsAppLinkFromAPI = getWhatsAppLinks();
            console.log('Processed links:', {
                social: socialLinksFormatted.length,
                regular: regularLinksFormatted.length,
                apps: appLinksFromAPI.length,
             whatsApp: whatsAppLinkFromAPI ? 'found' : 'not found'
            });

            setSocialLinksState(socialLinksFormatted);
            setRegularLinksState(regularLinksFormatted.sort((a, b) => a.orderIndex - b.orderIndex));
            setAppLinksState(appLinksFromAPI);
          setWhatsAppLinksState(whatsAppLinkFromAPI);
        }
    }, [links, getSocialLinks, getRegularLinks, getAppLinks, isAppStoreLink,getWhatsAppLinks,isWhatsAppLink, biositeData?.id]);

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
    {/*  */}
    const addWhatsAppLink = async (link: Omit<WhatsAppLink, 'id'>) => {
        if (!biositeData?.id) {
            throw new Error('Biosite ID is required');
        }

        try {
            const cleanPhone = link.phone.replace(/[^\d+]/g, '');
            const encodedMessage = encodeURIComponent(link.message);
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;

            const linkData = {
                biositeId: biositeData.id,
                label: 'WhatsApp',
                url: whatsappUrl,
                icon: 'whatsapp',
                orderIndex: links.length,
                isActive: link.isActive
            };

            const newLink = await createLink(linkData);
            if (newLink) {
                console.log('WhatsApp link created successfully:', newLink);
            }
        } catch (error) {
            console.error('Error creating WhatsApp link:', error);
            throw error;
        }
    };


        const removeWhatsAppLink = async (id: string) => {
            try {
                const success = await deleteLink(id);
                if (success) {
                    console.log('WhatsApp link deleted successfully:', id);
                }
            } catch (error) {
                console.error('Error deleting WhatsApp link:', error);
                throw error;
            }
        };

        const updateWhatsAppLink = async (id: string, data: Partial<WhatsAppLink>) => {
            try {
                const updateData: any = {};

                if (data.phone !== undefined || data.message !== undefined) {
                    const currentLink = links.find(link => link.id === id);
                    if (currentLink) {
                        const currentData = parseWhatsAppFromUrl(currentLink.url);

                        const phone = data.phone !== undefined ? data.phone : currentData.phone;
                        const message = data.message !== undefined ? data.message : currentData.message;

                        const cleanPhone = phone.replace(/[^\d+]/g, '');
                        const encodedMessage = encodeURIComponent(message);
                        updateData.url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
                    }
                }

                if (data.isActive !== undefined) {
                    updateData.isActive = data.isActive;
                }

                updateData.label = 'WhatsApp';
                updateData.icon = 'whatsapp';

                const updatedLink = await updateLink(id, updateData);
                if (updatedLink) {
                    console.log('WhatsApp link updated successfully:', updatedLink);
                }
            } catch (error) {
                console.error('Error updating WhatsApp link:', error);
                throw error;
            }
        };
    useEffect(() => {
        if (biositeData && biositeData.colors) {
            let parsedColors;

            if (typeof biositeData.colors === 'string') {
                try {
                    parsedColors = JSON.parse(biositeData.colors);
                } catch (e) {
                    parsedColors = { background: biositeData.colors };
                }
            } else {
                parsedColors = biositeData.colors;
            }

            // Sincronizar el themeColor con el color de fondo de la BD
            if (parsedColors.background && parsedColors.background !== themeColor) {
                console.log('Syncing theme color from BD:', parsedColors.background);
                setThemeColorState(parsedColors.background);
            }
        }
    }, [biositeData, themeColor]);
    const parseFont = (fonts: string | null | undefined): string => {
        const defaultFont = 'Inter';

        if (!fonts) return defaultFont;

        if (typeof fonts === 'string') {
            // Si es un string válido, usarlo directamente
            if (fonts.trim().length > 0) {
                return fonts.trim();
            }
        }

        return defaultFont;
    };
    useEffect(() => {
        if (biositeData && biositeData.fonts) {
            const parsedFont = parseFont(biositeData.fonts);

            // Sincronizar el fontFamily con la fuente de la BD
            if (parsedFont && parsedFont !== fontFamily) {
                console.log('Syncing font family from BD:', parsedFont);
                setFontFamilyState(parsedFont);
            }
        }
    }, [biositeData, fontFamily]);
    const setThemeColor = useCallback(async (color: string) => {
        try {
            setThemeColorState(color);

            if (biositeData?.id) {
                // Preparar los colores actualizados
                let currentColors;
                try {
                    currentColors = typeof biositeData.colors === 'string'
                        ? JSON.parse(biositeData.colors)
                        : biositeData.colors || {};
                } catch (e) {
                    currentColors = {};
                }

                const updatedColors = {
                    ...currentColors,
                    background: color
                };

                // Actualizar en la base de datos
                const updateData = {
                    ownerId: biositeData.ownerId,
                    title: biositeData.title,
                    slug: biositeData.slug,
                    themeId: biositeData.themeId,
                    colors: JSON.stringify(updatedColors),
                    fonts: biositeData.fonts || fontFamily,
                    avatarImage: biositeData.avatarImage || '',
                    backgroundImage: biositeData.backgroundImage || '',
                    isActive: biositeData.isActive
                };

                const updatedBiosite = await updateBiositeHook(updateData);

                if (updatedBiosite) {
                    // Forzar actualización del estado local
                    setBiosite(prev => prev ? {
                        ...prev,
                        colors: updatedColors
                    } : null);

                    console.log('Theme color updated successfully:', color);
                }
            }
        } catch (error) {
            console.error('Error updating theme color:', error);
            // Revertir el estado si hay error
            setThemeColorState(prevColor => prevColor);
            throw error;
        }
    }, [biositeData, fontFamily, updateBiositeHook, setBiosite]);
    const setFontFamily = useCallback(async (font: string) => {
        try {
            setFontFamilyState(font);

            if (biositeData?.id) {
                // Preparar los datos actualizados
                let colorsString: string;
                if (typeof biositeData.colors === 'string') {
                    colorsString = biositeData.colors;
                } else {
                    colorsString = JSON.stringify(biositeData.colors);
                }

                const updateData = {
                    ownerId: biositeData.ownerId,
                    title: biositeData.title,
                    slug: biositeData.slug,
                    themeId: biositeData.themeId,
                    colors: colorsString,
                    fonts: font, // Asegurar que se guarde la fuente
                    avatarImage: biositeData.avatarImage || '',
                    backgroundImage: biositeData.backgroundImage || '',
                    isActive: biositeData.isActive
                };

                const updatedBiosite = await updateBiositeHook(updateData);

                if (updatedBiosite) {
                    // Forzar actualización del estado local
                    setBiosite(prev => prev ? {
                        ...prev,
                        fonts: font
                    } : null);

                    console.log('Font family updated successfully:', font);
                }
            }
        } catch (error) {
            console.error('Error updating font family:', error);
            // Revertir el estado si hay error
            setFontFamilyState(prevFont => prevFont);
            throw error;
        }
    }, [biositeData, updateBiositeHook, setBiosite]);
    const contextValue: PreviewContextType = {
        biosite,
        socialLinks,
        regularLinks,
        appLinks,
        whatsAppLinks,
        loading,
        error,
        themeColor,
        fontFamily,
        updatePreview,
        clearError,
        getMusicEmbed,
        getSocialPost,
        getVideoEmbed,
        ...biositeOperations,
        ...linkOperations,
        setAppLinks: setAppLinksState,
        addAppLink,
        removeAppLink,
        updateAppLink,
       setWhatsAppLinks: setWhatsAppLinksState,
        addWhatsAppLink,
       removeWhatsAppLink,
       updateWhatsAppLink
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